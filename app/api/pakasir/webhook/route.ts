import { NextRequest, NextResponse } from 'next/server';
import { verifyPakasirWebhook } from '@/lib/pakasir';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Health check endpoint for Pakasir webhook
 * GET /api/pakasir/webhook
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'active',
      endpoint: '/api/pakasir/webhook',
      service: 'Pakasir Payment Gateway Webhook',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

/**
 * Pakasir Webhook Handler
 * POST /api/pakasir/webhook
 *
 * Dipanggil oleh Pakasir saat status transaksi berubah (completed, expired, canceled).
 * Atur URL webhook ini di dashboard Pakasir:
 * https://<domain-anda>/api/pakasir/webhook
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi X-Secret Header dari Pakasir
    const secretHeader =
      request.headers.get('x-secret') ||
      request.headers.get('X-Secret') ||
      request.headers.get('x-webhook-secret');

    const isSecretValid = verifyPakasirWebhook(secretHeader);
    if (!isSecretValid) {
      console.warn('⚠️ Webhook verification failed. Invalid or missing X-Secret header.', {
        receivedHeader: secretHeader ? `${secretHeader.slice(0, 4)}***` : 'null',
      });
      return NextResponse.json(
        { error: 'Unauthorized: Invalid secret header' },
        { status: 401 }
      );
    }

    // 2. Parse body payload
    const payload = await request.json();

    const txnId = payload.txn_id || payload.id || payload.transaction_id;
    const orderId = payload.order_id || payload.reference_id;
    const status = (payload.status || '').toLowerCase();
    const completedAt = payload.completed_at || new Date().toISOString();
    const amount = payload.amount;

    console.log('✅ Pakasir Webhook received:', {
      txn_id: txnId,
      order_id: orderId,
      status,
      amount,
      is_sandbox: payload.is_sandbox,
      timestamp: new Date().toISOString(),
    });

    if (!txnId && !orderId) {
      console.warn('Webhook payload missing txn_id and order_id:', payload);
      return NextResponse.json(
        { error: 'Bad Request: txn_id or order_id is required' },
        { status: 400 }
      );
    }

    // 3. Proses jika status pembayaran "completed" atau "settled" (berhasil dibayar)
    if (status === 'completed' || status === 'settled' || status === 'paid') {
      // 3a. Update record di tabel trailrun_payments
      let paymentQuery = supabase
        .from('trailrun_payments')
        .update({
          status: 'completed',
          completed_at: completedAt,
        });

      if (txnId) {
        paymentQuery = paymentQuery.eq('txn_id', txnId);
      } else {
        paymentQuery = paymentQuery.eq('order_id', orderId);
      }

      const { data: updatedPayments, error: paymentError } = await paymentQuery.select('registration_id');

      if (paymentError) {
        console.error('❌ Gagal update tabel trailrun_payments:', paymentError);
      } else {
        console.log('✅ trailrun_payments status updated to completed');
      }

      // 3b. Ambil registration_id untuk update tabel trailrun_registrations
      let regId = updatedPayments?.[0]?.registration_id;

      if (!regId) {
        // Fallback: cari langsung dari tabel trailrun_payments
        let findQuery = supabase.from('trailrun_payments').select('registration_id');
        if (txnId) {
          findQuery = findQuery.eq('txn_id', txnId);
        } else {
          findQuery = findQuery.eq('order_id', orderId);
        }
        const { data: found } = await findQuery.single();
        regId = found?.registration_id;
      }

      // 3c. Update status registrasi peserta menjadi "paid"
      if (regId) {
        const { error: regError } = await supabase
          .from('trailrun_registrations')
          .update({ status: 'paid' })
          .eq('id', regId);

        if (regError) {
          console.error('❌ Gagal update status registrasi:', regError);
        } else {
          console.log(`🎉 Peserta registration_id: ${regId} berhasil di-update menjadi PAID!`);
        }
      }
    } else if (status === 'canceled' || status === 'expired' || status === 'failed') {
      // 4. Proses jika pembayaran batal atau kedaluwarsa
      let paymentCancelQuery = supabase
        .from('trailrun_payments')
        .update({ status: status === 'failed' ? 'canceled' : status });

      if (txnId) {
        paymentCancelQuery = paymentCancelQuery.eq('txn_id', txnId);
      } else {
        paymentCancelQuery = paymentCancelQuery.eq('order_id', orderId);
      }

      await paymentCancelQuery;
      console.log(`ℹ️ Status pembayaran ${txnId || orderId} diperbarui menjadi ${status}`);
    }

    // 5. Berikan respon sukses 200 ke Pakasir
    return NextResponse.json(
      {
        received: true,
        success: true,
        order_id: orderId,
        txn_id: txnId,
        status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error fatal saat memproses webhook Pakasir:', error);
    // Tetap kembalikan 200 agar webhook tidak di-retry terus oleh gateway jika ada parsing error lokal
    return NextResponse.json(
      {
        received: true,
        error: error.message || 'Internal server error',
      },
      { status: 200 }
    );
  }
}
