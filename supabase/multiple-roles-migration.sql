-- Migration to support multiple roles for users
-- This allows users to have multiple roles like ['admin', 'weedmenu'] or ['doctor', 'weedmenu']

-- Step 1: Add new column for multiple roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing single roles to array format
UPDATE public.profiles 
SET roles = jsonb_build_array(role) 
WHERE roles = '[]'::jsonb AND role IS NOT NULL;

-- Step 3: Create function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(user_roles jsonb, required_role text)
RETURNS boolean AS $$
BEGIN
  -- Check if user has the required role in their roles array
  RETURN user_roles ? required_role;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 4: Create function to add role to user (without removing existing roles)
CREATE OR REPLACE FUNCTION add_role_to_user(user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  -- Add role to user's roles array if not already present
  UPDATE public.profiles 
  SET roles = CASE 
    WHEN roles ? new_role THEN roles  -- Role already exists, no change
    ELSE roles || jsonb_build_array(new_role)  -- Add new role
  END,
  updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create function to remove role from user
CREATE OR REPLACE FUNCTION remove_role_from_user(user_id uuid, role_to_remove text)
RETURNS void AS $$
BEGIN
  -- Remove role from user's roles array
  UPDATE public.profiles 
  SET roles = roles - role_to_remove,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Update RLS policies to work with multiple roles

-- Drop existing policies for menu tables
DROP POLICY IF EXISTS "Only weedmenu users can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only weedmenu users can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only weedmenu users can delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only weedmenu users can modify menu layout" ON public.menu_layout;
DROP POLICY IF EXISTS "Only weedmenu users can modify theme" ON public.theme;

-- Create new policies that work with multiple roles
CREATE POLICY "Only weedmenu users can insert menu items" ON public.menu_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        user_has_role(profiles.roles, 'weedmenu') OR 
        user_has_role(profiles.roles, 'admin')
      )
    )
  );

CREATE POLICY "Only weedmenu users can update menu items" ON public.menu_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        user_has_role(profiles.roles, 'weedmenu') OR 
        user_has_role(profiles.roles, 'admin')
      )
    )
  );

CREATE POLICY "Only weedmenu users can delete menu items" ON public.menu_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        user_has_role(profiles.roles, 'weedmenu') OR 
        user_has_role(profiles.roles, 'admin')
      )
    )
  );

CREATE POLICY "Only weedmenu users can modify menu layout" ON public.menu_layout
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        user_has_role(profiles.roles, 'weedmenu') OR 
        user_has_role(profiles.roles, 'admin')
      )
    )
  );

CREATE POLICY "Only weedmenu users can modify theme" ON public.theme
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        user_has_role(profiles.roles, 'weedmenu') OR 
        user_has_role(profiles.roles, 'admin')
      )
    )
  );

-- Step 7: Add weedmenu role to specific users (preserving existing roles)
-- Example usage:
SELECT add_role_to_user(
  (SELECT id FROM public.profiles WHERE email = 'contact@oglab.com'),
  'weedmenu'
);

SELECT add_role_to_user(
  (SELECT id FROM public.profiles WHERE email = 'safiulin@protonmail.com'),
  'weedmenu'
);

-- Step 8: Create helper views for easier role management
CREATE OR REPLACE VIEW user_roles_view AS
SELECT 
  id,
  email,
  full_name,
  role as legacy_role,  -- Keep old single role for compatibility
  roles as current_roles,
  jsonb_array_elements_text(roles) as individual_role
FROM public.profiles
WHERE roles != '[]'::jsonb;

-- Step 9: Create function to check weedmenu access (for backend code)
CREATE OR REPLACE FUNCTION is_weedmenu_user(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = user_id 
    AND (
      user_has_role(profiles.roles, 'weedmenu') OR 
      user_has_role(profiles.roles, 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Verification queries
-- Check users with multiple roles:
-- SELECT email, role, roles FROM public.profiles WHERE jsonb_array_length(roles) > 1;

-- Check users with weedmenu access:
-- SELECT email, roles FROM public.profiles WHERE user_has_role(roles, 'weedmenu') OR user_has_role(roles, 'admin');

COMMENT ON COLUMN public.profiles.roles IS 'JSONB array of user roles, e.g. ["admin", "weedmenu"]';
COMMENT ON FUNCTION add_role_to_user IS 'Add role to user without removing existing roles';
COMMENT ON FUNCTION remove_role_from_user IS 'Remove specific role from user';
COMMENT ON FUNCTION user_has_role IS 'Check if user has specific role in their roles array';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '=== Multiple Roles Migration Completed ===';
  RAISE NOTICE 'Users can now have multiple roles like ["admin", "weedmenu"]';
  RAISE NOTICE 'Use add_role_to_user() function to add weedmenu role to existing users';
  RAISE NOTICE 'Use remove_role_from_user() function to remove roles';
  RAISE NOTICE 'Legacy single role field is preserved for compatibility';
END $$;
