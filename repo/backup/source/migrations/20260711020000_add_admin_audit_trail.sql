/*
  PR-020 — Admin Audit Trail
  Records administrative mutations for core catalog entities and exposes a
  paginated, admin-only reporting function.
*/

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  entity_type text NOT NULL CHECK (entity_type IN ('product', 'brand', 'category', 'affiliate_link')),
  entity_id uuid,
  entity_label text,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changed_fields text[] NOT NULL DEFAULT '{}',
  previous_data jsonb,
  current_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx
  ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_entity_idx
  ON public.admin_audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_actor_idx
  ON public.admin_audit_logs (actor_id, created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can read audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

REVOKE ALL ON TABLE public.admin_audit_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.admin_audit_logs FROM authenticated;
GRANT SELECT ON TABLE public.admin_audit_logs TO authenticated;

CREATE OR REPLACE FUNCTION public.capture_admin_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_actor_email text;
  v_old jsonb;
  v_new jsonb;
  v_entity_id uuid;
  v_entity_label text;
  v_action text;
  v_changed_fields text[] := '{}';
BEGIN
  -- Public or anonymous mutations are not audit events for the admin trail.
  IF v_actor_id IS NULL OR NOT public.is_admin() THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  SELECT email INTO v_actor_email FROM auth.users WHERE id = v_actor_id;

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_new := to_jsonb(NEW);
    v_entity_id := NEW.id;
    v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_new));
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_entity_id := NEW.id;
    SELECT COALESCE(array_agg(key ORDER BY key), '{}')
      INTO v_changed_fields
    FROM (
      SELECT key
      FROM jsonb_each(v_new)
      WHERE (v_old -> key) IS DISTINCT FROM (v_new -> key)
        AND key NOT IN ('updated_at')
    ) changed;

    IF cardinality(v_changed_fields) = 0 THEN
      RETURN NEW;
    END IF;
  ELSE
    v_action := 'delete';
    v_old := to_jsonb(OLD);
    v_entity_id := OLD.id;
    v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_old));
  END IF;

  v_entity_label := CASE TG_TABLE_NAME
    WHEN 'products' THEN COALESCE(v_new ->> 'name', v_old ->> 'name')
    WHEN 'brands' THEN COALESCE(v_new ->> 'name', v_old ->> 'name')
    WHEN 'categories' THEN COALESCE(v_new ->> 'name', v_old ->> 'name')
    WHEN 'affiliate_links' THEN COALESCE(v_new ->> 'marketplace', v_old ->> 'marketplace')
    ELSE NULL
  END;

  INSERT INTO public.admin_audit_logs (
    actor_id, actor_email, entity_type, entity_id, entity_label,
    action, changed_fields, previous_data, current_data
  ) VALUES (
    v_actor_id,
    v_actor_email,
    CASE TG_TABLE_NAME
      WHEN 'products' THEN 'product'
      WHEN 'brands' THEN 'brand'
      WHEN 'categories' THEN 'category'
      WHEN 'affiliate_links' THEN 'affiliate_link'
    END,
    v_entity_id,
    v_entity_label,
    v_action,
    v_changed_fields,
    v_old,
    v_new
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS audit_products_changes ON public.products;
CREATE TRIGGER audit_products_changes
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.capture_admin_audit_log();

DROP TRIGGER IF EXISTS audit_brands_changes ON public.brands;
CREATE TRIGGER audit_brands_changes
AFTER INSERT OR UPDATE OR DELETE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.capture_admin_audit_log();

DROP TRIGGER IF EXISTS audit_categories_changes ON public.categories;
CREATE TRIGGER audit_categories_changes
AFTER INSERT OR UPDATE OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.capture_admin_audit_log();

DROP TRIGGER IF EXISTS audit_affiliate_links_changes ON public.affiliate_links;
CREATE TRIGGER audit_affiliate_links_changes
AFTER INSERT OR UPDATE OR DELETE ON public.affiliate_links
FOR EACH ROW EXECUTE FUNCTION public.capture_admin_audit_log();

CREATE OR REPLACE FUNCTION public.get_admin_audit_logs(
  p_query text DEFAULT NULL,
  p_entity_type text DEFAULT NULL,
  p_action text DEFAULT NULL,
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  actor_email text,
  entity_type text,
  entity_id uuid,
  entity_label text,
  action text,
  changed_fields text[],
  created_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_page integer := GREATEST(COALESCE(p_page, 1), 1);
  v_page_size integer := LEAST(GREATEST(COALESCE(p_page_size, 20), 1), 100);
  v_query text := NULLIF(btrim(COALESCE(p_query, '')), '');
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  RETURN QUERY
  SELECT
    logs.id,
    logs.actor_email,
    logs.entity_type,
    logs.entity_id,
    logs.entity_label,
    logs.action,
    logs.changed_fields,
    logs.created_at,
    count(*) OVER() AS total_count
  FROM public.admin_audit_logs logs
  WHERE (p_entity_type IS NULL OR p_entity_type = '' OR logs.entity_type = p_entity_type)
    AND (p_action IS NULL OR p_action = '' OR logs.action = p_action)
    AND (
      v_query IS NULL
      OR logs.entity_label ILIKE '%' || v_query || '%'
      OR logs.actor_email ILIKE '%' || v_query || '%'
      OR logs.entity_id::text ILIKE '%' || v_query || '%'
    )
  ORDER BY logs.created_at DESC
  OFFSET (v_page - 1) * v_page_size
  LIMIT v_page_size;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_audit_logs(text, text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_admin_audit_logs(text, text, text, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_audit_logs(text, text, text, integer, integer) TO authenticated;
