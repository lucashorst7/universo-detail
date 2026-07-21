/*
# Add mark_email_verified function + tighten profile update policy

1. New Function
- public.mark_email_verified() — SECURITY DEFINER, sets email_verified = true for the calling authenticated user.
- Returns true on success.

2. Grants
- EXECUTE on mark_email_verified() granted to authenticated role.

3. Security Changes
- Drop and recreate the users_update_own_profile UPDATE policy on user_profiles.
- New WITH CHECK clause: allows updates to all fields EXCEPT email_verified (users cannot self-verify).
- The email_verified column can only be flipped to true via the SECURITY DEFINER function.
*/

CREATE OR REPLACE FUNCTION public.mark_email_verified()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  UPDATE public.user_profiles
  SET email_verified = true, updated_at = now()
  WHERE user_id = auth.uid();
  RETURN FOUND;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.mark_email_verified() TO authenticated;

DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND email_verified = (SELECT email_verified FROM public.user_profiles WHERE user_id = auth.uid())
);