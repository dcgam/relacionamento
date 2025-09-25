-- Content Management System for Transformation Modules
-- This script creates tables for managing module content and configurations

-- Module sections for breaking down modules into smaller parts
CREATE TABLE IF NOT EXISTS public.module_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.transformation_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('text', 'video', 'exercise', 'reflection', 'quiz')),
  order_index INTEGER NOT NULL,
  estimated_duration_minutes INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module configurations for advanced settings
CREATE TABLE IF NOT EXISTS public.module_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.transformation_modules(id) ON DELETE CASCADE,
  prerequisites TEXT[], -- Array of module IDs that must be completed first
  unlock_criteria JSONB, -- Flexible criteria for unlocking modules
  completion_requirements JSONB, -- Requirements to mark module as complete
  tags TEXT[], -- Tags for better organization and filtering
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id)
);

-- Content templates for reusable content blocks
CREATE TABLE IF NOT EXISTS public.content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('exercise', 'reflection', 'meditation', 'quiz')),
  content_template TEXT NOT NULL,
  variables JSONB, -- Variables that can be customized when using template
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.module_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can manage content
CREATE POLICY "Admins can manage module sections" ON public.module_sections FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.jwt() ->> 'email' AND admin_users.is_active = true));

CREATE POLICY "Admins can manage module configurations" ON public.module_configurations FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.jwt() ->> 'email' AND admin_users.is_active = true));

CREATE POLICY "Admins can manage content templates" ON public.content_templates FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.jwt() ->> 'email' AND admin_users.is_active = true));

-- Users can read active sections for modules they have access to
CREATE POLICY "Users can view active module sections" ON public.module_sections FOR SELECT 
  USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_module_sections_module_id ON public.module_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_module_sections_order ON public.module_sections(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_module_configurations_module_id ON public.module_configurations(module_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_type ON public.content_templates(template_type);

-- Add updated_at triggers
CREATE TRIGGER update_module_sections_updated_at BEFORE UPDATE ON public.module_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_module_configurations_updated_at BEFORE UPDATE ON public.module_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON public.content_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample content templates
INSERT INTO public.content_templates (name, description, template_type, content_template, variables) VALUES
('Reflexão Guiada', 'Template para exercícios de reflexão pessoal', 'reflection', 
'## {{title}}

{{introduction}}

**Perguntas para reflexão:**

{{#questions}}
• {{question}}
{{/questions}}

**Tempo sugerido:** {{duration}} minutos

{{closing_message}}', 
'{"title": "Título da reflexão", "introduction": "Texto introdutório", "questions": ["Pergunta 1", "Pergunta 2"], "duration": 10, "closing_message": "Mensagem de encerramento"}'),

('Exercício Prático', 'Template para exercícios práticos e atividades', 'exercise',
'## {{title}}

{{description}}

**Instruções:**

{{#steps}}
{{step_number}}. {{instruction}}
{{/steps}}

**Materiais necessários:** {{materials}}

**Tempo estimado:** {{duration}} minutos

{{tips}}',
'{"title": "Nome do exercício", "description": "Descrição do exercício", "steps": [{"step_number": 1, "instruction": "Primeira instrução"}], "materials": "Lista de materiais", "duration": 15, "tips": "Dicas adicionais"}'),

('Meditação Guiada', 'Template para práticas de meditação e mindfulness', 'meditation',
'## {{title}}

{{introduction}}

**Preparação:**
{{preparation_instructions}}

**Prática:**

{{#meditation_steps}}
**{{step_title}}** ({{duration}} minutos)
{{step_instructions}}

{{/meditation_steps}}

**Encerramento:**
{{closing_instructions}}

**Duração total:** {{total_duration}} minutos',
'{"title": "Nome da meditação", "introduction": "Introdução à prática", "preparation_instructions": "Como se preparar", "meditation_steps": [{"step_title": "Respiração", "duration": 5, "step_instructions": "Instruções do passo"}], "closing_instructions": "Como encerrar", "total_duration": 15}');
