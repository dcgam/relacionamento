-- Create missing tables for the content editor functionality

-- Content templates for reusable content patterns
CREATE TABLE IF NOT EXISTS public.content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('text', 'video', 'exercise', 'reflection', 'quiz')),
  content_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module sections for detailed content within modules
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
  prerequisites TEXT[] DEFAULT '{}',
  unlock_criteria JSONB DEFAULT '{}',
  completion_requirements JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id)
);

-- Enable Row Level Security
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content templates (admin access only)
CREATE POLICY "Admin can manage content templates" ON public.content_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.jwt() ->> 'email' AND admin_users.is_active = true)
);

-- RLS Policies for module sections (admin access only)
CREATE POLICY "Admin can manage module sections" ON public.module_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.jwt() ->> 'email' AND admin_users.is_active = true)
);

-- RLS Policies for module configurations (admin access only)
CREATE POLICY "Admin can manage module configurations" ON public.module_configurations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.jwt() ->> 'email' AND admin_users.is_active = true)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_module_sections_module_id ON public.module_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_module_sections_order ON public.module_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_module_configurations_module_id ON public.module_configurations(module_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_type ON public.content_templates(template_type);

-- Add updated_at triggers
CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON public.content_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_module_sections_updated_at BEFORE UPDATE ON public.module_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_module_configurations_updated_at BEFORE UPDATE ON public.module_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample content templates
INSERT INTO public.content_templates (name, description, template_type, content_template) VALUES
('Template de Reflexão Básica', 'Template para seções de reflexão pessoal', 'reflection', 
'## Momento de Reflexão

Pare por um momento e reflita sobre as seguintes questões:

1. **Como você se sente neste momento?**
   - Descreva suas emoções atuais
   - O que está influenciando esses sentimentos?

2. **O que você aprendeu hoje?**
   - Quais insights surgiram?
   - Como isso se conecta com sua jornada?

3. **Qual é o próximo passo?**
   - O que você pode aplicar na prática?
   - Como vai integrar isso em sua vida?

*Reserve alguns minutos para escrever suas respostas em um diário ou apenas refletir mentalmente.*'),

('Template de Exercício Prático', 'Template para exercícios práticos', 'exercise',
'## Exercício Prático

### Objetivo
[Descreva o objetivo do exercício]

### Instruções
1. **Preparação**
   - Encontre um local tranquilo
   - Reserve [X] minutos para esta atividade
   - Tenha papel e caneta à mão

2. **Execução**
   - [Passo 1 detalhado]
   - [Passo 2 detalhado]
   - [Passo 3 detalhado]

3. **Reflexão**
   - Como foi a experiência?
   - O que você descobriu sobre si?
   - Que insights surgiram?

### Dicas
- Seja honesto consigo mesmo
- Não há respostas certas ou erradas
- Permita-se sentir o que surgir'),

('Template de Conteúdo Educativo', 'Template para artigos educativos', 'text',
'## [Título da Seção]

### Introdução
[Breve introdução ao tópico - por que é importante]

### Conceitos Principais

#### 1. [Conceito 1]
[Explicação clara e prática]

#### 2. [Conceito 2]
[Explicação clara e prática]

#### 3. [Conceito 3]
[Explicação clara e prática]

### Aplicação Prática
- **Na vida pessoal:** [Como aplicar]
- **Nos relacionamentos:** [Como aplicar]
- **No dia a dia:** [Como aplicar]

### Pontos-Chave para Lembrar
- [Ponto importante 1]
- [Ponto importante 2]
- [Ponto importante 3]

### Próximos Passos
[O que fazer após absorver este conteúdo]');
