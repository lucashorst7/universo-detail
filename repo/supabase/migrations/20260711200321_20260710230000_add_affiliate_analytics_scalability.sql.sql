/*
# Affiliate Analytics Scalability

Moves affiliate-link metrics aggregation to PostgreSQL and exposes paginated,
searchable administrative reports without loading raw click events in the browser.
*/

CREATE INDEX IF NOT EXISTS affiliate_clicks_link_clicked_at_idx
  ON public.affiliate_clicks (affiliate_link_id, clicked_at DESC);

CREATE OR REPLACE FUNCTION public.get_affiliate_analytics_summary()
RETURNS TABLE (
  total_links bigint,
  clicks_last_30_days bigint,
  active_links_last_30_days bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso restrito a administradores.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.affiliate_links)::bigint,
    count(ac.id)::bigint,
    count(DISTINCT ac.affiliate_link_id)::bigint
  FROM public.affiliate_clicks ac
  WHERE ac.clicked_at >= now() - interval '30 days';
END;
$$;


CREATE OR REPLACE FUNCTION public.get_affiliate_link_count(p_search text DEFAULT NULL)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  v_search text := NULLIF(btrim(COALESCE(p_search, '')), '');
  v_count bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso restrito a administradores.' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_count
  FROM public.affiliate_links al
  JOIN public.products p ON p.id = al.product_id
  WHERE v_search IS NULL
     OR al.marketplace ILIKE '%' || v_search || '%'
     OR p.name ILIKE '%' || v_search || '%';

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_affiliate_link_analytics(
  p_search text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  marketplace text,
  url text,
  price numeric,
  is_primary boolean,
  product_id uuid,
  product_name text,
  clicks_last_30_days bigint,
  last_click_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  v_search text := NULLIF(btrim(COALESCE(p_search, '')), '');
  v_offset integer := GREATEST(COALESCE(p_offset, 0), 0);
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso restrito a administradores.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH filtered_links AS (
    SELECT
      al.id,
      al.marketplace,
      al.url,
      al.price,
      al.is_primary,
      al.product_id,
      p.name AS product_name,
      al.created_at
    FROM public.affiliate_links al
    JOIN public.products p ON p.id = al.product_id
    WHERE v_search IS NULL
       OR al.marketplace ILIKE '%' || v_search || '%'
       OR p.name ILIKE '%' || v_search || '%'
  ),
  page AS (
    SELECT fl.*, count(*) OVER ()::bigint AS total_count
    FROM filtered_links fl
    ORDER BY fl.created_at DESC, fl.id
    OFFSET v_offset
    LIMIT v_limit
  )
  SELECT
    pg.id,
 pg.marketplace, pg.url, pg.price, pg.is_primary, pg.product_id, pg.product_name,
    count(ac.id) FILTER (WHERE ac.clicked_at >= now() - interval '30 days')::bigint,
    max(ac.clicked_at),
    pg.total_count
  FROM page pg
  LEFT JOIN public.affiliate_clicks ac ON ac.affiliate_link_id = pg.id
  GROUP BY pg.id, pg.marketplace, pg.url, pg.price, pg.is_primary,
           pg.product_id, pg.product_name, pg.created_at, pg.total_count
  ORDER BY pg.created_at DESC, pg.id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_affiliate_analytics_summary() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_affiliate_link_count(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_affiliate_link_analytics(text, integer, integer) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_affiliate_analytics_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_affiliate_link_count(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_affiliate_link_analytics(text, integer, integer) TO authenticated;