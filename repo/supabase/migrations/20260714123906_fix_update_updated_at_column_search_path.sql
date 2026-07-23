/*
# Fix mutable search_path on update_updated_at_column function

## Problem
The function `public.update_updated_at_column()` has a mutable search_path, which is a security risk. An attacker could create objects in the search path that shadow built-in functions, potentially executing malicious code when the trigger fires.

## Fix
1. Drop the trigger that depends on the function.
2. Drop and recreate the function with `SET search_path = ''`.
3. Recreate the trigger.

## Changes
- Drops trigger `trg_user_profiles_updated_at` on `user_profiles`
- Drops and recreates `update_updated_at_column()` with locked `search_path = ''`
- Recreates `trg_user_profiles_updated_at` trigger

## Notes
1. This is a non-destructive change — the function logic is identical, only the search_path is locked down.
2. `now()` is a fully qualified built-in that resolves correctly even with an empty search_path.
*/

-- 1. Drop the trigger first (it depends on the function)
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;

-- 2. Drop and recreate the function with locked search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Recreate the trigger
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
