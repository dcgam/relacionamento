-- Create default admin user for immediate access
-- This script creates a default admin account that can be used right away

-- First, let's make sure we have the admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS if not already enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create a function to promote any user to admin (for initial setup)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  result_message TEXT;
BEGIN
  -- Find the user by email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;
  
  IF user_id IS NULL THEN
    RETURN 'Usuário não encontrado com email: ' || user_email;
  END IF;
  
  -- Insert or update admin user
  INSERT INTO public.admin_users (id, email, role, is_active)
  VALUES (user_id, user_email, 'super_admin', true)
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'super_admin',
    is_active = true,
    updated_at = NOW();
    
  result_message := 'Usuário ' || user_email || ' promovido a super admin com sucesso!';
  RETURN result_message;
END;
$$;

-- Grant execute permission to authenticated users (temporary for setup)
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(TEXT) TO authenticated;

-- Instructions for use:
-- 1. Register a normal user account first at /register
-- 2. Then run this SQL command to promote yourself to admin:
--    SELECT public.promote_user_to_admin('your-email@example.com');
-- 3. After that, you can login as admin using the /login page with Admin mode

-- Example usage (replace with your actual email):
-- SELECT public.promote_user_to_admin('admin@renove-se.com');
