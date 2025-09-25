-- Seed data for achievements/badges
-- This script populates the achievements table with initial badges users can earn

INSERT INTO public.achievements (name, description, icon, category, criteria_type, criteria_value) VALUES
-- Goal-related achievements
('Primeira Meta', 'Parabéns por definir sua primeira meta de transformação!', '🎯', 'goals', 'goal_completion', 1),
('Conquistadora', 'Complete 5 metas para desbloquear este badge.', '🏆', 'goals', 'goal_completion', 5),
('Visionária', 'Complete 10 metas e mostre sua dedicação à transformação.', '⭐', 'goals', 'goal_completion', 10),
('Mestre da Transformação', 'Complete 25 metas e torne-se uma verdadeira mestre.', '👑', 'goals', 'goal_completion', 25),

-- Reflection-related achievements
('Primeira Reflexão', 'Sua jornada de autoconhecimento começou!', '📝', 'reflection', 'reflection_count', 1),
('Reflexiva', 'Complete 7 dias consecutivos de reflexões diárias.', '🌟', 'reflection', 'streak', 7),
('Contemplativa', 'Complete 30 dias de reflexões diárias.', '🧘‍♀️', 'reflection', 'reflection_count', 30),
('Sábia', 'Complete 100 reflexões diárias e demonstre sua sabedoria.', '🦉', 'reflection', 'reflection_count', 100),

-- Module completion achievements
('Estudante Dedicada', 'Complete seu primeiro módulo de transformação.', '📚', 'learning', 'module_completion', 1),
('Aprendiz Ávida', 'Complete 5 módulos de transformação.', '🎓', 'learning', 'module_completion', 5),
('Especialista em Crescimento', 'Complete 15 módulos de transformação.', '🌱', 'learning', 'module_completion', 15),
('Mestra do Conhecimento', 'Complete todos os módulos disponíveis.', '🔮', 'learning', 'module_completion', 30),

-- Streak achievements
('Consistente', 'Mantenha uma sequência de 7 dias de atividade.', '🔥', 'consistency', 'streak', 7),
('Determinada', 'Mantenha uma sequência de 30 dias de atividade.', '💪', 'consistency', 'streak', 30),
('Imparável', 'Mantenha uma sequência de 100 dias de atividade.', '🚀', 'consistency', 'streak', 100),

-- Special achievements
('Bem-vinda', 'Bem-vinda à comunidade Renove-se!', '🌸', 'welcome', 'goal_completion', 0),
('Inspiradora', 'Sua jornada inspira outras mulheres!', '✨', 'community', 'goal_completion', 15);
