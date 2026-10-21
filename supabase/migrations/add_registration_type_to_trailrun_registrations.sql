-- ==============================================================================
-- Migration SQL: Penambahan Kolom registration_type pada tabel trailrun_registrations
-- Membedakan pendaftaran 'individu' vs 'bulk' (kelompok)
-- ==============================================================================

-- 1. Tambahkan kolom registration_type dan order_id ke tabel trailrun_registrations jika belum ada
ALTER TABLE trailrun_registrations 
ADD COLUMN IF NOT EXISTS registration_type VARCHAR(20) DEFAULT 'individu',
ADD COLUMN IF NOT EXISTS order_id VARCHAR(50);

-- 2. Beri komentar dokumentasi
COMMENT ON COLUMN trailrun_registrations.registration_type IS 'Tipe pendaftaran peserta: individu atau bulk (kelompok)';
COMMENT ON COLUMN trailrun_registrations.order_id IS 'Nomor Order ID Transaksi pembayaran (TR-BULK-xxx untuk kelompok)';

-- 3. Update existing records jika ada yang memiliki relasi bulk
-- (Secara default semua yang sudah ada diasumsikan 'individu')
UPDATE trailrun_registrations
SET registration_type = 'individu'
WHERE registration_type IS NULL;

