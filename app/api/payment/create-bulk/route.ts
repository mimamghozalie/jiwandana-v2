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
    email: string;
    no_bib?: string;
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

    if (!participants || !Array.isArray(participants) || participants.length < 5) {
      return NextResponse.json(
        { error: 'Pendaftaran kolektif membutuhkan minimal 5 orang peserta.' },
        { status: 400 }
      );
    }

    if (!pic_name || !pic_email || !pic_phone) {
      return NextResponse.json(
        { error: 'Data Penanggung Jawab (PIC) wajib diisi lengkap.' },
        { status: 400 }
      );
    }

    // 1. Get current registered counts per category to evaluate pricing accurately
    const [res3k, res7k, res12k] = await Promise.all([
      supabase.from('trailrun_registrations').select('*', { count: 'exact', head: true }).ilike('kategori', '%3k%').in('status', ['paid', 'confirmed']),
      supabase.from('trailrun_registrations').select('*', { count: 'exact', head: true }).ilike('kategori', '%7k%').in('status', ['paid', 'confirmed']),
      supabase.from('trailrun_registrations').select('*', { count: 'exact', head: true }).ilike('kategori', '%12k%').in('status', ['paid', 'confirmed']),
    ]);

    const runningCounts: Record<string, number> = {
      '3k': res3k.count || 0,
      '7k': res7k.count || 0,
      '12k': res12k.count || 0,
    };

    // 2. Evaluate pricing for each participant & calculate total
    let subtotalTickets = 0;
    const evaluatedParticipants = participants.map((p, idx) => {
      const catKey = normalizeCategoryKey(p.kategori);
      const currentCount = runningCounts[catKey] || 0;
      const tierEval = getActivePricingTier(catKey, currentCount);

      // Increment count so the next participant in the same batch gets the updated quota status
      runningCounts[catKey] = currentCount + 1;
      subtotalTickets += tierEval.amount;

      return {
        ...p,
        categoryKey: catKey,
        tierId: tierEval.tierId,
        tierName: tierEval.tierName,
        priceAmount: tierEval.amount,
        nama_komunitas: p.nama_komunitas || group_name || null,
        status: 'confirmed',
      };
    });

    if (subtotalTickets <= 0) {
      return NextResponse.json({ error: 'Kalkulasi harga tiket tidak valid.' }, { status: 400 });
    }

    // 3. Biaya Admin Rp 2.000 per orang untuk pendaftaran kelompok Excel
    const ADMIN_FEE_PER_PERSON = 2000;
    const ADMIN_FEE = evaluatedParticipants.length * ADMIN_FEE_PER_PERSON;
    const amountToPay = subtotalTickets + ADMIN_FEE;

    // 4. Generate unique Bulk Order ID
    const orderId = `TR-BULK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 5. Create Pakasir transaction for the entire group
    const transaction = await createPakasirTransaction(orderId, {
      method: (payment_method || 'qris') as any,
      amount: amountToPay,
    });

    const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const expiredAt =
      (transaction as any).expired_at ||
      (transaction as any).expire_at ||
      (transaction as any).expiry_time ||
      defaultExpiry;

    const gatewayFee = transaction.fee || 0;
    const totalFee = ADMIN_FEE + gatewayFee;

    // 6. Batch Insert participants into trailrun_registrations
    const insertPayload = evaluatedParticipants.map((p) => ({
      nama: p.nama,
      email: p.email,
      no_bib: (p.no_bib || '').trim() || null,
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
      status: 'confirmed',
    }));

    const { data: insertedRegistrations, error: regError } = await supabase
      .from('trailrun_registrations')
      .insert(insertPayload)
      .select('id, nama, email, kategori, no_bib');


    if (regError) {
      console.error('Failed to batch insert bulk registrations:', regError);
      throw new Error(`Gagal menyimpan data pendaftaran: ${regError.message}`);
    }

    // 7. Save payment record to trailrun_payments
    // Link each registration to this group payment order
    const firstRegId = insertedRegistrations?.[0]?.id || orderId;
    const paymentRecords = (insertedRegistrations || []).map((reg) => ({
      registration_id: reg.id,
      order_id: orderId,
      txn_id: transaction.txn_id,
      amount: subtotalTickets,
      fee: totalFee,
      total_payment: transaction.total_payment,
      payment_method: transaction.payment_method,
      qr_string: transaction.qr_string || null,
      va_number: transaction.va_number || null,
      payment_link: transaction.payment_link || null,
      expired_at: expiredAt,
      is_sandbox: transaction.is_sandbox ?? true,
      status: 'pending',
    }));

    // If batch mapping fails, insert at least 1 record with firstRegId
    if (paymentRecords.length > 0) {
      await supabase.from('trailrun_payments').insert(paymentRecords);
    } else {
      await supabase.from('trailrun_payments').insert([{
        registration_id: firstRegId,
        order_id: orderId,
        txn_id: transaction.txn_id,
        amount: subtotalTickets,
        fee: totalFee,
        total_payment: transaction.total_payment,
        payment_method: transaction.payment_method,
        qr_string: transaction.qr_string || null,
        va_number: transaction.va_number || null,
        payment_link: transaction.payment_link || null,
        expired_at: expiredAt,
        is_sandbox: transaction.is_sandbox ?? true,
        status: 'pending',
      }]);
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        txn_id: transaction.txn_id,
        participant_count: evaluatedParticipants.length,
        subtotal: subtotalTickets,
        admin_fee_per_person: ADMIN_FEE_PER_PERSON,
        admin_fee: ADMIN_FEE,
        gateway_fee: gatewayFee,
        fee: totalFee,
        total_payment: transaction.total_payment,
        payment_method: transaction.payment_method,
        qr_string: transaction.qr_string,
        va_number: transaction.va_number,
        payment_link: transaction.payment_link,
        expired_at: expiredAt,
        is_sandbox: transaction.is_sandbox ?? true,
        participants: evaluatedParticipants.map((p) => ({
          nama: p.nama,
          kategori: p.kategori,
          tierName: p.tierName,
          priceAmount: p.priceAmount,
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
