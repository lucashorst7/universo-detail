-- FUNÇÕES CUSTOMIZADAS - Papo Detailer - 2026-07-22

CREATE OR REPLACE FUNCTION public.capture_admin_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION public.delete_brand_safely(p_brand_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
linked_products bigint;
BEGIN
IF NOT public.is_admin() THEN
RAISE EXCEPTION 'Acesso restrito a administradores.' USING ERRCODE = '42501';
END IF;

SELECT count(*) INTO linked_products
FROM public.products
WHERE brand_id = p_brand_id;

IF linked_products > 0 THEN
RAISE EXCEPTION 'A marca possui % produto(s) vinculado(s). Reatribua os produtos antes de excluir.', linked_products
USING ERRCODE = '23503';
END IF;

DELETE FROM public.brands WHERE id = p_brand_id;

IF NOT FOUND THEN
RAISE EXCEPTION 'Marca não encontrada.' USING ERRCODE = 'P0002';
END IF;
END;
$function$


CREATE OR REPLACE FUNCTION public.delete_category_safely(p_category_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
linked_products bigint;
BEGIN
IF NOT public.is_admin() THEN
RAISE EXCEPTION 'Acesso restrito a administradores.' USING ERRCODE = '42501';
END IF;

SELECT count(*) INTO linked_products
FROM public.products
WHERE category_id = p_category_id;

IF linked_products > 0 THEN
RAISE EXCEPTION 'A categoria possui % produto(s) vinculado(s). Reatribua os produtos antes de excluir.', linked_products
USING ERRCODE = '23503';
END IF;

DELETE FROM public.categories WHERE id = p_category_id;

IF NOT FOUND THEN
RAISE EXCEPTION 'Categoria não encontrada.' USING ERRCODE = 'P0002';
END IF;
END;
$function$


CREATE OR REPLACE FUNCTION public.delete_product_safely(p_product_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_product products%ROWTYPE;
v_media_urls jsonb := '[]'::jsonb;
BEGIN
IF NOT public.is_admin() THEN
RAISE EXCEPTION 'Administrator access required';
END IF;

SELECT * INTO v_product
FROM public.products
WHERE id = p_product_id
FOR UPDATE;

IF NOT FOUND THEN
RAISE EXCEPTION 'Product not found';
END IF;

v_media_urls := (
SELECT COALESCE(jsonb_agg(url), '[]'::jsonb)
FROM (
SELECT v_product.image_url AS url
WHERE v_product.image_url IS NOT NULL AND btrim(v_product.image_url) <> ''
UNION
SELECT value #>> '{}'
FROM jsonb_array_elements(COALESCE(v_product.gallery_images, '[]'::jsonb)) AS value
WHERE jsonb_typeof(value) = 'string' AND btrim(value #>> '{}') <> ''
) media
);

DELETE FROM public.products WHERE id = p_product_id;

RETURN jsonb_build_object(
'product_id', p_product_id,
'media_urls', v_media_urls
);
END;
$function$


CREATE OR REPLACE FUNCTION public.get_admin_audit_logs(p_query text DEFAULT NULL::text, p_entity_type text DEFAULT NULL::text, p_action text DEFAULT NULL::text, p_page integer DEFAULT 1, p_page_size integer DEFAULT 20)
 RETURNS TABLE(id uuid, actor_email text, entity_type text, entity_id uuid, entity_label text, action text, changed_fields text[], created_at timestamp with time zone, total_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION public.get_admin_dashboard_snapshot()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION public.get_affiliate_analytics_summary()
 RETURNS TABLE(total_links bigint, clicks_last_30_days bigint, active_links_last_30_days bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION public.get_affiliate_link_analytics(p_search text DEFAULT NULL::text, p_offset integer DEFAULT 0, p_limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, marketplace text, url text, price numeric, is_primary boolean, product_id uuid, product_name text, clicks_last_30_days bigint, last_click_at timestamp with time zone, total_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION public.get_affiliate_link_count(p_search text DEFAULT NULL::text)
 RETURNS bigint
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION public.get_brand_catalog_usage()
 RETURNS TABLE(id uuid, name text, slug text, country text, is_featured boolean, product_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
IF NOT public.is_admin() THEN
RAISE EXCEPTION 'Acesso restrito a administradores.' USING ERRCODE = '42501';
END IF;

RETURN QUERY
SELECT
b.id,
b.name,
b.slug,
b.country,
b.is_featured,
count(p.id)::bigint AS product_count
FROM public.brands b
LEFT JOIN public.products p ON p.brand_id = b.id
GROUP BY b.id, b.name, b.slug, b.country, b.is_featured
ORDER BY b.name;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_category_catalog_usage()
 RETURNS TABLE(id uuid, name text, slug text, display_order integer, icon text, product_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
IF NOT public.is_admin() THEN
RAISE EXCEPTION 'Acesso restrito a administradores.' USING ERRCODE = '42501';
END IF;

RETURN QUERY
SELECT
c.id,
c.name,
c.slug,
c.display_order,
c.icon,
count(p.id)::bigint AS product_count
FROM public.categories c
LEFT JOIN public.products p ON p.category_id = c.id
GROUP BY c.id, c.name, c.slug, c.display_order, c.icon
ORDER BY c.display_order, c.name;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_runtime_error_logs(p_query text DEFAULT NULL::text, p_source text DEFAULT NULL::text, p_page integer DEFAULT 1, p_page_size integer DEFAULT 20)
 RETURNS TABLE(id uuid, incident_code text, source text, message text, route text, created_at timestamp with time zone, total_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 20), 1), 100);
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  return query
  with filtered as (
    select rel.*
    from public.runtime_error_logs rel
    where (nullif(trim(p_query), '') is null
      or rel.incident_code ilike '%' || trim(p_query) || '%'
      or rel.message ilike '%' || trim(p_query) || '%'
      or coalesce(rel.route, '') ilike '%' || trim(p_query) || '%')
      and (nullif(trim(p_source), '') is null or rel.source = p_source)
  )
  select f.id, f.incident_code, f.source, f.message, f.route, f.created_at,
    count(*) over() as total_count
  from filtered f
  order by f.created_at desc
  offset (v_page - 1) * v_page_size
  limit v_page_size;
end;
$function$


CREATE OR REPLACE FUNCTION public.get_search_index_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator access required' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object(
  'indexed_documents',(SELECT count(*) FROM public.search_documents WHERE publish_at IS NULL OR publish_at<=now()),
  'eligible_products',(SELECT count(*) FROM public.products WHERE status='published' AND (publish_at IS NULL OR publish_at<=now())),
  'pending_documents',GREATEST((SELECT count(*) FROM public.products WHERE status='published' AND (publish_at IS NULL OR publish_at<=now()))-(SELECT count(*) FROM public.search_documents WHERE publish_at IS NULL OR publish_at<=now()),0),
  'last_indexed_at',(SELECT max(updated_at) FROM public.search_documents WHERE publish_at IS NULL OR publish_at<=now())
 );
END; $function$


CREATE OR REPLACE FUNCTION public.get_search_operations_snapshot(p_days integer DEFAULT 30, p_limit integer DEFAULT 10)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_days integer := LEAST(GREATEST(COALESCE(p_days, 30), 1), 365);
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 10), 1), 25);
  v_since timestamptz;
  v_top_queries jsonb;
  v_no_result_queries jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  v_since := now() - make_interval(days => v_days);

  SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.searches DESC, r.query), '[]'::jsonb)
  INTO v_top_queries
  FROM (
    SELECT
      query_normalized AS query,
      count(*)::integer AS searches,
      round(avg(result_count)::numeric, 1) AS average_results,
      max(searched_at) AS last_searched_at
    FROM public.search_insights
    WHERE searched_at >= v_since
    GROUP BY query_normalized
    ORDER BY count(*) DESC, query_normalized
    LIMIT v_limit
  ) r;

  SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.searches DESC, r.query), '[]'::jsonb)
  INTO v_no_result_queries
  FROM (
    SELECT
      query_normalized AS query,
      count(*)::integer AS searches,
      max(searched_at) AS last_searched_at
    FROM public.search_insights
    WHERE searched_at >= v_since AND result_count = 0
    GROUP BY query_normalized
    ORDER BY count(*) DESC, query_normalized
    LIMIT v_limit
  ) r;

  RETURN jsonb_build_object(
    'indexed_documents', (SELECT count(*) FROM public.search_documents WHERE publish_at IS NULL OR publish_at <= now()),
    'eligible_products', (SELECT count(*) FROM public.products WHERE status = 'published' AND (publish_at IS NULL OR publish_at <= now())),
    'pending_documents', GREATEST(
      (SELECT count(*) FROM public.products WHERE status = 'published' AND (publish_at IS NULL OR publish_at <= now()))
      - (SELECT count(*) FROM public.search_documents WHERE publish_at IS NULL OR publish_at <= now()),
      0
    ),
    'last_indexed_at', (SELECT max(updated_at) FROM public.search_documents WHERE publish_at IS NULL OR publish_at <= now()),
    'period_days', v_days,
    'total_searches', (SELECT count(*) FROM public.search_insights WHERE searched_at >= v_since),
    'zero_result_searches', (SELECT count(*) FROM public.search_insights WHERE searched_at >= v_since AND result_count = 0),
    'distinct_queries', (SELECT count(DISTINCT query_normalized) FROM public.search_insights WHERE searched_at >= v_since),
    'last_search_at', (SELECT max(searched_at) FROM public.search_insights WHERE searched_at >= v_since),
    'top_queries', v_top_queries,
    'no_result_queries', v_no_result_queries
  );
