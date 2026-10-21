import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/cancel-bulk
 * Membatalkan transaksi pendaftaran kelompok dan menghapus data pendaftaran terkait.
 * Body: { order_id?: string, txn_id?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, txn_id } = body;

    if (!order_id && !txn_id) {
      return NextResponse.json(
        { success: false, message: 'order_id atau txn_id wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Cari data pembayaran berdasarkan order_id atau txn_id
    let payQuery = supabase.from('trailrun_payments').select('id, registration_id, status, order_id');
    if (order_id) {
      payQuery = payQuery.eq('order_id', order_id);
    } else {
      payQuery = payQuery.eq('txn_id', txn_id);
    }

    const { data: payments, error: findError } = await payQuery;

    if (findError) {
      console.error('Error finding payments to cancel:', findError);
      return NextResponse.json(
        { success: false, message: `Gagal mencari transaksi: ${findError.message}` },
        { status: 500 }
      );
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

    // 2. Hapus data dari trailrun_payments
    if (order_id) {
      await supabase.from('trailrun_payments').delete().eq('order_id', order_id);
    } else if (txn_id) {
      await supabase.from('trailrun_payments').delete().eq('txn_id', txn_id);
    }

    // 3. Hapus data peserta rombongan dari trailrun_registrations
    // Pertama gunakan list registration_id jika ada
    let deletedCount = 0;
    const regIds = (payments || []).map((p) => p.registration_id).filter(Boolean);

    // Ambil data pembayaran untuk info PIC tambahan
    const picPhone = payments?.[0]?.pic_phone;
    const picName = payments?.[0]?.pic_name;

    if (regIds.length > 0) {
      const { error: regDelErr } = await supabase
        .from('trailrun_registrations')
        .delete()
        .in('id', regIds);

      if (!regDelErr) {
        deletedCount += regIds.length;
      }
    }

    // Jika ada nomor HP PIC dan status masih pending, hapus peserta kelompok terkait yang belum paid
    if (picPhone) {
      await supabase
        .from('trailrun_registrations')
        .delete()
        .eq('pic_phone', picPhone)
        .neq('status', 'paid');
    }

    return NextResponse.json({
      success: true,
      message: `Transaksi kelompok berhasil dibatalkan. ${deletedCount} data pendaftaran telah dihapus.`,
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
