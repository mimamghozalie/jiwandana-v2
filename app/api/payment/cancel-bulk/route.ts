import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/cancel-bulk
 * Membatalkan transaksi pendaftaran kelompok dan menghapus data pendaftaran terkait.
 * Body: { order_id?: string, txn_id?: string, registration_ids?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();
    const serviceKeyPresent = !!(
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );
    console.log(`[Cancel Bulk] Service Role Key aktif: ${serviceKeyPresent}`);

    const body = await request.json();
    const { order_id, txn_id, registration_ids } = body;

    if (!order_id && !txn_id && (!registration_ids || registration_ids.length === 0)) {
      return NextResponse.json(
        { success: false, message: 'order_id, txn_id, atau registration_ids wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Cari data pembayaran berdasarkan order_id atau txn_id
    let payQuery = supabase
      .from('trailrun_payments')
      .select('id, registration_id, status, order_id, pic_phone, pic_name');

    if (order_id) {
      payQuery = payQuery.eq('order_id', order_id);
    } else if (txn_id) {
      payQuery = payQuery.eq('txn_id', txn_id);
    }

    const { data: payments, error: findError } = await payQuery;

    if (findError) {
      console.error('[Cancel Bulk] Error finding payments to cancel:', findError);
    }

    // Pastikan tidak membatalkan yang sudah lunas
    const hasCompleted = payments?.some((p) => p.status === 'completed' || p.status === 'settled');
    if (hasCompleted) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transaksi ini telah lunas dan tidak dapat dibatalkan.',
        },
        { status: 400 }
      );
    }

    // 2. Kumpulkan SEMUA registration_id yang perlu dihapus
    const allRegIds = new Set<string>();

    // Tambahkan id dari body jika ada
    if (Array.isArray(registration_ids)) {
      registration_ids.forEach((id: string) => {
        if (id) allRegIds.add(id);
      });
    }

    // Tambahkan registration_id dari record pembayaran
    (payments || []).forEach((p) => {
      if (p.registration_id) allRegIds.add(p.registration_id);
    });

    const regIdList = Array.from(allRegIds);
    console.log(`[Cancel Bulk] Menghapus ${regIdList.length} peserta dengan ID:`, regIdList);

    // 3. Hapus data transaksi dari trailrun_payments terlebih dahulu
    // (Mencegah foreign key constraint error jika registration_id direferensikan)
    if (order_id) {
      const { error: delPayErr } = await supabase
        .from('trailrun_payments')
        .delete()
        .eq('order_id', order_id);
      if (delPayErr) console.error('[Cancel Bulk] Gagal delete payment by order_id:', delPayErr.message);
    }
    if (txn_id) {
      const { error: delTxnErr } = await supabase
        .from('trailrun_payments')
        .delete()
        .eq('txn_id', txn_id);
      if (delTxnErr) console.error('[Cancel Bulk] Gagal delete payment by txn_id:', delTxnErr.message);
    }
    if (regIdList.length > 0) {
      // Hapus sisa payment yang mereferensikan registration_id tersebut jika ada
      await supabase
        .from('trailrun_payments')
        .delete()
        .in('registration_id', regIdList);
    }

    // 4. Hapus seluruh peserta rombongan dari trailrun_registrations
    let deletedCount = 0;
    const deletedIdSet = new Set<string>();

    // Cara 1 (Sangat Bersih & Langsung): Hapus semua anggota rombongan dengan order_id yang sama
    if (order_id) {
      const { data: rowsByOrder, error: errByOrder } = await supabase
        .from('trailrun_registrations')
        .delete()
        .eq('order_id', order_id)
        .select('id');

      if (!errByOrder && rowsByOrder) {
        rowsByOrder.forEach((r) => deletedIdSet.add(r.id));
        console.log(`[Cancel Bulk] Berhasil menghapus ${rowsByOrder.length} peserta via order_id="${order_id}".`);
      } else if (errByOrder) {
        console.warn('[Cancel Bulk] Info: Gagal delete via order_id (mungkin kolom belum ada):', errByOrder.message);
      }
    }

    // Cara 2: Hapus peserta berdasarkan list registration_id
    if (regIdList.length > 0) {
      const remainingIds = regIdList.filter((id) => !deletedIdSet.has(id));
      if (remainingIds.length > 0) {
        const { data: deletedRows, error: delResultError } = await supabase
          .from('trailrun_registrations')
          .delete()
          .in('id', remainingIds)
          .select('id');

        if (delResultError) {
          console.error('[Cancel Bulk] Gagal delete trailrun_registrations via ID list:', delResultError.message);
        } else if (deletedRows) {
          deletedRows.forEach((r) => deletedIdSet.add(r.id));
        }
      }
    }

    deletedCount = deletedIdSet.size;
    console.log(`[Cancel Bulk] Total ${deletedCount} baris peserta dibersihkan dari database.`);

    return NextResponse.json({
      success: true,
      message: `Transaksi kelompok berhasil dibatalkan. ${deletedCount} data pendaftaran telah dibersihkan.`,
      deleted: {
        order_id: order_id || null,
        txn_id: txn_id || null,
        registrations_count: deletedCount,
      },
    });
  } catch (error: any) {
    console.error('Error cancelling bulk transaction:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem saat membatalkan transaksi.' },
      { status: 500 }
    );
  }
}