END;
$function$


CREATE OR REPLACE FUNCTION public.get_user_count()
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
SELECT count(*)::integer FROM auth.users;
$function$


CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
INSERT INTO public.user_profiles (user_id, display_name)
VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'auth'
AS $function$
SELECT EXISTS (
SELECT 1 FROM public.admin_users
WHERE admin_users.user_id = auth.uid()
);
$function$


CREATE OR REPLACE FUNCTION public.preserve_brand_slug_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
IF TG_OP = 'INSERT' THEN
IF EXISTS (SELECT 1 FROM public.brand_slug_history WHERE lower(slug) = lower(NEW.slug)) THEN
RAISE EXCEPTION 'Brand slug was previously used and is reserved' USING ERRCODE = '23505';
END IF;
RETURN NEW;
END IF;

IF lower(OLD.slug) IS DISTINCT FROM lower(NEW.slug) THEN
IF EXISTS (
SELECT 1 FROM public.brand_slug_history
WHERE lower(slug) = lower(NEW.slug) AND brand_id <> OLD.id
) THEN
RAISE EXCEPTION 'Brand slug was previously used and is reserved' USING ERRCODE = '23505';
END IF;

INSERT INTO public.brand_slug_history (brand_id, slug)
VALUES (OLD.id, OLD.slug)
ON CONFLICT ((lower(slug))) DO NOTHING;
END IF;
RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.preserve_category_slug_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
IF TG_OP = 'INSERT' THEN
IF EXISTS (SELECT 1 FROM public.category_slug_history WHERE lower(slug) = lower(NEW.slug)) THEN
RAISE EXCEPTION 'Category slug was previously used and is reserved' USING ERRCODE = '23505';
END IF;
RETURN NEW;
END IF;

