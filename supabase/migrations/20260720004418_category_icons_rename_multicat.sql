/*
# Category restructure + multi-category support

## Changes
1. Swap icons: Ceras e Selantes → shield; Polimento e Vitrificadores → sparkles
2. Rename "Shampoo e Limpeza Externa" → "Limpeza Externa" (slug: limpeza-externa)
3. Delete "Flanelas e Toalhas" (empty category, 0 products)
4. Create "Pneus e Rodas" category (display_order 6, icon: circle-dot)
5. Renumber display_order for Acessórios (7) and Aromatizantes (8)
6. Create product_categories junction table for multi-category assignment
7. Backfill product_categories from existing products.category_id so no data is lost
8. RLS on product_categories: public read (anon+authenticated), authenticated write

## New tables
- `product_categories`: (product_id, category_id) composite PK, enables one product → many categories
*/

-- 1. Swap icons
UPDATE categories SET icon = 'shield'   WHERE slug = 'ceras-e-selantes';
UPDATE categories SET icon = 'sparkles' WHERE slug = 'polimento-e-vitrificadores';

-- 2. Rename Shampoo e Limpeza Externa → Limpeza Externa
UPDATE categories
  SET name = 'Limpeza Externa', slug = 'limpeza-externa'
  WHERE slug = 'shampoo-e-limpeza-externa';

-- 3. Delete empty Flanelas e Toalhas
DELETE FROM categories WHERE slug = 'flanelas-e-toalhas';

-- 4. Insert Pneus e Rodas (order 6), push Acessórios to 7 and Aromatizantes to 8
UPDATE categories SET display_order = 7 WHERE slug = 'acessorios-e-ferramentas';
UPDATE categories SET display_order = 8 WHERE slug = 'aromatizantes';

INSERT INTO categories (name, slug, icon, display_order)
VALUES ('Pneus e Rodas', 'pneus-e-rodas', 'circle-dot', 6)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

-- 5. Create product_categories junction table (idempotent)
CREATE TABLE IF NOT EXISTS product_categories (
  product_id  uuid NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_product_id  ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);

-- 6. Backfill from existing category_id (safe to re-run due to ON CONFLICT DO NOTHING)
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 7. RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_product_categories" ON product_categories;
CREATE POLICY "anon_select_product_categories" ON product_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_product_categories" ON product_categories;
CREATE POLICY "anon_insert_product_categories" ON product_categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_product_categories" ON product_categories;
CREATE POLICY "anon_update_product_categories" ON product_categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_product_categories" ON product_categories;
CREATE POLICY "anon_delete_product_categories" ON product_categories FOR DELETE
  TO anon, authenticated USING (true);
