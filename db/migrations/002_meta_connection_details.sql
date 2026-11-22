ALTER TABLE meta_connections
  ADD COLUMN IF NOT EXISTS verified_name text,
  ADD COLUMN IF NOT EXISTS quality_rating text,
  ADD COLUMN IF NOT EXISTS code_verification_status text,
  ADD COLUMN IF NOT EXISTS platform_type text,
  ADD COLUMN IF NOT EXISTS throughput_level text;
