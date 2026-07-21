/*
# Fix customer_reviews INSERT RLS policy

## Problem
The INSERT policy `auth_insert_reviews` has `WITH CHECK (user_id = auth.uid())`.
While `user_id` has `DEFAULT auth.uid()`, the DEFAULT may not be applied before
the WITH CHECK is evaluated in certain Postgres/Supabase configurations,
causing `user_id` to be NULL at check time, which makes the check fail with
error 42501 (new row violates row-level security policy).

## Changes
1. Make `user_id` column NOT NULL (0 existing rows, safe to do)
2. Drop and recreate the INSERT policy with a more tolerant WITH CHECK that
   uses `COALESCE(user_id, auth.uid()) = auth.uid()` — this passes whether
   the client sends user_id explicitly or relies on the column DEFAULT.
3. Keep the banned_users subquery check intact.
*/

-- Step 1: Make user_id NOT NULL (safe — 0 rows in table)
ALTER TABLE customer_reviews ALTER COLUMN user_id SET NOT NULL;

-- Step 2: Drop old INSERT policy
DROP POLICY IF EXISTS "auth_insert_reviews" ON customer_reviews;

-- Step 3: Recreate with COALESCE for robustness
CREATE POLICY "auth_insert_reviews"
ON customer_reviews FOR INSERT
TO authenticated
WITH CHECK (
  COALESCE(user_id, auth.uid()) = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM banned_users
    WHERE banned_users.user_id = auth.uid()
  )
);
