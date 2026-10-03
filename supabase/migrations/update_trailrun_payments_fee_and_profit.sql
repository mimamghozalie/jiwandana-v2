-- ==============================================================================
-- Migration SQL: Penyesuaian Kolom & Update Data Tabel trailrun_payments
-- Flat Fee Admin Rp 5.000, Biaya Tx Gateway (0.7% + 300), dan Keuntungan Admin
-- ==============================================================================

-- 1. Tambahkan kolom baru ke tabel trailrun_payments jika belum ada
ALTER TABLE trailrun_payments 
ADD COLUMN IF NOT EXISTS admin_fee NUMERIC DEFAULT 5000,
ADD COLUMN IF NOT EXISTS gateway_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS admin_profit NUMERIC DEFAULT 0;

-- 2. Update (Backfill) transaksi individual agar fee flat 5.000 dan keuntungan tercatat
UPDATE trailrun_payments
SET 
  fee = 5000,
  admin_fee = 5000,
  total_payment = amount + 5000,
  gateway_fee = ROUND((amount + 5000) * 0.007 + 300),
  admin_profit = GREATEST(0, 5000 - ROUND((amount + 5000) * 0.007 + 300))
WHERE 
  -- Hanya targetkan transaksi individual atau transaksi yang sebelumnya memiliki fee 7.450
  (order_id NOT LIKE 'TR-BULK%' AND (fee = 7450 OR fee IS NULL OR admin_profit IS NULL OR admin_profit = 0));

-- 3. Update untuk transaksi group/bulk (jika ada)
UPDATE trailrun_payments
SET 
  admin_fee = COALESCE(admin_fee, fee, 5000),
  gateway_fee = COALESCE(NULLIF(gateway_fee, 0), ROUND(total_payment * 0.007 + 300)),
  admin_profit = GREATEST(0, COALESCE(admin_fee, fee, 5000) - ROUND(total_payment * 0.007 + 300))
WHERE 
  order_id LIKE 'TR-BULK%' AND (admin_profit IS NULL OR admin_profit = 0);

-- 4. Verifikasi hasil update
SELECT 
  id,
  order_id,
  payment_method,
  amount AS subtotal_tiket,
  fee AS biaya_admin,
  gateway_fee AS fee_gateway,
  admin_profit AS profit_bersih,
  total_payment AS total_bayar,
  status,
  created_at
FROM trailrun_payments
ORDER BY created_at DESC
LIMIT 20;
