-- ==============================================================================
-- Migration SQL: Penambahan Kolom ID ITRA pada tabel trailrun_registrations
-- ==============================================================================

-- 1. Tambahkan kolom id_itra ke tabel trailrun_registrations jika belum ada
ALTER TABLE trailrun_registrations 
ADD COLUMN IF NOT EXISTS id_itra VARCHAR(50);

-- 2. Tambahkan komentar kolom untuk dokumentasi schema
COMMENT ON COLUMN trailrun_registrations.id_itra IS 'ID Pelari pada asosiasi ITRA (International Trail Running Association)';

-- 3. Buat indeks opsional untuk mempercepat pencarian no_bib dan id_itra
CREATE INDEX IF NOT EXISTS idx_trailrun_registrations_id_itra ON trailrun_registrations(id_itra);

-- 4. Verifikasi struktur kolom yang baru ditambahkan
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'trailrun_registrations' 
  AND column_name IN ('nik', 'kk', 'id_itra')
ORDER BY column_name;
