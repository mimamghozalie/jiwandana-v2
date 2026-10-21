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
    const { order_id, txn_id, registration_ids, pic_phone: bodyPicPhone } = body;

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
      console.error('Error finding payments to cancel:', findError);
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
    let deletedCount = 0;
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

    // 3. Hapus peserta dari trailrun_registrations berdasarkan list ID
    const regIdList = Array.from(allRegIds);
    if (regIdList.length > 0) {
      const { data: delData, error: regDelErr } = await supabase
        .from('trailrun_registrations')
        .delete()
        .in('id', regIdList)
        .neq('status', 'paid')
        .select('id');

      if (!regDelErr && delData) {
        deletedCount += delData.length;
      }
    }

    // 4. Hapus juga via nomor HP PIC (jika ada di payment atau di body)
    const picPhone = bodyPicPhone || payments?.[0]?.pic_phone;
    if (picPhone) {
      const { data: delPicData } = await supabase
        .from('trailrun_registrations')
        .delete()
        .eq('pic_phone', picPhone)
        .neq('status', 'paid')
        .select('id');

      if (delPicData) {
        deletedCount += delPicData.length;
      }
    }

    // 5. Terakhir, hapus data transaksi dari trailrun_payments
    if (order_id) {
      await supabase.from('trailrun_payments').delete().eq('order_id', order_id);
    }
    if (txn_id) {
      await supabase.from('trailrun_payments').delete().eq('txn_id', txn_id);
    }

    return NextResponse.json({
      success: true,
      message: `Transaksi kelompok berhasil dibatalkan. Data pendaftaran telah dibersihkan.`,
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
