/*
# Remove mark_email_verified SECURITY DEFINER function + revert RLS policy

## Purpose
Fix security vulnerabilities: the `mark_email_verified()` SECURITY DEFINER function
was executable by both `anon` and `authenticated` roles, allowing potential RLS bypass.

## Changes

### 1. Drop function
- `public.mark_email_verified()` is dropped entirely.
- Email verification is now tracked by Supabase Auth's built-in `auth.users.email_confirmed_at`
  field, which is set automatically when `verifyOtp()` succeeds. No custom function needed.

### 2. Revert RLS UPDATE policy on user_profiles
- The tightened policy that prevented users from updating `email_verified` is dropped.
- Restored to the original simple ownership check: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`.
- The `email_verified` column remains in the table (unused) but is no longer enforced via RLS.

### 3. Revoke grants
- EXECUTE on `mark_email_verified()` is revoked from all roles before dropping.
*/

REVOKE EXECUTE ON FUNCTION public.mark_email_verified() FROM anon, authenticated;
DROP FUNCTION IF EXISTS public.mark_email_verified();

DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);