/**
 * Authentication helper for Admin Control Panel
 * Reads credentials from environment variables (.env.local)
 */

export const ADMIN_COOKIE_NAME = 'jiwandana_admin_session';

export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'adminjiwandana2026';
  const secret = process.env.ADMIN_SESSION_SECRET || 'jiwandana-super-secret-jwt-key-2026';
  return { username, password, secret };
}

export function checkAdminCredentials(user: string, pass: string): boolean {
  const { username, password } = getAdminCredentials();
  return user.trim() === username && pass === password;
}

export async function createSessionHash(username: string): Promise<string> {
  const { password, secret } = getAdminCredentials();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = `${username}:${password}`;
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${username}.${hex}`;
}

export async function verifySessionHash(token: string): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  const { username } = getAdminCredentials();
  const [user] = token.split('.');
  if (user !== username) return false;
  const expected = await createSessionHash(user);
  return token === expected;
}
