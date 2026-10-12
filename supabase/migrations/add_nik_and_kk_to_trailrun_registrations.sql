-- ==============================================================================
-- Migration SQL: Penambahan Kolom NIK dan KK pada tabel trailrun_registrations
-- ==============================================================================

-- 1. Tambahkan kolom nik dan kk ke tabel trailrun_registrations jika belum ada
ALTER TABLE trailrun_registrations 
ADD COLUMN IF NOT EXISTS nik VARCHAR(20),
ADD COLUMN IF NOT EXISTS kk VARCHAR(20);

-- 2. Tambahkan komentar kolom untuk dokumentasi schema
COMMENT ON COLUMN trailrun_registrations.nik IS 'Nomor Induk Kependudukan (16 digit angka)';
COMMENT ON COLUMN trailrun_registrations.kk IS 'Nomor Kartu Keluarga (16 digit angka)';

-- 3. Verifikasi struktur kolom yang baru ditambahkan
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'trailrun_registrations' 
  AND column_name IN ('nik', 'kk')
ORDER BY column_name;
