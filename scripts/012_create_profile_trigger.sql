-- Criar trigger para automaticamente criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa quando novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Verificar se há usuários na auth.users que não têm perfil
INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT 
  au.id, 
  au.email, 
  au.created_at, 
  au.updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Verificar quantos usuários temos agora
SELECT 'auth.users' as tabela, count(*) as total FROM auth.users
UNION ALL
SELECT 'profiles' as tabela, count(*) as total FROM public.profiles;
