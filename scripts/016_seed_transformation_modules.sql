-- Seed data for transformation modules
-- This script populates the transformation_modules table with initial content

INSERT INTO public.transformation_modules (title, description, category, estimated_duration_minutes, difficulty_level, content_type, order_index) VALUES
-- Relationship modules
('Comunicação Efetiva no Relacionamento', 'Aprenda técnicas de comunicação que fortalecem vínculos e resolvem conflitos de forma saudável.', 'relationship', 15, 'beginner', 'article', 1),
('Construindo Confiança Mútua', 'Descubra como reconstruir e manter a confiança em relacionamentos através de ações consistentes.', 'relationship', 20, 'intermediate', 'exercise', 2),
('Gerenciando Conflitos com Amor', 'Transforme discussões em oportunidades de crescimento e conexão mais profunda.', 'relationship', 18, 'intermediate', 'video', 3),
('Intimidade Emocional', 'Desenvolva a capacidade de se conectar emocionalmente de forma autêntica e vulnerável.', 'relationship', 25, 'advanced', 'exercise', 4),

-- Personal development modules
('Autoconhecimento e Autoaceitação', 'Jornada de descoberta pessoal para entender seus valores, necessidades e padrões comportamentais.', 'personal', 12, 'beginner', 'meditation', 5),
('Desenvolvendo Autoestima Saudável', 'Construa uma relação positiva consigo mesma através de práticas de autocompaixão e reconhecimento.', 'personal', 10, 'beginner', 'exercise', 6),
('Estabelecendo Limites Saudáveis', 'Aprenda a dizer não e proteger sua energia emocional sem culpa.', 'personal', 15, 'intermediate', 'article', 7),
('Transformando Padrões Limitantes', 'Identifique e modifique crenças e comportamentos que impedem seu crescimento.', 'personal', 30, 'advanced', 'exercise', 8),

-- Health and wellness modules
('Mindfulness para o Dia a Dia', 'Práticas simples de atenção plena para reduzir estresse e aumentar a presença.', 'health', 8, 'beginner', 'meditation', 9),
('Cuidado Emocional Diário', 'Rotinas de autocuidado que nutrem sua saúde mental e emocional.', 'health', 12, 'beginner', 'exercise', 10),
('Energia e Vitalidade', 'Estratégias holísticas para aumentar sua energia física e mental naturalmente.', 'health', 20, 'intermediate', 'article', 11),

-- Career and purpose modules
('Descobrindo Seu Propósito', 'Explore seus talentos únicos e como alinhá-los com sua missão de vida.', 'career', 25, 'intermediate', 'exercise', 12),
('Equilibrio Vida-Trabalho', 'Crie harmonia entre suas ambições profissionais e bem-estar pessoal.', 'career', 18, 'intermediate', 'article', 13),

-- Spiritual growth modules
('Conexão com Sua Essência', 'Práticas espirituais para se conectar com sua sabedoria interior e intuição.', 'spiritual', 15, 'beginner', 'meditation', 14),
('Gratidão e Abundância', 'Cultive uma mentalidade de gratidão que atrai mais positividade para sua vida.', 'spiritual', 10, 'beginner', 'exercise', 15);
