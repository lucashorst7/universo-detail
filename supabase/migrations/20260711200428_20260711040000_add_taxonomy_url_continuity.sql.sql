/* PR-022 Taxonomy URL Continuity */
CREATE TABLE IF NOT EXISTS public.brand_slug_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brand_slug_history_slug_not_blank CHECK (btrim(slug) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS brand_slug_history_slug_unique_idx
  ON public.brand_slug_history (lower(slug));
CREATE INDEX IF NOT EXISTS brand_slug_history_brand_idx
  ON public.brand_slug_history (brand_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.category_slug_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT category_slug_history_slug_not_blank CHECK (btrim(slug) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS category_slug_history_slug_unique_idx
  ON public.category_slug_history (lower(slug));
CREATE INDEX IF NOT EXISTS category_slug_history_category_idx
  ON public.category_slug_history (category_id, created_at DESC);

ALTER TABLE public.brand_slug_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_slug_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.brand_slug_history FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.category_slug_history FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.preserve_brand_slug_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.preserve_category_slug_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

DROP TRIGGER IF EXISTS preserve_brand_slug_history_trigger ON public.brands;
CREATE TRIGGER preserve_brand_slug_history_trigger
BEFORE INSERT OR UPDATE OF slug ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.preserve_brand_slug_history();

DROP TRIGGER IF EXISTS preserve_category_slug_history_trigger ON public.categories;
CREATE TRIGGER preserve_category_slug_history_trigger
BEFORE INSERT OR UPDATE OF slug ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.preserve_category_slug_history();

CREATE OR REPLACE FUNCTION public.resolve_public_brand_slug(p_slug text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT b.slug
  FROM public.brand_slug_history h
  JOIN public.brands b ON b.id = h.brand_id
  WHERE lower(h.slug) = lower(btrim(p_slug))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.resolve_public_category_slug(p_slug text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT c.slug
  FROM public.category_slug_history h
  JOIN public.categories c ON c.id = h.category_id
  WHERE lower(h.slug) = lower(btrim(p_slug))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.preserve_brand_slug_history() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.preserve_category_slug_history() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.resolve_public_brand_slug(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_public_category_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_public_brand_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_public_category_slug(text) TO anon, authenticated;