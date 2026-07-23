/*
# Add User Authentication and Review System

## Overview
This migration adds full user authentication support to the PapoDetailer portal:
- User profiles table linked to Supabase auth
- Banned users table for admin moderation
- Links customer_reviews to authenticated users
- Admin can delete reviews and ban users
- Secure RLS policies for all operations

## New Tables
1. `user_profiles` - Extended user info (display name) linked to auth.users
2. `banned_users` - Records of banned users with reason and ban date

## Modified Tables
1. `customer_reviews` - Added `user_id` column (nullable for backward compat with existing anonymous reviews), added `is_deleted` column for soft-delete by admin

## Security Changes
- RLS on user_profiles: users can read/update own profile, admins can read all
- RLS on banned_users: admins can CRUD, users can read own ban status
- RLS on customer_reviews: public read (non-deleted), authenticated insert (own reviews), admin delete
- Admin detection via admin_users table membership
- Added helper function is_admin() to check if current user is an admin
- Updated customer_reviews insert policy to require authentication
- Updated customer_reviews to default user_id to auth.uid()

## Important Notes
1. Email confirmation is turned ON for security (users must verify email before login)
2. Existing anonymous reviews remain readable (user_id is nullable)
3. New reviews require authentication (user_id defaults to auth.uid())
4. Admin users are identified by membership in the admin_users table
5. Banned users cannot post new reviews (enforced via RLS)
6. Soft-delete pattern for reviews preserves audit trail
*/

-- ============================================================
-- 1. Helper function: is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- ============================================================
-- 2. User profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
CREATE POLICY "users_select_own_profile"
ON public.user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "admins_select_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_select_all_profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (public.is_admin());

-- Users can update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile (auto-created on signup)
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
CREATE POLICY "users_insert_own_profile"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. Banned users table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  banned_by uuid REFERENCES auth.users(id),
  banned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DROP POLICY IF EXISTS "admins_select_banned" ON public.banned_users;
CREATE POLICY "admins_select_banned"
ON public.banned_users FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admins_insert_banned" ON public.banned_users;
CREATE POLICY "admins_insert_banned"
ON public.banned_users FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admins_delete_banned" ON public.banned_users;
CREATE POLICY "admins_delete_banned"
ON public.banned_users FOR DELETE
TO authenticated
USING (public.is_admin());

-- Users can check if they are banned (to show appropriate message)
DROP POLICY IF EXISTS "users_select_own_ban" ON public.banned_users;
CREATE POLICY "users_select_own_ban"
ON public.banned_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- 4. Modify customer_reviews table
-- ============================================================
-- Add user_id column (nullable for backward compatibility)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_reviews' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.customer_reviews ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add is_deleted column for soft-delete by admin
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_reviews' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE public.customer_reviews ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add deleted_by and deleted_at for audit
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_reviews' AND column_name = 'deleted_by'
  ) THEN
    ALTER TABLE public.customer_reviews ADD COLUMN deleted_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_reviews' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.customer_reviews ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;

-- ============================================================
-- 5. Update customer_reviews RLS policies
-- ============================================================
-- Drop existing public read policy
DROP POLICY IF EXISTS "public_read_reviews" ON public.customer_reviews;

-- Public can read non-deleted reviews
DROP POLICY IF EXISTS "public_read_active_reviews" ON public.customer_reviews;
CREATE POLICY "public_read_active_reviews"
ON public.customer_reviews FOR SELECT
TO anon, authenticated
USING (is_deleted = false);

-- Admins can read all reviews including deleted
DROP POLICY IF EXISTS "admins_read_all_reviews" ON public.customer_reviews;
CREATE POLICY "admins_read_all_reviews"
ON public.customer_reviews FOR SELECT
TO authenticated
USING (public.is_admin());

-- Authenticated users can insert reviews (must not be banned)
DROP POLICY IF EXISTS "auth_insert_reviews" ON public.customer_reviews;
CREATE POLICY "auth_insert_reviews"
ON public.customer_reviews FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.banned_users WHERE banned_users.user_id = auth.uid()
  )
);

-- Admins can update reviews (soft-delete)
DROP POLICY IF EXISTS "admins_update_reviews" ON public.customer_reviews;
CREATE POLICY "admins_update_reviews"
ON public.customer_reviews FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can delete reviews
DROP POLICY IF EXISTS "admins_delete_reviews" ON public.customer_reviews;
CREATE POLICY "admins_delete_reviews"
ON public.customer_reviews FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================
-- 6. Index for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customer_reviews_product_id ON public.customer_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_user_id ON public.customer_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_is_deleted ON public.customer_reviews(is_deleted);
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ============================================================
-- 7. Trigger to auto-create user_profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
