-- ==============================================================================
-- Migration SQL: Tambah Kolom Pelacakan Status Pengiriman WA & Email RPC
-- ==============================================================================

ALTER TABLE trailrun_rpc_verifications
  ADD COLUMN IF NOT EXISTS wa_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS wa_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_rpc_wa_sent ON trailrun_rpc_verifications(wa_sent);
CREATE INDEX IF NOT EXISTS idx_rpc_email_sent ON trailrun_rpc_verifications(email_sent);
