/* PR-018 Admin Dashboard Reliability */
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_snapshot()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'products', (SELECT count(*) FROM public.products),
    'brands', (SELECT count(*) FROM public.brands),
    'categories', (SELECT count(*) FROM public.categories),
    'clicks_30d', (SELECT count(*) FROM public.affiliate_clicks WHERE created_at >= now() - interval '30 days'),
    'draft', (SELECT count(*) FROM public.products WHERE status = 'draft'),
    'review', (SELECT count(*) FROM public.products WHERE status = 'review'),
    'published', (SELECT count(*) FROM public.products WHERE status = 'published'),
    'archived', (SELECT count(*) FROM public.products WHERE status = 'archived'),
    'scheduled', (SELECT count(*) FROM public.products WHERE status = 'published' AND publish_at > now()),
    'incomplete', (
      SELECT count(*)
      FROM public.products p
      WHERE p.status IN ('draft', 'review', 'published')
        AND (
          p.brand_id IS NULL OR p.category_id IS NULL OR
          NULLIF(btrim(COALESCE(p.short_description, '')), '') IS NULL OR
          NULLIF(btrim(COALESCE(p.description, '')), '') IS NULL OR
          NULLIF(btrim(COALESCE(p.image_url, '')), '') IS NULL OR
          NOT EXISTS (SELECT 1 FROM public.affiliate_links al WHERE al.product_id = p.id)
        )
    ),
    'recent_products', COALESCE((
      SELECT jsonb_agg(row_data ORDER BY row_data.created_at DESC)
      FROM (
        SELECT p.id, p.name, p.slug, p.created_at, p.status,
               jsonb_build_object('name', b.name) AS brand
        FROM public.products p
        LEFT JOIN public.brands b ON b.id = p.brand_id
        ORDER BY p.created_at DESC
        LIMIT 5
      ) row_data
    ), '[]'::jsonb),
    'attention_products', COALESCE((
      SELECT jsonb_agg(row_data ORDER BY row_data.priority, row_data.created_at DESC)
      FROM (
        SELECT p.id, p.name, p.status, p.created_at,
          CASE WHEN p.status = 'review' THEN 1 ELSE 2 END AS priority,
          CASE
            WHEN p.status = 'review' THEN 'Aguardando revisão'
            ELSE concat_ws(', ',
              CASE WHEN p.brand_id IS NULL THEN 'sem marca' END,
              CASE WHEN p.category_id IS NULL THEN 'sem categoria' END,
              CASE WHEN NULLIF(btrim(COALESCE(p.short_description, '')), '') IS NULL THEN 'sem resumo' END,
              CASE WHEN NULLIF(btrim(COALESCE(p.description, '')), '') IS NULL THEN 'sem descrição' END,
              CASE WHEN NULLIF(btrim(COALESCE(p.image_url, '')), '') IS NULL THEN 'sem imagem' END,
              CASE WHEN NOT EXISTS (SELECT 1 FROM public.affiliate_links al WHERE al.product_id = p.id) THEN 'sem link afiliado' END
            )
          END AS reason
        FROM public.products p
        WHERE p.status = 'review'
           OR (p.status IN ('draft', 'published') AND (
             p.brand_id IS NULL OR p.category_id IS NULL OR
             NULLIF(btrim(COALESCE(p.short_description, '')), '') IS NULL OR
             NULLIF(btrim(COALESCE(p.description, '')), '') IS NULL OR
             NULLIF(btrim(COALESCE(p.image_url, '')), '') IS NULL OR
             NOT EXISTS (SELECT 1 FROM public.affiliate_links al WHERE al.product_id = p.id)
           ))
        ORDER BY priority, p.created_at DESC
        LIMIT 8
      ) row_data
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_snapshot() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_snapshot() TO authenticated;
