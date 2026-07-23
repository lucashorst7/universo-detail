/*
# Automotive Aesthetics Aggregator — Initial Schema

## Overview
Creates the full schema for an automotive detailing product aggregator site,
similar to Fragantica but for car care products. No authentication required —
all data is public/shared. Policies use TO anon, authenticated.

## Tables

### categories
Organizes products into top-level groups (e.g. Ceras & Selantes, Shampoos, Polimentos).
- id: UUID primary key
- name: Display name
- slug: URL-friendly identifier
- description: Short category description
- icon: Lucide icon name string
- cover_image: Pexels photo URL
- display_order: Integer for sorting categories in nav

### brands
Car care product brands (e.g. Meguiar's, 3M, Vonixx, Carnauba do Vale).
- id: UUID primary key
- name: Brand name
- slug: URL slug
- description: Brand bio
- logo_url: Brand logo URL
- country: Country of origin
- is_featured: Boolean for homepage feature

### products
Core product catalog.
- id: UUID primary key
- name: Product name
- slug: URL slug
- brand_id: FK to brands
- category_id: FK to categories
- short_description: One-line pitch
- description: Full markdown-capable description
- specifications: JSONB array of {label, value} spec items
- usability: Text — how to use it, when, on what surfaces
- tips: Text — pro tips and care advice
- image_url: Primary product image
- gallery_images: JSONB array of additional image URLs
- rating: Numeric 0–5
- review_count: Integer
- is_featured: Boolean
- is_new: Boolean
- tags: text[] for searchable keywords
- created_at: Timestamp

### affiliate_links
One or many marketplace links per product.
- id: UUID primary key
- product_id: FK to products
- marketplace: e.g. 'Mercado Livre', 'Amazon', 'Magazine Luiza'
- url: Affiliate URL
- price: Approximate price (numeric)
- currency: 'BRL'
- is_primary: Whether this is the featured link
- display_order: Integer sort

## Security
RLS enabled on all tables. All policies are TO anon, authenticated (no sign-in).
*/

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text DEFAULT 'package',
  cover_image text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- BRANDS
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  country text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_brands" ON brands;
CREATE POLICY "anon_select_brands" ON brands FOR SELECT
  TO anon, authenticated USING (true);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  short_description text,
  description text,
  specifications jsonb DEFAULT '[]'::jsonb,
  usability text,
  tips text,
  image_url text,
  gallery_images jsonb DEFAULT '[]'::jsonb,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_brand_id_idx ON products(brand_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_tags_idx ON products USING GIN(tags);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- AFFILIATE LINKS
CREATE TABLE IF NOT EXISTS affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  marketplace text NOT NULL,
  url text NOT NULL,
  price numeric(10,2),
  currency text DEFAULT 'BRL',
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS affiliate_links_product_id_idx ON affiliate_links(product_id);

ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_affiliate_links" ON affiliate_links;
CREATE POLICY "anon_select_affiliate_links" ON affiliate_links FOR SELECT
  TO anon, authenticated USING (true);
