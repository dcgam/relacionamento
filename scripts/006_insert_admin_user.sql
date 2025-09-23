-- Create admin user in auth.users and admin_users tables
-- This script creates a default admin user that can login immediately

-- First, insert into auth.users (Supabase auth table)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at,
  phone_confirmed_at,
  phone_change_token,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@renovese.com',
  crypt('admin123', gen_salt('bf')), -- Password: admin123
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  NOW(),
  NULL,
  '',
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the admin user
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@renovese.com';
    
    -- Insert into profiles table
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (admin_user_id, 'admin@renovese.com', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    -- Insert into admin_users table
    INSERT INTO public.admin_users (id, email, role, is_active, created_at, updated_at)
    VALUES (admin_user_id, 'admin@renovese.com', 'super_admin', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
END $$;

-- Verify the admin user was created
SELECT 
    u.email,
    u.email_confirmed_at,
    au.role,
    au.is_active
FROM auth.users u
JOIN public.admin_users au ON u.id = au.id
WHERE u.email = 'admin@renovese.com';
