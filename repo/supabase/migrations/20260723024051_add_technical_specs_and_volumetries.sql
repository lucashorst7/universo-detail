/*
# Add technical_specs and volumetries columns to products

1. Changes to existing tables
- `products.technical_specs` (jsonb, default '{}'): Stores category-specific technical specification fields as a structured JSON object. Each key corresponds to a field key from the category spec definition, and values can be strings, numbers, booleans, or arrays of strings.
- `products.volumetries` (text[], default '{}'): Stores the list of commercial presentations/volumes available for a product (e.g., "500 ml", "1 L", "5 L", "20 L", "Não se aplica").

2. Security
- No changes to RLS policies. Existing policies on `products` remain unchanged.
- Both columns are nullable/defaulted, so existing products will have empty defaults without any data loss.

3. Important notes
- This migration is purely additive — no existing columns are modified or removed.
- All 105 existing product records are preserved with their current data.
- The `specifications` column (existing jsonb) remains untouched; `technical_specs` is a new separate column.
- The `volumetries` column stores commercial presentations, not the specific volume of a single product variant.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS technical_specs jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS volumetries text[] DEFAULT '{}'::text[];
