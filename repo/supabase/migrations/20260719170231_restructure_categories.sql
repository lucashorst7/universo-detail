/*
# Restructure product categories to the new 8-category taxonomy

## What this migration does
Reorganizes the `categories` table from the old 7-category structure into
the new 8-category taxonomy requested by the site owner. All 105 existing
products are preserved — six existing categories are simply renamed
(keeping their product foreign keys intact), the seventh ("Pneus & Rodas")
has its 7 products reassigned to "Ceras e Selantes" (per the new taxonomy,
tire-blackening products live there) and is then deleted, and two brand-new
categories are created.

## New taxonomy (in display order)
1. Shampoo e Limpeza Externa  — shampoos, desigraxantes, desincrustantes
2. Limpeza Interna            — APCs, limpeza de couro/painel
3. Ceras e Selantes           — ceras, selantes, pneu pretinho, revitalizador de plásticos
4. Limpeza de Vidros          — limpeza de vidro, remoção de chuva ácida
5. Polimento e Vitrificadores  — compostos de polimento, vitrificadores
6. Flanelas e Toalhas         — (nova)
7. Acessórios e Ferramentas   — pincéis, snowfoams, escovas, luvas de lavagem (nova)
8. Aromatizantes              — aromatizantes e perfumes

## Mapping (old → new), all via UPDATE (no product data lost)
- "Shampoos & Limpeza"      → "Shampoo e Limpeza Externa"  (17 products kept)
- "Detalhamento Interno"    → "Limpeza Interna"            (20 products kept)
- "Ceras & Selantes"        → "Ceras e Selantes"           (18 products kept, +7 from Pneus)
- "Vidros & Cristalizadores"→ "Limpeza de Vidros"          (10 products kept)
- "Polimentos & Compounds"  → "Polimento e Vitrificadores" (12 products kept)
- "Aromatizantes & Perfumes"→ "Aromatizantes"              (21 products kept)
- "Pneus & Rodas"           → DELETED; 7 products moved to "Ceras e Selantes"

## New categories created
- "Flanelas e Toalhas"      (slug: flanelas-e-toalhas)
- "Acessórios e Ferramentas" (slug: acessorios-e-ferramentas)

## Important notes
1. NO products are deleted. The 7 "Pneus & Rodas" products are UPDATEd
   to point at "Ceras e Selantes" BEFORE the old category row is removed,
   so the foreign key never breaks.
2. Slugs are regenerated for renamed categories to match the new names.
3. `display_order` is set 1..8 so the frontend lists them in the requested order.
4. `icon` column is set to match the new icon keys the frontend expects.
5. Steps are idempotent-safe: re-running won't duplicate rows because we
   match on the old slug before updating, and new rows use ON CONFLICT.
*/

-- 1. Rename the six surviving categories, regenerate slug, set order + icon.
UPDATE categories SET name = 'Shampoo e Limpeza Externa', slug = 'shampoo-e-limpeza-externa', display_order = 1, icon = 'droplet'  WHERE slug = 'shampoos-limpeza';
UPDATE categories SET name = 'Limpeza Interna',           slug = 'limpeza-interna',           display_order = 2, icon = 'armchair' WHERE slug = 'detalhamento-interno';
UPDATE categories SET name = 'Ceras e Selantes',          slug = 'ceras-e-selantes',          display_order = 3, icon = 'sparkles' WHERE slug = 'ceras-selantes';
UPDATE categories SET name = 'Limpeza de Vidros',         slug = 'limpeza-de-vidros',         display_order = 4, icon = 'eye'      WHERE slug = 'vidros-cristalizadores';
UPDATE categories SET name = 'Polimento e Vitrificadores', slug = 'polimento-e-vitrificadores', display_order = 5, icon = 'shield'  WHERE slug = 'polimentos-compounds';
UPDATE categories SET name = 'Aromatizantes',             slug = 'aromatizantes',             display_order = 8, icon = 'spray-can' WHERE slug = 'aromatizantes-perfumes';

-- 2. Reassign the 7 "Pneus & Rodas" products to "Ceras e Selantes" (tire
--    blackeners / sealants live there in the new taxonomy), then drop the
--    now-empty old category. Done BEFORE the delete so the FK stays valid.
UPDATE products
  SET category_id = (SELECT id FROM categories WHERE slug = 'ceras-e-selantes')
  WHERE category_id = 'cb24dc5d-1f78-485b-80bf-6a734afb2f65';

DELETE FROM categories WHERE id = 'cb24dc5d-1f78-485b-80bf-6a734afb2f65';

-- 3. Create the two brand-new categories (idempotent via ON CONFLICT).
INSERT INTO categories (name, slug, icon, display_order)
VALUES ('Flanelas e Toalhas', 'flanelas-e-toalhas', 'towel', 6)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO categories (name, slug, icon, display_order)
VALUES ('Acessórios e Ferramentas', 'acessorios-e-ferramentas', 'wrench', 7)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;
