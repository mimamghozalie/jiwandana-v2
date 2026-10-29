import { NextResponse } from 'next/server';
import { clearSilatSessionCookie } from '@/lib/silatAuth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Berhasil keluar dari akun kontingen.',
  });

  clearSilatSessionCookie(response);
  return response;
}

