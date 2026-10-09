-- ==============================================================================
-- Migration SQL: Penambahan Kolom hasil_lari pada tabel trailrun_registrations
-- ==============================================================================

-- 1. Tambahkan kolom hasil_lari ke tabel trailrun_registrations jika belum ada
ALTER TABLE trailrun_registrations 
ADD COLUMN IF NOT EXISTS hasil_lari VARCHAR(100) DEFAULT '-';

-- 2. Verifikasi struktur kolom
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'trailrun_registrations' 
  AND column_name = 'hasil_lari';
