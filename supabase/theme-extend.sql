-- Extend public.theme to support new UI fields and fix 400 errors on save
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Core columns (if your table is empty/minimal)
ALTER TABLE public.theme
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS primary_color text NOT NULL DEFAULT '#536C4A',
  ADD COLUMN IF NOT EXISTS secondary_color text NOT NULL DEFAULT '#B0BF93',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Price tier labels
ALTER TABLE public.theme
  ADD COLUMN IF NOT EXISTS tier0_label text DEFAULT '1PC',
  ADD COLUMN IF NOT EXISTS tier1_label text DEFAULT '1G',
  ADD COLUMN IF NOT EXISTS tier2_label text DEFAULT '5G+',
  ADD COLUMN IF NOT EXISTS tier3_label text DEFAULT '20G+';

-- Legend labels
ALTER TABLE public.theme
  ADD COLUMN IF NOT EXISTS legend_hybrid text DEFAULT 'Hybrid',
  ADD COLUMN IF NOT EXISTS legend_sativa text DEFAULT 'Sativa',
  ADD COLUMN IF NOT EXISTS legend_indica text DEFAULT 'Indica',
  ADD COLUMN IF NOT EXISTS feature_label text DEFAULT 'Farm-grown',
  ADD COLUMN IF NOT EXISTS tip_label text DEFAULT 'Batches from 5g';

-- Legend colors
ALTER TABLE public.theme
  ADD COLUMN IF NOT EXISTS legend_hybrid_color text DEFAULT '#4f7bff',
  ADD COLUMN IF NOT EXISTS legend_sativa_color text DEFAULT '#ff6633',
  ADD COLUMN IF NOT EXISTS legend_indica_color text DEFAULT '#38b24f',
  ADD COLUMN IF NOT EXISTS feature_color text DEFAULT '#536C4A';

-- General UI colors
ALTER TABLE public.theme
  ADD COLUMN IF NOT EXISTS item_text_color text DEFAULT '#1f2937',
  ADD COLUMN IF NOT EXISTS category_text_color text DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS card_bg_color text DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS event_text text,
  ADD COLUMN IF NOT EXISTS offer_text text;

-- Updated_at trigger
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'theme_set_updated_at'
  ) THEN
    CREATE TRIGGER theme_set_updated_at
    BEFORE UPDATE ON public.theme
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- RLS policies: allow public read, authenticated write
ALTER TABLE public.theme ENABLE ROW LEVEL SECURITY;

-- Read policies
DROP POLICY IF EXISTS "Allow public read" ON public.theme;
CREATE POLICY "Allow public read" ON public.theme
  FOR SELECT TO anon, authenticated
  USING (true);

-- Insert/Update policies for authenticated users (admins can be constrained later if needed)
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.theme;
CREATE POLICY "Allow authenticated insert" ON public.theme
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update" ON public.theme;
CREATE POLICY "Allow authenticated update" ON public.theme
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure a UUID primary key exists; needed for targeted updates from app
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.theme
  ADD COLUMN IF NOT EXISTS id uuid;

UPDATE public.theme
SET id = gen_random_uuid()
WHERE id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'theme_pkey'
  ) THEN
    ALTER TABLE public.theme
    ADD CONSTRAINT theme_pkey PRIMARY KEY (id);
  END IF;
END$$;

-- Done.

