import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbyrvileybbqfuzgbty.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

// Helper with timeout to prevent hung queries
async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 3500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), timeoutMs)
    ),
  ]);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bibParam = searchParams.get('no_bib') || searchParams.get('bib');

    if (!bibParam || !bibParam.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nomor BIB wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanBib = bibParam.trim().toUpperCase();

    // Query langsung ke tabel trailrun_registrations di database
    const regQuery = supabase
      .from('trailrun_registrations')
      .select('*')
      .ilike('no_bib', cleanBib)
      .limit(1)
      .maybeSingle();

    const { data: reg, error: regError } = await withTimeout(regQuery, 4000);

    if (regError) {
      console.error('Supabase query error searching participant:', regError);
      return NextResponse.json(
        { success: false, message: 'Terjadi gangguan saat menghubungi database.' },
        { status: 500 }
      );
    }

    if (!reg) {
      return NextResponse.json(
        {
          success: false,
          message: `Tidak ada peserta yang terdaftar dengan nomor BIB "${cleanBib}".`,
        },
        { status: 404 }
      );
    }

    // Ambil data pembayaran terkait jika ada
    let paymentInfo = null;
    try {
      const payQuery = supabase
        .from('trailrun_payments')
        .select('order_id, amount, fee, total_payment, payment_method, status, completed_at')
        .eq('registration_id', reg.id)
        .limit(1)
        .maybeSingle();

      const { data: pay } = await withTimeout(payQuery, 2500);
      paymentInfo = pay || null;
    } catch {
      // ignore payment join error
    }

    return NextResponse.json({
      success: true,
      data: {
        ...reg,
        payment: paymentInfo,
      },
    });
  } catch (error: any) {
    console.error('Error fetching participant detail by BIB:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem saat mencari peserta.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trailrun/peserta?id=xxx
 * Menghapus satu pendaftar dan transaksi pembayarannya langsung
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pendaftaran wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Hapus transaksi pembayaran terkait terlebih dahulu
    await supabase.from('trailrun_payments').delete().eq('registration_id', id);

    // 2. Hapus data pendaftaran
    const { error: delError } = await supabase
      .from('trailrun_registrations')
      .delete()
      .eq('id', id);

    if (delError) {
      throw delError;
    }

    return NextResponse.json({
      success: true,
      message: 'Pendaftar berhasil dihapus dari database.',
    });
  } catch (error: any) {
    console.error('Error deleting participant:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus pendaftar.' },
      { status: 500 }
    );
  }
}
