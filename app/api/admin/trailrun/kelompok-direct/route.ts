import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

interface DirectParticipantInput {
  nama: string;
  nama_bib?: string;
  nik?: string;
  kk?: string;
  email?: string;
  no_bib?: string;
  ukuran_jersey?: string;
  no_hp?: string;
  kategori: string;
  tanggal_lahir?: string;
  jenis_kelamin: string;
  golongan_darah?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kontak_darurat?: string;
  riwayat_medis?: string;
}

interface KelompokDirectBody {
  group_name: string;
  pic_name: string;
  pic_email?: string;
  pic_phone?: string;
  participants: DirectParticipantInput[];
}

/**
 * POST /api/admin/trailrun/kelompok-direct
 * Menambahkan pendaftaran kelompok langsung oleh admin dengan:
 * - Nominal: Rp 0 (amount=0, fee=0, total_payment=0)
 * - Tipe Pembayaran: 'direct'
 * - Status langsung: 'paid' (Lunas)
 * - Auto-generate No. BIB unik (M-XXXXX / F-XXXXX) jika dikosongkan
 */
export async function POST(request: NextRequest) {
  try {
    const body: KelompokDirectBody = await request.json();
    const { group_name, pic_name, pic_email, pic_phone, participants } = body;

    if (!group_name || !group_name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama Komunitas / Grup wajib diisi.' },
        { status: 400 }
      );
    }

    if (!pic_name || !pic_name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama Penanggung Jawab (PIC) wajib diisi.' },
        { status: 400 }
      );
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Minimal 1 peserta wajib ditambahkan.' },
        { status: 400 }
      );
    }

    const invalidName = participants.some((p) => !p.nama || !p.nama.trim());
    if (invalidName) {
      return NextResponse.json(
        { success: false, message: 'Semua baris peserta wajib memiliki Nama Lengkap.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // 1. Ambil seluruh no_bib yang sudah terdaftar untuk auto-generate nomor urut berikutnya
    const { data: existingBibRows, error: bibFetchErr } = await supabase
      .from('trailrun_registrations')
      .select('no_bib')
      .not('no_bib', 'is', null);

    if (bibFetchErr) {
      console.error('[API Kelompok Direct] Gagal membaca daftar BIB:', bibFetchErr);
      return NextResponse.json(
        { success: false, message: 'Gagal memeriksa nomor BIB yang tersedia.' },
        { status: 500 }
      );
    }

    const usedBibs = new Set<string>();
    let maxMaleNum = 0;
    let maxFemaleNum = 0;

    (existingBibRows || []).forEach((row) => {
      const bib = (row.no_bib || '').trim().toUpperCase();
      if (!bib) return;
      usedBibs.add(bib);

      const mMatch = bib.match(/^M-(\d+)$/);
      if (mMatch) {
        const n = parseInt(mMatch[1], 10);
        if (n > maxMaleNum) maxMaleNum = n;
      }
      const fMatch = bib.match(/^F-(\d+)$/);
      if (fMatch) {
        const n = parseInt(fMatch[1], 10);
        if (n > maxFemaleNum) maxFemaleNum = n;
      }
    });

    // Helper generate next BIB
    const getNextAvailableBib = (gender: string): string => {
      const isFemale = (gender || '').toLowerCase().includes('perempuan') || (gender || '').toLowerCase() === 'f';
      const prefix = isFemale ? 'F-' : 'M-';
      let counter = isFemale ? maxFemaleNum + 1 : maxMaleNum + 1;

      while (usedBibs.has(`${prefix}${String(counter).padStart(5, '0')}`)) {
        counter += 1;
      }

      const newBib = `${prefix}${String(counter).padStart(5, '0')}`;
      usedBibs.add(newBib);
      if (isFemale) maxFemaleNum = counter;
      else maxMaleNum = counter;
      return newBib;
    };

    // Validasi BIB manual jika ada duplikat
    for (const p of participants) {
      const manualBib = (p.no_bib || '').trim().toUpperCase();
      if (manualBib) {
        if (usedBibs.has(manualBib)) {
          return NextResponse.json(
            { success: false, message: `Nomor BIB "${manualBib}" sudah terdaftar oleh peserta lain.` },
            { status: 400 }
          );
        }
        usedBibs.add(manualBib);
      }
    }

    // 2. Generate Order ID khusus Kelompok Direct
    const orderId = `TR-BULK-DIRECT-${Date.now().toString().slice(-6)}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    // 3. Siapkan payload insert peserta ke trailrun_registrations (status langsung 'paid')
    const insertPayload = participants.map((p) => {
      const manualBib = (p.no_bib || '').trim().toUpperCase();
      const resolvedBib = manualBib || getNextAvailableBib(p.jenis_kelamin || 'Laki-laki');
      const catClean = (p.kategori || '12K').toUpperCase();
      const resolvedCategory = catClean.includes('12')
        ? '12K'
        : catClean.includes('3')
        ? '3K'
        : '7K';

      return {
        nama: p.nama.trim(),
        nama_bib: (p.nama_bib || p.nama).trim(),
        nik: (p.nik || '').trim() || null,
        kk: (p.kk || '').trim() || null,
        email: (p.email || pic_email || '').trim() || '-',
        no_bib: resolvedBib,
        ukuran_jersey: (p.ukuran_jersey || '').trim().toUpperCase() || '-',
        no_hp: (p.no_hp || pic_phone || '').trim() || '-',
        alamat: (p.alamat || '').trim() || '-',
        kota: (p.kota || '').trim() || '-',
        provinsi: (p.provinsi || '').trim() || '-',
        kewarganegaraan: 'Indonesia',
        tanggal_lahir: (p.tanggal_lahir || '').trim() || '1995-01-01',
        jenis_kelamin: p.jenis_kelamin || 'Laki-laki',
        nama_komunitas: group_name.trim(),
        golongan_darah: (p.golongan_darah || '').trim() || '-',
        riwayat_medis: (p.riwayat_medis || '').trim() || '-',
        kontak_darurat: (p.kontak_darurat || pic_phone || '').trim() || '-',
        kategori: resolvedCategory,
        status: 'paid',
        registration_type: 'bulk',
        order_id: orderId,
      };
    });

    let { data: insertedRegistrations, error: regError } = await supabase
      .from('trailrun_registrations')
      .insert(insertPayload)
      .select('id, nama, email, kategori, no_bib');

    // Graceful fallback jika kolom opsional tertentu belum ada di schema
    if (regError) {
      console.warn('[API Kelompok Direct] Initial insert error, trying fallback:', regError.message);
      let fallbackPayload: any[] = [...insertPayload];
      const msg = regError.message?.toLowerCase() || '';
      if (msg.includes('order_id')) fallbackPayload = fallbackPayload.map(({ order_id, ...rest }) => rest);
      if (msg.includes('nama_bib')) fallbackPayload = fallbackPayload.map(({ nama_bib, ...rest }) => rest);
      if (msg.includes('registration_type'))
        fallbackPayload = fallbackPayload.map(({ registration_type, ...rest }) => rest);
      if (msg.includes('ukuran_jersey')) fallbackPayload = fallbackPayload.map(({ ukuran_jersey, ...rest }) => rest);
      if (msg.includes('nik')) fallbackPayload = fallbackPayload.map(({ nik, ...rest }) => rest);
      if (msg.includes('kk')) fallbackPayload = fallbackPayload.map(({ kk, ...rest }) => rest);

      const retryRes = await supabase
        .from('trailrun_registrations')
        .insert(fallbackPayload)
        .select('id, nama, email, kategori, no_bib');

      insertedRegistrations = retryRes.data;
      regError = retryRes.error;
    }

    if (regError) {
      console.error('[API Kelompok Direct] Failed to insert registrations:', regError);
      return NextResponse.json(
        { success: false, message: `Gagal menyimpan data peserta: ${regError.message}` },
        { status: 500 }
      );
    }

    // 4. Insert 1 record pembayaran Direct (Nominal 0, payment_method: 'direct', status: 'paid')
    const nowIso = new Date().toISOString();
    const primaryRegId = insertedRegistrations?.[0]?.id || orderId;
    const singlePaymentRecord = {
      registration_id: primaryRegId,
      order_id: orderId,
      txn_id: orderId,
      amount: 0,
      fee: 0,
      total_payment: 0,
      payment_method: 'direct',
      qr_string: null,
      va_number: null,
      payment_link: null,
      expired_at: nowIso,
      completed_at: nowIso,
      is_sandbox: false,
      status: 'paid',
      admin_fee: 0,
      gateway_fee: 0,
      admin_profit: 0,
      pic_name: pic_name.trim(),
      pic_phone: (pic_phone || '').trim() || null,
      pic_email: (pic_email || '').trim() || null,
    };

    const { error: payErr } = await supabase.from('trailrun_payments').insert([singlePaymentRecord]);
    if (payErr) {
      console.warn('[API Kelompok Direct] Payment insert warning, trying fallback:', payErr.message);
      const { admin_fee, gateway_fee, admin_profit, ...fallbackRecord } = singlePaymentRecord;
      const { error: fbErr } = await supabase.from('trailrun_payments').insert([fallbackRecord]);
      if (fbErr) {
        const { pic_name: _, pic_phone: __, pic_email: ___, ...basicRecord } = fallbackRecord;
        await supabase.from('trailrun_payments').insert([basicRecord]);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${insertedRegistrations?.length || participants.length} peserta kelompok (Direct Rp 0) dengan Order ID ${orderId}.`,
      data: {
        order_id: orderId,
        participants: insertedRegistrations || [],
      },
    });
  } catch (err: any) {
    console.error('[API Kelompok Direct] Server error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
