import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/trailrun/peserta/all
 * Mengambil daftar seluruh peserta publik dengan kolom minimal:
 * nama, nama_bib, no_bib, kategori.
 * Tanpa menyertakan id maupun created_at.
 */
export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    // Query hanya 4 kolom pokok, diurutkan secara alfabetis berdasarkan nama lengkap (A-Z)
    const { data, error } = await supabase
      .from('trailrun_registrations')
      .select('nama, nama_bib, no_bib, kategori')
      .not('no_bib', 'is', null)
      .order('nama', { ascending: true });

    if (error) {
      console.error('[API All Peserta] Supabase error:', error.message);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data peserta.' },
        { status: 500 }
      );
    }

    const participants = (data || []).map((p: any) => ({
      nama: p.nama || '—',
      nama_bib: p.nama_bib || p.nama || '—',
      no_bib: p.no_bib || '—',
      kategori: p.kategori || '12K',
    }));

    return NextResponse.json({
      success: true,
      total: participants.length,
      data: participants,
    });
  } catch (err: any) {
    console.error('[API All Peserta] Server error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
