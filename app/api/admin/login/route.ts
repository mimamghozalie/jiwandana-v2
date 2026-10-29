import { NextRequest, NextResponse } from 'next/server';
import { checkAdminCredentials, createSessionHash, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Body permintaan harus berupa JSON yang valid.' },
        { status: 400 }
      );
    }
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    if (!checkAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Username atau password tidak sesuai.' },
        { status: 401 }
      );
    }

    const token = await createSessionHash(username.trim());

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server saat login.' },
      { status: 500 }
    );
  }
}
