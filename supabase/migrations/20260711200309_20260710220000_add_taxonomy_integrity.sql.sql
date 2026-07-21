/*
# Taxonomy Integrity

Protects brands and categories that are still referenced by products and exposes
usage counts to the administrative catalog without loading the full product table.
*/

CREATE OR REPLACE FUNCTION public.get_brand_catalog_usage()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  country text,
  is_featured boolean,
  product_count bigint
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
$$;

CREATE OR REPLACE FUNCTION public.get_category_catalog_usage()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  display_order integer,
  icon text,
  product_count bigint
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
$$;

CREATE OR REPLACE FUNCTION public.delete_brand_safely(p_brand_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.delete_category_safely(p_category_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE ALL ON FUNCTION public.get_brand_catalog_usage() FROM public, anon;
REVOKE ALL ON FUNCTION public.get_category_catalog_usage() FROM public, anon;
REVOKE ALL ON FUNCTION public.delete_brand_safely(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.delete_category_safely(uuid) FROM public, anon;

GRANT EXECUTE ON FUNCTION public.get_brand_catalog_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_catalog_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_brand_safely(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_category_safely(uuid) TO authenticated;