import { NextRequest, NextResponse } from 'next/server';
import { getPakasirTransactionStatus } from '@/lib/pakasir';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check payment transaction status
 * GET /api/payment/status?txn_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const txnId = request.nextUrl.searchParams.get('txn_id');

    if (!txnId) {
      return NextResponse.json(
        { error: 'Parameter txn_id wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Cek di database Supabase terlebih dahulu
    const { data: dbPayment } = await supabase
      .from('trailrun_payments')
      .select('registration_id, status, completed_at, is_sandbox, order_id')
      .eq('txn_id', txnId)
      .maybeSingle();

    // Jika sudah tercatat selesai di Supabase (misal dari webhook), langsung respon sukses
    if (dbPayment?.status === 'completed') {
      return NextResponse.json({
        success: true,
        data: {
          txn_id: txnId,
          order_id: dbPayment.order_id,
          status: 'completed',
          completed_at: dbPayment.completed_at,
          is_sandbox: dbPayment.is_sandbox,
        },
      });
    }

    // 2. Jika belum selesai di database, tanyakan ke Pakasir API
    let pakasirStatus: any = null;
    try {
      pakasirStatus = await getPakasirTransactionStatus(txnId);
    } catch (apiErr: any) {
      // Jika kena rate limit (429) atau error sementara, jangan return 500!
      // Kembalikan status pending dari database agar UI frontend tidak error
      console.warn('Pakasir status fetch warning (graceful fallback):', apiErr.message);
      return NextResponse.json({
        success: true,
        data: {
          txn_id: txnId,
          order_id: dbPayment?.order_id,
          status: dbPayment?.status || 'pending',
          is_sandbox: dbPayment?.is_sandbox,
          rate_limited: apiErr.message?.includes('429'),
        },
      });
    }

    // 3. Jika Pakasir mengonfirmasi transaksi completed, sinkronkan ke Supabase
    if (pakasirStatus && (pakasirStatus.status === 'completed' || pakasirStatus.status === 'settled')) {
      await supabase
        .from('trailrun_payments')
        .update({
          status: 'completed',
          completed_at: pakasirStatus.completed_at || new Date().toISOString(),
        })
        .eq('txn_id', txnId);

      if (dbPayment?.registration_id) {
        await supabase
          .from('trailrun_registrations')
          .update({ status: 'paid' })
          .eq('id', dbPayment.registration_id);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        txn_id: txnId,
        order_id: pakasirStatus?.order_id || dbPayment?.order_id,
        status: pakasirStatus?.status || dbPayment?.status || 'pending',
        is_sandbox: pakasirStatus?.is_sandbox ?? dbPayment?.is_sandbox,
        completed_at: pakasirStatus?.completed_at || dbPayment?.completed_at,
      },
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengecek status pembayaran.' },
      { status: 500 }
    );
  }
}
