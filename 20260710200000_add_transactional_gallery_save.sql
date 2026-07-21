/*
# Transactional product gallery save

Extends the product save RPC so the public gallery can be managed from the admin
form and persisted in the same transaction as the product and affiliate links.
*/

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
  v_product_id uuid;
  v_link jsonb;
  v_primary_count integer;
  v_gallery jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  IF NULLIF(btrim(p_product->>'name'), '') IS NULL THEN
    RAISE EXCEPTION 'Product name is required' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(btrim(p_product->>'slug'), '') IS NULL THEN
    RAISE EXCEPTION 'Product slug is required' USING ERRCODE = '22023';
  END IF;

  IF jsonb_typeof(COALESCE(p_links, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'Affiliate links must be an array' USING ERRCODE = '22023';
  END IF;

  v_gallery := COALESCE(p_product->'gallery_images', '[]'::jsonb);
  IF jsonb_typeof(v_gallery) <> 'array' THEN
    RAISE EXCEPTION 'Gallery images must be an array' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(v_gallery) > 8 THEN
    RAISE EXCEPTION 'Gallery accepts at most 8 images' USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO v_primary_count
  FROM jsonb_array_elements(COALESCE(p_links, '[]'::jsonb)) AS item
  WHERE COALESCE((item->>'is_primary')::boolean, false);

  IF v_primary_count > 1 THEN
    RAISE EXCEPTION 'Only one affiliate link can be primary' USING ERRCODE = '22023';
  END IF;

  IF p_product_id IS NULL THEN
    INSERT INTO public.products (
      name, slug, brand_id, category_id, short_description, description,
      usability, tips, image_url, gallery_images, rating, review_count,
      is_featured, is_new, tags, specifications
    ) VALUES (
      btrim(p_product->>'name'),
      btrim(p_product->>'slug'),
      NULLIF(p_product->>'brand_id', '')::uuid,
      NULLIF(p_product->>'category_id', '')::uuid,
      NULLIF(btrim(p_product->>'short_description'), ''),
      NULLIF(btrim(p_product->>'description'), ''),
      NULLIF(btrim(p_product->>'usability'), ''),
      NULLIF(btrim(p_product->>'tips'), ''),
      NULLIF(btrim(p_product->>'image_url'), ''),
      v_gallery,
      COALESCE((p_product->>'rating')::numeric, 0),
      COALESCE((p_product->>'review_count')::integer, 0),
      COALESCE((p_product->>'is_featured')::boolean, false),
      COALESCE((p_product->>'is_new')::boolean, false),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_product->'tags')), '{}'::text[]),
      COALESCE(p_product->'specifications', '[]'::jsonb)
    ) RETURNING id INTO v_product_id;
  ELSE
    UPDATE public.products SET
      name = btrim(p_product->>'name'),
      slug = btrim(p_product->>'slug'),
      brand_id = NULLIF(p_product->>'brand_id', '')::uuid,
      category_id = NULLIF(p_product->>'category_id', '')::uuid,
      short_description = NULLIF(btrim(p_product->>'short_description'), ''),
      description = NULLIF(btrim(p_product->>'description'), ''),
      usability = NULLIF(btrim(p_product->>'usability'), ''),
      tips = NULLIF(btrim(p_product->>'tips'), ''),
      image_url = NULLIF(btrim(p_product->>'image_url'), ''),
      gallery_images = v_gallery,
      rating = COALESCE((p_product->>'rating')::numeric, 0),
      review_count = COALESCE((p_product->>'review_count')::integer, 0),
      is_featured = COALESCE((p_product->>'is_featured')::boolean, false),
      is_new = COALESCE((p_product->>'is_new')::boolean, false),
      tags = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_product->'tags')), '{}'::text[]),
      specifications = COALESCE(p_product->'specifications', '[]'::jsonb)
    WHERE id = p_product_id
    RETURNING id INTO v_product_id;

    IF v_product_id IS NULL THEN
      RAISE EXCEPTION 'Product not found' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  DELETE FROM public.affiliate_links WHERE product_id = v_product_id;

  FOR v_link IN SELECT value FROM jsonb_array_elements(COALESCE(p_links, '[]'::jsonb))
  LOOP
    IF NULLIF(btrim(v_link->>'marketplace'), '') IS NULL OR NULLIF(btrim(v_link->>'url'), '') IS NULL THEN
      RAISE EXCEPTION 'Marketplace and URL are required for every affiliate link' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.affiliate_links (product_id, marketplace, url, price, is_primary, display_order)
    VALUES (
      v_product_id,
      btrim(v_link->>'marketplace'),
      btrim(v_link->>'url'),
      NULLIF(v_link->>'price', '')::numeric,
      COALESCE((v_link->>'is_primary')::boolean, false),
      COALESCE((v_link->>'display_order')::integer, 0)
    );
  END LOOP;

  RETURN v_product_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_product_with_affiliate_links(uuid, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_product_with_affiliate_links(uuid, jsonb, jsonb) TO authenticated;
