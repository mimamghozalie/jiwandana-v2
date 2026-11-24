-- ==============================================================================
-- Migration SQL: Pembuatan Tabel Baru trailrun_rpc_verifications
-- Khusus Data Meja Kerja Verifikasi Pengambilan Race Pack (RPC)
-- ==============================================================================

-- 1. Buat tabel trailrun_rpc_verifications
CREATE TABLE IF NOT EXISTS trailrun_rpc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES trailrun_registrations(id) ON DELETE CASCADE,
  no_bib VARCHAR(50) NOT NULL UNIQUE,
  nama VARCHAR(255) NOT NULL,
  nama_bib VARCHAR(100),
  kategori VARCHAR(50) NOT NULL,
  ukuran_jersey VARCHAR(50),
  
  -- 6 Syarat Pemeriksaan Pengambilan Race Pack:
  mandatory_gear BOOLEAN DEFAULT FALSE,
  waiver BOOLEAN DEFAULT FALSE,
  surat_sehat BOOLEAN DEFAULT FALSE,
  surat_izin_ortu BOOLEAN DEFAULT FALSE,
  strava_12k BOOLEAN DEFAULT FALSE,
  menunjukan_data_diri BOOLEAN DEFAULT FALSE,
  
  -- Status Penyerahan Paket Lomba:
  -- 'belum_diambil' | 'syarat_kurang' | 'sudah_diambil_bersyarat' | 'sudah_diambil'
  status_pengambilan VARCHAR(50) DEFAULT 'belum_diambil',
  waktu_pengambilan TIMESTAMPTZ,
  petugas VARCHAR(100),
  catatan TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan komentar schema
COMMENT ON TABLE trailrun_rpc_verifications IS 'Data verifikasi berkas dan perlengkapan meja Race Pack Collection (RPC) Pawitra Trail Run 2026';
COMMENT ON COLUMN trailrun_rpc_verifications.mandatory_gear IS 'Pemeriksaan fisik perlengkapan wajib di venue';
COMMENT ON COLUMN trailrun_rpc_verifications.waiver IS 'Surat pernyataan pelepasan tanggung jawab bertandatangan';
COMMENT ON COLUMN trailrun_rpc_verifications.surat_sehat IS 'Surat keterangan sehat medis (wajib)';
COMMENT ON COLUMN trailrun_rpc_verifications.surat_izin_ortu IS 'Surat izin orang tua untuk peserta junior/anak';
COMMENT ON COLUMN trailrun_rpc_verifications.strava_12k IS 'Verifikasi aktivitas lari 5K di aplikasi Strava (khusus 12K)';
COMMENT ON COLUMN trailrun_rpc_verifications.menunjukan_data_diri IS 'Pemeriksaan kartu identitas fisik asli (e-KTP/SIM/Paspor)';
COMMENT ON COLUMN trailrun_rpc_verifications.status_pengambilan IS 'Status penyerahan: belum_diambil, syarat_kurang, sudah_diambil_bersyarat, sudah_diambil';

-- 3. Buat indeks untuk performa pencarian cepat BIB & Status
CREATE INDEX IF NOT EXISTS idx_rpc_no_bib ON trailrun_rpc_verifications(no_bib);
CREATE INDEX IF NOT EXISTS idx_rpc_status ON trailrun_rpc_verifications(status_pengambilan);
CREATE INDEX IF NOT EXISTS idx_rpc_kategori ON trailrun_rpc_verifications(kategori);

-- 4. Kloning otomatis seluruh peserta yang sudah memiliki no_bib ke tabel baru
INSERT INTO trailrun_rpc_verifications (registration_id, no_bib, nama, nama_bib, kategori, ukuran_jersey)
SELECT 
  id, 
  no_bib, 
  nama, 
  nama_bib, 
  kategori, 
  ukuran_jersey 
FROM trailrun_registrations 
WHERE no_bib IS NOT NULL AND TRIM(no_bib) <> ''
ON CONFLICT (no_bib) DO NOTHING;

-- 5. Verifikasi isi tabel baru
SELECT no_bib, nama, kategori, ukuran_jersey, status_pengambilan 
FROM trailrun_rpc_verifications 
ORDER BY no_bib ASC 
LIMIT 10;
