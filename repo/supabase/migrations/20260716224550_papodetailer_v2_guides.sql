/*
# Guides table + guide_products

1. New Tables
- guides: interactive decision-tree guides (e.g. "Qual cera escolher?")
- guide_products: products recommended by each guide with match labels
2. Security
- RLS enabled, public read for anon + authenticated, no public writes
*/

CREATE TABLE IF NOT EXISTS public.guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  cover_image text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_guides" ON public.guides;
CREATE POLICY "public_read_guides" ON public.guides FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.guide_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  match_label text,
  display_order integer NOT NULL DEFAULT 0,
  UNIQUE(guide_id, product_id)
);

ALTER TABLE public.guide_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_guide_products" ON public.guide_products;
CREATE POLICY "public_read_guide_products" ON public.guide_products FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_guide_products_guide ON public.guide_products(guide_id);
