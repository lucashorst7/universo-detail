/*
# Seed initial collections, guides, and spotlight data

1. Inserts 3 curated collections with products
2. Inserts 2 interactive guides with product recommendations
3. Inserts 1 spotlight entry for the current week
All product IDs are fetched dynamically from the published products table.
*/

DO $$
DECLARE
  v_shampoo_id uuid;
  v_cera_id uuid;
  v_selante_id uuid;
  v_pneu_id uuid;
  v_interior_id uuid;
  v_vidro_id uuid;
  v_aroma_id uuid;
  v_polimento_id uuid;
  v_collection_kit uuid;
  v_collection_lavagem uuid;
  v_collection_pro uuid;
  v_guide_cera uuid;
  v_guide_shampoo uuid;
BEGIN
  -- Fetch some published product IDs
  SELECT id INTO v_shampoo_id FROM products WHERE status='published' AND category_id=(SELECT id FROM categories WHERE slug='shampoos-limpeza') LIMIT 1;
  SELECT id INTO v_cera_id FROM products WHERE status='published' AND category_id=(SELECT id FROM categories WHERE slug='ceras-selantes') AND specifications->>'Tipo' ILIKE '%cera%' LIMIT 1;
  SELECT id INTO v_selante_id FROM products WHERE status='published' AND category_id=(SELECT id FROM categories WHERE slug='ceras-selantes') AND specifications->>'Tipo' ILIKE '%selante%' LIMIT 1;
  SELECT id INTO v_pneu_id FROM products WHERE status='published' AND category_id=(SELECT id FROM categories WHERE slug='pneus-rodas') LIMIT 1;
  SELECT id INTO v_interior_id FROM products WHERE status='published' AND category_id=(SELECT id FROM categories WHERE slug='detalhamento-interno') LIMIT 1;
  SELECT id INTO v_vidro_id FROM products WHERE status='published' AND category_id=(SELECT id FROM categories WHERE slug='vidros-cristalizadores') LIMIT 1;
  SELECT id INTO v_aroma_id FROM products WHERE status='published' AND category_id=(SELECT id FROM categories WHERE slug='aromatizantes-perfumes') LIMIT 1;
  SELECT id INTO v_polimento_id FROM products WHERE status='published' AND category_id=(SELECT id FROM categories WHERE slug='polimentos-compounds') LIMIT 1;

  -- Collections
  INSERT INTO collections (slug, title, description, display_order, is_featured) VALUES
    ('kit-iniciante', 'Kit Iniciante', 'Tudo que você precisa para começar no mundo da estética automotiva sem desperdiçar dinheiro.', 1, true),
    ('lavagem-rapida', 'Lavagem Rápida 15min', 'Produtos para uma lavagem eficiente quando o tempo está curto.', 2, true),
    ('pro-grade', 'Pro Grade', 'Ferramentas e produtos usados por profissionais da estética automotiva.', 3, false)
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_collection_kit FROM collections WHERE slug='kit-iniciante';
  SELECT id INTO v_collection_lavagem FROM collections WHERE slug='lavagem-rapida';
  SELECT id INTO v_collection_pro FROM collections WHERE slug='pro-grade';

  -- Collection items: Kit Iniciante
  IF v_shampoo_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order, note)
    VALUES (v_collection_kit, v_shampoo_id, 1, 'O shampoo é a base de tudo.')
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;
  IF v_cera_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order, note)
    VALUES (v_collection_kit, v_cera_id, 2, 'Proteção essencial para a pintura.')
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;
  IF v_pneu_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order, note)
    VALUES (v_collection_kit, v_pneu_id, 3, 'Pneus pretos fazem toda a diferença.')
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;
  IF v_interior_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order, note)
    VALUES (v_collection_kit, v_interior_id, 4, 'Interior limpo é conforto.')
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;

  -- Collection items: Lavagem Rápida
  IF v_shampoo_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order)
    VALUES (v_collection_lavagem, v_shampoo_id, 1)
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;
  IF v_vidro_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order)
    VALUES (v_collection_lavagem, v_vidro_id, 2)
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;
  IF v_pneu_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order)
    VALUES (v_collection_lavagem, v_pneu_id, 3)
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;
  IF v_aroma_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order)
    VALUES (v_collection_lavagem, v_aroma_id, 4)
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;

  -- Collection items: Pro Grade
  IF v_polimento_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order)
    VALUES (v_collection_pro, v_polimento_id, 1)
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;
  IF v_selante_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order)
    VALUES (v_collection_pro, v_selante_id, 2)
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;
  IF v_cera_id IS NOT NULL THEN
    INSERT INTO collection_items (collection_id, product_id, display_order)
    VALUES (v_collection_pro, v_cera_id, 3)
    ON CONFLICT (collection_id, product_id) DO NOTHING;
  END IF;

  -- Guides
  INSERT INTO guides (slug, title, description)
  VALUES
    ('qual-cera-escolher', 'Qual cera ou selante escolher?', 'Descubra a proteção ideal para seu carro baseada no seu perfil de uso.'),
    ('qual-shampoo-usar', 'Qual shampoo usar?', 'Encontre o shampoo certo considerando seu tipo de lavagem e proteção atual.')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_guide_cera FROM guides WHERE slug='qual-cera-escolher';
  SELECT id INTO v_guide_shampoo FROM guides WHERE slug='qual-shampoo-usar';

  -- Guide products: Qual cera escolher
  IF v_cera_id IS NOT NULL THEN
    INSERT INTO guide_products (guide_id, product_id, match_label, display_order)
    VALUES (v_guide_cera, v_cera_id, 'Para uso semanal e brilho intenso', 1)
    ON CONFLICT (guide_id, product_id) DO NOTHING;
  END IF;
  IF v_selante_id IS NOT NULL THEN
    INSERT INTO guide_products (guide_id, product_id, match_label, display_order)
    VALUES (v_guide_cera, v_selante_id, 'Para proteção de longa duração (3+ meses)', 2)
    ON CONFLICT (guide_id, product_id) DO NOTHING;
  END IF;

  -- Guide products: Qual shampoo usar
  IF v_shampoo_id IS NOT NULL THEN
    INSERT INTO guide_products (guide_id, product_id, match_label, display_order)
    VALUES (v_guide_shampoo, v_shampoo_id, 'Para lavagem semanal com diluição econômica', 1)
    ON CONFLICT (guide_id, product_id) DO NOTHING;
  END IF;

  -- Spotlight: current week
  INSERT INTO spotlight (product_id, week_start, editorial_text)
  SELECT p.id, CURRENT_DATE, 'Este produto chamou nossa atenção pela combinação de performance, rendimento e custo-benefício. Uma daquelas descobertas que vira favorito rapidamente.'
  FROM products p
  WHERE p.status = 'published' AND p.is_featured = true
  ORDER BY p.rating DESC, p.review_count DESC
  LIMIT 1
  ON CONFLICT DO NOTHING;

END $$;
