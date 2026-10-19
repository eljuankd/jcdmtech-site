-- ============================================================
-- JCDM Technologies — Supabase schema setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name TEXT,
  phone     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
  id        BIGSERIAL PRIMARY KEY,
  make      TEXT NOT NULL,
  model     TEXT NOT NULL,
  year      INT,
  color     TEXT,
  plate     TEXT,
  notes     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Drivers
CREATE TABLE IF NOT EXISTS public.drivers (
  id        BIGSERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  phone     TEXT,
  email     TEXT,
  license   TEXT,
  notes     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable Row Level Security
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies — profiles
-- ============================================================

-- Users can read and write their own profile
CREATE POLICY "users_own_profile_select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_own_profile_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_own_profile_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "admin_read_all_profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RLS Policies — vehicles (admin only)
-- ============================================================
CREATE POLICY "admin_all_vehicles"
  ON public.vehicles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- RLS Policies — drivers (admin only)
-- ============================================================
CREATE POLICY "admin_all_drivers"
  ON public.drivers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- Trigger: auto-create profile row on signup
-- (runs with SECURITY DEFINER so it bypasses RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Make yourself admin (run AFTER you create your account)
-- Replace the email below with your email
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');

-- ============================================================
-- Migration: add theme + language preferences to profiles
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  ADD COLUMN IF NOT EXISTS lang  TEXT NOT NULL DEFAULT 'en'   CHECK (lang  IN ('en', 'es'));
