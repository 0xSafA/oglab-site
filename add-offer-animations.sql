-- Add animation settings to theme table
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_particles BOOLEAN DEFAULT true;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_cosmic_glow BOOLEAN DEFAULT true;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_floating BOOLEAN DEFAULT true;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_pulse BOOLEAN DEFAULT true;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_inner_light BOOLEAN DEFAULT true;

-- Add comments for clarity
COMMENT ON COLUMN theme.offer_enable_particles IS 'Enable flying particles around offer pill';
COMMENT ON COLUMN theme.offer_enable_cosmic_glow IS 'Enable cosmic glow effect on offer pill';
COMMENT ON COLUMN theme.offer_enable_floating IS 'Enable floating animation on offer pill';
COMMENT ON COLUMN theme.offer_enable_pulse IS 'Enable pulse animation on offer pill';
COMMENT ON COLUMN theme.offer_enable_inner_light IS 'Enable inner light effect on offer pill';
