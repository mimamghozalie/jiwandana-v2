import { NextRequest, NextResponse } from 'next/server';
import { createPakasirTransaction, parsePriceToNumber } from '@/lib/pakasir';
import { createClient } from '@supabase/supabase-js';
import trailrunData from '@/data/trailrun.json';

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

    // Use presale price as the default current price
    const amount = parsePriceToNumber(category.prices.presale);

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Harga tidak valid.' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `TR-${registration_id.slice(0, 8).toUpperCase()}-${Date.now()}`;

    // Create transaction via Pakasir API v2
    const transaction = await createPakasirTransaction(orderId, {
      method: payment_method,
      amount,
    });

    // Default expired_at fallback: 24 hours from now if Pakasir does not return it
    const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const expiredAt =
      (transaction as any).expired_at ||
      (transaction as any).expire_at ||
      (transaction as any).expiry_time ||
      defaultExpiry;

    // Save payment record to Supabase
    await supabase.from('trailrun_payments').insert([{
      registration_id,
      order_id: orderId,
      txn_id: transaction.txn_id,
      amount: transaction.amount,
      fee: transaction.fee,
      total_payment: transaction.total_payment,
      payment_method: transaction.payment_method,
      qr_string: transaction.qr_string || null,
      va_number: transaction.va_number || null,
      payment_link: transaction.payment_link || null,
      expired_at: expiredAt,
      is_sandbox: transaction.is_sandbox ?? true,
      status: 'pending',
    }]);

    // Update registration status
    await supabase
      .from('trailrun_registrations')
      .update({ status: 'confirmed' })
      .eq('id', registration_id);

    return NextResponse.json({
      success: true,
      data: {
        txn_id: transaction.txn_id,
        order_id: orderId,
        amount: transaction.amount,
        total_payment: transaction.total_payment,
        fee: transaction.fee,
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
