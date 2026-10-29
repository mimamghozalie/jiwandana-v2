import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';
import { hashSilatPassword, createSilatSessionToken, setSilatSessionCookie } from '@/lib/silatAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_kontingen, email, password, asal_sekolah, kota, pic_phone } = body;

    // 1. Validasi Input
    if (!nama_kontingen || typeof nama_kontingen !== 'string' || !nama_kontingen.trim()) {
      return NextResponse.json(
        { error: 'Nama kontingen / sekolah wajib diisi.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal terdiri dari 6 karakter.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNama = nama_kontingen.trim();

    // 2. Cek apakah email sudah terdaftar
    const { data: existingAccount, error: checkErr } = await supabase
      .from('silat_kontingen_accounts')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkErr && checkErr.code !== 'PGRST116') {
      console.error('Error checking existing account:', checkErr);
    }

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Email ini sudah terdaftar. Silakan beralih ke tab MASUK.' },
        { status: 400 }
      );
    }

    // 3. Insert Profil Kontingen ke silat_kontingen
    const { data: kontingen, error: kontingenErr } = await supabase
      .from('silat_kontingen')
      .insert({
        nama_kontingen: cleanNama,
        asal_sekolah: asal_sekolah?.trim() || null,
        kota: kota?.trim() || 'Mojokerto',
        pic_name: cleanNama,
        pic_email: cleanEmail,
        pic_phone: pic_phone?.trim() || null,
        status: 'pending',
      })
      .select('id, nama_kontingen, asal_sekolah, kota')
      .single();

    if (kontingenErr || !kontingen) {
      console.error('Error inserting silat_kontingen:', kontingenErr);
      return NextResponse.json(
        { error: 'Gagal membuat profil kontingen di database.' },
        { status: 500 }
      );
    }

    // 4. Hash Password & Simpan Akun Kredensial ke silat_kontingen_accounts
    const hashedPassword = await hashSilatPassword(password);
    const { data: account, error: accountErr } = await supabase
      .from('silat_kontingen_accounts')
      .insert({
        kontingen_id: kontingen.id,
        email: cleanEmail,
        password_hash: hashedPassword,
        last_login: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (accountErr || !account) {
      console.error('Error inserting silat_kontingen_accounts:', accountErr);
      return NextResponse.json(
        { error: 'Gagal menyimpan kredensial akun kontingen.' },
        { status: 500 }
      );
    }

    // 5. Generate Session Token & Set Cookie
    const sessionPayload = {
      accountId: account.id,
      kontingenId: kontingen.id,
      email: cleanEmail,
      namaKontingen: kontingen.nama_kontingen,
    };

    const token = await createSilatSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Pendaftaran kontingen berhasil! Selamat datang.',
      user: {
        ...sessionPayload,
        asalSekolah: kontingen.asal_sekolah,
        kota: kontingen.kota,
      },
    });

    setSilatSessionCookie(response, token);
    return response;
  } catch (err: any) {
    console.error('Unhandled silat register error:', err);
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan sistem saat mendaftar.' },
      { status: 500 }
    );
  }
}

