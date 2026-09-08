-- frontend/scripts/schema.sql
-- Run once against the Neon database (see Task 6, Step 4) before the
-- analytics endpoints are used for the first time.
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
