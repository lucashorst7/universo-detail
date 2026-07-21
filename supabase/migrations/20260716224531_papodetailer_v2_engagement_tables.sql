/*
# PapoDetailer v2 — New engagement & discovery tables

## Overview
Adds 5 new tables that transform PapoDetailer from a static catalog into a
discovery-driven community portal. All tables use RLS with appropriate policies.

## New Tables

1. **collections** — Curated product lists (e.g. "Kit Iniciante", "Lavagem Rápida 15min")
   - id, slug, title, description, cover_image, display_order, is_featured, created_at

2. **collection_items** — Products within a collection (ordered)
   - id, collection_id (FK), product_id (FK), display_order, note

3. **guides** — Interactive decision-tree guides ("Qual cera escolher?")
   - id, slug, title, description, cover_image, category_id (nullable FK), created_at

4. **guide_products** — Products recommended by a guide
   - id, guide_id (FK), product_id (FK), match_label, display_order

5. **spotlight** — Product of the week (editorial pick)
   - id, product_id (FK), week_start (date), editorial_text, created_at

## Security
- collections, collection_items, guides, guide_products, spotlight: all public read (anon + authenticated)
- No public writes (admin-only via service role / future admin UI)
*/
