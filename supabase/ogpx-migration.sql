-- Migration script for OG Lab Menu Admin Panel
-- This script adds menu management tables to existing OGPx database
-- and creates the 'weedmenu' role for menu administrators

-- 1. Add 'weedmenu' role to existing role constraint
-- First, let's check current constraint and update it
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role = ANY (ARRAY['store'::text, 'doctor'::text, 'admin'::text, 'provider'::text, 'patient'::text, 'weedmenu'::text]));

-- 2. Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, ебанулись что ли
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('hybrid', 'sativa', 'indica')),
  thc DECIMAL(5,2),
  cbg DECIMAL(5,2),
  price_1pc DECIMAL(10,2),
  price_1g DECIMAL(10,2),
  price_5g DECIMAL(10,2),
  price_20g DECIMAL(10,2),
  our BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 3. Create menu_layout table
CREATE TABLE IF NOT EXISTS public.menu_layout (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column1 TEXT[] DEFAULT '{}',
  column2 TEXT[] DEFAULT '{}',
  column3 TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create theme table
CREATE TABLE IF NOT EXISTS public.theme (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_color TEXT DEFAULT '#536C4A',
  secondary_color TEXT DEFAULT '#B0BF93',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on new tables
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_layout ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for menu_items
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only admin users can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only admin users can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only admin users can delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only weedmenu users can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only weedmenu users can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only weedmenu users can delete menu items" ON public.menu_items;

CREATE POLICY "Anyone can view menu items" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "Only admin users can insert menu items" ON public.menu_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admin users can update menu items" ON public.menu_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admin users can delete menu items" ON public.menu_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 7. Create RLS policies for menu_layout
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view menu layout" ON public.menu_layout;
DROP POLICY IF EXISTS "Only admin users can modify menu layout" ON public.menu_layout;
DROP POLICY IF EXISTS "Only weedmenu users can modify menu layout" ON public.menu_layout;

CREATE POLICY "Anyone can view menu layout" ON public.menu_layout
  FOR SELECT USING (true);

CREATE POLICY "Only admin users can modify menu layout" ON public.menu_layout
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 8. Create RLS policies for theme
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view theme" ON public.theme;
DROP POLICY IF EXISTS "Only admin users can modify theme" ON public.theme;
DROP POLICY IF EXISTS "Only weedmenu users can modify theme" ON public.theme;

CREATE POLICY "Anyone can view theme" ON public.theme
  FOR SELECT USING (true);

CREATE POLICY "Only admin users can modify theme" ON public.theme
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for updated_at
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
DROP TRIGGER IF EXISTS update_menu_layout_updated_at ON public.menu_layout;
DROP TRIGGER IF EXISTS update_theme_updated_at ON public.theme;

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_layout_updated_at
  BEFORE UPDATE ON public.menu_layout
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theme_updated_at
  BEFORE UPDATE ON public.theme
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Insert default menu layout
INSERT INTO public.menu_layout (column1, column2, column3) VALUES (
  ARRAY['TOP SHELF', 'MID SHELF', 'PREMIUM'],
  ARRAY['SMALLS', 'CBG', 'PRE ROLLS'],
  ARRAY['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH']
) ON CONFLICT DO NOTHING;

-- 12. Insert default theme
INSERT INTO public.theme (primary_color, secondary_color) VALUES (
  '#536C4A', '#B0BF93'
) ON CONFLICT DO NOTHING;

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON public.menu_items(type);
CREATE INDEX IF NOT EXISTS idx_menu_items_updated_at ON public.menu_items(updated_at);

-- 14. Add audit logging for menu changes (optional)
CREATE OR REPLACE FUNCTION log_menu_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log to existing audit_logs table
  INSERT INTO public.audit_logs (
    user_id,
    entity,
    entity_id,
    action,
    diff,
    meta
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    TG_OP,
    CASE 
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
      ELSE jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    END,
    jsonb_build_object('table', TG_TABLE_NAME, 'timestamp', NOW())
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 15. Create audit triggers
-- Drop existing audit triggers if they exist
DROP TRIGGER IF EXISTS menu_items_audit_trigger ON public.menu_items;
DROP TRIGGER IF EXISTS theme_audit_trigger ON public.theme;

CREATE TRIGGER menu_items_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION log_menu_changes();

CREATE TRIGGER theme_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.theme
  FOR EACH ROW EXECUTE FUNCTION log_menu_changes();

-- 16. Create helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_layout TO authenticated;
GRANT ALL ON public.theme TO authenticated;

-- 18. Create sample menu items (optional - remove if not needed)
-- INSERT INTO public.menu_items (category, name, type, thc, price_5g, price_20g, our) VALUES
-- ('TOP SHELF', 'OG Kush', 'hybrid', 22.5, 250, 800, true),
-- ('TOP SHELF', 'White Widow', 'hybrid', 20.0, 230, 750, true),
-- ('MID SHELF', 'Blue Dream', 'sativa', 18.5, 200, 650, false),
-- ('PREMIUM', 'Girl Scout Cookies', 'hybrid', 24.0, 280, 900, true),
-- ('PRE ROLLS', 'Mixed Pack', null, null, 150, null, false),
-- ('FRESH FROZEN HASH', 'Bubble Hash', null, null, 400, 1200, true);

COMMENT ON TABLE public.menu_items IS 'Cannabis menu items with pricing and details';
COMMENT ON TABLE public.menu_layout IS 'Layout configuration for menu display';
COMMENT ON TABLE public.theme IS 'Site theme configuration including colors and logo';
COMMENT ON COLUMN public.profiles.role IS 'User role: store, doctor, admin, provider, patient, weedmenu';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'OG Lab Menu Admin Panel migration completed successfully!';
  RAISE NOTICE 'Menu management tables have been created with proper RLS policies.';
  RAISE NOTICE 'Only users with "admin" role can access menu management.';
  RAISE NOTICE 'Audit logging has been set up for menu changes.';
  RAISE NOTICE 'Use existing admin users or grant admin role to users who need menu access.';
END $$;
