import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export interface RpcVerificationRecord {
  id: string;
  registration_id?: string;
  no_bib: string;
  nama: string;
  nama_bib?: string | null;
  kategori: string;
  ukuran_jersey?: string | null;
  tanggal_lahir?: string | null;
  no_hp?: string | null;
  email?: string | null;
  mandatory_gear: boolean;
  waiver: boolean;
  surat_sehat: boolean;
  surat_izin_ortu: boolean;
  strava_12k: boolean;
  menunjukan_data_diri: boolean;
  status_pengambilan: 'belum_diambil' | 'syarat_kurang' | 'sudah_diambil_bersyarat' | 'sudah_diambil';
  waktu_pengambilan?: string | null;
  petugas?: string | null;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET /api/admin/trailrun/rpc
 * Mengambil daftar seluruh data verifikasi pengambilan race pack (RPC).
 * Dilengkapi auto-sync dari trailrun_registrations dan graceful fallback jika tabel baru belum dibuat.
 */
export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    // 1. Ambil seluruh data pendaftaran resmi yang memiliki no_bib
    const { data: regRows, error: regErr } = await supabase
      .from('trailrun_registrations')
      .select('id, no_bib, nama, nama_bib, kategori, ukuran_jersey, tanggal_lahir, no_hp, email')
      .not('no_bib', 'is', null)
      .order('no_bib', { ascending: true });

    if (regErr) {
      console.error('[API RPC GET] Error fetching registrations:', regErr);
      return NextResponse.json(
        { success: false, message: 'Gagal memuat data pendaftaran.' },
        { status: 500 }
      );
    }

    const regMap = new Map<string, any>();
    (regRows || []).forEach((r) => {
      const cleanBib = (r.no_bib || '').trim().toUpperCase();
      if (cleanBib) regMap.set(cleanBib, r);
    });

    // 2. Coba ambil dari tabel baru trailrun_rpc_verifications
    const { data: rpcRows, error: rpcErr } = await supabase
      .from('trailrun_rpc_verifications')
      .select('*')
      .order('no_bib', { ascending: true });

    // Jika tabel trailrun_rpc_verifications belum dibuat di Supabase (PostgreSQL 42P01: undefined_table)
    if (rpcErr && rpcErr.code === '42P01') {
      console.warn('[API RPC GET] Tabel trailrun_rpc_verifications belum dibuat, menggunakan data pendaftaran langsung.');
      
      const fallbackData: RpcVerificationRecord[] = Array.from(regMap.values()).map((r) => ({
        id: r.id,
        registration_id: r.id,
        no_bib: (r.no_bib || '').trim().toUpperCase(),
        nama: r.nama || '—',
        nama_bib: r.nama_bib || r.nama || '—',
        kategori: r.kategori || '12K',
        ukuran_jersey: r.ukuran_jersey || '—',
        tanggal_lahir: r.tanggal_lahir || null,
        no_hp: r.no_hp || null,
        email: r.email || null,
        mandatory_gear: false,
        waiver: false,
        surat_sehat: false,
        surat_izin_ortu: false,
        strava_12k: false,
        menunjukan_data_diri: false,
        status_pengambilan: 'belum_diambil',
        waktu_pengambilan: null,
        petugas: null,
        catatan: null,
      }));

      return NextResponse.json({
        success: true,
        needMigration: true,
        total: fallbackData.length,
        data: fallbackData,
      });
    }

    if (rpcErr) {
      console.error('[API RPC GET] Error fetching RPC table:', rpcErr);
      return NextResponse.json(
        { success: false, message: rpcErr.message || 'Gagal memuat data RPC.' },
        { status: 500 }
      );
    }

    // 3. Auto-sync: jika ada peserta di trailrun_registrations yang belum ada di trailrun_rpc_verifications, masukkan
    const existingBibs = new Set((rpcRows || []).map((row) => (row.no_bib || '').trim().toUpperCase()));
    const missingRowsToInsert: any[] = [];

    regMap.forEach((reg, bib) => {
      if (!existingBibs.has(bib)) {
        missingRowsToInsert.push({
          registration_id: reg.id,
          no_bib: bib,
          nama: reg.nama || '—',
          nama_bib: reg.nama_bib || reg.nama || '—',
          kategori: reg.kategori || '12K',
          ukuran_jersey: reg.ukuran_jersey || null,
          mandatory_gear: false,
          waiver: false,
          surat_sehat: false,
          surat_izin_ortu: false,
          strava_12k: false,
          menunjukan_data_diri: false,
          status_pengambilan: 'belum_diambil',
        });
      }
    });

    let mergedRpcRows = [...(rpcRows || [])];

    if (missingRowsToInsert.length > 0) {
      try {
        const { data: inserted, error: insErr } = await supabase
          .from('trailrun_rpc_verifications')
          .insert(missingRowsToInsert)
          .select();

        if (!insErr && inserted) {
          mergedRpcRows = [...mergedRpcRows, ...inserted];
        }
      } catch (e) {
        console.warn('[API RPC GET] Auto-sync insert warning:', e);
      }
    }

    // Map dan gabungkan data tanggal_lahir, no_hp, email untuk penentuan umur dan kontak
    const finalizedData: RpcVerificationRecord[] = mergedRpcRows.map((r) => {
      const cleanBib = (r.no_bib || '').trim().toUpperCase();
      const reg = regMap.get(cleanBib);
      return {
        ...r,
        no_bib: cleanBib,
        tanggal_lahir: reg?.tanggal_lahir || r.tanggal_lahir || null,
        ukuran_jersey: r.ukuran_jersey || reg?.ukuran_jersey || '—',
        nama_bib: r.nama_bib || reg?.nama_bib || r.nama,
        no_hp: reg?.no_hp || r.no_hp || null,
        email: reg?.email || r.email || null,
      };
    });

    // Urutkan berdasarkan no_bib
    finalizedData.sort((a, b) => (a.no_bib || '').localeCompare(b.no_bib || '', undefined, { numeric: true }));

    return NextResponse.json({
      success: true,
      total: finalizedData.length,
      data: finalizedData,
    });
  } catch (err: any) {
    console.error('[API RPC GET] Server error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/trailrun/rpc
 * Memperbarui status verifikasi 6 syarat & penyerahan paket lomba peserta.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      no_bib,
      mandatory_gear,
      waiver,
      surat_sehat,
      surat_izin_ortu,
      strava_12k,
      menunjukan_data_diri,
      status_pengambilan,
      petugas,
      catatan,
    } = body;

    if (!id && !no_bib) {
      return NextResponse.json(
        { success: false, message: 'ID atau Nomor BIB peserta wajib disertakan.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Hitung waktu_pengambilan otomatis jika diserahkan
    let waktuPengambilan: string | null = null;
    if (status_pengambilan === 'sudah_diambil' || status_pengambilan === 'sudah_diambil_bersyarat') {
      waktuPengambilan = new Date().toISOString();
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (mandatory_gear !== undefined) updatePayload.mandatory_gear = Boolean(mandatory_gear);
    if (waiver !== undefined) updatePayload.waiver = Boolean(waiver);
    if (surat_sehat !== undefined) updatePayload.surat_sehat = Boolean(surat_sehat);
    if (surat_izin_ortu !== undefined) updatePayload.surat_izin_ortu = Boolean(surat_izin_ortu);
    if (strava_12k !== undefined) updatePayload.strava_12k = Boolean(strava_12k);
    if (menunjukan_data_diri !== undefined) updatePayload.menunjukan_data_diri = Boolean(menunjukan_data_diri);
    if (status_pengambilan !== undefined) {
      updatePayload.status_pengambilan = status_pengambilan;
      if (waktuPengambilan) {
        updatePayload.waktu_pengambilan = waktuPengambilan;
      } else if (status_pengambilan === 'belum_diambil') {
        updatePayload.waktu_pengambilan = null;
      }
    }
    if (petugas !== undefined) updatePayload.petugas = (petugas || '').trim() || null;
    if (catatan !== undefined) {
      updatePayload.catatan = (catatan || '').trim() || null;
    }
    // Jika status sudah_diambil_bersyarat dan catatan kosong, default ke "sudah ttd"
    if (status_pengambilan === 'sudah_diambil_bersyarat' && !updatePayload.catatan) {
      updatePayload.catatan = 'sudah ttd';
    }

    // Eksekusi update ke tabel trailrun_rpc_verifications
    let query = supabase.from('trailrun_rpc_verifications').update(updatePayload);

    if (id) {
      query = query.eq('id', id);
    } else if (no_bib) {
      query = query.eq('no_bib', (no_bib || '').trim().toUpperCase());
    }

    const { data, error } = await query.select().maybeSingle();

    // Jika tabel belum dibuat di database, beri respons panduan yang bersahabat
    if (error && error.code === '42P01') {
      return NextResponse.json({
        success: true,
        needMigration: true,
        message: 'Tabel "trailrun_rpc_verifications" belum dibuat di database. Jalankan file migrasi SQL di folder supabase/migrations.',
        data: {
          id: id || no_bib,
          no_bib,
          ...updatePayload,
        },
      });
    }

    if (error) {
      console.error('[API RPC POST] Error update Supabase:', error);
      return NextResponse.json(
        { success: false, message: error.message || 'Gagal menyimpan perubahan verifikasi RPC.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data verifikasi race pack berhasil diperbarui.',
      data,
    });
  } catch (err: any) {
    console.error('[API RPC POST] Server error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
