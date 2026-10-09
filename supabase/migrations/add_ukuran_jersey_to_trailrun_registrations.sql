-- ==============================================================================
-- Migration SQL: Penambahan Kolom ukuran_jersey pada tabel trailrun_registrations
-- ==============================================================================

-- 1. Tambahkan kolom ukuran_jersey ke tabel trailrun_registrations jika belum ada
ALTER TABLE trailrun_registrations 
ADD COLUMN IF NOT EXISTS ukuran_jersey VARCHAR(50) DEFAULT 'M';

-- 2. (Opsional) Update data lama yang masih bernilai NULL agar memiliki nilai default 'M'
UPDATE trailrun_registrations 
SET ukuran_jersey = 'M' 
WHERE ukuran_jersey IS NULL;

-- 3. Verifikasi struktur kolom
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'trailrun_registrations' 
  AND column_name = 'ukuran_jersey';
