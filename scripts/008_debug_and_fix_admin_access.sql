-- Debug and fix admin access to user data
-- This script will help identify and resolve the admin dashboard issues

-- First, let's check what data actually exists
SELECT 'Checking auth.users table' as check_type;
SELECT COUNT(*) as total_auth_users FROM auth.users;

SELECT 'Checking profiles table' as check_type;
SELECT COUNT(*) as total_profiles FROM public.profiles;

SELECT 'Sample profiles data' as check_type;
SELECT id, email, created_at FROM public.profiles LIMIT 5;

-- Check if admin_users table has any data
SELECT 'Checking admin_users table' as check_type;
SELECT COUNT(*) as total_admin_users FROM public.admin_users;

-- Check current RLS policies on profiles table
SELECT 'Current RLS policies on profiles' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- Create a service role policy that bypasses RLS for admin operations
-- This allows the admin dashboard to access all user data
CREATE POLICY "service_role_profiles_all" ON public.profiles
  FOR ALL USING (
    current_setting('role') = 'service_role'
  );

-- Also create a policy for authenticated users who are in admin_users table
-- But first, let's make sure we can create an admin user
INSERT INTO public.admin_users (id, email, role, is_active)
SELECT 
  au.id,
  au.email,
  'admin',
  true
FROM auth.users au
WHERE au.email = 'admin@renovese.com'
ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- Create a more permissive admin policy
DROP POLICY IF EXISTS "admin_profiles_select_all" ON public.profiles;
CREATE POLICY "admin_profiles_select_all" ON public.profiles
  FOR SELECT USING (
    -- Allow if user is in admin_users table
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.email = 'admin@renovese.com' AND au.is_active = true
    )
    OR
    -- Allow service role access
    current_setting('role') = 'service_role'
  );

-- Grant necessary permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

-- Check if the policies were created successfully
SELECT 'Updated RLS policies on profiles' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- Final verification - show actual user data
SELECT 'Final verification - actual user data' as check_type;
SELECT 
  p.id,
  p.email,
  p.created_at,
  CASE 
    WHEN au.id IS NOT NULL THEN 'Admin'
    ELSE 'Regular User'
  END as user_type
FROM public.profiles p
LEFT JOIN public.admin_users au ON p.id = au.id
ORDER BY p.created_at DESC;
