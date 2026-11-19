-- ==============================================================================
-- Migration SQL: Penambahan Kolom nama_bib pada tabel trailrun_registrations
-- dan kloning otomatis dari kolom nama lengkap (nama)
-- ==============================================================================

-- 1. Tambah kolom nama_bib jika belum ada
ALTER TABLE trailrun_registrations 
ADD COLUMN IF NOT EXISTS nama_bib VARCHAR(100);

-- 2. Kloning isi kolom nama ke nama_bib untuk seluruh data yang ada
UPDATE trailrun_registrations 
SET nama_bib = TRIM(nama)
WHERE nama_bib IS NULL OR TRIM(nama_bib) = '';

-- 3. Tambahkan komentar schema
COMMENT ON COLUMN trailrun_registrations.nama_bib IS 'Nama peserta yang dicetak pada nomor dada BIB (default: clone dari nama lengkap)';

-- 4. Buat indeks untuk mempercepat pencarian nama BIB
CREATE INDEX IF NOT EXISTS idx_trailrun_registrations_nama_bib ON trailrun_registrations(nama_bib);

-- 5. Verifikasi hasil migrasi
SELECT id, nama, nama_bib, no_bib, kategori 
FROM trailrun_registrations 
ORDER BY created_at DESC 
LIMIT 10;
