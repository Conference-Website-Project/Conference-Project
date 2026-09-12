-- Migration 008: Ensure public.users table exists, RLS policies, trigger function, and backfill

-- 1. Create public.users table if not exists matching exact schema requirement
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255) NOT NULL DEFAULT '',
  country VARCHAR(100) NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'PARTICIPANT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies on public.users
DROP POLICY IF EXISTS "Public select users" ON public.users;
DROP POLICY IF EXISTS "Users insert own user row" ON public.users;
DROP POLICY IF EXISTS "Users update own user row" ON public.users;

-- RLS Policies on public.users
CREATE POLICY "Public select users" 
  ON public.users FOR SELECT 
  USING (true);

CREATE POLICY "Users insert own user row" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own user row" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- 3. Update handle_new_user trigger to populate both public.profiles AND public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert/Upsert public.profiles
  INSERT INTO public.profiles (
    id, full_name, email, phone, institution, designation, country, role, avatar_url, onboarding_completed, participation_type
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1), 'Participant User'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'institution', ''),
    COALESCE(NEW.raw_user_meta_data->>'designation', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', 'India'),
    'PARTICIPANT',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    false,
    'DELEGATE'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();

  -- Insert/Upsert public.users (satisfies papers.author_user_id FK)
  INSERT INTO public.users (
    id, full_name, email, affiliation, country, role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1), 'Participant User'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'institution', 'N/A'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'India'),
    'PARTICIPANT'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rebind trigger to auth.users AFTER INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill public.users for any existing auth.users / public.profiles missing from public.users
INSERT INTO public.users (
  id, full_name, email, affiliation, country, role
)
SELECT 
  u.id,
  COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1), 'Participant User'),
  COALESCE(u.email, p.email, ''),
  COALESCE(p.institution, u.raw_user_meta_data->>'institution', 'N/A'),
  COALESCE(p.country, u.raw_user_meta_data->>'country', 'India'),
  COALESCE(p.role, 'PARTICIPANT')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  affiliation = EXCLUDED.affiliation,
  country = EXCLUDED.country,
  updated_at = NOW();
