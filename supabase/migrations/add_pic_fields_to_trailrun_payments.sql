-- ==============================================================================
-- Migration SQL: Penambahan Kolom Data PIC pada tabel trailrun_payments
-- ==============================================================================

-- 1. Tambahkan kolom pic_name, pic_phone, dan pic_email ke tabel trailrun_payments jika belum ada
ALTER TABLE trailrun_payments 
ADD COLUMN IF NOT EXISTS pic_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS pic_phone VARCHAR(30),
ADD COLUMN IF NOT EXISTS pic_email VARCHAR(100);

-- 2. Tambahkan komentar kolom untuk dokumentasi schema
COMMENT ON COLUMN trailrun_payments.pic_name IS 'Nama lengkap Koordinator / PIC pendaftaran kolektif kelompok';
COMMENT ON COLUMN trailrun_payments.pic_phone IS 'Nomor WhatsApp / HP PIC pendaftaran kolektif kelompok';
COMMENT ON COLUMN trailrun_payments.pic_email IS 'Alamat email PIC pendaftaran kolektif kelompok';

-- 3. Verifikasi struktur kolom yang baru ditambahkan
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'trailrun_payments' 
  AND column_name IN ('pic_name', 'pic_phone', 'pic_email')
ORDER BY column_name;
