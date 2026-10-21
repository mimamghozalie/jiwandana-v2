import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbyrvileybbqfuzgbty.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Client-side / Public Supabase Client (Anon Key)
 * Digunakan untuk:
 * - Komponen UI / browser ('use client')
 * - Query publik yang menghormati RLS (Row Level Security)
 */
export const supabaseAnonClient = createClient(supabaseUrl, supabaseAnonKey);

// Alias kompatibilitas mundur
export const supabase = supabaseAnonClient;

/**
 * Server-side Admin / Service Supabase Client (Service Role Key)
 * Digunakan untuk:
 * - Next.js Route Handlers (`app/api/**`)
 * - Server Actions & Server Components
 * - Operasi database privileged (bypass RLS, bulk insert, update status, webhook gateway)
 */
export function getSupabaseServiceClient() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    '';

  return createClient(
    supabaseUrl,
    serviceKey || supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export const supabaseServiceClient = getSupabaseServiceClient();
export const supabaseServerClient = supabaseServiceClient;

