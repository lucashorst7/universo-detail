/*
# Fix customer_reviews user_id default

## Problem
The `auth_insert_reviews` RLS policy requires `user_id = auth.uid()`, but the
`user_id` column has no DEFAULT. When the Supabase JS client sends `.insert()`
and the payload's `user_id` field is silently dropped or null for any reason,
the RLS WITH CHECK fails and the insert is rejected.

## Fix
1. Add `DEFAULT auth.uid()` to `customer_reviews.user_id` so every insert
   automatically gets the authenticated user's ID even if the client omits it.
2. Add a SELECT policy scoped to the row's owner so that `.insert().select().single()`
   works — without a SELECT policy for the inserting user, the chained `.select()`
   returns nothing and Supabase JS client throws "no rows" which surfaces as an error.

## Changes
- `customer_reviews.user_id`: adds DEFAULT auth.uid()
- New SELECT policy `"users_select_own_reviews"` so authenticated users can read their own reviews (needed for `.insert().select()` chaining)

## Notes
- Existing rows are unaffected — this only changes the column default for future inserts.
- The existing `public_read_active_reviews` policy already covers reading non-deleted reviews for all users, so this new policy is additive.
*/

-- 1. Set DEFAULT auth.uid() on user_id so inserts never silently lose the owner
ALTER TABLE customer_reviews
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Add a SELECT policy so the inserting user can read back the new row
--    (required for .insert().select().single() to succeed)
DROP POLICY IF EXISTS "users_select_own_reviews" ON customer_reviews;
CREATE POLICY "users_select_own_reviews" ON customer_reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
