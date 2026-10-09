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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, hasil_lari } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID peserta wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanHasil = (hasil_lari || '').trim() || '-';

    const { data, error } = await supabase
      .from('trailrun_registrations')
      .update({ hasil_lari: cleanHasil })
      .eq('id', id)
      .select('id, nama, no_bib, hasil_lari')
      .maybeSingle();

    if (error) {
      console.error('Error updating hasil_lari in Supabase:', error);
      if (error.code === '42703' || error.message?.includes('hasil_lari')) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Kolom "hasil_lari" belum ada di Supabase. Silakan jalankan file SQL migration di folder supabase/migrations.',
            needMigration: true,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { success: false, message: error.message || 'Gagal memperbarui hasil lari.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hasil lari berhasil diperbarui.',
      data,
    });
  } catch (err: any) {
    console.error('Error in /api/admin/trailrun/update-result:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
