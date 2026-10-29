import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';
import { getSilatSessionFromRequest } from '@/lib/silatAuth';
import type { AtletItem, OfficialItem } from '@/components/silat/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSilatSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Autentikasi diperlukan. Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }

    const kontingenId = session.kontingenId;

    // 1. Ambil data kontingen
    const { data: kontingen, error: kError } = await supabase
      .from('silat_kontingen')
      .select('*')
      .eq('id', kontingenId)
      .maybeSingle();

    if (kError || !kontingen) {
      return NextResponse.json(
        { error: 'Data kontingen tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 2. Ambil data officials
    const { data: rawOfficials, error: offError } = await supabase
      .from('silat_officials')
      .select('*')
      .eq('kontingen_id', kontingenId)
      .order('created_at', { ascending: true });

    if (offError) {
      console.error('Error fetching officials:', offError);
    }

    // 3. Ambil data atlet
    const { data: rawAtlets, error: atlError } = await supabase
      .from('silat_atlets')
      .select('*')
      .eq('kontingen_id', kontingenId)
      .order('created_at', { ascending: true });

    if (atlError) {
      console.error('Error fetching atlets:', atlError);
    }

    // Map database snake_case ke camelCase untuk Frontend
    const officials: OfficialItem[] = (rawOfficials || []).map((row: any) => ({
      id: row.id,
      nama: row.nama || '',
      jabatan: row.jabatan || 'Official',
      nik: row.nik || '',
      tanggalLahir: row.tanggal_lahir ? String(row.tanggal_lahir).split('T')[0] : '',
      kota: row.kota || '',
      jenisKelamin: row.jenis_kelamin || 'Laki-Laki',
      noHp: row.no_hp || '',
      email: row.email || '',
      fotoUrl: row.foto_url || '',
      kkUrl: row.kk_url || '',
    }));

    const atlets: (AtletItem & { status?: string; orderId?: string })[] = (rawAtlets || []).map((row: any) => ({
      id: row.id,
      nama: row.nama || '',
      asalSekolah: row.asal_sekolah || '',
      nik: row.nik || '',
      tanggalLahir: row.tanggal_lahir ? String(row.tanggal_lahir).split('T')[0] : '',
      umur: row.umur ?? '',
      tinggi: row.tinggi ?? '',
      berat: row.berat ?? '',
      kota: row.kota || '',
      jenisKelamin: row.jenis_kelamin || 'Laki-Laki',
      tingkatPendidikan: row.tingkat_pendidikan || '',
      kategoriLomba: row.kategori_lomba || '',
      kategoriKelasSeni: row.kategori_kelas_seni || '',
      noHp: row.no_hp || '',
      email: row.email || '',
      fotoUrl: row.foto_url || '',
      kkUrl: row.kk_url || '',
      status: row.status || 'pending',
      orderId: row.order_id || '',
    }));

    return NextResponse.json({
      success: true,
      kontingen: {
        id: kontingen.id,
        namaKontingen: kontingen.nama_kontingen,
        asalSekolah: kontingen.asal_sekolah || '',
        kota: kontingen.kota || '',
        picName: kontingen.pic_name || '',
        picPhone: kontingen.pic_phone || '',
        picEmail: kontingen.pic_email || '',
        status: kontingen.status || 'pending',
      },
      officials,
      atlets,
    });
  } catch (err: any) {
    console.error('Error fetching silat kontingen data:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal memuat data kontingen.' },
      { status: 500 }
    );
  }
}

