import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPakasirTransactionStatus } from '@/lib/pakasir';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Izinkan eksekusi hingga 60 detik di Vercel

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbyrvileybbqfuzgbty.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7';

const supabase = createClient(supabaseUrl, supabaseKey);

// Batas waktu: 1 jam 5 menit (65 menit)
const CUTOFF_MINUTES = 65;

/**
 * Handler pembersihan transaksi & pendaftaran yang belum dibayar
 * Berjalan otomatis via Vercel Cron (setiap 1 jam) atau dipicu manual oleh Admin.
 */
async function handleCleanup(request: NextRequest) {
  try {
    // 1. Verifikasi Keamanan / Otorisasi Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const keyParam = request.nextUrl.searchParams.get('key');
    const isManualAdmin = request.nextUrl.searchParams.get('source') === 'admin';

    if (cronSecret && !isManualAdmin) {
      const isBearerValid = authHeader === `Bearer ${cronSecret}`;
      const isKeyValid = keyParam === cronSecret;

      if (!isBearerValid && !isKeyValid) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid cron secret' },
          { status: 401 }
        );
      }
    }

    // 2. Hitung timestamp batas waktu (1 jam 5 menit yang lalu)
    const cutoffTime = new Date(Date.now() - CUTOFF_MINUTES * 60 * 1000).toISOString();

    console.log(`[Cron Cleanup] Memulai pembersihan data kadaluarsa sebelum: ${cutoffTime}`);

    // 3. Ambil data pembayaran yang statusnya BELUM 'completed'/'paid' dan dibuat > 65 menit lalu
    const { data: unpaidPayments, error: payError } = await supabase
      .from('trailrun_payments')
      .select('id, registration_id, txn_id, order_id, status, created_at')
      .lte('created_at', cutoffTime)
      .not('status', 'in', '("completed","settled","paid")');

    if (payError) {
      console.error('[Cron Cleanup] Gagal mengambil trailrun_payments:', payError);
      return NextResponse.json(
        { error: 'Gagal membaca tabel trailrun_payments', details: payError.message },
        { status: 500 }
      );
    }

    const candidatePayments = unpaidPayments || [];
    const paymentIdsToDelete: string[] = [];
    const regIdsFromPayments: string[] = [];

    // 4. Verifikasi ke Pakasir untuk setiap transaksi (safety net: jangan hapus jika ternyata baru saja dibayar)
    for (const payment of candidatePayments) {
      let isActuallyPaid = false;

      if (payment.txn_id) {
        try {
          const statusRes = await getPakasirTransactionStatus(payment.txn_id);
          if (statusRes && (statusRes.status === 'completed' || (statusRes as any).status === 'settled')) {
            isActuallyPaid = true;

            // Jika di Pakasir ternyata statusnya sudah lunas, perbarui ke database (jangan dihapus!)
            await supabase
              .from('trailrun_payments')
              .update({
                status: 'completed',
                completed_at: statusRes.completed_at || new Date().toISOString(),
              })
              .eq('id', payment.id);

            if (payment.registration_id) {
              await supabase
                .from('trailrun_registrations')
                .update({ status: 'paid' })
                .eq('id', payment.registration_id);
            }

            console.log(`[Cron Cleanup] Transaksi ${payment.txn_id} ternyata lunas di gateway. Diupdate ke completed.`);
          }
        } catch (apiErr) {
          // Jika gagal hubungi Pakasir / 404 / expired, anggap unpaid
        }
      }

      if (!isActuallyPaid) {
        paymentIdsToDelete.push(payment.id);
        if (payment.registration_id) {
          regIdsFromPayments.push(payment.registration_id);
        }
      }
    }

    // 5. Cari pendaftaran di trailrun_registrations yang:
    // a. Terkait dengan payment unpaid di atas, ATAU
    // b. Belum pernah membuat pembayaran sama sekali (ditinggalkan di Step 3) dan usianya > 65 menit
    const { data: oldUnpaidRegistrations, error: regError } = await supabase
      .from('trailrun_registrations')
      .select('id, nama, no_bib, status, created_at')
      .lte('created_at', cutoffTime)
      .not('status', 'in', '("completed","settled","paid")');

    if (regError) {
      console.error('[Cron Cleanup] Gagal mengambil trailrun_registrations:', regError);
    }

    // 6. Ambil semua registration_id yang memiliki status pembayaran SUDAH LUNAS di trailrun_payments
    // Ini perlindungan mutlak agar data peserta yang sah tidak akan pernah terhapus!
    const { data: paidPayments } = await supabase
      .from('trailrun_payments')
      .select('registration_id')
      .in('status', ['completed', 'settled', 'paid']);

    const paidRegIdSet = new Set(
      (paidPayments || []).map((p: any) => p.registration_id).filter(Boolean)
    );

    // Kumpulkan semua candidate registration_id
    const candidateRegIds = new Set<string>([
      ...regIdsFromPayments,
      ...(oldUnpaidRegistrations || []).map((r: any) => r.id),
    ]);

    // Filter pendaftaran yang aman untuk dihapus (BUKAN peserta yang sudah lunas)
    const finalRegIdsToDelete = Array.from(candidateRegIds).filter(
      (id) => id && !paidRegIdSet.has(id)
    );

    // Kumpulkan detail pendaftar yang akan dihapus untuk audit log
    const deletedParticipantsInfo = (oldUnpaidRegistrations || [])
      .filter((r: any) => finalRegIdsToDelete.includes(r.id))
      .map((r: any) => ({
        id: r.id,
        nama: r.nama,
        no_bib: r.no_bib,
        status: r.status,
        created_at: r.created_at,
      }));

    // 7. Eksekusi Penghapusan
    // A. Hapus data di tabel trailrun_payments terlebih dahulu (mencegah error foreign key)
    let deletedPaymentsCount = 0;
    if (paymentIdsToDelete.length > 0) {
      const { error: delPayErr } = await supabase
        .from('trailrun_payments')
        .delete()
        .in('id', paymentIdsToDelete);

      if (delPayErr) {
        console.error('[Cron Cleanup] Error menghapus trailrun_payments:', delPayErr);
      } else {
        deletedPaymentsCount = paymentIdsToDelete.length;
      }
    }

    // Pastikan jika ada pembayaran tersisa yang berelasi dengan registration yang akan dihapus juga ikut dibersihkan
    if (finalRegIdsToDelete.length > 0) {
      await supabase
        .from('trailrun_payments')
        .delete()
        .in('registration_id', finalRegIdsToDelete);
    }

    // B. Hapus data di tabel trailrun_registrations
    let deletedRegistrationsCount = 0;
    if (finalRegIdsToDelete.length > 0) {
      const { error: delRegErr } = await supabase
        .from('trailrun_registrations')
        .delete()
        .in('id', finalRegIdsToDelete);

      if (delRegErr) {
        console.error('[Cron Cleanup] Error menghapus trailrun_registrations:', delRegErr);
      } else {
        deletedRegistrationsCount = finalRegIdsToDelete.length;
      }
    }

    console.log(`[Cron Cleanup] Selesai. Dihapus: ${deletedPaymentsCount} pembayaran, ${deletedRegistrationsCount} pendaftaran.`);

    return NextResponse.json({
      success: true,
      message: `Pembersihan berhasil. Dihapus ${deletedPaymentsCount} transaksi pembayaran dan ${deletedRegistrationsCount} pendaftaran yang belum dibayar (> ${CUTOFF_MINUTES} menit).`,
      cutoff_minutes: CUTOFF_MINUTES,
      cutoff_time: cutoffTime,
      deleted: {
        payments_count: deletedPaymentsCount,
        registrations_count: deletedRegistrationsCount,
        participants: deletedParticipantsInfo,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron Cleanup] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem saat pembersihan cron.' },
      { status: 500 }
    );
  }
}

// Vercel Cron memanggil route dengan metode GET
export async function GET(request: NextRequest) {
  return handleCleanup(request);
}

// POST juga didukung untuk pemanggilan manual via tombol admin atau trigger eksternal
export async function POST(request: NextRequest) {
  return handleCleanup(request);
}
