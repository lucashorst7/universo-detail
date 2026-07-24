/*
# Fix missing INSERT/UPDATE/DELETE grants on customer_reviews

## Problem
The `authenticated` and `anon` roles lacked INSERT, UPDATE, and DELETE
privileges on `customer_reviews`. RLS policies define *which rows* a role
can access, but the role also needs the base table GRANT for the operation.
Without `INSERT` privilege, every insert attempt fails with 42501 (new row
violates row-level security policy) — even when the RLS policy itself would
allow the row.

## Changes
1. GRANT INSERT on `customer_reviews` to `authenticated` (for logged-in users
   submitting reviews).
2. GRANT UPDATE on `customer_reviews` to `authenticated` (for soft-delete and
   editing, gated by RLS).
3. GRANT DELETE on `customer_reviews` to `authenticated` (for admin delete,
   gated by RLS `is_admin()`).
4. GRANT INSERT/UPDATE/DELETE on `customer_reviews` to `anon` as well, so the
   anon-key client is not blocked at the GRANT level (RLS still gates access).
*/

GRANT INSERT, UPDATE, DELETE ON customer_reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON customer_reviews TO anon;
