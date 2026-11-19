import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/trailrun/update-bpjs
 * Memperbarui data NIK, No. KK, ID ITRA, Nama Lengkap, dan No. BIB peserta.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nama, nama_bib, no_bib, nik, kk, id_itra } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID peserta wajib disertakan.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Siapkan payload update
    const updatePayload: Record<string, any> = {};

    if (nama !== undefined) {
      updatePayload.nama = (nama || '').trim();
    }
    if (nama_bib !== undefined) {
      updatePayload.nama_bib = (nama_bib || '').trim() || null;
    }
    if (no_bib !== undefined) {
      updatePayload.no_bib = (no_bib || '').trim().toUpperCase();
    }
    if (nik !== undefined) {
      updatePayload.nik = (nik || '').trim() || null;
    }
    if (kk !== undefined) {
      updatePayload.kk = (kk || '').trim() || null;
    }
    if (id_itra !== undefined) {
      updatePayload.id_itra = (id_itra || '').trim() || null;
    }

    // Lakukan update ke Supabase
    let { data, error } = await supabase
      .from('trailrun_registrations')
      .update(updatePayload)
      .eq('id', id)
      .select('id, nama, nama_bib, no_bib, nik, kk, id_itra, kategori, status')
      .maybeSingle();

    // Jika terjadi error kolom id_itra atau nama_bib belum ada di tabel Supabase
    if (error && (error.code === '42703' || error.message?.includes('id_itra') || error.message?.includes('nama_bib'))) {
      console.warn('[Admin BPJS] Kolom id_itra/nama_bib belum ada di Supabase, mencoba update tanpa kolom tersebut...');
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.id_itra;
      delete fallbackPayload.nama_bib;

      const fallbackRes = await supabase
        .from('trailrun_registrations')
        .update(fallbackPayload)
        .eq('id', id)
        .select('id, nama, no_bib, nik, kk, kategori, status')
        .maybeSingle();

      if (fallbackRes.error) {
        return NextResponse.json(
          {
            success: false,
            message: fallbackRes.error.message || 'Gagal memperbarui data peserta.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          'Data berhasil disimpan. (Catatan: Kolom "nama_bib" / "id_itra" belum dibuat di database. Jalankan SQL migration di folder supabase/migrations).',
        needMigration: true,
        data: fallbackRes.data,
      });
    }

    if (error) {
      console.error('[Admin BPJS] Error update Supabase:', error);
      return NextResponse.json(
        { success: false, message: error.message || 'Gagal menyimpan perubahan data BPJS/ITRA.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data BPJS & ITRA peserta berhasil diperbarui.',
      data,
    });
  } catch (err: any) {
    console.error('[Admin BPJS] Server error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
