/*
# Fix Security Issues: is_admin function + storage bucket listing

## Problems fixed
1. Function `is_admin()` had a mutable search_path — now pinned to ''.
2. Public bucket `product-images` had a broad SELECT policy allowing file enumeration — dropped.
   Public buckets serve objects via URL without any SELECT policy; the policy only enabled listing.
3. `is_admin()` was SECURITY DEFINER, callable by anon via REST — switched to SECURITY INVOKER
   so it runs with the caller's privileges, not the owner's.
4. `is_admin()` was executable by anon — revoked EXECUTE from anon/public; kept for authenticated
   (needed by RLS write policies on products/brands/categories/affiliate_links).
*/

-- ── 1. Switch is_admin to SECURITY INVOKER with pinned search_path ────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  );
$$;

-- ── 2. Restrict EXECUTE to authenticated only ─────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ── 3. Drop broad SELECT policy on storage.objects for product-images ─────────
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;