/* PR-021 Product URL Continuity */
CREATE TABLE IF NOT EXISTS public.product_slug_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_slug_history_slug_not_blank CHECK (btrim(slug) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS product_slug_history_slug_unique_idx
  ON public.product_slug_history (lower(slug));
CREATE INDEX IF NOT EXISTS product_slug_history_product_idx
  ON public.product_slug_history (product_id, created_at DESC);

ALTER TABLE public.product_slug_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.product_slug_history FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.resolve_public_product_slug(p_slug text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.slug
  FROM public.product_slug_history h
  JOIN public.products p ON p.id = h.product_id
  WHERE lower(h.slug) = lower(btrim(p_slug))
    AND p.status = 'published'
    AND (p.publish_at IS NULL OR p.publish_at <= now())
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.resolve_public_product_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_public_product_slug(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_product_with_affiliate_links(
  p_product_id uuid,
  p_product jsonb,
  p_links jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.save_product_with_affiliate_links(uuid,jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_product_with_affiliate_links(uuid,jsonb,jsonb) TO authenticated;
