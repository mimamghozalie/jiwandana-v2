-- ==============================================================================
-- Query SQL: Tambah Kolom order_id pada tabel trailrun_registrations
-- Jalankan query ini di SQL Editor Dashboard Supabase
-- ==============================================================================

-- 1. Tambah kolom order_id ke tabel trailrun_registrations jika belum ada
ALTER TABLE trailrun_registrations 
ADD COLUMN IF NOT EXISTS order_id VARCHAR(100);

-- 2. Buat index pada kolom order_id agar query pencarian, pelunasan (webhook),
--    dan pembatalan (delete bulk) berjalan sangat cepat
CREATE INDEX IF NOT EXISTS idx_trailrun_registrations_order_id 
ON trailrun_registrations(order_id);

-- 3. Beri komentar dokumentasi pada kolom
COMMENT ON COLUMN trailrun_registrations.order_id 
IS 'Nomor Order ID Transaksi pembayaran (TR-BULK-xxx untuk pendaftaran kelompok)';

-- 4. Verifikasi apakah kolom order_id sudah berhasil ditambahkan
SELECT 
  column_name, 
  data_type, 
  character_maximum_length, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'trailrun_registrations' 
  AND column_name = 'order_id';
