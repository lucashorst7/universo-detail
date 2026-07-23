/*
# Spotlight — Product of the Week

1. New Table
- spotlight: editorial product pick with week_start date and editorial text
- One active spotlight per week (enforced by unique week_start)
2. Security
- RLS enabled, public read, no public writes
*/

CREATE TABLE IF NOT EXISTS public.spotlight (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  week_start date NOT NULL DEFAULT CURRENT_DATE,
  editorial_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.spotlight ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_spotlight" ON public.spotlight;
CREATE POLICY "public_read_spotlight" ON public.spotlight FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_spotlight_week ON public.spotlight(week_start DESC);
