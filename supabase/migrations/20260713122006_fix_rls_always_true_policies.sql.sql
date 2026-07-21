/*
# Fix RLS Policies with Always-True WITH CHECK

## Overview
The previous migration added INSERT policies on `runtime_error_logs` and `search_insights`
with `WITH CHECK (true)`, which the security advisor flags as bypassing RLS. This migration
replaces those with meaningful column-level constraints that validate the inserted data
without allowing arbitrary writes.

## Security Changes
- `runtime_error_logs`: INSERT policy now requires non-null `source` and `message`
  (matching the NOT NULL constraints on those columns), and if `actor_id` is provided
  it must match the authenticated user's ID.
- `search_insights`: INSERT policy now requires non-null `query_normalized` and
  `result_count >= 0` (matching the NOT NULL constraint and preventing negative counts).

## Important Notes
1. These are intentionally public-insert tables (error reporting and search analytics)
   that need to accept writes from anonymous users. The constraints ensure only valid
   data is inserted, not arbitrary rows.
2. The `actor_id` check on `runtime_error_logs` ensures a user cannot impersonate another
   user when reporting errors - if actor_id is set, it must be their own ID.
*/

-- ============================================================
-- runtime_error_logs: Replace always-true INSERT policy
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_runtime_error_logs" ON public.runtime_error_logs;

CREATE POLICY "anon_insert_runtime_error_logs"
ON public.runtime_error_logs FOR INSERT
TO anon, authenticated
WITH CHECK (
  source IS NOT NULL
  AND message IS NOT NULL
  AND (actor_id IS NULL OR actor_id = auth.uid())
);

-- ============================================================
-- search_insights: Replace always-true INSERT policy
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_search_insights" ON public.search_insights;

CREATE POLICY "anon_insert_search_insights"
ON public.search_insights FOR INSERT
TO anon, authenticated
WITH CHECK (
  query_normalized IS NOT NULL
  AND result_count >= 0
);
