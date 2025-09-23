-- Fix admin access to profiles table
-- This script adds the missing admin policy to allow admins to view all user profiles

-- Add admin policy to profiles table to allow admins to view all profiles
CREATE POLICY "admin_profiles_select_all" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.id = auth.uid() AND au.is_active = true
    )
  );

-- Also add admin policies for insert, update, and delete if needed
CREATE POLICY "admin_profiles_insert_all" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "admin_profiles_update_all" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "admin_profiles_delete_all" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.id = auth.uid() AND au.is_active = true
    )
  );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
