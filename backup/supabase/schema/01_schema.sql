-- ============================================================
-- BACKUP COMPLETO DO SCHEMA DO BANCO DE DADOS
-- Projeto: Papo Detailer (Estética Automotiva)
-- Data do Backup: 2026-07-22
-- Total de tabelas: 22
-- ============================================================

-- ============================================================
-- 1. TIPOS ENUMERADOS
-- ============================================================
CREATE TYPE product_status AS ENUM ('draft', 'review', 'published', 'archived');


-- ============================================================
-- Tabela: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text DEFAULT 'package'::text,
    cover_image text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: brands
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo_url text,
    country text,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT brands_pkey PRIMARY KEY (id)
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    brand_id uuid,
    category_id uuid,
    short_description text,
    description text,
    specifications jsonb DEFAULT '[]'::jsonb,
    usability text,
    tips text,
    image_url text,
    gallery_images jsonb DEFAULT '[]'::jsonb,
    rating numeric DEFAULT 0,
    review_count integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    is_new boolean DEFAULT false,
    tags ARRAY DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    status USER-DEFINED DEFAULT 'draft'::product_status NOT NULL,
    publish_at timestamp with time zone,
    published_at timestamp with time zone,
    parent_product_id uuid,
    variant_label text,
    CONSTRAINT products_pkey PRIMARY KEY (id)
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: product_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_categories (
    product_id uuid NOT NULL,
    category_id uuid NOT NULL,
    CONSTRAINT product_categories_pkey PRIMARY KEY (product_id),
    CONSTRAINT product_categories_pkey PRIMARY KEY (product_id),
    CONSTRAINT product_categories_pkey PRIMARY KEY (category_id),
    CONSTRAINT product_categories_pkey PRIMARY KEY (category_id)
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: affiliate_links
-- ============================================================
CREATE TABLE IF NOT EXISTS public.affiliate_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    marketplace text NOT NULL,
    url text NOT NULL,
    price numeric,
    currency text DEFAULT 'BRL'::text,
    is_primary boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT affiliate_links_pkey PRIMARY KEY (id)
);
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: admin_users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: admin_audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    actor_email text,
    entity_type text NOT NULL,
    entity_id uuid,
    entity_label text,
    action text NOT NULL,
    changed_fields ARRAY DEFAULT '{}'::text[] NOT NULL,
    previous_data jsonb,
    current_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id)
);
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: affiliate_clicks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id bigint NOT NULL,
    affiliate_link_id uuid NOT NULL,
    product_id uuid NOT NULL,
    page_path text NOT NULL,
    referrer_domain text,
    clicked_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT affiliate_clicks_pkey PRIMARY KEY (id)
);
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: product_slug_history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_slug_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_slug_history_pkey PRIMARY KEY (id)
);
ALTER TABLE public.product_slug_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: brand_slug_history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brand_slug_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT brand_slug_history_pkey PRIMARY KEY (id)
);
ALTER TABLE public.brand_slug_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: category_slug_history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.category_slug_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT category_slug_history_pkey PRIMARY KEY (id)
);
ALTER TABLE public.category_slug_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: runtime_error_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.runtime_error_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_code text DEFAULT upper(substr(replace((gen_random_uuid())::text, '-'::text, ''::text), 1, 10)) NOT NULL,
    actor_id uuid,
    source text NOT NULL,
    message text NOT NULL,
    stack text,
    component_stack text,
    route text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT runtime_error_logs_pkey PRIMARY KEY (id)
);
ALTER TABLE public.runtime_error_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: search_documents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.search_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    title text NOT NULL,
    subtitle text,
    short_description text,
    search_text text DEFAULT ''::text NOT NULL,
    keywords ARRAY DEFAULT '{}'::text[] NOT NULL,
    slug text NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    publish_at timestamp with time zone,
    image_url text,
    rating numeric DEFAULT 0 NOT NULL,
    review_count integer DEFAULT 0 NOT NULL,
    is_new boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT search_documents_pkey PRIMARY KEY (id)
);
ALTER TABLE public.search_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: search_insights
-- ============================================================
CREATE TABLE IF NOT EXISTS public.search_insights (
    id bigint NOT NULL,
    query_normalized text NOT NULL,
    result_count integer NOT NULL,
    searched_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT search_insights_pkey PRIMARY KEY (id)
);
ALTER TABLE public.search_insights ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: customer_reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    author_name text NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_by uuid,
    deleted_at timestamp with time zone,
    CONSTRAINT customer_reviews_pkey PRIMARY KEY (id)
);
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    current_car text,
    favorite_shampoo text,
    favorite_wax text,
    favorite_tire_dressing text,
    favorite_brand_id uuid,
    email_verified boolean DEFAULT false NOT NULL,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: banned_users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.banned_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reason text NOT NULL,
    banned_by uuid,
    banned_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT banned_users_pkey PRIMARY KEY (id)
);
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: collections
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    cover_image text,
    display_order integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT collections_pkey PRIMARY KEY (id)
);
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: collection_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collection_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    collection_id uuid NOT NULL,
    product_id uuid NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    note text,
    CONSTRAINT collection_items_pkey PRIMARY KEY (id)
);
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: guides
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    cover_image text,
    category_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT guides_pkey PRIMARY KEY (id)
);
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: guide_products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guide_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guide_id uuid NOT NULL,
    product_id uuid NOT NULL,
    match_label text,
    display_order integer DEFAULT 0 NOT NULL,
    CONSTRAINT guide_products_pkey PRIMARY KEY (id)
);
ALTER TABLE public.guide_products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela: spotlight
-- ============================================================
CREATE TABLE IF NOT EXISTS public.spotlight (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    week_start date DEFAULT CURRENT_DATE NOT NULL,
    editorial_text text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT spotlight_pkey PRIMARY KEY (id)
);
ALTER TABLE public.spotlight ENABLE ROW LEVEL SECURITY;
