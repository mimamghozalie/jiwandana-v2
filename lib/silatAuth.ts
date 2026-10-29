import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const SILAT_AUTH_COOKIE = 'silat_kontingen_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 hari

export interface SilatKontingenSession {
  accountId: string;
  kontingenId: string;
  email: string;
  namaKontingen: string;
  exp: number;
}

function getSecretKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SILAT_SESSION_SECRET ||
    'silat-dsc-2026-super-secret-signing-key'
  );
}

/**
 * Hash password menggunakan bcrypt
 */
export async function hashSilatPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifikasi plain password terhadap hash bcrypt
 */
export async function verifySilatPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Encode base64url string
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Decode base64url string
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Sign HMAC-SHA256 signature
 */
async function signHmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Buat session token yang ditandatangani HMAC-SHA256
 */
export async function createSilatSessionToken(
  payload: Omit<SilatKontingenSession, 'exp'>
): Promise<string> {
  const secret = getSecretKey();
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const fullPayload: SilatKontingenSession = { ...payload, exp };
  const payloadStr = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await signHmac(payloadStr, secret);
  return `${payloadStr}.${signature}`;
}

/**
 * Verifikasi session token
 */
export async function verifySilatSessionToken(
  token: string
): Promise<SilatKontingenSession | null> {
  if (!token || !token.includes('.')) return null;
  const [payloadStr, signature] = token.split('.');
  if (!payloadStr || !signature) return null;

  const secret = getSecretKey();
  const expectedSig = await signHmac(payloadStr, secret);
  if (signature !== expectedSig) return null;

  try {
    const jsonStr = base64UrlDecode(payloadStr);
    const session: SilatKontingenSession = JSON.parse(jsonStr);
    const now = Math.floor(Date.now() / 1000);
    if (session.exp && session.exp < now) {
      return null; // Expired
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Dapatkan session dari NextRequest
 */
export async function getSilatSessionFromRequest(
  request: NextRequest
): Promise<SilatKontingenSession | null> {
  const cookieValue = request.cookies.get(SILAT_AUTH_COOKIE)?.value;
  if (!cookieValue) return null;
  return verifySilatSessionToken(cookieValue);
}

/**
 * Dapatkan session dari cookies() Server Components / Server Actions
 */
export async function getSilatSessionFromCookies(): Promise<SilatKontingenSession | null> {
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(SILAT_AUTH_COOKIE)?.value;
    if (!cookieValue) return null;
    return verifySilatSessionToken(cookieValue);
  } catch {
    return null;
  }
}

/**
 * Set HTTP-Only Cookie ke NextResponse
 */
export function setSilatSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SILAT_AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Hapus HTTP-Only Cookie dari NextResponse
 */
export function clearSilatSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SILAT_AUTH_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

