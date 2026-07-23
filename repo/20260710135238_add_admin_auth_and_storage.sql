/*
# Admin Auth + Product Images Storage

1. Changes
  - Creates `admin_users` table to store which Supabase auth users are admins.
  - Adds INSERT/UPDATE/DELETE policies on products, brands, categories, affiliate_links
    so that authenticated admins can write to them (public SELECT already exists via anon).
  - Creates a storage bucket `product-images` for product photo uploads.

2. Security
  - Only rows in `admin_users` matching `auth.uid()` grant write access.
  - Public read on storage bucket so images are served without auth.
*/

-- ── admin_users ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_self" ON admin_users;
CREATE POLICY "admins_select_self" ON admin_users FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- ── helper function ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$;

-- ── products: write policies for admins ──────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_products" ON products;
CREATE POLICY "admins_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_update_products" ON products;
CREATE POLICY "admins_update_products" ON products FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_products" ON products;
CREATE POLICY "admins_delete_products" ON products FOR DELETE
  TO authenticated USING (is_admin());

-- ── brands: write policies for admins ────────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_brands" ON brands;
CREATE POLICY "admins_insert_brands" ON brands FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_update_brands" ON brands;
CREATE POLICY "admins_update_brands" ON brands FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_brands" ON brands;
CREATE POLICY "admins_delete_brands" ON brands FOR DELETE
  TO authenticated USING (is_admin());

-- ── categories: write policies for admins ────────────────────────────────────
DROP POLICY IF EXISTS "admins_insert_categories" ON categories;
CREATE POLICY "admins_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_update_categories" ON categories;
CREATE POLICY "admins_update_categories" ON categories FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_categories" ON categories;
CREATE POLICY "admins_delete_categories" ON categories FOR DELETE
  TO authenticated USING (is_admin());

-- ── affiliate_links: write policies for admins ───────────────────────────────
DROP POLICY IF EXISTS "admins_insert_affiliate_links" ON affiliate_links;
CREATE POLICY "admins_insert_affiliate_links" ON affiliate_links FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_update_affiliate_links" ON affiliate_links;
CREATE POLICY "admins_update_affiliate_links" ON affiliate_links FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_affiliate_links" ON affiliate_links;
CREATE POLICY "admins_delete_affiliate_links" ON affiliate_links FOR DELETE
  TO authenticated USING (is_admin());

-- ── storage bucket ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admins_upload_product_images" ON storage.objects;
CREATE POLICY "admins_upload_product_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "admins_update_product_images" ON storage.objects;
CREATE POLICY "admins_update_product_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "admins_delete_product_images" ON storage.objects;
CREATE POLICY "admins_delete_product_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'product-images' AND is_admin());
