-- ==============================================================================
-- Migration SQL: Schema Autentikasi Akun Kontingen Silat DSC 2026
-- Tabel: silat_kontingen_accounts
-- ==============================================================================

CREATE TABLE IF NOT EXISTS silat_kontingen_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kontingen_id UUID NOT NULL REFERENCES silat_kontingen(id) ON DELETE CASCADE,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Performa
CREATE INDEX IF NOT EXISTS idx_silat_kontingen_accounts_email ON silat_kontingen_accounts(email);
CREATE INDEX IF NOT EXISTS idx_silat_kontingen_accounts_kontingen_id ON silat_kontingen_accounts(kontingen_id);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE silat_kontingen_accounts ENABLE ROW LEVEL SECURITY;

-- Catatan Keamanan:
-- Tabel silat_kontingen_accounts TIDAK memiliki public policy (Read/Insert/Update).
-- Seluruh proses registrasi dan verifikasi login dilakukan di server-side (Next.js Route Handlers)
-- menggunakan SUPABASE_SERVICE_ROLE_KEY untuk melindungi hash password dari kebocoran anon publik.

