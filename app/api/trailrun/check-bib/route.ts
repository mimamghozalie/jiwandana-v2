import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbyrvileybbqfuzgbty.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

// Helper to prevent hanging on network/Supabase timeouts
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
    const bibParam = searchParams.get('bib');

    if (!bibParam || !bibParam.trim()) {
      return NextResponse.json(
        { available: false, error: 'Nomor BIB wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanBib = bibParam.trim().toUpperCase();

    // Enforce exactly 7 characters: F-XXXXX or M-XXXXX
    if (cleanBib.length !== 7 || !/^[FM]-\d{5}$/.test(cleanBib)) {
      return NextResponse.json({
        available: false,
        bib: cleanBib,
        message: 'Nomor BIB harus tepat 7 karakter dengan format F-XXXXX atau M-XXXXX (contoh: M-00001, F-00001).',
      });
    }

    // Query trailrun_registrations for any registration with matching no_bib (case-insensitive)
    const queryPromise = supabase
      .from('trailrun_registrations')
      .select('id, no_bib, nama, status')
      .ilike('no_bib', cleanBib)
      .limit(1);

    const { data, error } = await withTimeout(queryPromise, 3500);

    if (error) {
      console.error('Supabase query error checking BIB:', error);
      return NextResponse.json(
        { available: false, error: 'Gagal memeriksa ketersediaan nomor BIB di database.' },
        { status: 500 }
      );
    }

    const isTaken = !!(data && data.length > 0);

    return NextResponse.json({
      available: !isTaken,
      bib: cleanBib,
      message: isTaken
        ? `Nomor BIB "${cleanBib}" sudah terdaftar oleh peserta lain.`
        : `Nomor BIB "${cleanBib}" tersedia.`,
    });
  } catch (err: any) {
    console.error('Error in check-bib API route:', err);
    return NextResponse.json(
      { available: false, error: err.message || 'Terjadi kesalahan sistem saat memeriksa BIB.' },
      { status: 500 }
    );
  }
}
