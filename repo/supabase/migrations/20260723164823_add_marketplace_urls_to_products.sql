/*
# Add marketplace URL columns to products

1. Purpose
   Adds three optional columns to the `products` table so administrators can
   store external purchase links for each product on Mercado Livre, Shopee and
   Amazon.  Each column is nullable and defaults to NULL, so existing products
   continue to work without any data backfill.

2. New columns on `products`
   - `mercado_livre_url` (text, nullable) — full URL to the product on Mercado Livre.
   - `shopee_url`        (text, nullable) — full URL to the product on Shopee.
   - `amazon_url`        (text, nullable) — full URL to the product on Amazon.

3. Security
   No changes to RLS — the existing policies on `products` already cover SELECT
   (public read of published products) and admin write via the service role.
   The new columns inherit those same policies automatically.

4. Compatibility
   All three columns accept NULL, so no migration of existing rows is required.
   No existing column is renamed, retyped, or removed.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS mercado_livre_url text,
  ADD COLUMN IF NOT EXISTS shopee_url text,
  ADD COLUMN IF NOT EXISTS amazon_url text;
