-- Cleanup script for OG Lab Menu Admin Panel
-- Run this ONLY if you need to completely remove menu tables and start fresh
-- WARNING: This will delete all menu data!

-- Drop triggers first
DROP TRIGGER IF EXISTS menu_items_audit_trigger ON public.menu_items;
DROP TRIGGER IF EXISTS theme_audit_trigger ON public.theme;
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
DROP TRIGGER IF EXISTS update_menu_layout_updated_at ON public.menu_layout;
DROP TRIGGER IF EXISTS update_theme_updated_at ON public.theme;

-- Drop policies
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only admin users can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only admin users can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only admin users can delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only weedmenu users can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only weedmenu users can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only weedmenu users can delete menu items" ON public.menu_items;

DROP POLICY IF EXISTS "Anyone can view menu layout" ON public.menu_layout;
DROP POLICY IF EXISTS "Only admin users can modify menu layout" ON public.menu_layout;
DROP POLICY IF EXISTS "Only weedmenu users can modify menu layout" ON public.menu_layout;

DROP POLICY IF EXISTS "Anyone can view theme" ON public.theme;
DROP POLICY IF EXISTS "Only admin users can modify theme" ON public.theme;
DROP POLICY IF EXISTS "Only weedmenu users can modify theme" ON public.theme;

-- Drop tables
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.menu_layout CASCADE;
DROP TABLE IF EXISTS public.theme CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS log_menu_changes();
DROP FUNCTION IF EXISTS is_admin_user();
DROP FUNCTION IF EXISTS is_weedmenu_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Menu tables and related objects have been cleaned up.';
  RAISE NOTICE 'You can now run the main migration script again.';
END $$;
