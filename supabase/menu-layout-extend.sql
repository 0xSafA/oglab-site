-- Ensure menu_layout table supports drag-and-drop category layout
-- Safe to run multiple times

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create table if missing
CREATE TABLE IF NOT EXISTS public.menu_layout (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column1 text[] NOT NULL DEFAULT '{}',
  column2 text[] NOT NULL DEFAULT '{}',
  column3 text[] NOT NULL DEFAULT '{}',
  hidden  text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already exists
ALTER TABLE public.menu_layout
  ADD COLUMN IF NOT EXISTS id uuid,
  ADD COLUMN IF NOT EXISTS column1 text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS column2 text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS column3 text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hidden  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill id and add PK if needed
UPDATE public.menu_layout SET id = gen_random_uuid() WHERE id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'menu_layout_pkey'
  ) THEN
    ALTER TABLE public.menu_layout
    ADD CONSTRAINT menu_layout_pkey PRIMARY KEY (id);
  END IF;
END$$;

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS trigger AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'menu_layout_set_updated_at'
  ) THEN
    CREATE TRIGGER menu_layout_set_updated_at
    BEFORE UPDATE ON public.menu_layout
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- RLS
ALTER TABLE public.menu_layout ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.menu_layout;
CREATE POLICY "Allow public read" ON public.menu_layout
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON public.menu_layout;
CREATE POLICY "Allow authenticated insert" ON public.menu_layout
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update" ON public.menu_layout;
CREATE POLICY "Allow authenticated update" ON public.menu_layout
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Optional: ask PostgREST to reload schema cache to recognize new columns immediately
-- (works on Supabase)
NOTIFY pgrst, 'reload schema';

-- Done.

