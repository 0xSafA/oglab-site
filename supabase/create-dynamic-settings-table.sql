-- Migration: Create dynamic_settings table for editable content
-- Date: 2025-10-03
-- Purpose: Store texts and labels that change frequently without slowing down the site

-- Create dynamic_settings table
CREATE TABLE IF NOT EXISTS dynamic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Main Page Section (Homepage offer/event texts)
  event_text TEXT DEFAULT 'Next party is coming soon! Stay tuned!',
  offer_text TEXT DEFAULT 'Special offer available now!',
  offer_hide BOOLEAN DEFAULT false,
  
  -- Menu Labels Section
  tier0_label TEXT DEFAULT '1PC',
  tier1_label TEXT DEFAULT '1G',
  tier2_label TEXT DEFAULT '5G+',
  tier3_label TEXT DEFAULT '20G+',
  
  -- Other menu text settings
  legend_hybrid TEXT DEFAULT 'Hybrid',
  legend_sativa TEXT DEFAULT 'Sativa',
  legend_indica TEXT DEFAULT 'Indica',
  feature_label TEXT DEFAULT 'Farm-grown',
  tip_label TEXT DEFAULT 'Batches from 5g'
);

-- Insert default row (only if table is empty)
INSERT INTO dynamic_settings (event_text, offer_text)
SELECT 'Next party is coming soon! Stay tuned!', 'Special offer available now!'
WHERE NOT EXISTS (SELECT 1 FROM dynamic_settings LIMIT 1);

-- Enable Row Level Security
ALTER TABLE dynamic_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON dynamic_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated update" ON dynamic_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON dynamic_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dynamic_settings_updated_at BEFORE UPDATE ON dynamic_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Migrate data from old theme table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'theme') THEN
    UPDATE dynamic_settings
    SET 
      event_text = COALESCE((SELECT event_text FROM theme ORDER BY updated_at DESC LIMIT 1), event_text),
      offer_text = COALESCE((SELECT offer_text FROM theme ORDER BY updated_at DESC LIMIT 1), offer_text),
      offer_hide = COALESCE((SELECT offer_hide FROM theme ORDER BY updated_at DESC LIMIT 1), offer_hide),
      tier0_label = COALESCE((SELECT tier0_label FROM theme ORDER BY updated_at DESC LIMIT 1), tier0_label),
      tier1_label = COALESCE((SELECT tier1_label FROM theme ORDER BY updated_at DESC LIMIT 1), tier1_label),
      tier2_label = COALESCE((SELECT tier2_label FROM theme ORDER BY updated_at DESC LIMIT 1), tier2_label),
      tier3_label = COALESCE((SELECT tier3_label FROM theme ORDER BY updated_at DESC LIMIT 1), tier3_label),
      legend_hybrid = COALESCE((SELECT legend_hybrid FROM theme ORDER BY updated_at DESC LIMIT 1), legend_hybrid),
      legend_sativa = COALESCE((SELECT legend_sativa FROM theme ORDER BY updated_at DESC LIMIT 1), legend_sativa),
      legend_indica = COALESCE((SELECT legend_indica FROM theme ORDER BY updated_at DESC LIMIT 1), legend_indica),
      feature_label = COALESCE((SELECT feature_label FROM theme ORDER BY updated_at DESC LIMIT 1), feature_label),
      tip_label = COALESCE((SELECT tip_label FROM theme ORDER BY updated_at DESC LIMIT 1), tip_label);
  END IF;
END $$;

