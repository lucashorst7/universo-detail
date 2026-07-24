/*
  PR-024 — Admin Session Hardening

  Exposes a minimal authenticated session-validation RPC. The browser can
  revalidate authorization without reading admin_users directly or inferring
  access from unrelated queries.
*/

CREATE OR REPLACE FUNCTION public.validate_admin_session()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_is_admin boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = v_user_id
  ) INTO v_is_admin;

  RETURN jsonb_build_object(
    'is_admin', v_is_admin,
    'user_id', v_user_id,
    'validated_at', timezone('utc', now())
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_admin_session() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_admin_session() TO authenticated;
