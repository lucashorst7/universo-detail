/*
# Add email_verified column to user_profiles

1. New Columns
- user_profiles.email_verified (boolean, NOT NULL, default false)

2. Notes
- Idempotent: uses DO block to add column only if missing.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN email_verified boolean NOT NULL DEFAULT false;
  END IF;
END $$;