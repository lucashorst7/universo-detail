
-- Add variant support to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS parent_product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_label text;

-- Index for fast variant lookups
CREATE INDEX IF NOT EXISTS idx_products_parent_id ON products(parent_product_id);

-- RLS policies for the new columns (inherited from existing product policies)
-- No new tables, columns are part of existing table with existing RLS
