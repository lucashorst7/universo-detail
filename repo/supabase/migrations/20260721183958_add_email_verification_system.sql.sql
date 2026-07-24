/*
# Add email verification system for user accounts

## Purpose
Supports the new user registration flow that requires email verification via a 6-digit OTP code.
Users must verify their email before they can post reviews/comments on products.

## Changes

### 1. New column on user_profiles
- `email_verified` (boolean, NOT NULL, default false): tracks whether the user has verified their email via OTP code.

### 2. New function: mark_email_verified()
- SECURITY DEFINER function that sets `email_verified = true` for the calling authenticated user.
- Called from the frontend after `supabase.auth.verifyOtp()` succeeds.
- Bypasses RLS so it can write to `email_verified`, which users cannot update directly.

### 3. Updated RLS policy on user_profiles
- The existing `users_update_own_profile` UPDATE policy is tightened so users CANNOT set `email_verified` to true themselves.
- Only the `mark_email_verified()` SECURITY DEFINER function can flip it from false to true.
- Users can still update all their other profile fields (display_name, avatar_url, current_car, etc.) normally.

### 4. Grants
- `mark_email_verified()` granted EXECUTE to `authenticated` role.

## Security
- Users cannot bypass email verification by directly updating their profile — the RLS WITH CHECK clause blocks it.
- The SECURITY DEFINER function is the only path to set email_verified = true.
- email_verified defaults to false, so new signups start unverified.
*/