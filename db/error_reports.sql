-- Enable pgcrypto for gen_random_uuid
-- NOTE: Run this in Supabase SQL editor separately if needed.
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table for storing frontend/backend error reports
CREATE TABLE IF NOT EXISTS public.error_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text,
  message text,
  url text,
  user_info jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Example insert
-- INSERT INTO public.error_reports (title, message, url, user_info) VALUES ('TypeError on click', 'Cannot read property of undefined', 'https://example.com/app', '{"userId":123}');
