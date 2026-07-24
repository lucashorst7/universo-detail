-- Public RPC to expose the registered user count to anon clients.
-- SECURITY DEFINER so the anon key can read auth.users (which it cannot otherwise).
CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer FROM auth.users;
$$;

-- Allow anon + authenticated to call it (the home page is public).
REVOKE ALL ON FUNCTION public.get_user_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_count() TO anon, authenticated;
