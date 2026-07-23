/*
# Fix RLS policies on product_categories (write operations admin-only)

## Context
The `product_categories` junction table (links products ↔ categories) had
INSERT, UPDATE, and DELETE policies scoped to `anon, authenticated` with
`true` predicates. This effectively disabled row-level security for writes —
any unauthenticated client could insert, update, or delete junction rows and
thereby reassign products to arbitrary categories.

## Changes
- `product_categories` SELECT policy: unchanged (intentionally public read —
  the storefront resolves product categories through this table via the anon key).
- `product_categories` INSERT: replaced `WITH CHECK (true)` with admin-only
  `WITH CHECK (is_admin())`, scoped `TO authenticated`.
- `product_categories` UPDATE: replaced `USING (true) WITH CHECK (true)` with
  admin-only `USING (is_admin()) WITH CHECK (is_admin())`, scoped `TO authenticated`.
- `product_categories` DELETE: replaced `USING (true)` with admin-only
  `USING (is_admin())`, scoped `TO authenticated`.

## Security impact
After this migration, only authenticated admins (rows present in `admin_users`,
verified by the existing `is_admin()` function) can modify product↔category
associations. Anon and non-admin authenticated users retain read access only,
consistent with the policies already in place on `products`, `brands`, and
`categories`.

## Notes
1. Policies are dropped first (DROP POLICY IF EXISTS) and re-created so the
   migration is safe to re-run if a prior attempt timed out after committing.
2. No data is deleted or modified — only policy definitions change.
3. The `anon_select_product_categories` SELECT policy is intentionally left
   as `USING (true)` because product/category associations are public catalog
   data that the storefront must read via the anon key.
*/

-- SELECT: unchanged (intentionally public read for storefront catalog).
-- No action needed; the existing anon_select_product_categories policy stays.

-- INSERT: admin-only.
DROP POLICY IF EXISTS "anon_insert_product_categories" ON public.product_categories;
CREATE POLICY "admins_insert_product_categories"
  ON public.product_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: admin-only.
DROP POLICY IF EXISTS "anon_update_product_categories" ON public.product_categories;
CREATE POLICY "admins_update_product_categories"
  ON public.product_categories FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DELETE: admin-only.
DROP POLICY IF EXISTS "anon_delete_product_categories" ON public.product_categories;
CREATE POLICY "admins_delete_product_categories"
  ON public.product_categories FOR DELETE
  TO authenticated
  USING (is_admin());
