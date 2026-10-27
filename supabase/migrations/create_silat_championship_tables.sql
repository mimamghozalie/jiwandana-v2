-- ==============================================================================
-- Migration SQL: Schema Lengkap Kejuaraan Pencak Silat DSC 2026
-- Tabel:
--  1. silat_kontingen       (Data Kontingen / Sekolah / Perguruan)
--  2. silat_officials       (Data Pelatih & Official Pendamping)
--  3. silat_atlets          (Data Atlet Pencak Silat untuk 11 Kategori)
--  4. silat_payments        (Data Transaksi Pembayaran Pakasir Gateway)
-- ==============================================================================

-- 1. TABEL KONTINGEN
CREATE TABLE IF NOT EXISTS silat_kontingen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kontingen VARCHAR(255) NOT NULL,
  asal_sekolah VARCHAR(255),
  kota VARCHAR(100) DEFAULT 'Mojokerto',
  pic_name VARCHAR(150),
  pic_phone VARCHAR(50),
  pic_email VARCHAR(150),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'verified'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL OFFICIALS
CREATE TABLE IF NOT EXISTS silat_officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kontingen_id UUID REFERENCES silat_kontingen(id) ON DELETE CASCADE,
  order_id VARCHAR(100),
  nama VARCHAR(255) NOT NULL,
  jabatan VARCHAR(100) NOT NULL, -- 'Pelatih Kepala', 'Official', 'Pendamping Official'
  nik VARCHAR(30),
  tanggal_lahir DATE,
  kota VARCHAR(100),
  jenis_kelamin VARCHAR(20) CHECK (jenis_kelamin IN ('Laki-Laki', 'Perempuan')),
  no_hp VARCHAR(50),
  email VARCHAR(150),
  foto_url TEXT, -- Pas Foto Official
  kk_url TEXT,   -- Berkas KK / KTP Official
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL ATLET PENCAK SILAT (Mendukung 11 Kategori Resmi)
CREATE TABLE IF NOT EXISTS silat_atlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kontingen_id UUID REFERENCES silat_kontingen(id) ON DELETE SET NULL,
  order_id VARCHAR(100),
  nama VARCHAR(255) NOT NULL,
  asal_sekolah VARCHAR(255) NOT NULL,
  nik VARCHAR(30) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  umur INTEGER,
  tinggi INTEGER,
  berat INTEGER,
  kota VARCHAR(100),
  jenis_kelamin VARCHAR(20) CHECK (jenis_kelamin IN ('Laki-Laki', 'Perempuan')),
  tingkat_pendidikan VARCHAR(100), -- 'Usia Dini / SD', 'Pra-Remaja / SMP', 'Remaja / SMA', 'Dewasa / Umum'
  kategori_lomba VARCHAR(100) NOT NULL, -- 11 Kategori (Tanding - Pemasalan, Prestasi, Jurus Baku, Festival, dll.)
  kategori_kelas_seni VARCHAR(100), -- Kelas A, B, C... / Solo Kreatif, dll.
  no_hp VARCHAR(50),
  email VARCHAR(150),
  foto_url TEXT, -- Pas Foto Atlet
  kk_url TEXT,   -- Berkas Kartu Keluarga (KK) / KIA / Akta Atlet
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'confirmed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL PEMBAYARAN SILAT (PAKASIR GATEWAY)
CREATE TABLE IF NOT EXISTS silat_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) UNIQUE NOT NULL,
  txn_id VARCHAR(100),
  kontingen_id UUID REFERENCES silat_kontingen(id) ON DELETE SET NULL,
  kontingen_name VARCHAR(255),
  pic_name VARCHAR(150),
  pic_phone VARCHAR(50),
  total_atlet INTEGER DEFAULT 0,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  fee NUMERIC(12, 2) NOT NULL DEFAULT 5000,
  admin_fee NUMERIC(12, 2) NOT NULL DEFAULT 5000,
  total_payment NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL, -- 'qris', 'bri_va', 'bni_va', 'mandiri_va', 'permata_va', 'cimb_niaga_va'
  qr_string TEXT,
  va_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'canceled', 'expired'
  is_sandbox BOOLEAN DEFAULT false,
  expired_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INDEXES UNTUK PERFORMA PENCARIAN & JOIN
CREATE INDEX IF NOT EXISTS idx_silat_atlets_order_id ON silat_atlets(order_id);
CREATE INDEX IF NOT EXISTS idx_silat_atlets_kontingen_id ON silat_atlets(kontingen_id);
CREATE INDEX IF NOT EXISTS idx_silat_atlets_kategori ON silat_atlets(kategori_lomba);
CREATE INDEX IF NOT EXISTS idx_silat_officials_order_id ON silat_officials(order_id);
CREATE INDEX IF NOT EXISTS idx_silat_payments_order_id ON silat_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_silat_payments_txn_id ON silat_payments(txn_id);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE silat_kontingen ENABLE ROW LEVEL SECURITY;
ALTER TABLE silat_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE silat_atlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE silat_payments ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES (Public Read & Service Role Full Access)
CREATE POLICY "Public Read Kontingen" ON silat_kontingen FOR SELECT USING (true);
CREATE POLICY "Public Insert Kontingen" ON silat_kontingen FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Officials" ON silat_officials FOR SELECT USING (true);
CREATE POLICY "Public Insert Officials" ON silat_officials FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Atlets" ON silat_atlets FOR SELECT USING (true);
CREATE POLICY "Public Insert Atlets" ON silat_atlets FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Payments" ON silat_payments FOR SELECT USING (true);
CREATE POLICY "Public Insert Payments" ON silat_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Payments" ON silat_payments FOR UPDATE USING (true);

-- 8. STORAGE BUCKET UNTUK FOTO & KK SILAT
INSERT INTO storage.buckets (id, name, public)
VALUES ('silat-documents', 'silat-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies agar file dapat dibaca publik dan diunggah pendaftar
CREATE POLICY "Public Read silat-documents" ON storage.objects
FOR SELECT USING (bucket_id = 'silat-documents');

CREATE POLICY "Public Upload silat-documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'silat-documents');

CREATE POLICY "Public Update silat-documents" ON storage.objects
FOR UPDATE USING (bucket_id = 'silat-documents');

