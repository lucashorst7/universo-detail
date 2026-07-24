/*
  PR-019 — Media Storage Hygiene
  Deletes products transactionally and returns their media URLs so the authenticated
  admin client can remove only files that belong to the managed product-images bucket.
*/

CREATE OR REPLACE FUNCTION public.delete_product_safely(p_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.delete_product_safely(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_product_safely(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_product_safely(uuid) TO authenticated;