import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';
import { verifySilatPassword, createSilatSessionToken, setSilatSessionCookie } from '@/lib/silatAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validasi Input
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Ambil data akun dan profil kontingen terkait
    const { data: account, error: accErr } = await supabase
      .from('silat_kontingen_accounts')
      .select('id, kontingen_id, email, password_hash, silat_kontingen (id, nama_kontingen, asal_sekolah, kota, status)')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (accErr) {
      console.error('Error querying silat_kontingen_accounts on login:', accErr);
      return NextResponse.json(
        { error: 'Terjadi kesalahan sistem saat memeriksa akun.' },
        { status: 500 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    // 3. Verifikasi Password dengan bcrypt
    const isPasswordValid = await verifySilatPassword(password, account.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    // 4. Update waktu last_login (non-blocking)
    supabase
      .from('silat_kontingen_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('id', account.id)
      .then();

    // 5. Susun Payload Sesi & Token
    const kontingen = account.silat_kontingen as any;
    const sessionPayload = {
      accountId: account.id,
      kontingenId: account.kontingen_id,
      email: account.email,
      namaKontingen: kontingen?.nama_kontingen || 'Kontingen Silat',
    };

    const token = await createSilatSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil! Selamat datang kembali.',
      user: {
        ...sessionPayload,
        asalSekolah: kontingen?.asal_sekolah || '',
        kota: kontingen?.kota || 'Mojokerto',
        status: kontingen?.status || 'pending',
      },
    });

    setSilatSessionCookie(response, token);
    return response;
  } catch (err: any) {
    console.error('Unhandled silat login error:', err);
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan server saat memproses login.' },
      { status: 500 }
    );
  }
}

