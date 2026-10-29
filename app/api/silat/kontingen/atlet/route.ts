import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';
import { getSilatSessionFromRequest } from '@/lib/silatAuth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSilatSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Autentikasi diperlukan. Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      nama,
      asalSekolah,
      nik,
      tanggalLahir,
      umur,
      tinggi,
      berat,
      kota,
      jenisKelamin,
      tingkatPendidikan,
      kategoriLomba,
      kategoriKelasSeni,
      noHp,
      email,
      fotoUrl,
      kkUrl,
    } = body;

    if (!nama || !asalSekolah || !nik || !kategoriLomba) {
      return NextResponse.json(
        { error: 'Nama, Asal Sekolah, NIK, dan Kategori Lomba wajib diisi.' },
        { status: 400 }
      );
    }

    if (!fotoUrl || !fotoUrl.trim() || !kkUrl || !kkUrl.trim()) {
      return NextResponse.json(
        { error: 'Pas Foto resmi dan Berkas KK / Akta atlet wajib diunggah.' },
        { status: 400 }
      );
    }

    const { data: inserted, error } = await supabase
      .from('silat_atlets')
      .insert({
        kontingen_id: session.kontingenId,
        nama: nama.trim(),
        asal_sekolah: asalSekolah.trim(),
        nik: nik.trim(),
        tanggal_lahir: tanggalLahir || null,
        umur: umur ? parseInt(String(umur), 10) : null,
        tinggi: tinggi ? parseInt(String(tinggi), 10) : null,
        berat: berat ? parseInt(String(berat), 10) : null,
        kota: kota?.trim() || 'Mojokerto',
        jenis_kelamin: jenisKelamin || 'Laki-Laki',
        tingkat_pendidikan: tingkatPendidikan || 'Usia Dini / SD',
        kategori_lomba: kategoriLomba,
        kategori_kelas_seni: kategoriKelasSeni || '',
        no_hp: noHp?.trim() || '',
        email: email?.trim() || '',
        foto_url: fotoUrl || null,
        kk_url: kkUrl || null,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error || !inserted) {
      console.error('Error adding atlet:', error);
      return NextResponse.json(
        { error: 'Gagal menyimpan data atlet ke database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Atlet berhasil ditambahkan ke kontingen.',
      atlet: {
        id: inserted.id,
        nama: inserted.nama,
        asalSekolah: inserted.asal_sekolah,
        nik: inserted.nik,
        tanggalLahir: inserted.tanggal_lahir ? String(inserted.tanggal_lahir).split('T')[0] : '',
        umur: inserted.umur ?? '',
        tinggi: inserted.tinggi ?? '',
        berat: inserted.berat ?? '',
        kota: inserted.kota,
        jenisKelamin: inserted.jenis_kelamin,
        tingkatPendidikan: inserted.tingkat_pendidikan,
        kategoriLomba: inserted.kategori_lomba,
        kategoriKelasSeni: inserted.kategori_kelas_seni,
        noHp: inserted.no_hp,
        email: inserted.email,
        fotoUrl: inserted.foto_url || '',
        kkUrl: inserted.kk_url || '',
        status: inserted.status || 'pending',
      },
    });
  } catch (err: any) {
    console.error('Error in POST atlet:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSilatSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Autentikasi diperlukan. Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Atlet wajib disertakan.' }, { status: 400 });
    }

    if (data.fotoUrl !== undefined && (!data.fotoUrl || !data.fotoUrl.trim())) {
      return NextResponse.json(
        { error: 'Pas Foto resmi atlet wajib diunggah.' },
        { status: 400 }
      );
    }
    if (data.kkUrl !== undefined && (!data.kkUrl || !data.kkUrl.trim())) {
      return NextResponse.json(
        { error: 'Berkas Kartu Keluarga (KK) / Akta atlet wajib diunggah.' },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {};
    if (data.nama !== undefined) updatePayload.nama = data.nama.trim();
    if (data.asalSekolah !== undefined) updatePayload.asal_sekolah = data.asalSekolah.trim();
    if (data.nik !== undefined) updatePayload.nik = data.nik.trim();
    if (data.tanggalLahir !== undefined) updatePayload.tanggal_lahir = data.tanggalLahir || null;
    if (data.umur !== undefined) updatePayload.umur = data.umur ? parseInt(String(data.umur), 10) : null;
    if (data.tinggi !== undefined) updatePayload.tinggi = data.tinggi ? parseInt(String(data.tinggi), 10) : null;
    if (data.berat !== undefined) updatePayload.berat = data.berat ? parseInt(String(data.berat), 10) : null;
    if (data.kota !== undefined) updatePayload.kota = data.kota.trim();
    if (data.jenisKelamin !== undefined) updatePayload.jenis_kelamin = data.jenisKelamin;
    if (data.tingkatPendidikan !== undefined) updatePayload.tingkat_pendidikan = data.tingkatPendidikan;
    if (data.kategoriLomba !== undefined) updatePayload.kategori_lomba = data.kategoriLomba;
    if (data.kategoriKelasSeni !== undefined) updatePayload.kategori_kelas_seni = data.kategoriKelasSeni;
    if (data.noHp !== undefined) updatePayload.no_hp = data.noHp.trim();
    if (data.email !== undefined) updatePayload.email = data.email.trim();
    if (data.fotoUrl !== undefined) updatePayload.foto_url = data.fotoUrl || null;
    if (data.kkUrl !== undefined) updatePayload.kk_url = data.kkUrl || null;

    const { data: updated, error } = await supabase
      .from('silat_atlets')
      .update(updatePayload)
      .eq('id', id)
      .eq('kontingen_id', session.kontingenId)
      .select('*')
      .single();

    if (error || !updated) {
      console.error('Error updating atlet:', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui data atlet.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data atlet berhasil diperbarui.',
      atlet: {
        id: updated.id,
        nama: updated.nama,
        asalSekolah: updated.asal_sekolah,
        nik: updated.nik,
        tanggalLahir: updated.tanggal_lahir ? String(updated.tanggal_lahir).split('T')[0] : '',
        umur: updated.umur ?? '',
        tinggi: updated.tinggi ?? '',
        berat: updated.berat ?? '',
        kota: updated.kota,
        jenisKelamin: updated.jenis_kelamin,
        tingkatPendidikan: updated.tingkat_pendidikan,
        kategoriLomba: updated.kategori_lomba,
        kategoriKelasSeni: updated.kategori_kelas_seni,
        noHp: updated.no_hp,
        email: updated.email,
        fotoUrl: updated.foto_url || '',
        kkUrl: updated.kk_url || '',
        status: updated.status || 'pending',
      },
    });
  } catch (err: any) {
    console.error('Error in PUT atlet:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSilatSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Autentikasi diperlukan. Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Atlet wajib disertakan.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('silat_atlets')
      .delete()
      .eq('id', id)
      .eq('kontingen_id', session.kontingenId);

    if (error) {
      console.error('Error deleting atlet:', error);
      return NextResponse.json(
        { error: 'Gagal menghapus atlet.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Atlet berhasil dihapus dari database kontingen.',
    });
  } catch (err: any) {
    console.error('Error in DELETE atlet:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

