-- ==============================================================================
-- Migration SQL: Izinkan nilai '-' atau NULL pada kolom golongan_darah
-- di tabel trailrun_registrations (untuk data peserta kelompok / Excel)
-- ==============================================================================

ALTER TABLE trailrun_registrations
  ALTER COLUMN golongan_darah DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS trailrun_registrations_golongan_darah_check,
  ADD CONSTRAINT trailrun_registrations_golongan_darah_check
    CHECK (golongan_darah IS NULL OR golongan_darah IN ('A', 'B', 'AB', 'O', '-', 'Tidak Diketahui'));
