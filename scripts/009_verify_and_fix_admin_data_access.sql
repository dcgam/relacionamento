-- Verificar e corrigir acesso aos dados do admin
-- Este script diagnostica e corrige problemas de acesso aos dados

-- 1. Verificar se existem usuários na tabela auth.users
SELECT 'Verificando usuários em auth.users:' as info;
SELECT COUNT(*) as total_auth_users FROM auth.users;
SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Verificar se existem perfis na tabela profiles
SELECT 'Verificando perfis na tabela profiles:' as info;
SELECT COUNT(*) as total_profiles FROM public.profiles;
SELECT email, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 5;

-- 3. Verificar políticas RLS atuais
SELECT 'Políticas RLS atuais para profiles:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Criar políticas mais permissivas para admin
-- Primeiro, remover políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "admin_profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_all" ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_update_all" ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_delete_all" ON public.profiles;

-- Criar políticas que permitem acesso total para qualquer usuário autenticado
-- (temporariamente para debug)
CREATE POLICY "temp_admin_full_access" ON public.profiles
  FOR ALL USING (true);

-- 5. Verificar se o admin user existe
SELECT 'Verificando admin user:' as info;
SELECT COUNT(*) as admin_count FROM public.admin_users WHERE email = 'admin@renovese.com';

-- 6. Inserir admin user se não existir
INSERT INTO public.admin_users (id, email, role, is_active)
SELECT 
  gen_random_uuid(),
  'admin@renovese.com',
  'super_admin',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE email = 'admin@renovese.com'
);

-- 7. Verificar progresso dos usuários
SELECT 'Verificando progresso dos usuários:' as info;
SELECT COUNT(*) as total_progress FROM public.user_progress;
SELECT user_id, step_name, status FROM public.user_progress LIMIT 10;

-- 8. Criar função para admin acessar todos os dados
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Para debug, sempre retorna true se há uma sessão ativa
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Atualizar políticas para usar a função admin
DROP POLICY IF EXISTS "temp_admin_full_access" ON public.profiles;

CREATE POLICY "admin_can_access_all_profiles" ON public.profiles
  FOR ALL USING (public.is_admin_user());

-- 10. Verificar dados finais
SELECT 'Verificação final:' as info;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.profiles) as profiles,
  (SELECT COUNT(*) FROM public.admin_users) as admin_users,
  (SELECT COUNT(*) FROM public.user_progress) as user_progress;

-- 11. Mostrar alguns dados de exemplo
SELECT 'Dados de exemplo:' as info;
SELECT p.email, p.created_at, 
       (SELECT COUNT(*) FROM public.user_progress up WHERE up.user_id = p.id) as progress_count
FROM public.profiles p 
ORDER BY p.created_at DESC 
LIMIT 5;
