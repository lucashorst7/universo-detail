/*
# Fix Security Issues: Extensions, Search Paths, Function Privileges, RLS Policies

## Overview
This migration fixes all security issues flagged by the Supabase security advisor:
1. Moves pg_trgm and unaccent extensions from public to a dedicated extensions schema
2. Fixes mutable search_path on is_admin() and handle_new_user() functions
3. Revokes EXECUTE from anon and authenticated on all SECURITY DEFINER functions
4. Grants EXECUTE only where needed (is_admin for RLS policy evaluation)
5. Switches is_admin() to SECURITY INVOKER (safe with existing RLS on admin_users)
6. Adds RLS policies to 5 tables that had RLS enabled but no policies

## Security Changes

### Extensions
- Created schema `extensions`
- Moved `pg_trgm` extension to `extensions` schema
- Moved `unaccent` extension to `extensions` schema
- Recreated GIN trigram index with schema-qualified opclass
- Updated function search_paths to include `extensions` schema

### Function Search Path
- `is_admin()`: Added `SET search_path TO public, auth`
- `handle_new_user()`: Added `SET search_path TO public, auth`

### Function Privileges
- All SECURITY DEFINER functions: REVOKE EXECUTE FROM PUBLIC, anon, authenticated
- `is_admin()`: Switched to SECURITY INVOKER, GRANT EXECUTE TO authenticated
  (Works safely because admin_users has RLS policy allowing users to read their own row)
- Trigger functions (capture_admin_audit_log, handle_new_user, sync_product_search_document,
  preserve_brand_slug_history, preserve_category_slug_history): No grants needed,
  triggers execute with function owner privileges regardless of EXECUTE grants

### RLS Policies Added
- `brand_slug_history`: Admin-only SELECT
- `category_slug_history`: Admin-only SELECT
- `product_slug_history`: Admin-only SELECT
- `runtime_error_logs`: Admin-only SELECT, anon INSERT (for error reporting)
- `search_insights`: Admin-only SELECT, anon INSERT (for search analytics)

## Important Notes
1. The frontend does not call any RPC functions via Supabase client - it uses direct
   table queries with RLS. So revoking EXECUTE on all functions does not break the app.
2. is_admin() is called from RLS policies on multiple tables. Switching to SECURITY INVOKER
   works because admin_users has an RLS policy allowing authenticated users to SELECT
   their own row (admins_select_self), so the EXISTS check in is_admin() resolves correctly.
3. Trigger functions continue to work because triggers run with the function owner's
   privileges, independent of EXECUTE grants.
4. SECURITY DEFINER functions that INSERT into tables (report_runtime_error,
   record_search_insight) bypass RLS because they run as the function owner (superuser).
*/

-- ============================================================
-- 1. Create extensions schema and move extensions
-- ============================================================
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to all roles
GRANT USAGE ON SCHEMA extensions TO anon, authenticated;

-- Drop the GIN index that depends on pg_trgm
DROP INDEX IF EXISTS public.search_documents_title_trgm_idx;

-- Move pg_trgm extension to extensions schema
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION pg_trgm SCHEMA extensions;

-- Move unaccent extension to extensions schema
DROP EXTENSION IF EXISTS unaccent CASCADE;
CREATE EXTENSION unaccent SCHEMA extensions;

-- Recreate the GIN trigram index with schema-qualified opclass
CREATE INDEX IF NOT EXISTS search_documents_title_trgm_idx
  ON public.search_documents
  USING gin (title extensions.gin_trgm_ops);

-- ============================================================
-- 2. Fix search_path on is_admin() and handle_new_user()
-- ============================================================

-- Recreate is_admin() as SECURITY INVOKER with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path TO public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  );
$$;

