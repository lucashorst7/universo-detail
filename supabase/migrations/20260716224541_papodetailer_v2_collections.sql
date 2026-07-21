/*
# Collections table + items

1. New Tables
- collections: curated product lists with slug, title, description, cover image
- collection_items: junction table linking products to collections with order + note
2. Security
- RLS enabled, public read for anon + authenticated, no public writes
*/

CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  cover_image text,
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_collections" ON public.collections;
CREATE POLICY "public_read_collections" ON public.collections FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  note text,
  UNIQUE(collection_id, product_id)
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_collection_items" ON public.collection_items;
CREATE POLICY "public_read_collection_items" ON public.collection_items FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_product ON public.collection_items(product_id);