IF lower(OLD.slug) IS DISTINCT FROM lower(NEW.slug) THEN
IF EXISTS (
SELECT 1 FROM public.category_slug_history
WHERE lower(slug) = lower(NEW.slug) AND category_id <> OLD.id
) THEN
RAISE EXCEPTION 'Category slug was previously used and is reserved' USING ERRCODE = '23505';
END IF;

INSERT INTO public.category_slug_history (category_id, slug)
VALUES (OLD.id, OLD.slug)
ON CONFLICT ((lower(slug))) DO NOTHING;
END IF;
RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.rebuild_search_index()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE v_started timestamptz := clock_timestamp(); v_count integer; v_actor uuid := auth.uid(); v_email text;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator access required' USING ERRCODE='42501'; END IF;
  DELETE FROM public.search_documents;
  INSERT INTO public.search_documents (entity_type, entity_id, title, subtitle, short_description, search_text, keywords, slug, status, publish_at, image_url, rating, review_count, is_new, updated_at)
  SELECT 'product', p.id, p.name, b.name, p.short_description, concat_ws(' ',p.short_description,p.description,b.name,c.name,p.usability,p.tips), COALESCE(p.tags,'{}'), p.slug, 'published', p.publish_at, p.image_url, COALESCE(p.rating,0), COALESCE(p.review_count,0), COALESCE(p.is_new,false), now()
  FROM public.products p LEFT JOIN public.brands b ON b.id=p.brand_id LEFT JOIN public.categories c ON c.id=p.category_id
  WHERE p.status='published';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  SELECT email INTO v_email FROM auth.users WHERE id=v_actor;
  INSERT INTO public.admin_audit_logs(actor_id,actor_email,entity_type,entity_label,action,changed_fields,current_data)
  VALUES(v_actor,v_email,'search_index','Índice de busca','rebuild',ARRAY['documents'],jsonb_build_object('documents',v_count));
  RETURN jsonb_build_object('documents',v_count,'completed_at',now(),'duration_ms',round(extract(epoch from clock_timestamp()-v_started)*1000));
