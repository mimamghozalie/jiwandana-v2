import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inputPassword = (body.password || '').toString().trim();

    if (!inputPassword) {
      return NextResponse.json(
        { valid: false, error: 'Password wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Ambil password dynamic dari tabel trailrun_pricing_tiers di Supabase
    let dbPassword = '';
    try {
      const { data, error } = await supabase
        .from('trailrun_pricing_tiers')
        .select('*')
        .eq('id', 'flashsale')
        .maybeSingle();

      if (!error && data) {
        dbPassword = data.access_password || data.password || '';
      }
    } catch (_) {}

    // 2. Fallback ke env atau default jika belum diset di tabel
    const expectedPassword =
      dbPassword ||
      process.env.NEXT_PUBLIC_FLASHSALE_PASSWORD ||
      'FLASHSALE2026';

    const isValid = inputPassword.toUpperCase() === expectedPassword.toUpperCase();

    if (isValid) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json(
      { valid: false, error: 'Password Flash Sale salah. Silakan periksa kembali kode akses Anda.' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Error verifying flash sale password:', err);
    return NextResponse.json(
      { valid: false, error: 'Terjadi kesalahan sistem saat verifikasi.' },
      { status: 500 }
    );
  }
}

