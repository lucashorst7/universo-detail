/* PR-023 Taxonomy Form Reliability */
CREATE OR REPLACE FUNCTION public.save_brand(p_brand_id uuid, p_brand jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.save_category(p_category_id uuid, p_category jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.save_brand(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_category(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_brand(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_category(uuid, jsonb) TO authenticated;