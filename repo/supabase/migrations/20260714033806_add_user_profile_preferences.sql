/*
# Add User Profile Preference Fields

## Purpose
Adds 5 optional personal preference fields to the `user_profiles` table so users can share their favorite products and current car. This data helps the administrator understand which products and brands are most popular among users, and enables a "community" feel by showing the user's car next to their name in comments.

## Changes to existing table `user_profiles`

1. `current_car` (text, nullable) — Free-text field where the user enters their current car (e.g., "BMW 320i"). Displayed as a small bubble below the user's name in product comments.
2. `favorite_shampoo` (text, nullable) — The user's favorite shampoo product (free text).
3. `favorite_wax` (text, nullable) — The user's favorite wax/sealant product (free text).
4. `favorite_tire_dressing` (text, nullable) — The user's favorite tire dressing / "pretinho" product (free text).
5. `favorite_brand_id` (uuid, nullable, FK → brands.id) — The user's favorite brand, linked to the brands table for aggregation purposes.

All fields are optional (nullable). No existing data is affected.

## Security
- No new tables created.
- No RLS policy changes needed — existing policies operate at row level and cover the new columns.
- The `favorite_brand_id` FK references `brands(id)` which is already readable by all users.

## Notes
1. All 5 fields are nullable — users can fill in only what they want.
2. The `favorite_brand_id` FK allows the admin to aggregate favorite brands via a JOIN.
3. `current_car` is free text to keep the UX simple.
4. A trigger auto-updates `updated_at` on row modification.
*/

-- Create the helper function first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add the 5 new columns
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS current_car text,
  ADD COLUMN IF NOT EXISTS favorite_shampoo text,
  ADD COLUMN IF NOT EXISTS favorite_wax text,
  ADD COLUMN IF NOT EXISTS favorite_tire_dressing text,
  ADD COLUMN IF NOT EXISTS favorite_brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;

-- Add an index on favorite_brand_id for admin aggregation queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_favorite_brand_id ON user_profiles(favorite_brand_id) WHERE favorite_brand_id IS NOT NULL;

-- Auto-update updated_at on row modification (idempotent)
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
