-- Admin access policies for content management
-- This script creates policies that allow admin users to manage all content

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for transformation_modules
CREATE POLICY "Admins can view all modules" ON public.transformation_modules 
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can insert modules" ON public.transformation_modules 
  FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update modules" ON public.transformation_modules 
  FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete modules" ON public.transformation_modules 
  FOR DELETE USING (public.is_admin_user());

-- Admin policies for achievements
CREATE POLICY "Admins can insert achievements" ON public.achievements 
  FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update achievements" ON public.achievements 
  FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete achievements" ON public.achievements 
  FOR DELETE USING (public.is_admin_user());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
