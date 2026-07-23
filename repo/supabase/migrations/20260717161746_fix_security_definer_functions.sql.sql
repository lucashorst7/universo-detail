/*
# Fix SECURITY DEFINER functions — switch to SECURITY INVOKER where safe

## Problem
Four functions were SECURITY DEFINER and executable by anon/authenticated,
flagged as a privilege escalation risk. Three only need RLS-governed table
access; one needs an additional INSERT policy to work as INVOKER.

## Changes
1. search_catalog → SECURITY INVOKER (reads search_documents, anon SELECT policy exists)
2. suggest_catalog_search → SECURITY INVOKER (same)
3. report_runtime_error → SECURITY INVOKER + grant INSERT on runtime_error_logs
   to anon/authenticated + add authenticated INSERT policy
4. track_affiliate_click → SECURITY INVOKER + add INSERT policy on affiliate_clicks
   for anon/authenticated (function already validates affiliate_link_id exists)
*/

-- 1. search_catalog: switch to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.search_catalog(p_query text, p_limit integer DEFAULT 48)
  RETURNS TABLE(id uuid, name text, slug text, short_description text, image_url text, rating numeric, review_count integer, is_new boolean, brand_name text, score real)
  LANGUAGE sql
  STABLE SECURITY INVOKER
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
$function$;

-- 2. suggest_catalog_search: switch to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.suggest_catalog_search(p_prefix text, p_limit integer DEFAULT 6)
  RETURNS TABLE(suggestion text, frequency bigint)
  LANGUAGE sql
  STABLE SECURITY INVOKER
  SET search_path TO 'public', 'extensions'
AS $function$
  WITH terms AS (
    SELECT unnest(regexp_split_to_array(lower(unaccent(title || ' ' || coalesce(subtitle,'') || ' ' || array_to_string(keywords,' '))), '[^[:alnum:]]+')) term
    FROM public.search_documents WHERE status='published' AND (publish_at IS NULL OR publish_at <= now())
  ), input AS (SELECT lower(unaccent(left(btrim(COALESCE(p_prefix,'')),40))) prefix)
  SELECT initcap(term), count(*) FROM terms, input
  WHERE length(input.prefix) >= 2 AND length(term) >= 3 AND term LIKE input.prefix || '%'
  GROUP BY term ORDER BY count(*) DESC, term LIMIT LEAST(GREATEST(COALESCE(p_limit,6),1),10);
$function$;

-- 3. report_runtime_error: switch to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.report_runtime_error(p_source text, p_message text, p_stack text DEFAULT NULL, p_component_stack text DEFAULT NULL, p_route text DEFAULT NULL)
  RETURNS text
  LANGUAGE plpgsql
  SECURITY INVOKER
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
$function$;

-- Grant INSERT on runtime_error_logs so INVOKER can write
GRANT INSERT ON runtime_error_logs TO anon;
GRANT INSERT ON runtime_error_logs TO authenticated;

-- Add authenticated INSERT policy (anon already has one)
CREATE POLICY "auth_insert_runtime_error_logs" ON runtime_error_logs FOR INSERT
  TO authenticated
  WITH CHECK (source IS NOT NULL AND message IS NOT NULL AND (actor_id IS NULL OR actor_id = auth.uid()));

-- 4. track_affiliate_click: switch to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.track_affiliate_click(p_affiliate_link_id uuid, p_page_path text, p_referrer_domain text DEFAULT NULL)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY INVOKER
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
$function$;

-- Add INSERT policy on affiliate_clicks so INVOKER can write
CREATE POLICY "anon_insert_affiliate_clicks" ON affiliate_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
