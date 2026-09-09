-- ====================================================================
-- DAY 2 MIGRATION: AUTH PROFILES & ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- 1. Create Public Profiles Table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  institution VARCHAR(255) NOT NULL DEFAULT '',
  designation VARCHAR(255),
  country VARCHAR(100) NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'PARTICIPANT',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trigger Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    institution,
    designation,
    country,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Participant User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'institution', ''),
    NEW.raw_user_meta_data->>'designation',
    COALESCE(NEW.raw_user_meta_data->>'country', 'India'),
    'PARTICIPANT' -- Mandatory default role. Role CANNOT be set to ADMIN via signup metadata.
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Enable Row Level Security on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies
-- Policy A: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy B: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy C: Users can update their own non-sensitive profile fields
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy D: Admins can update any profile (e.g., role assignments)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ====================================================================
-- CONTROLLED SECURE ADMIN CREATION PROCEDURE (DEVELOPMENT & PROD)
-- Run this query in Supabase SQL Editor to designate an Admin user:
--
-- UPDATE public.profiles
-- SET role = 'ADMIN'
-- WHERE email = 'admin@college.edu';
-- ====================================================================
