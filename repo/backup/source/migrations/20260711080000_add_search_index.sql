/* PR-030 — Dedicated catalog search index */
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE TABLE IF NOT EXISTS public.search_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('product')),
  entity_id uuid NOT NULL,
  title text NOT NULL,
  subtitle text,
  short_description text,
  search_text text NOT NULL DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  slug text NOT NULL,
  status text NOT NULL DEFAULT 'published',
  publish_at timestamptz,
  image_url text,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  is_new boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT search_documents_entity_unique UNIQUE (entity_type, entity_id),
  CONSTRAINT search_documents_slug_unique UNIQUE (entity_type, slug)
);

CREATE INDEX IF NOT EXISTS search_documents_portuguese_fts_idx
  ON public.search_documents USING gin (
    to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(search_text, '') || ' ' || array_to_string(keywords, ' '))
  );
CREATE INDEX IF NOT EXISTS search_documents_english_fts_idx
  ON public.search_documents USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(search_text, '') || ' ' || array_to_string(keywords, ' '))
  );
CREATE INDEX IF NOT EXISTS search_documents_updated_at_idx ON public.search_documents (updated_at DESC);
CREATE INDEX IF NOT EXISTS search_documents_title_trgm_idx ON public.search_documents USING gin (title gin_trgm_ops);

ALTER TABLE public.search_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read search documents" ON public.search_documents;
CREATE POLICY "Public can read search documents" ON public.search_documents
  FOR SELECT TO anon, authenticated USING (status = 'published' AND (publish_at IS NULL OR publish_at <= now()));
REVOKE INSERT, UPDATE, DELETE ON public.search_documents FROM anon, authenticated;
GRANT SELECT ON public.search_documents TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_product_search_document()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

DROP TRIGGER IF EXISTS sync_product_search_document_trigger ON public.products;
CREATE TRIGGER sync_product_search_document_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_product_search_document();

CREATE OR REPLACE FUNCTION public.refresh_search_documents_for_taxonomy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.sync_product_search_document_from_id(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

DROP TRIGGER IF EXISTS refresh_brand_search_documents ON public.brands;
CREATE TRIGGER refresh_brand_search_documents AFTER UPDATE OF name ON public.brands
FOR EACH ROW WHEN (OLD.name IS DISTINCT FROM NEW.name) EXECUTE FUNCTION public.refresh_search_documents_for_taxonomy();
DROP TRIGGER IF EXISTS refresh_category_search_documents ON public.categories;
CREATE TRIGGER refresh_category_search_documents AFTER UPDATE OF name ON public.categories
FOR EACH ROW WHEN (OLD.name IS DISTINCT FROM NEW.name) EXECUTE FUNCTION public.refresh_search_documents_for_taxonomy();

CREATE OR REPLACE FUNCTION public.search_catalog(p_query text, p_limit integer DEFAULT 48)
RETURNS TABLE (
  id uuid, name text, slug text, short_description text, image_url text,
  rating numeric, review_count integer, is_new boolean, brand_name text, score real
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH input AS (
    SELECT left(btrim(regexp_replace(COALESCE(p_query,''), '\s+', ' ', 'g')), 80) q,
           websearch_to_tsquery('portuguese', left(btrim(COALESCE(p_query,'')),80)) tsq
  )
  SELECT d.entity_id, d.title, d.slug,
         d.short_description,
         d.image_url, d.rating, d.review_count, d.is_new, d.subtitle,
         (ts_rank_cd(to_tsvector('portuguese', d.title || ' ' || coalesce(d.subtitle,'') || ' ' || d.search_text || ' ' || array_to_string(d.keywords,' ')), input.tsq) * 100
          + CASE WHEN lower(d.title)=lower(input.q) THEN 120 WHEN lower(d.title) LIKE lower(input.q)||'%' THEN 80 WHEN d.title ILIKE '%'||input.q||'%' THEN 50 ELSE 0 END
          + similarity(d.title, input.q) * 20)::real AS score
  FROM public.search_documents d CROSS JOIN input
  WHERE input.q <> '' AND d.status='published' AND (d.publish_at IS NULL OR d.publish_at <= now())
    AND (to_tsvector('portuguese', d.title || ' ' || coalesce(d.subtitle,'') || ' ' || d.search_text || ' ' || array_to_string(d.keywords,' ')) @@ input.tsq
         OR d.title ILIKE '%'||input.q||'%' OR d.subtitle ILIKE '%'||input.q||'%')
  ORDER BY score DESC, d.title
  LIMIT LEAST(GREATEST(COALESCE(p_limit,48),1),48);
$$;
REVOKE ALL ON FUNCTION public.search_catalog(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_catalog(text, integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.suggest_catalog_search(p_prefix text, p_limit integer DEFAULT 6)
RETURNS TABLE (suggestion text, frequency bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH terms AS (
    SELECT unnest(regexp_split_to_array(lower(unaccent(title || ' ' || coalesce(subtitle,'') || ' ' || array_to_string(keywords,' '))), '[^[:alnum:]]+')) term
    FROM public.search_documents WHERE status='published' AND (publish_at IS NULL OR publish_at <= now())
  ), input AS (SELECT lower(unaccent(left(btrim(COALESCE(p_prefix,'')),40))) prefix)
  SELECT initcap(term), count(*) FROM terms, input
  WHERE length(input.prefix) >= 2 AND length(term) >= 3 AND term LIKE input.prefix || '%'
  GROUP BY term ORDER BY count(*) DESC, term LIMIT LEAST(GREATEST(COALESCE(p_limit,6),1),10);
$$;
REVOKE ALL ON FUNCTION public.suggest_catalog_search(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.suggest_catalog_search(text, integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.rebuild_search_index()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
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
END; $$;
REVOKE ALL ON FUNCTION public.rebuild_search_index() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rebuild_search_index() TO authenticated;

ALTER TABLE public.admin_audit_logs DROP CONSTRAINT IF EXISTS admin_audit_logs_entity_type_check;
ALTER TABLE public.admin_audit_logs ADD CONSTRAINT admin_audit_logs_entity_type_check CHECK (entity_type IN ('product','brand','category','affiliate_link','search_index'));
ALTER TABLE public.admin_audit_logs DROP CONSTRAINT IF EXISTS admin_audit_logs_action_check;
ALTER TABLE public.admin_audit_logs ADD CONSTRAINT admin_audit_logs_action_check CHECK (action IN ('create','update','delete','rebuild'));

CREATE OR REPLACE FUNCTION public.get_search_index_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator access required' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object(
  'indexed_documents',(SELECT count(*) FROM public.search_documents WHERE publish_at IS NULL OR publish_at<=now()),
  'eligible_products',(SELECT count(*) FROM public.products WHERE status='published' AND (publish_at IS NULL OR publish_at<=now())),
  'pending_documents',GREATEST((SELECT count(*) FROM public.products WHERE status='published' AND (publish_at IS NULL OR publish_at<=now()))-(SELECT count(*) FROM public.search_documents WHERE publish_at IS NULL OR publish_at<=now()),0),
  'last_indexed_at',(SELECT max(updated_at) FROM public.search_documents WHERE publish_at IS NULL OR publish_at<=now())
 );
END; $$;
REVOKE ALL ON FUNCTION public.get_search_index_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_search_index_stats() TO authenticated;

SELECT public.sync_product_search_document_from_id(id) FROM public.products;
