-- Ensure transformation_modules table exists and has the correct structure
CREATE TABLE IF NOT EXISTS transformation_modules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    estimated_duration_minutes INTEGER DEFAULT 20,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    content_type TEXT CHECK (content_type IN ('article', 'video', 'exercise', 'meditation')) DEFAULT 'article',
    content_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure module_sections table exists
CREATE TABLE IF NOT EXISTS module_sections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    module_id TEXT NOT NULL REFERENCES transformation_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    section_type TEXT CHECK (section_type IN ('text', 'video', 'exercise', 'reflection', 'quiz')) DEFAULT 'text',
    order_index INTEGER DEFAULT 1,
    estimated_duration_minutes INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure user_module_progress table exists
CREATE TABLE IF NOT EXISTS user_module_progress (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL,
    module_id TEXT NOT NULL REFERENCES transformation_modules(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Insert or update the admin modules to match the exact content shown in dashboard
INSERT INTO transformation_modules (id, title, description, category, estimated_duration_minutes, difficulty_level, content_type, is_active, order_index)
VALUES 
    ('1', 'Autoconhecimento Básico', 'Introdução ao processo de autoconhecimento e reflexão pessoal', 'personal', 20, 'beginner', 'article', true, 1),
    ('2', 'Gestão de Emoções', 'Aprenda a identificar e gerenciar suas emoções de forma saudável', 'personal', 25, 'intermediate', 'exercise', true, 2),
    ('3', 'Relacionamentos Saudáveis', 'Como construir e manter relacionamentos equilibrados', 'relationship', 30, 'intermediate', 'article', true, 3),
    ('4', 'Propósito de Vida', 'Descobrindo seu propósito e direção na vida', 'career', 35, 'advanced', 'article', true, 4)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    difficulty_level = EXCLUDED.difficulty_level,
    content_type = EXCLUDED.content_type,
    is_active = EXCLUDED.is_active,
    order_index = EXCLUDED.order_index,
    updated_at = NOW();

-- Create default sections for each module if they don't exist
INSERT INTO module_sections (module_id, title, content, section_type, order_index, estimated_duration_minutes, is_active)
SELECT 
    tm.id,
    'Conteúdo Principal',
    CASE 
        WHEN tm.content_type = 'video' THEN 
            '# ' || tm.title || E'\n\n' || tm.description || E'\n\n## Objetivos deste módulo\n\nAo completar este módulo, você será capaz de:\n- Compreender os conceitos fundamentais\n- Aplicar as técnicas na prática\n- Desenvolver novas habilidades\n- Refletir sobre seu crescimento pessoal\n\n## Conteúdo Principal\n\n### Assista ao vídeo\n\n*Cole aqui a URL do vídeo do YouTube ou Vimeo*\n\n**Instruções:**\n1. Assista ao vídeo com atenção\n2. Faça anotações dos pontos principais\n3. Pratique os exercícios sugeridos\n\n### Reflexão\n\nApós assistir ao vídeo, reflita sobre:\n- Quais pontos mais chamaram sua atenção?\n- Como você pode aplicar isso em sua vida?\n- Que mudanças você gostaria de implementar?\n\n*Tempo estimado: ' || tm.estimated_duration_minutes || ' minutos*'
        WHEN tm.content_type = 'exercise' THEN
            '# ' || tm.title || E'\n\n' || tm.description || E'\n\n## Objetivos deste módulo\n\nAo completar este módulo, você será capaz de:\n- Compreender os conceitos fundamentais\n- Aplicar as técnicas na prática\n- Desenvolver novas habilidades\n- Refletir sobre seu crescimento pessoal\n\n## Conteúdo Principal\n\n### Exercício Prático\n\n**Instruções:**\n1. Reserve um tempo tranquilo para este exercício\n2. Seja honesto(a) em suas respostas\n3. Não há respostas certas ou erradas\n4. Anote suas reflexões no final\n\n**Exercício:**\n\n*Descreva aqui o exercício específico*\n\n### Questões para Reflexão\n\n1. O que você descobriu sobre si mesmo?\n2. Que padrões você consegue identificar?\n3. Que ações você pode tomar a partir dessas descobertas?\n\n*Tempo estimado: ' || tm.estimated_duration_minutes || ' minutos*'
        WHEN tm.content_type = 'meditation' THEN
            '# ' || tm.title || E'\n\n' || tm.description || E'\n\n## Objetivos deste módulo\n\nAo completar este módulo, você será capaz de:\n- Compreender os conceitos fundamentais\n- Aplicar as técnicas na prática\n- Desenvolver novas habilidades\n- Refletir sobre seu crescimento pessoal\n\n## Conteúdo Principal\n\n### Prática de Meditação\n\n**Preparação:**\n1. Encontre um local silencioso e confortável\n2. Sente-se com a coluna ereta\n3. Respire profundamente algumas vezes\n4. Feche os olhos suavemente\n\n**Prática Guiada:**\n\n*Descreva aqui a prática de meditação específica*\n\n### Após a Prática\n\nReserve alguns minutos para:\n- Observar como você se sente\n- Anotar qualquer insight ou sensação\n- Agradecer por este momento de cuidado consigo\n\n*Duração: ' || tm.estimated_duration_minutes || ' minutos*'
        ELSE
            '# ' || tm.title || E'\n\n' || tm.description || E'\n\n## Objetivos deste módulo\n\nAo completar este módulo, você será capaz de:\n- Compreender os conceitos fundamentais\n- Aplicar as técnicas na prática\n- Desenvolver novas habilidades\n- Refletir sobre seu crescimento pessoal\n\n## Conteúdo Principal\n\n### Conceitos Fundamentais\n\n*Desenvolva aqui o conteúdo principal do módulo*\n\n### Técnicas Práticas\n\n*Descreva técnicas que o usuário pode aplicar*\n\n### Exercícios de Aplicação\n\n*Inclua exercícios práticos relacionados ao tema*\n\n### Para Saber Mais\n\n*Adicione recursos adicionais, links úteis ou leituras complementares*\n\n[Link para recurso adicional](https://exemplo.com)\n\n### Reflexão Final\n\n*Inclua questões para reflexão e autoavaliação*\n\n*Tempo estimado de leitura: ' || tm.estimated_duration_minutes || ' minutos*'
    END,
    CASE WHEN tm.content_type = 'video' THEN 'video' ELSE 'text' END,
    1,
    tm.estimated_duration_minutes,
    true
FROM transformation_modules tm
WHERE tm.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM module_sections ms 
    WHERE ms.module_id = tm.id
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_module_sections_module_id ON module_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_module_sections_order ON module_sections(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_module_id ON user_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_transformation_modules_active ON transformation_modules(is_active, order_index);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_transformation_modules_updated_at ON transformation_modules;
CREATE TRIGGER update_transformation_modules_updated_at 
    BEFORE UPDATE ON transformation_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_module_sections_updated_at ON module_sections;
CREATE TRIGGER update_module_sections_updated_at 
    BEFORE UPDATE ON module_sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_module_progress_updated_at ON user_module_progress;
CREATE TRIGGER update_user_module_progress_updated_at 
    BEFORE UPDATE ON user_module_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
