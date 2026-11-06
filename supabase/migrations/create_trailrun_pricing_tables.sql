-- Migration: Create trailrun pricing tiers and category pricing tables
-- Description: Dynamic pricing configuration stored in Supabase with flash sale support and 3K closure.

-- 1. Tabel Sesi / Tier Registrasi
CREATE TABLE IF NOT EXISTS public.trailrun_pricing_tiers (
    id VARCHAR(50) PRIMARY KEY, -- 'early', 'presale', 'regular', 'flashsale'
    name VARCHAR(100) NOT NULL,
    badge VARCHAR(100),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    quota_limit INT DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Harga per Kategori & Tier
CREATE TABLE IF NOT EXISTS public.trailrun_category_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_key VARCHAR(10) NOT NULL, -- '3k', '7k', '12k'
    tier_id VARCHAR(50) NOT NULL REFERENCES public.trailrun_pricing_tiers(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    display VARCHAR(50),
    quota_limit INT DEFAULT NULL, -- Kuota per kategori (Flash sale: 10)
    is_sold_out BOOLEAN DEFAULT false,
    category_closed BOOLEAN DEFAULT false, -- True untuk 3K (Tutup total)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_key, tier_id)
);

-- Enable RLS and add public read policy
ALTER TABLE public.trailrun_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trailrun_category_pricing ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'trailrun_pricing_tiers' AND policyname = 'Allow public read access on trailrun_pricing_tiers'
    ) THEN
        CREATE POLICY "Allow public read access on trailrun_pricing_tiers" 
        ON public.trailrun_pricing_tiers FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'trailrun_category_pricing' AND policyname = 'Allow public read access on trailrun_category_pricing'
    ) THEN
        CREATE POLICY "Allow public read access on trailrun_category_pricing" 
        ON public.trailrun_category_pricing FOR SELECT USING (true);
    END IF;
END $$;

-- 3. Data Awal (Seed Data)
INSERT INTO public.trailrun_pricing_tiers (id, name, badge, start_date, end_date, is_active, description)
VALUES 
  ('early', 'Early Bird', 'Terbatas 50 Slot', '2026-10-04T10:00:00+07:00', '2026-10-10T23:59:59+07:00', true, 'Periode Early Bird'),
  ('presale', 'Pre-Sale', 'Harga Spesial', '2026-10-11T00:00:00+07:00', '2026-10-21T23:59:59+07:00', true, 'Periode Pre-Sale'),
  ('regular', 'Regular', 'Harga Normal', '2026-10-22T00:00:00+07:00', '2026-11-08T23:59:59+07:00', true, 'Periode Reguler'),
  ('flashsale', 'Flash Sale', 'Promo Terbatas 30 Menit', '2026-11-07T17:00:00+07:00', '2026-11-07T17:30:00+07:00', true, 'Flash Sale Kilat 10 Slot')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  badge = EXCLUDED.badge,
  start_date = EXCLUDED.start_date, 
  end_date = EXCLUDED.end_date, 
  is_active = EXCLUDED.is_active,
  description = EXCLUDED.description;

-- Harga Sesi Flash Sale & Reguler (3K Tutup Total, 7K Flash = 300k, 12K Flash = 350k)
INSERT INTO public.trailrun_category_pricing (category_key, tier_id, amount, display, quota_limit, category_closed)
VALUES
  -- 3K Ditutup Total
  ('3k', 'early', 250000, '250k', NULL, true),
  ('3k', 'presale', 280000, '280k', NULL, true),
  ('3k', 'regular', 340000, '340k', NULL, true),
  ('3k', 'flashsale', 300000, '300k', 0, true),
  
  -- 7K (Flash Sale = 300.000, kuota 10)
  ('7k', 'early', 240000, '240k', 50, false),
  ('7k', 'presale', 270000, '270k', 150, false),
  ('7k', 'regular', 330000, '330k', NULL, false),
  ('7k', 'flashsale', 300000, '300k', 10, false),

  -- 12K (Flash Sale = 350.000, kuota 10)
  ('12k', 'early', 290000, '290k', 50, false),
  ('12k', 'presale', 320000, '320k', 150, false),
  ('12k', 'regular', 380000, '380k', NULL, false),
  ('12k', 'flashsale', 350000, '350k', 10, false)
ON CONFLICT (category_key, tier_id) DO UPDATE SET 
  amount = EXCLUDED.amount, 
  display = EXCLUDED.display, 
  quota_limit = EXCLUDED.quota_limit, 
  category_closed = EXCLUDED.category_closed;