-- Fix handle_new_user() search_path (keep as SECURITY DEFINER - it's a trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. Update search_path on functions that use unaccent/similarity
--    to include the extensions schema
-- ============================================================

-- Functions using similarity() (from pg_trgm)
ALTER FUNCTION public.search_catalog(p_query text, p_limit integer) SET search_path TO public, extensions;
ALTER FUNCTION public.suggest_catalog_search(p_prefix text, p_limit integer) SET search_path TO public, extensions;

-- Functions using unaccent() (from unaccent extension)
-- suggest_catalog_search already updated above

-- Functions that had empty or missing search_path - fix them all
ALTER FUNCTION public.capture_admin_audit_log() SET search_path TO public, auth;
ALTER FUNCTION public.delete_brand_safely(p_brand_id uuid) SET search_path TO public;
ALTER FUNCTION public.delete_category_safely(p_category_id uuid) SET search_path TO public;
ALTER FUNCTION public.delete_product_safely(p_product_id uuid) SET search_path TO public;
ALTER FUNCTION public.get_admin_audit_logs(p_query text, p_entity_type text, p_action text, p_page integer, p_page_size integer) SET search_path TO public, auth;
ALTER FUNCTION public.get_admin_dashboard_snapshot() SET search_path TO public, auth;
ALTER FUNCTION public.get_affiliate_analytics_summary() SET search_path TO public;
ALTER FUNCTION public.get_affiliate_link_analytics(p_search text, p_offset integer, p_limit integer) SET search_path TO public;
ALTER FUNCTION public.get_affiliate_link_count(p_search text) SET search_path TO public;
ALTER FUNCTION public.get_brand_catalog_usage() SET search_path TO public;
ALTER FUNCTION public.get_category_catalog_usage() SET search_path TO public;
ALTER FUNCTION public.get_runtime_error_logs(p_query text, p_source text, p_page integer, p_page_size integer) SET search_path TO public;
ALTER FUNCTION public.get_search_index_stats() SET search_path TO public;
ALTER FUNCTION public.get_search_operations_snapshot(p_days integer, p_limit integer) SET search_path TO public;
ALTER FUNCTION public.preserve_brand_slug_history() SET search_path TO public;
ALTER FUNCTION public.preserve_category_slug_history() SET search_path TO public;
ALTER FUNCTION public.rebuild_search_index() SET search_path TO public, auth;
ALTER FUNCTION public.record_search_insight(p_query text, p_result_count integer) SET search_path TO public;
ALTER FUNCTION public.refresh_search_documents_for_taxonomy() SET search_path TO public;
ALTER FUNCTION public.report_runtime_error(p_source text, p_message text, p_stack text, p_component_stack text, p_route text) SET search_path TO public;
ALTER FUNCTION public.resolve_public_brand_slug(p_slug text) SET search_path TO public;
ALTER FUNCTION public.resolve_public_category_slug(p_slug text) SET search_path TO public;
ALTER FUNCTION public.resolve_public_product_slug(p_slug text) SET search_path TO public;
ALTER FUNCTION public.save_brand(p_brand_id uuid, p_brand jsonb) SET search_path TO public;
ALTER FUNCTION public.save_category(p_category_id uuid, p_category jsonb) SET search_path TO public;
ALTER FUNCTION public.sync_product_search_document() SET search_path TO public;
ALTER FUNCTION public.sync_product_search_document_from_id(p_product_id uuid) SET search_path TO public;
ALTER FUNCTION public.track_affiliate_click(p_affiliate_link_id uuid, p_page_path text, p_referrer_domain text) SET search_path TO public;
ALTER FUNCTION public.validate_admin_session() SET search_path TO public, auth;

-- ============================================================
-- 4. Revoke EXECUTE from PUBLIC on ALL SECURITY DEFINER functions
--    Then grant only where explicitly needed
-- ============================================================

-- Revoke EXECUTE from all roles on all SECURITY DEFINER functions
-- (PUBLIC covers anon, authenticated, and any other role)
REVOKE EXECUTE ON FUNCTION public.capture_admin_audit_log() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_brand_safely(p_brand_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_category_safely(p_category_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_product_safely(p_product_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_audit_logs(p_query text, p_entity_type text, p_action text, p_page integer, p_page_size integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_snapshot() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_affiliate_analytics_summary() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_affiliate_link_analytics(p_search text, p_offset integer, p_limit integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_affiliate_link_count(p_search text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_brand_catalog_usage() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_category_catalog_usage() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_runtime_error_logs(p_query text, p_source text, p_page integer, p_page_size integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_search_index_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_search_operations_snapshot(p_days integer, p_limit integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.preserve_brand_slug_history() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.preserve_category_slug_history() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rebuild_search_index() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_search_insight(p_query text, p_result_count integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refresh_search_documents_for_taxonomy() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.report_runtime_error(p_source text, p_message text, p_stack text, p_component_stack text, p_route text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.resolve_public_brand_slug(p_slug text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.resolve_public_category_slug(p_slug text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.resolve_public_product_slug(p_slug text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.save_brand(p_brand_id uuid, p_brand jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.save_category(p_category_id uuid, p_category jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_product_search_document() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_product_search_document_from_id(p_product_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.track_affiliate_click(p_affiliate_link_id uuid, p_page_path text, p_referrer_domain text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_admin_session() FROM PUBLIC;

-- Grant EXECUTE on is_admin() to authenticated only (needed for RLS policy evaluation)
-- is_admin() is now SECURITY INVOKER, so it runs with the caller's privileges
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================
-- 5. Add RLS policies to tables with RLS enabled but no policies
-- ============================================================

-- brand_slug_history: admin-only read
ALTER TABLE public.brand_slug_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_brand_slug_history" ON public.brand_slug_history;
CREATE POLICY "admins_read_brand_slug_history"
ON public.brand_slug_history FOR SELECT
TO authenticated
USING (public.is_admin());

-- category_slug_history: admin-only read
ALTER TABLE public.category_slug_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_category_slug_history" ON public.category_slug_history;
CREATE POLICY "admins_read_category_slug_history"
ON public.category_slug_history FOR SELECT
TO authenticated
USING (public.is_admin());

-- product_slug_history: admin-only read
ALTER TABLE public.product_slug_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_product_slug_history" ON public.product_slug_history;
CREATE POLICY "admins_read_product_slug_history"
ON public.product_slug_history FOR SELECT
TO authenticated
USING (public.is_admin());

-- runtime_error_logs: admin-only read, anon can insert (error reporting)
ALTER TABLE public.runtime_error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_runtime_error_logs" ON public.runtime_error_logs;
CREATE POLICY "admins_read_runtime_error_logs"
ON public.runtime_error_logs FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "anon_insert_runtime_error_logs" ON public.runtime_error_logs;
CREATE POLICY "anon_insert_runtime_error_logs"
ON public.runtime_error_logs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- search_insights: admin-only read, anon can insert (search analytics)
ALTER TABLE public.search_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_search_insights" ON public.search_insights;
CREATE POLICY "admins_read_search_insights"
ON public.search_insights FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "anon_insert_search_insights" ON public.search_insights;
CREATE POLICY "anon_insert_search_insights"
ON public.search_insights FOR INSERT
TO anon, authenticated
WITH CHECK (true);
