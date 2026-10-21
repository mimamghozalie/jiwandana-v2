import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';
import { createPakasirTransaction } from '@/lib/pakasir';
import { getActivePricingTier, normalizeCategoryKey } from '@/lib/pricing';

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

    // 1. Validasi jumlah peserta: Minimal 5 orang dan Maksimal 20 orang
    if (!participants || !Array.isArray(participants) || participants.length < 5 || participants.length > 20) {
      return NextResponse.json(
        { error: 'Pendaftaran kolektif membutuhkan minimal 5 orang dan maksimal 20 orang peserta per transaksi.' },
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

    // 4. Promo Diskon Kelipatan 10 Orang: Rp 320.000 per 10 orang (contoh 10 org = Rp 320.000, 20 org = Rp 640.000)
    const discountMultiplier = Math.floor(evaluatedParticipants.length / 10);
    const discountAmount = discountMultiplier * 320000;
    const promoNote =
      discountMultiplier > 0
        ? `Promo Kelompok: Diskon ${discountMultiplier}x Rp 320.000 = Rp ${discountAmount.toLocaleString('id-ID')}`
        : null;

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

    // 8. Batch Insert participants into trailrun_registrations (hanya data peserta: nama, nik, kk, jersey, dll)
    // NOTE: Data PIC (pic_name, pic_phone, pic_email) disimpan di tabel trailrun_payments
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
      nama_komunitas: p.nama_komunitas || group_name || null,
      golongan_darah: p.golongan_darah || null,
      riwayat_medis: p.riwayat_medis || null,
      kontak_darurat: p.kontak_darurat,
      kategori: p.kategori.toUpperCase(),
      status: 'pending',
      registration_type: 'bulk',
      order_id: orderId,
    }));

    let { data: insertedRegistrations, error: regError } = await supabase
      .from('trailrun_registrations')
      .insert(insertPayload)
      .select('id, nama, email, kategori, no_bib');

    // Graceful fallback jika kolom opsional tertentu belum termigrasi
    if (regError) {
      console.warn('Initial insert trailrun_registrations error:', regError.message);
      let fallbackPayload = [...insertPayload];
      if (regError.message?.toLowerCase().includes('order_id')) {
        fallbackPayload = fallbackPayload.map(({ order_id, ...rest }: any) => rest);
      }
      if (regError.message?.toLowerCase().includes('registration_type')) {
        fallbackPayload = fallbackPayload.map(({ registration_type, ...rest }: any) => rest);
      }
      if (regError.message?.toLowerCase().includes('ukuran_jersey')) {
        fallbackPayload = fallbackPayload.map(({ ukuran_jersey, ...rest }: any) => rest);
      }
      if (regError.message?.toLowerCase().includes('nik')) {
        fallbackPayload = fallbackPayload.map(({ nik, ...rest }: any) => rest);
      }
      if (regError.message?.toLowerCase().includes('kk')) {
        fallbackPayload = fallbackPayload.map(({ kk, ...rest }: any) => rest);
      }

      const retryRes = await supabase
        .from('trailrun_registrations')
        .insert(fallbackPayload)
        .select('id, nama, email, kategori, no_bib');

      insertedRegistrations = retryRes.data;
      regError = retryRes.error;
    }

    if (regError) {
      console.error('Failed to batch insert bulk registrations:', regError);
      throw new Error(`Gagal menyimpan data pendaftaran: ${regError.message}`);
    }

    // 9. Save payment record to trailrun_payments
    // NOTE: Tabel trailrun_payments adalah tempat utama untuk data PIC (pic_name, pic_phone, pic_email)
    // dan memiliki UNIQUE constraint pada `order_id` (1 order = 1 record payment)
    // Jadi untuk pendaftaran rombongan, cukup 1 baris payment record per order_id (mewakili PIC / rombongan)
    const primaryRegId = insertedRegistrations?.[0]?.id || orderId;
    const singlePaymentRecord = {
      registration_id: primaryRegId,
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
      pic_name: pic_name || null,
      pic_phone: pic_phone || null,
      pic_email: pic_email || null,
    };

    // Insert 1 record payment
    const { error: insErr } = await supabase.from('trailrun_payments').insert([singlePaymentRecord]);
    if (insErr) {
      console.warn('⚠️ Gagal insert ke trailrun_payments dengan field profit/fees:', insErr.message);
      // Fallback tanpa profit fields
      const { admin_fee, gateway_fee, admin_profit, ...fallbackRecord } = singlePaymentRecord;
      const { error: fallbackErr } = await supabase.from('trailrun_payments').insert([fallbackRecord]);
      if (fallbackErr) {
        console.warn('⚠️ Fallback insert tanpa pic fields:', fallbackErr.message);
        const { pic_name: _, pic_phone: __, ...basicRecord } = fallbackRecord;
        await supabase.from('trailrun_payments').insert([basicRecord]);
      }
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
        registration_ids: (insertedRegistrations || []).map((r) => r.id),
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
