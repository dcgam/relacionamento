-- CREDENCIAIS DE ACESSO ADMIN PARA RENOVE-SE
-- ==========================================

-- PASSO 1: Criar conta de admin
-- Email: admin@renovese.com
-- Senha: Admin123!

-- PASSO 2: Executar este script para ativar privilégios de admin
INSERT INTO public.admin_users (id, email, role, is_active) 
SELECT 
  id, 
  email, 
  'super_admin',
  true
FROM auth.users 
WHERE email = 'admin@renovese.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  updated_at = NOW();

-- Verificar se o admin foi criado
SELECT 
  au.email,
  au.role,
  au.is_active,
  au.created_at
FROM public.admin_users au
WHERE au.email = 'admin@renovese.com';

-- INFORMAÇÕES DE ACESSO:
-- =====================
-- URL de Login: /admin/login
-- Email: admin@renovese.com  
-- Senha: Admin123!
-- 
-- URLs do Sistema Admin:
-- - Dashboard Principal: /admin
-- - Gestão de Usuários: /admin/users
-- - Acompanhamento de Progresso: /admin/progress
-- - Configuração de Emails: /admin/email-config
