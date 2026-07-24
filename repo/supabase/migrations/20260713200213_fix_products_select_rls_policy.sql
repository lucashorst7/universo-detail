-- Fix: allow both anon and authenticated to SELECT published products
-- Previously only 'anon' could read, so logged-in non-admin users saw zero products

DROP POLICY IF EXISTS "public_select_published_products" ON products;
DROP POLICY IF EXISTS "authenticated_select_products" ON products;

CREATE POLICY "public_select_published_products" ON products
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND (publish_at IS NULL OR publish_at <= now())
  );
