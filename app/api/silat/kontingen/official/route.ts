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
    const { nama, jabatan, nik, tanggalLahir, kota, jenisKelamin, noHp, email, fotoUrl, kkUrl } = body;

    if (!nama || !jabatan) {
      return NextResponse.json(
        { error: 'Nama dan Jabatan official wajib diisi.' },
        { status: 400 }
      );
    }

    const { data: inserted, error } = await supabase
      .from('silat_officials')
      .insert({
        kontingen_id: session.kontingenId,
        nama: nama.trim(),
        jabatan: jabatan || 'Official',
        nik: nik?.trim() || null,
        tanggal_lahir: tanggalLahir || null,
        kota: kota?.trim() || 'Mojokerto',
        jenis_kelamin: jenisKelamin || 'Laki-Laki',
        no_hp: noHp?.trim() || null,
        email: email?.trim() || null,
        foto_url: fotoUrl || null,
        kk_url: kkUrl || null,
      })
      .select('*')
      .single();

    if (error || !inserted) {
      console.error('Error adding official:', error);
      return NextResponse.json(
        { error: 'Gagal menambahkan official ke database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Official berhasil ditambahkan ke kontingen.',
      official: {
        id: inserted.id,
        nama: inserted.nama,
        jabatan: inserted.jabatan,
        nik: inserted.nik || '',
        tanggalLahir: inserted.tanggal_lahir ? String(inserted.tanggal_lahir).split('T')[0] : '',
        kota: inserted.kota || '',
        jenisKelamin: inserted.jenis_kelamin || 'Laki-Laki',
        noHp: inserted.no_hp || '',
        email: inserted.email || '',
        fotoUrl: inserted.foto_url || '',
        kkUrl: inserted.kk_url || '',
      },
    });
  } catch (err: any) {
    console.error('Error in POST official:', err);
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
      return NextResponse.json({ error: 'ID Official wajib disertakan.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (data.nama !== undefined) updatePayload.nama = data.nama.trim();
    if (data.jabatan !== undefined) updatePayload.jabatan = data.jabatan;
    if (data.nik !== undefined) updatePayload.nik = data.nik?.trim() || null;
    if (data.tanggalLahir !== undefined) updatePayload.tanggal_lahir = data.tanggalLahir || null;
    if (data.kota !== undefined) updatePayload.kota = data.kota?.trim() || null;
    if (data.jenisKelamin !== undefined) updatePayload.jenis_kelamin = data.jenisKelamin;
    if (data.noHp !== undefined) updatePayload.no_hp = data.noHp?.trim() || null;
    if (data.email !== undefined) updatePayload.email = data.email?.trim() || null;
    if (data.fotoUrl !== undefined) updatePayload.foto_url = data.fotoUrl || null;
    if (data.kkUrl !== undefined) updatePayload.kk_url = data.kkUrl || null;

    const { data: updated, error } = await supabase
      .from('silat_officials')
      .update(updatePayload)
      .eq('id', id)
      .eq('kontingen_id', session.kontingenId)
      .select('*')
      .single();

    if (error || !updated) {
      console.error('Error updating official:', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui data official.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data official berhasil diperbarui.',
      official: {
        id: updated.id,
        nama: updated.nama,
        jabatan: updated.jabatan,
        nik: updated.nik || '',
        tanggalLahir: updated.tanggal_lahir ? String(updated.tanggal_lahir).split('T')[0] : '',
        kota: updated.kota || '',
        jenisKelamin: updated.jenis_kelamin || 'Laki-Laki',
        noHp: updated.no_hp || '',
        email: updated.email || '',
        fotoUrl: updated.foto_url || '',
        kkUrl: updated.kk_url || '',
      },
    });
  } catch (err: any) {
    console.error('Error in PUT official:', err);
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
      return NextResponse.json({ error: 'ID Official wajib disertakan.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('silat_officials')
      .delete()
      .eq('id', id)
      .eq('kontingen_id', session.kontingenId);

    if (error) {
      console.error('Error deleting official:', error);
      return NextResponse.json(
        { error: 'Gagal menghapus official.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Official berhasil dihapus dari kontingen.',
    });
  } catch (err: any) {
    console.error('Error in DELETE official:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

