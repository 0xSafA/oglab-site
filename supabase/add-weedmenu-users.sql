-- Script to add users with 'weedmenu' role for OG Lab Menu Admin Panel
-- Run this script after the main migration to add specific users

-- Example: Add existing users to weedmenu role
-- Replace email addresses with actual user emails who should have menu access

-- Method 1A: Give admin role to users who need menu access
-- Admin role already has access to menu through RLS policies
UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN (
  'contact@oglab.com',
  'safiulin@protonmail.com'
) 
AND role NOT IN ('doctor');  -- Don't overwrite doctor roles, but admin is fine

-- Method 1B: Check current roles before updating
-- First, let's see what roles these users currently have:
SELECT email, role, full_name 
FROM public.profiles 
WHERE email IN (
  'contact@oglab.com',
  'safiulin@protonmail.com'
);

-- Method 1C: ALTERNATIVE - Give admin users weedmenu access by keeping admin role
-- Admins already have access through our policies, so this is just for clarity
-- UPDATE public.profiles 
-- SET role = 'admin'  -- Keep admin role (they already have weedmenu access)
-- WHERE email IN (
--   'admin-email@oglab.com'
-- ) 
-- AND role = 'admin';

-- Method 2: Update existing users by user ID (if you know the IDs)
-- UPDATE public.profiles 
-- SET role = 'weedmenu' 
-- WHERE id IN (
--   '12345678-1234-1234-1234-123456789012',
--   '87654321-4321-4321-4321-210987654321'
-- );

-- Method 3: Create new user with weedmenu role (manual process)
-- Note: You'll need to create the user in Supabase Auth first, then run this:
-- INSERT INTO public.profiles (id, email, full_name, role) VALUES (
--   'new-user-uuid-here',
--   'newuser@oglab.com',
--   'Menu Administrator',
--   'weedmenu'
-- );

-- Method 4: Give admin users additional weedmenu access
-- If you want admin users to also have menu access, they already do
-- because the policies check for both 'weedmenu' AND 'admin' roles

-- Method 5: Check current users and their roles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
WHERE role IN ('admin', 'weedmenu')
ORDER BY created_at DESC;

-- Method 6: Verify menu access for a specific user
-- Replace 'user-uuid-here' with actual user ID
-- SELECT 
--   p.email,
--   p.role,
--   CASE 
--     WHEN p.role IN ('weedmenu', 'admin') THEN 'Has menu access'
--     ELSE 'No menu access'
--   END as menu_access_status
-- FROM public.profiles p
-- WHERE p.id = 'user-uuid-here';

-- Method 7: Bulk update multiple users to weedmenu role
-- Uncomment and modify as needed:
/*
UPDATE public.profiles 
SET 
  role = 'weedmenu',
  updated_at = NOW()
WHERE email IN (
  -- Add email addresses of users who should have menu access
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
) 
AND role != 'admin'; -- Don't change admin users
*/

-- Method 8: Create a temporary admin user for initial setup
-- Uncomment and modify as needed:
/*
-- First create the user in Supabase Auth dashboard, then run:
INSERT INTO public.profiles (
  id, 
  email, 
  full_name, 
  role,
  created_at,
  updated_at
) VALUES (
  'temp-admin-uuid', -- Replace with actual UUID from auth.users
  'ceo@oglab.com',
  'Temporary Menu Admin',
  'weedmenu',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'weedmenu',
  updated_at = NOW();
*/

-- Helpful queries for user management:

-- 1. List all users with their roles
-- SELECT 
--   au.email as auth_email,
--   p.email as profile_email,
--   p.full_name,
--   p.role,
--   p.created_at,
--   au.created_at as auth_created_at
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON au.id = p.id
-- ORDER BY au.created_at DESC;

-- 2. Find users without profiles (need profile creation)
-- SELECT 
--   au.id,
--   au.email,
--   au.created_at
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON au.id = p.id
-- WHERE p.id IS NULL;

-- 3. Check menu access permissions
-- SELECT 
--   p.email,
--   p.role,
--   CASE 
--     WHEN p.role IN ('weedmenu', 'admin') THEN '✅ Can access menu admin'
--     ELSE '❌ Cannot access menu admin'
--   END as access_status
-- FROM public.profiles p
-- ORDER BY p.role, p.email;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '=== OG Lab Menu Admin User Setup ===';
  RAISE NOTICE 'To add users with menu access:';
  RAISE NOTICE '1. Uncomment and modify the UPDATE statements above';
  RAISE NOTICE '2. Replace email addresses with actual user emails';
  RAISE NOTICE '3. Run the modified script';
  RAISE NOTICE '';
  RAISE NOTICE 'Users with role "weedmenu" or "admin" can:';
  RAISE NOTICE '- Access /admin panel';
  RAISE NOTICE '- Edit menu items and pricing';
  RAISE NOTICE '- Change site theme and upload logos';
  RAISE NOTICE '- View audit logs of their changes';
END $$;
