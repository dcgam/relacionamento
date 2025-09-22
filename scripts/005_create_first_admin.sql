-- Script para criar o primeiro usuário administrador
-- Execute este script DEPOIS de criar uma conta normal através do registro

-- INSTRUÇÕES:
-- 1. Primeiro, registre-se normalmente em /register com o email que será admin
-- 2. Confirme o email através do link enviado
-- 3. Execute este script substituindo 'seu-email@exemplo.com' pelo email real
-- 4. Depois poderá acessar /admin/login

-- Criar o primeiro super admin
-- SUBSTITUA 'seu-email@exemplo.com' pelo email real do administrador
INSERT INTO public.admin_users (id, email, role, is_active) 
SELECT 
  id, 
  email, 
  'super_admin',
  true
FROM auth.users 
WHERE email = 'seu-email@exemplo.com'  -- SUBSTITUA ESTE EMAIL
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  updated_at = NOW();

-- Verificar se o admin foi criado corretamente
SELECT 
  au.email,
  au.role,
  au.is_active,
  au.created_at
FROM public.admin_users au
WHERE au.email = 'seu-email@exemplo.com';  -- SUBSTITUA ESTE EMAIL
