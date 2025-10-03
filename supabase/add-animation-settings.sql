-- Migration: Add animation settings to dynamic_settings table
-- Date: 2025-10-03
-- Purpose: Allow admin to control offer banner animations

-- Add animation control columns
ALTER TABLE dynamic_settings
ADD COLUMN IF NOT EXISTS offer_enable_particles BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS offer_enable_cosmic_glow BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS offer_enable_floating BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS offer_enable_pulse BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS offer_enable_inner_light BOOLEAN DEFAULT true;

-- Update existing rows to have default values
UPDATE dynamic_settings
SET 
  offer_enable_particles = COALESCE(offer_enable_particles, true),
  offer_enable_cosmic_glow = COALESCE(offer_enable_cosmic_glow, true),
  offer_enable_floating = COALESCE(offer_enable_floating, true),
  offer_enable_pulse = COALESCE(offer_enable_pulse, true),
  offer_enable_inner_light = COALESCE(offer_enable_inner_light, true)
WHERE id IS NOT NULL;

