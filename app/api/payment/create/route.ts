import { NextRequest, NextResponse } from 'next/server';
import { createPakasirTransaction, parsePriceToNumber } from '@/lib/pakasir';
import { createClient } from '@supabase/supabase-js';
import trailrunData from '@/data/trailrun.json';
import { getActivePricingTier } from '@/lib/pricing';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registration_id, kategori, payment_method } = body;

    if (!registration_id || !kategori || !payment_method) {
      return NextResponse.json(
        { error: 'registration_id, kategori, dan payment_method wajib diisi.' },
        { status: 400 }
      );
    }

    // Find the category to get the price
    const category = (trailrunData.categories as any[]).find(
      (c) => c.id === kategori || c.id.toLowerCase() === kategori.toLowerCase()
    );

    if (!category) {
      return NextResponse.json(
        { error: `Kategori '${kategori}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    // 1. Count paid registrations for this category to enforce early quota (only paid counts!)
    let paidCount = 0;
    try {
      const { count } = await supabase
        .from('trailrun_registrations')
        .select('*', { count: 'exact', head: true })
        .ilike('kategori', `%${kategori}%`)
        .eq('status', 'paid');
      paidCount = count || 0;
    } catch (countErr) {
      console.warn('Could not count registrations, defaulting to 0:', countErr);
    }

    // 2. Evaluate active pricing tier (Early Bird limit 50, Presale, Regular)
    const tierEvaluation = getActivePricingTier(kategori, paidCount);
    const baseAmount = tierEvaluation.amount;

    if (baseAmount <= 0) {
      return NextResponse.json(
        { error: 'Harga tidak valid.' },
        { status: 400 }
      );
    }

    // Biaya Admin Flat Rp 5.000 ke peserta
    const ADMIN_FEE = 5000;
    const targetTotalPayment = baseAmount + ADMIN_FEE; // Contoh: 240.000 + 5.000 = 245.000

    // Biaya transaksi gateway: 0.7% + Rp 300
    // Agar Pakasir menghasilkan QRIS/VA dengan nominal pas targetTotalPayment (245.000),
    // kirim amount bersih ke Pakasir jika gateway menambahkan fee
    const estimatedTxFee = Math.round(targetTotalPayment * 0.007 + 300);
    const amountToSend = Math.max(1000, Math.round((targetTotalPayment - 300) / 1.007));

    // Generate unique order ID
    const orderId = `TR-${registration_id.slice(0, 8).toUpperCase()}-${Date.now()}`;

    // Create transaction via Pakasir API v2
    const transaction = await createPakasirTransaction(orderId, {
      method: payment_method,
      amount: amountToSend,
    });

    // Batas waktu pembayaran: 1 jam (60 menit) dari saat transaksi dibuat
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const defaultExpiry = new Date(Date.now() + ONE_HOUR_MS).toISOString();

    let expiredAt = defaultExpiry;
    const pakasirExpiryRaw =
      (transaction as any).expired_at ||
      (transaction as any).expire_at ||
      (transaction as any).expiry_time;

    if (pakasirExpiryRaw) {
      const pakasirTime = new Date(pakasirExpiryRaw).getTime();
      if (!isNaN(pakasirTime)) {
        // Batasi batas waktu pembayaran maksimal 1 jam dari sekarang
        expiredAt = new Date(Math.min(pakasirTime, Date.now() + ONE_HOUR_MS)).toISOString();
      }
    }

    // Tx fee riil gateway (atau fallback estimasi 0.7% + 300)
    const gatewayFee = transaction.fee || estimatedTxFee;

    // Keuntungan fee admin bersih (Rp 5.000 - tx fee)
    const adminProfit = Math.max(0, ADMIN_FEE - gatewayFee);

    // Total bayar final yang dibayar peserta: flat subtotal + admin fee Rp 5.000
    const finalTotalPayment = transaction.total_payment || targetTotalPayment;

    // Base payment record
    const basePaymentRecord = {
      registration_id,
      order_id: orderId,
      txn_id: transaction.txn_id,
      amount: baseAmount,
      fee: ADMIN_FEE, // Flat Rp 5.000
      total_payment: finalTotalPayment,
      payment_method: transaction.payment_method,
      qr_string: transaction.qr_string || null,
      va_number: transaction.va_number || null,
      payment_link: transaction.payment_link || null,
      expired_at: expiredAt,
      is_sandbox: transaction.is_sandbox ?? true,
      status: 'pending',
    };

    // Extended record dengan pencatatan profit admin & fee gateway
    const extendedPaymentRecord = {
      ...basePaymentRecord,
      admin_fee: ADMIN_FEE,
      gateway_fee: gatewayFee,
      admin_profit: adminProfit,
    };

    // Save payment record to Supabase (dengan graceful fallback jika kolom profit belum ada)
    const { error: insertError } = await supabase.from('trailrun_payments').insert([extendedPaymentRecord]);
    if (insertError) {
      console.warn('Fallback insert without extra columns:', insertError.message);
      await supabase.from('trailrun_payments').insert([basePaymentRecord]);
    }

    // Keep registration status as 'pending' until actual payment is completed
    await supabase
      .from('trailrun_registrations')
      .update({ status: 'pending' })
      .eq('id', registration_id);

    return NextResponse.json({
      success: true,
      data: {
        txn_id: transaction.txn_id,
        order_id: orderId,
        amount: baseAmount,
        total_payment: finalTotalPayment,
        fee: ADMIN_FEE, // Flat Rp 5.000
        admin_fee: ADMIN_FEE,
        gateway_fee: gatewayFee,
        admin_profit: adminProfit,
        payment_method: transaction.payment_method,
        qr_string: transaction.qr_string,
        va_number: transaction.va_number,
        payment_link: transaction.payment_link,
        expired_at: expiredAt,
        is_sandbox: transaction.is_sandbox ?? true,
      },
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat transaksi pembayaran.' },
      { status: 500 }
    );
  }
}
