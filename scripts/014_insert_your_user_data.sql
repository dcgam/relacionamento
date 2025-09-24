-- Inserindo seus dados diretamente no banco
-- Primeiro, vamos inserir você como usuário na tabela user_profiles
INSERT INTO user_profiles (id, user_id, email, display_name, language, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'diogocgarcia@gmail.com' LIMIT 1),
  'diogocgarcia@gmail.com',
  'diogocgarcia',
  'pt-BR',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  updated_at = NOW();

-- Inserindo seu progresso na tabela user_progress
INSERT INTO user_progress (id, user_id, protocol_id, status, progress_percentage, completed_sections, total_sections, started_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'diogocgarcia@gmail.com' LIMIT 1),
  'renovacao-protocol',
  'in_progress',
  17, -- 1 de 6 = ~17%
  1,
  6,
  NOW() - INTERVAL '1 day',
  NOW()
) ON CONFLICT (user_id, protocol_id) DO UPDATE SET
  progress_percentage = EXCLUDED.progress_percentage,
  completed_sections = EXCLUDED.completed_sections,
  updated_at = NOW();

-- Garantindo que o admin pode ver todos os dados
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Política para admins verem tudo
CREATE POLICY "Admins can view all user profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can view all user progress" ON user_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

-- Política para usuários verem seus próprios dados
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (user_id = auth.uid());

-- Verificando se os dados foram inseridos
SELECT 'Usuários na tabela user_profiles:' as info, COUNT(*) as count FROM user_profiles;
SELECT 'Progresso na tabela user_progress:' as info, COUNT(*) as count FROM user_progress;
SELECT 'Seus dados:' as info, email, display_name FROM user_profiles WHERE email = 'diogocgarcia@gmail.com';
