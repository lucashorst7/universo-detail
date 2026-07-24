/*
# Revoke Explicit EXECUTE Grants from anon and authenticated

## Overview
The previous migration revoked EXECUTE from PUBLIC on all SECURITY DEFINER functions,
but some functions still had explicit grants to the `anon` and/or `authenticated` roles
(likely created by earlier migrations or Supabase defaults). This migration explicitly
revokes EXECUTE from both `anon` and `authenticated` on all functions that still show
execute privileges.

## Security Changes
- REVOKE EXECUTE FROM anon, authenticated on all SECURITY DEFINER functions that still
  had execute privileges
- Re-grant EXECUTE on is_admin() to authenticated (it's SECURITY INVOKER, needed for RLS)
*/

-- Functions that still had anon/authenticated execute after PUBLIC revoke
REVOKE EXECUTE ON FUNCTION public.capture_admin_audit_log() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_search_insight(p_query text, p_result_count integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_search_documents_for_taxonomy() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.report_runtime_error(p_source text, p_message text, p_stack text, p_component_stack text, p_route text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_public_brand_slug(p_slug text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_public_category_slug(p_slug text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_public_product_slug(p_slug text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.search_catalog(p_query text, p_limit integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.suggest_catalog_search(p_prefix text, p_limit integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_product_search_document() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_product_search_document_from_id(p_product_id uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.track_affiliate_click(p_affiliate_link_id uuid, p_page_path text, p_referrer_domain text) FROM anon, authenticated;

-- Also revoke from the ones that showed auth_can_execute=true but anon_can_execute=false
REVOKE EXECUTE ON FUNCTION public.delete_brand_safely(p_brand_id uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_category_safely(p_category_id uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_product_safely(p_product_id uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_audit_logs(p_query text, p_entity_type text, p_action text, p_page integer, p_page_size integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_snapshot() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_affiliate_analytics_summary() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_affiliate_link_analytics(p_search text, p_offset integer, p_limit integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_affiliate_link_count(p_search text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_brand_catalog_usage() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_category_catalog_usage() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_runtime_error_logs(p_query text, p_source text, p_page integer, p_page_size integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_search_index_stats() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_search_operations_snapshot(p_days integer, p_limit integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.rebuild_search_index() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.save_brand(p_brand_id uuid, p_brand jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.save_category(p_category_id uuid, p_category jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_admin_session() FROM authenticated;

-- Re-grant is_admin() to authenticated (SECURITY INVOKER, needed for RLS policy evaluation)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