END; $function$


CREATE OR REPLACE FUNCTION public.record_search_insight(p_query text, p_result_count integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_query text;
  v_result_count integer;
BEGIN
  v_query := lower(left(btrim(regexp_replace(COALESCE(p_query, ''), '\s+', ' ', 'g')), 80));
  v_result_count := LEAST(GREATEST(COALESCE(p_result_count, 0), 0), 48);

  IF char_length(v_query) < 2 THEN
    RETURN false;
  END IF;

  INSERT INTO public.search_insights (query_normalized, result_count)
  VALUES (v_query, v_result_count);

  RETURN true;
END;
$function$


CREATE OR REPLACE FUNCTION public.refresh_search_documents_for_taxonomy()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_product record;
BEGIN
  FOR v_product IN
    SELECT p.* FROM public.products p
    WHERE (TG_TABLE_NAME = 'brands' AND p.brand_id = COALESCE(NEW.id, OLD.id))
       OR (TG_TABLE_NAME = 'categories' AND p.category_id = COALESCE(NEW.id, OLD.id))
  LOOP
    PERFORM public.sync_product_search_document_from_id(v_product.id);
  END LOOP;
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$function$


CREATE OR REPLACE FUNCTION public.report_runtime_error(p_source text, p_message text, p_stack text DEFAULT NULL::text, p_component_stack text DEFAULT NULL::text, p_route text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
v_incident_code text;
begin
if p_source not in ('react_boundary', 'window_error', 'unhandled_rejection') then
raise exception 'invalid_error_source';
end if;
if nullif(trim(p_message), '') is null then
raise exception 'error_message_required';
end if;

insert into public.runtime_error_logs (actor_id, source, message, stack, component_stack, route)
values (
auth.uid(),
p_source,
left(trim(p_message), 1000),
left(p_stack, 8000),
left(p_component_stack, 8000),
left(p_route, 500)
)
returning incident_code into v_incident_code;

return v_incident_code;
end;
$function$


CREATE OR REPLACE FUNCTION public.resolve_public_brand_slug(p_slug text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
SELECT b.slug
FROM public.brand_slug_history h
JOIN public.brands b ON b.id = h.brand_id
WHERE lower(h.slug) = lower(btrim(p_slug))
LIMIT 1;
$function$


CREATE OR REPLACE FUNCTION public.resolve_public_category_slug(p_slug text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
SELECT c.slug
FROM public.category_slug_history h
JOIN public.categories c ON c.id = h.category_id
WHERE lower(h.slug) = lower(btrim(p_slug))
LIMIT 1;
$function$


CREATE OR REPLACE FUNCTION public.resolve_public_product_slug(p_slug text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
SELECT p.slug
FROM public.product_slug_history h
JOIN public.products p ON p.id = h.product_id
WHERE lower(h.slug) = lower(btrim(p_slug))
AND p.status = 'published'
AND (p.publish_at IS NULL OR p.publish_at <= now())
LIMIT 1;
$function$


CREATE OR REPLACE FUNCTION public.save_brand(p_brand_id uuid, p_brand jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_id uuid;
v_name text := btrim(COALESCE(p_brand->>'name', ''));
v_slug text := lower(btrim(COALESCE(p_brand->>'slug', '')));
BEGIN
IF NOT public.is_admin() THEN
RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
END IF;
IF v_name = '' THEN
RAISE EXCEPTION 'Brand name is required' USING ERRCODE = '22023';
END IF;
IF v_slug = '' THEN
RAISE EXCEPTION 'Brand slug is required' USING ERRCODE = '22023';
END IF;

IF p_brand_id IS NULL THEN
INSERT INTO public.brands (name, slug, description, country, logo_url, is_featured)
VALUES (
v_name,
v_slug,
NULLIF(btrim(p_brand->>'description'), ''),
NULLIF(btrim(p_brand->>'country'), ''),
NULLIF(btrim(p_brand->>'logo_url'), ''),
COALESCE((p_brand->>'is_featured')::boolean, false)
)
RETURNING id INTO v_id;
ELSE
UPDATE public.brands
SET name = v_name,
slug = v_slug,
description = NULLIF(btrim(p_brand->>'description'), ''),
country = NULLIF(btrim(p_brand->>'country'), ''),
logo_url = NULLIF(btrim(p_brand->>'logo_url'), ''),
is_featured = COALESCE((p_brand->>'is_featured')::boolean, false)
WHERE id = p_brand_id
RETURNING id INTO v_id;

IF v_id IS NULL THEN
RAISE EXCEPTION 'Brand not found' USING ERRCODE = 'P0002';
END IF;
END IF;

RETURN v_id;
END;
$function$


CREATE OR REPLACE FUNCTION public.save_category(p_category_id uuid, p_category jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_id uuid;
v_name text := btrim(COALESCE(p_category->>'name', ''));
v_slug text := lower(btrim(COALESCE(p_category->>'slug', '')));
v_display_order integer;
BEGIN
IF NOT public.is_admin() THEN
RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
END IF;
IF v_name = '' THEN
RAISE EXCEPTION 'Category name is required' USING ERRCODE = '22023';
END IF;
IF v_slug = '' THEN
RAISE EXCEPTION 'Category slug is required' USING ERRCODE = '22023';
END IF;

BEGIN
v_display_order := COALESCE((p_category->>'display_order')::integer, 0);
EXCEPTION WHEN invalid_text_representation THEN
RAISE EXCEPTION 'Category display order must be an integer' USING ERRCODE = '22023';
END;

IF v_display_order < 0 THEN
RAISE EXCEPTION 'Category display order cannot be negative' USING ERRCODE = '22023';
END IF;

IF p_category_id IS NULL THEN
INSERT INTO public.categories (name, slug, description, icon, cover_image, display_order)
VALUES (
v_name,
v_slug,
NULLIF(btrim(p_category->>'description'), ''),
NULLIF(btrim(p_category->>'icon'), ''),
NULLIF(btrim(p_category->>'cover_image'), ''),
v_display_order
)
RETURNING id INTO v_id;
ELSE
UPDATE public.categories
SET name = v_name,
slug = v_slug,
description = NULLIF(btrim(p_category->>'description'), ''),
icon = NULLIF(btrim(p_category->>'icon'), ''),
cover_image = NULLIF(btrim(p_category->>'cover_image'), ''),
display_order = v_display_order
WHERE id = p_category_id
RETURNING id INTO v_id;

IF v_id IS NULL THEN
RAISE EXCEPTION 'Category not found' USING ERRCODE = 'P0002';
END IF;
END IF;

RETURN v_id;
END;
$function$


CREATE OR REPLACE FUNCTION public.save_product_with_affiliate_links(p_product_id uuid, p_product jsonb, p_links jsonb DEFAULT '[]'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
v_product_id uuid; v_link jsonb; v_primary_count integer; v_gallery jsonb;
v_status public.product_status; v_publish_at timestamptz; v_published_at timestamptz;
v_previous_slug text; v_new_slug text;
BEGIN
IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501'; END IF;
IF NULLIF(btrim(p_product->>'name'), '') IS NULL THEN RAISE EXCEPTION 'Product name is required' USING ERRCODE = '22023'; END IF;
IF NULLIF(btrim(p_product->>'slug'), '') IS NULL THEN RAISE EXCEPTION 'Product slug is required' USING ERRCODE = '22023'; END IF;
IF jsonb_typeof(COALESCE(p_links, '[]'::jsonb)) <> 'array' THEN RAISE EXCEPTION 'Affiliate links must be an array' USING ERRCODE = '22023'; END IF;
v_new_slug := btrim(p_product->>'slug');
v_gallery := COALESCE(p_product->'gallery_images', '[]'::jsonb);
IF jsonb_typeof(v_gallery) <> 'array' OR jsonb_array_length(v_gallery) > 8 THEN RAISE EXCEPTION 'Gallery must be an array with at most 8 images' USING ERRCODE = '22023'; END IF;
BEGIN v_status := COALESCE(NULLIF(p_product->>'status', ''), 'draft')::public.product_status;
EXCEPTION WHEN invalid_text_representation THEN RAISE EXCEPTION 'Invalid editorial status' USING ERRCODE = '22023'; END;
v_publish_at := NULLIF(p_product->>'publish_at', '')::timestamptz;
v_published_at := NULLIF(p_product->>'published_at', '')::timestamptz;
IF v_status = 'published' THEN v_published_at := COALESCE(v_published_at, now()); ELSE v_published_at := NULL; END IF;
SELECT count(*) INTO v_primary_count FROM jsonb_array_elements(COALESCE(p_links, '[]'::jsonb)) item WHERE COALESCE((item->>'is_primary')::boolean, false);
IF v_primary_count > 1 THEN RAISE EXCEPTION 'Only one affiliate link can be primary' USING ERRCODE = '22023'; END IF;

IF p_product_id IS NULL THEN
IF EXISTS (SELECT 1 FROM public.product_slug_history WHERE lower(slug) = lower(v_new_slug)) THEN
RAISE EXCEPTION 'Product slug was previously used and is reserved' USING ERRCODE = '23505';
END IF;
INSERT INTO public.products (name,slug,brand_id,category_id,short_description,description,usability,tips,image_url,gallery_images,rating,review_count,is_featured,is_new,tags,specifications,status,publish_at,published_at)
VALUES (btrim(p_product->>'name'),v_new_slug,NULLIF(p_product->>'brand_id','')::uuid,NULLIF(p_product->>'category_id','')::uuid,NULLIF(btrim(p_product->>'short_description'),''),NULLIF(btrim(p_product->>'description'),''),NULLIF(btrim(p_product->>'usability'),''),NULLIF(btrim(p_product->>'tips'),''),NULLIF(btrim(p_product->>'image_url'),''),v_gallery,COALESCE((p_product->>'rating')::numeric,0),COALESCE((p_product->>'review_count')::integer,0),COALESCE((p_product->>'is_featured')::boolean,false),COALESCE((p_product->>'is_new')::boolean,false),COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_product->'tags')),'{}'::text[]),COALESCE(p_product->'specifications','[]'::jsonb),v_status,v_publish_at,v_published_at)
RETURNING id INTO v_product_id;
ELSE
SELECT slug INTO v_previous_slug FROM public.products WHERE id = p_product_id FOR UPDATE;
IF v_previous_slug IS NULL THEN RAISE EXCEPTION 'Product not found' USING ERRCODE = 'P0002'; END IF;

IF lower(v_previous_slug) IS DISTINCT FROM lower(v_new_slug)
AND EXISTS (SELECT 1 FROM public.product_slug_history WHERE lower(slug) = lower(v_new_slug) AND product_id <> p_product_id) THEN
RAISE EXCEPTION 'Product slug was previously used and is reserved' USING ERRCODE = '23505';
END IF;

UPDATE public.products SET name=btrim(p_product->>'name'),slug=v_new_slug,brand_id=NULLIF(p_product->>'brand_id','')::uuid,category_id=NULLIF(p_product->>'category_id','')::uuid,short_description=NULLIF(btrim(p_product->>'short_description'),''),description=NULLIF(btrim(p_product->>'description'),''),usability=NULLIF(btrim(p_product->>'usability'),''),tips=NULLIF(btrim(p_product->>'tips'),''),image_url=NULLIF(btrim(p_product->>'image_url'),''),gallery_images=v_gallery,rating=COALESCE((p_product->>'rating')::numeric,0),review_count=COALESCE((p_product->>'review_count')::integer,0),is_featured=COALESCE((p_product->>'is_featured')::boolean,false),is_new=COALESCE((p_product->>'is_new')::boolean,false),tags=COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_product->'tags')),'{}'::text[]),specifications=COALESCE(p_product->'specifications','[]'::jsonb),status=v_status,publish_at=v_publish_at,published_at=v_published_at
WHERE id=p_product_id RETURNING id INTO v_product_id;

IF lower(v_previous_slug) IS DISTINCT FROM lower(v_new_slug) THEN
INSERT INTO public.product_slug_history(product_id, slug)
VALUES (v_product_id, v_previous_slug)
ON CONFLICT ((lower(slug))) DO NOTHING;
END IF;
END IF;

DELETE FROM public.affiliate_links WHERE product_id=v_product_id;
FOR v_link IN SELECT value FROM jsonb_array_elements(COALESCE(p_links,'[]'::jsonb)) LOOP
IF NULLIF(btrim(v_link->>'marketplace'),'') IS NULL OR NULLIF(btrim(v_link->>'url'),'') IS NULL THEN RAISE EXCEPTION 'Marketplace and URL are required for every affiliate link' USING ERRCODE = '22023'; END IF;
INSERT INTO public.affiliate_links(product_id,marketplace,url,price,is_primary,display_order) VALUES(v_product_id,btrim(v_link->>'marketplace'),btrim(v_link->>'url'),NULLIF(v_link->>'price','')::numeric,COALESCE((v_link->>'is_primary')::boolean,false),COALESCE((v_link->>'display_order')::integer,0));
END LOOP;
RETURN v_product_id;
END;
$function$


CREATE OR REPLACE FUNCTION public.search_catalog(p_query text, p_limit integer DEFAULT 48)
 RETURNS TABLE(id uuid, name text, slug text, short_description text, image_url text, rating numeric, review_count integer, is_new boolean, brand_name text, score real)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'extensions'
AS $function$
WITH input AS (
SELECT left(btrim(regexp_replace(COALESCE(p_query,''), '\s+', ' ', 'g')), 80) q,
websearch_to_tsquery('portuguese', left(btrim(COALESCE(p_query,'')),80)) tsq
)
SELECT d.entity_id, d.title, d.slug,
d.short_description, d.image_url, d.rating, d.review_count, d.is_new, d.subtitle,
(ts_rank_cd(to_tsvector('portuguese', d.title || ' ' || coalesce(d.subtitle,'') || ' ' || d.search_text || ' ' || array_to_string(d.keywords,' ')), input.tsq) * 100
+ CASE WHEN lower(d.title)=lower(input.q) THEN 120 WHEN lower(d.title) LIKE lower(input.q)||'%' THEN 80 WHEN d.title ILIKE '%'||input.q||'%' THEN 50 ELSE 0 END
+ similarity(d.title, input.q) * 20)::real AS score
FROM public.search_documents d CROSS JOIN input
WHERE input.q <> '' AND d.status='published' AND (d.publish_at IS NULL OR d.publish_at <= now())
AND (to_tsvector('portuguese', d.title || ' ' || coalesce(d.subtitle,'') || ' ' || d.search_text || ' ' || array_to_string(d.keywords,' ')) @@ input.tsq
OR d.title ILIKE '%'||input.q||'%' OR d.subtitle ILIKE '%'||input.q||'%')
ORDER BY score DESC, d.title
LIMIT LEAST(GREATEST(COALESCE(p_limit,48),1),48);
$function$


CREATE OR REPLACE FUNCTION public.set_product_published_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published' OR NEW.published_at IS NULL) THEN
NEW.published_at := COALESCE(NEW.published_at, now());
ELSIF NEW.status <> 'published' THEN
NEW.published_at := NULL;
END IF;
RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.suggest_catalog_search(p_prefix text, p_limit integer DEFAULT 6)
 RETURNS TABLE(suggestion text, frequency bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'extensions'
AS $function$
WITH terms AS (
SELECT unnest(regexp_split_to_array(lower(unaccent(title || ' ' || coalesce(subtitle,'') || ' ' || array_to_string(keywords,' '))), '[^[:alnum:]]+')) term
FROM public.search_documents WHERE status='published' AND (publish_at IS NULL OR publish_at <= now())
), input AS (SELECT lower(unaccent(left(btrim(COALESCE(p_prefix,'')),40))) prefix)
SELECT initcap(term), count(*) FROM terms, input
WHERE length(input.prefix) >= 2 AND length(term) >= 3 AND term LIKE input.prefix || '%'
GROUP BY term ORDER BY count(*) DESC, term LIMIT LEAST(GREATEST(COALESCE(p_limit,6),1),10);
$function$


CREATE OR REPLACE FUNCTION public.sync_product_search_document()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_brand text;
  v_category text;
  v_public boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.search_documents WHERE entity_type = 'product' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  v_public := NEW.status = 'published';
  IF NOT v_public THEN
    DELETE FROM public.search_documents WHERE entity_type = 'product' AND entity_id = NEW.id;
    RETURN NEW;
  END IF;

  SELECT name INTO v_brand FROM public.brands WHERE id = NEW.brand_id;
  SELECT name INTO v_category FROM public.categories WHERE id = NEW.category_id;

  INSERT INTO public.search_documents (
    entity_type, entity_id, title, subtitle, short_description, search_text, keywords, slug, status, publish_at,
    image_url, rating, review_count, is_new, updated_at
  ) VALUES (
    'product', NEW.id, NEW.name, v_brand, NEW.short_description,
    concat_ws(' ', NEW.short_description, NEW.description, v_brand, v_category, NEW.usability, NEW.tips),
    COALESCE(NEW.tags, '{}'), NEW.slug, 'published', NEW.publish_at, NEW.image_url,
    COALESCE(NEW.rating, 0), COALESCE(NEW.review_count, 0), COALESCE(NEW.is_new, false), now()
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    short_description = EXCLUDED.short_description,
    search_text = EXCLUDED.search_text,
    keywords = EXCLUDED.keywords,
    slug = EXCLUDED.slug,
    status = EXCLUDED.status,
    publish_at = EXCLUDED.publish_at,
    image_url = EXCLUDED.image_url,
    rating = EXCLUDED.rating,
    review_count = EXCLUDED.review_count,
    is_new = EXCLUDED.is_new,
    updated_at = now();
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.sync_product_search_document_from_id(p_product_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  p public.products%ROWTYPE;
  v_brand text;
  v_category text;
BEGIN
  SELECT * INTO p FROM public.products WHERE id = p_product_id;
  IF NOT FOUND OR p.status <> 'published' THEN
    DELETE FROM public.search_documents WHERE entity_type = 'product' AND entity_id = p_product_id;
    RETURN;
  END IF;
  SELECT name INTO v_brand FROM public.brands WHERE id = p.brand_id;
  SELECT name INTO v_category FROM public.categories WHERE id = p.category_id;
  INSERT INTO public.search_documents (entity_type, entity_id, title, subtitle, short_description, search_text, keywords, slug, status, publish_at, image_url, rating, review_count, is_new, updated_at)
  VALUES ('product', p.id, p.name, v_brand, p.short_description, concat_ws(' ', p.short_description, p.description, v_brand, v_category, p.usability, p.tips), COALESCE(p.tags, '{}'), p.slug, 'published', p.publish_at, p.image_url, COALESCE(p.rating,0), COALESCE(p.review_count,0), COALESCE(p.is_new,false), now())
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET title=EXCLUDED.title, subtitle=EXCLUDED.subtitle, short_description=EXCLUDED.short_description, search_text=EXCLUDED.search_text, keywords=EXCLUDED.keywords, slug=EXCLUDED.slug, status='published', publish_at=EXCLUDED.publish_at, image_url=EXCLUDED.image_url, rating=EXCLUDED.rating, review_count=EXCLUDED.review_count, is_new=EXCLUDED.is_new, updated_at=now();
END;
$function$


CREATE OR REPLACE FUNCTION public.track_affiliate_click(p_affiliate_link_id uuid, p_page_path text, p_referrer_domain text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
v_product_id uuid;
BEGIN
SELECT affiliate_links.product_id
INTO v_product_id
FROM public.affiliate_links
WHERE affiliate_links.id = p_affiliate_link_id;

IF v_product_id IS NULL THEN
RETURN;
END IF;

INSERT INTO public.affiliate_clicks (
affiliate_link_id,
product_id,
page_path,
referrer_domain
) VALUES (
p_affiliate_link_id,
v_product_id,
LEFT(COALESCE(NULLIF(TRIM(p_page_path), ''), '/'), 500),
NULLIF(LEFT(TRIM(COALESCE(p_referrer_domain, '')), 255), '')
);
END;
$function$


CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.validate_admin_session()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$


