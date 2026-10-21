import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPakasirTransaction } from '@/lib/pakasir';
import { getActivePricingTier, normalizeCategoryKey } from '@/lib/pricing';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface BulkRequestBody {
  group_name?: string;
  pic_name: string;
  pic_email: string;
  pic_phone: string;
  payment_method: string;
  participants: Array<{
    nama: string;
    nik?: string;
    kk?: string;
    email: string;
    no_bib?: string;
    ukuran_jersey?: string;
    no_hp: string;
    kategori: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    golongan_darah?: string;
    alamat: string;
    kota: string;
    provinsi: string;
    kontak_darurat: string;
    nama_komunitas?: string;
    riwayat_medis?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkRequestBody = await request.json();
    const { group_name, pic_name, pic_email, pic_phone, payment_method, participants } = body;

    // 1. Validasi jumlah peserta: Minimal 5 orang dan Maksimal 10 orang
    if (!participants || !Array.isArray(participants) || participants.length < 5 || participants.length > 10) {
      return NextResponse.json(
        { error: 'Pendaftaran kolektif membutuhkan minimal 5 orang dan maksimal 10 orang peserta per transaksi.' },
        { status: 400 }
      );
    }

    if (!pic_name || !pic_email || !pic_phone) {
      return NextResponse.json(
        { error: 'Data Penanggung Jawab (PIC) wajib diisi lengkap.' },
        { status: 400 }
      );
    }

    // 2. Validasi Kategori: Hanya 7K dan 12K (Kategori 3K tidak tersedia untuk pendaftaran kelompok)
    const hasInvalidCat = participants.some((p) => {
      const cat = (p.kategori || '').toLowerCase();
      return !cat.includes('7k') && !cat.includes('12k') && !cat.includes('7') && !cat.includes('12');
    });
    if (hasInvalidCat) {
      return NextResponse.json(
        { error: 'Pendaftaran kolektif hanya menerima kategori 7K dan 12K. Kategori 3K tidak tersedia untuk pendaftaran kelompok.' },
        { status: 400 }
      );
    }

    // 3. Harga Tiket Terkunci di Tarif Pre-Sale (Permanen): 7K = Rp 270.000, 12K = Rp 320.000
    const GROUP_PRICES: Record<string, number> = {
      '7k': 270000,
      '12k': 320000,
    };

    let rawSubtotalTickets = 0;
    const evaluatedParticipants = participants.map((p) => {
      const catKey = p.kategori.toLowerCase().includes('12') ? '12k' : '7k';
      const priceAmount = GROUP_PRICES[catKey];
      rawSubtotalTickets += priceAmount;

      return {
        ...p,
        categoryKey: catKey,
        tierId: 'presale',
        tierName: 'Pre-Sale (Harga Khusus Kelompok)',
        priceAmount,
        nama_komunitas: p.nama_komunitas || group_name || null,
        status: 'confirmed',
      };
    });

    if (rawSubtotalTickets <= 0) {
      return NextResponse.json({ error: 'Kalkulasi harga tiket tidak valid.' }, { status: 400 });
    }

    // 4. Promo Diskon 10 Orang: Potongan tetap Rp 320.000 (setara 1 tiket 12K)
    let discountAmount = 0;
    let promoNote: string | null = null;
    if (evaluatedParticipants.length === 10) {
      discountAmount = 320000;
      promoNote = 'Promo 10 Peserta: Potongan Tetap Rp 320.000 (Setara 1 Tiket 12K)';
    }

    const subtotalTickets = Math.max(0, rawSubtotalTickets - discountAmount);

    // 5. SKEMA B: Biaya Admin Rp 3.000 / orang sebagai PROFIT BERSIH UTUH
    // Biaya transaksi gateway Pakasir (0.7% + Rp 300) dibebankan ke user.
    const ADMIN_FEE_PER_PERSON = 3000;
    const ADMIN_FEE = evaluatedParticipants.length * ADMIN_FEE_PER_PERSON; // Profit admin bersih utuh
    const targetSettlement = subtotalTickets + ADMIN_FEE; // Dana bersih yang dicairkan Pakasir ke penyelenggara

    // Jumlah yang dikirim ke Pakasir sebagai nominal dasar
    // Pakasir akan menambahkan fee transaksi (0.7% + Rp 300) ke total_payment yang di-scan user
    const amountToSend = targetSettlement;

    // 6. Generate unique Bulk Order ID
    const orderId = `TR-BULK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 7. Create Pakasir transaction for the entire group
    const transaction = await createPakasirTransaction(orderId, {
      method: (payment_method || 'qris') as any,
      amount: amountToSend,
    });

    // Batas waktu pembayaran kolektif: 1 jam (60 menit) dari saat transaksi dibuat
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
        expiredAt = new Date(Math.min(pakasirTime, Date.now() + ONE_HOUR_MS)).toISOString();
      }
    }

    const estimatedTxFee = Math.round(amountToSend * 0.007 + 300);
    const gatewayFee = transaction.fee || estimatedTxFee;
    const adminProfit = ADMIN_FEE; // Keuntungan bersih utuh Rp 3.000 / orang
    const finalTotalPayment = transaction.total_payment || (amountToSend + gatewayFee);

    // 8. Batch Insert participants into trailrun_registrations (termasuk ukuran_jersey, nik, kk)
    const insertPayload = evaluatedParticipants.map((p) => ({
      nama: p.nama,
      nik: p.nik || null,
      kk: p.kk || null,
      email: p.email,
      no_bib: (p.no_bib || '').trim().toUpperCase() || null,
      ukuran_jersey: p.ukuran_jersey || 'M',
      no_hp: p.no_hp,
      alamat: p.alamat,
      kota: p.kota,
      provinsi: p.provinsi,
      kewarganegaraan: 'Indonesia',
      tanggal_lahir: p.tanggal_lahir,
      jenis_kelamin: p.jenis_kelamin,
      nama_komunitas: p.nama_komunitas,
      golongan_darah: p.golongan_darah || null,
      riwayat_medis: p.riwayat_medis || null,
      kontak_darurat: p.kontak_darurat,
      kategori: p.kategori.toUpperCase(),
      status: 'pending',
    }));

    let { data: insertedRegistrations, error: regError } = await supabase
      .from('trailrun_registrations')
      .insert(insertPayload)
      .select('id, nama, email, kategori, no_bib');

    // Graceful fallback jika kolom nik/kk/ukuran_jersey belum termigrasi
    if (
      regError &&
      (regError.message?.toLowerCase().includes('nik') ||
        regError.message?.toLowerCase().includes('kk') ||
        regError.message?.toLowerCase().includes('ukuran_jersey'))
    ) {
      console.warn('Fallback insert bulk registrations without nik/kk/ukuran_jersey:', regError.message);
      const fallbackPayload = insertPayload.map(({ nik, kk, ukuran_jersey, ...rest }) => rest);
      const fallbackRes = await supabase
        .from('trailrun_registrations')
        .insert(fallbackPayload)
        .select('id, nama, email, kategori, no_bib');
      insertedRegistrations = fallbackRes.data;
      regError = fallbackRes.error;
    }

    if (regError) {
      console.error('Failed to batch insert bulk registrations:', regError);
      throw new Error(`Gagal menyimpan data pendaftaran: ${regError.message}`);
    }

    // 9. Save payment record to trailrun_payments
    const firstRegId = insertedRegistrations?.[0]?.id || orderId;
    const paymentRecords = (insertedRegistrations || []).map((reg) => ({
      registration_id: reg.id,
      order_id: orderId,
      txn_id: transaction.txn_id,
      amount: subtotalTickets,
      fee: ADMIN_FEE,
      total_payment: finalTotalPayment,
      payment_method: transaction.payment_method,
      qr_string: transaction.qr_string || null,
      va_number: transaction.va_number || null,
      payment_link: transaction.payment_link || null,
      expired_at: expiredAt,
      is_sandbox: transaction.is_sandbox ?? true,
      status: 'pending',
      admin_fee: ADMIN_FEE,
      gateway_fee: gatewayFee,
      admin_profit: adminProfit,
    }));

    if (paymentRecords.length > 0) {
      const { error: insErr } = await supabase.from('trailrun_payments').insert(paymentRecords);
      if (insErr) {
        const baseRecords = paymentRecords.map(({ admin_fee, gateway_fee, admin_profit, ...rest }) => rest);
        await supabase.from('trailrun_payments').insert(baseRecords);
      }
    } else {
      const singleRecord = {
        registration_id: firstRegId,
        order_id: orderId,
        txn_id: transaction.txn_id,
        amount: subtotalTickets,
        fee: ADMIN_FEE,
        total_payment: finalTotalPayment,
        payment_method: transaction.payment_method,
        qr_string: transaction.qr_string || null,
        va_number: transaction.va_number || null,
        payment_link: transaction.payment_link || null,
        expired_at: expiredAt,
        is_sandbox: transaction.is_sandbox ?? true,
        status: 'pending',
      };
      await supabase.from('trailrun_payments').insert([singleRecord]);
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        txn_id: transaction.txn_id,
        participant_count: evaluatedParticipants.length,
        raw_subtotal: rawSubtotalTickets,
        discount_amount: discountAmount,
        promo_note: promoNote,
        subtotal: subtotalTickets,
        admin_fee_per_person: ADMIN_FEE_PER_PERSON,
        admin_fee: ADMIN_FEE,
        gateway_fee: gatewayFee,
        admin_profit: adminProfit,
        fee: ADMIN_FEE + gatewayFee,
        total_payment: finalTotalPayment,
        payment_method: transaction.payment_method,
        qr_string: transaction.qr_string,
        va_number: transaction.va_number,
        payment_link: transaction.payment_link,
        expired_at: expiredAt,
        is_sandbox: transaction.is_sandbox ?? true,
        pic: {
          name: pic_name,
          email: pic_email,
          phone: pic_phone,
          group_name: group_name || null,
        },
        participants: evaluatedParticipants.map((p) => ({
          nama: p.nama,
          kategori: p.kategori,
          tierName: p.tierName,
          priceAmount: p.priceAmount,
          ukuran_jersey: p.ukuran_jersey || 'M',
        })),
      },
    });
  } catch (err: any) {
    console.error('Bulk payment create error:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal memproses pendaftaran kolektif.' },
      { status: 500 }
    );
  }
}
