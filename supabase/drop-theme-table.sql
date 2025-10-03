-- Migration: Remove OLD theme table after migrating to new architecture
-- Date: 2025-10-03
-- Reason: Performance optimization
-- 
-- NEW ARCHITECTURE:
-- - Static settings (colors, animations) → .env (instant, no DB calls)
-- - Dynamic settings (texts, labels) → dynamic_settings table (async load, no blocking)
--
-- IMPORTANT: Run create-dynamic-settings-table.sql FIRST to migrate your data!

-- 1. Verify dynamic_settings table exists and has data
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dynamic_settings') THEN
    RAISE EXCEPTION 'ERROR: dynamic_settings table does not exist! Run create-dynamic-settings-table.sql first.';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM dynamic_settings LIMIT 1) THEN
    RAISE EXCEPTION 'ERROR: dynamic_settings table is empty! Run create-dynamic-settings-table.sql first.';
  END IF;
END $$;

-- 2. Backup current theme data (OPTIONAL - for safety)
-- Uncomment if you want to keep a backup:
-- CREATE TABLE IF NOT EXISTS theme_backup AS SELECT * FROM theme;

-- 3. Drop the OLD theme table
DROP TABLE IF EXISTS theme CASCADE;

-- 4. Success message
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Old theme table dropped. Dynamic settings are now in dynamic_settings table.';
END $$;

-- INSTRUCTIONS FOR .env.local FILE:
-- Add these STATIC settings to .env.local (colors and animation flags):
-- 
-- # Static Theme Configuration (colors, animation flags)
-- NEXT_PUBLIC_PRIMARY_COLOR=#536C4A
-- NEXT_PUBLIC_SECONDARY_COLOR=#B0BF93
-- NEXT_PUBLIC_OFFER_PARTICLES=true
-- NEXT_PUBLIC_OFFER_COSMIC_GLOW=true
-- NEXT_PUBLIC_OFFER_FLOATING=true
-- NEXT_PUBLIC_OFFER_PULSE=true
-- NEXT_PUBLIC_OFFER_INNER_LIGHT=true
-- 
-- # Menu Theme Configuration (colors only)
-- NEXT_PUBLIC_ITEM_TEXT_COLOR=#1f2937
-- NEXT_PUBLIC_CATEGORY_TEXT_COLOR=#ffffff
-- NEXT_PUBLIC_CARD_BG_COLOR=#ffffff
-- NEXT_PUBLIC_FEATURE_COLOR=#536C4A
-- NEXT_PUBLIC_LEGEND_HYBRID_COLOR=#4f7bff
-- NEXT_PUBLIC_LEGEND_SATIVA_COLOR=#ff6633
-- NEXT_PUBLIC_LEGEND_INDICA_COLOR=#38b24f
--
-- DYNAMIC SETTINGS (texts, labels) are now in the dynamic_settings table.
-- Edit them at: /admin/settings

