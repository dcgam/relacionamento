-- Script para verificar dados reais no banco
-- Este script vai mostrar exatamente quantos usuários existem

-- Verificar dados na tabela profiles
SELECT 'profiles' as tabela, count(*) as total_registros FROM profiles;

-- Mostrar todos os profiles existentes
SELECT 'Dados profiles:' as info;
SELECT id, email, created_at FROM profiles ORDER BY created_at DESC;

-- Verificar dados na tabela admin_users  
SELECT 'admin_users' as tabela, count(*) as total_registros FROM admin_users;

-- Mostrar todos os admin_users existentes
SELECT 'Dados admin_users:' as info;
SELECT id, email, role, is_active, created_at FROM admin_users ORDER BY created_at DESC;

-- Verificar se existem outras tabelas que não estamos vendo
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verificar se há dados na tabela auth.users (usuários do Supabase Auth)
SELECT 'auth.users' as tabela, count(*) as total_registros FROM auth.users;

-- Mostrar usuários do Supabase Auth
SELECT 'Dados auth.users:' as info;
SELECT id, email, created_at, email_confirmed_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC;
