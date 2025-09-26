-- Simple script to create transformation_modules table
CREATE TABLE IF NOT EXISTS public.transformation_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'personal',
  estimated_duration_minutes INTEGER DEFAULT 15,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  content_type TEXT DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'exercise', 'meditation')),
  content_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transformation_modules ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active modules
CREATE POLICY "Anyone can view active modules" ON public.transformation_modules 
  FOR SELECT USING (is_active = true);

-- Allow admin access
CREATE POLICY "Admins can manage all modules" ON public.transformation_modules 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- Insert some sample data
INSERT INTO public.transformation_modules (title, description, category, estimated_duration_minutes, difficulty_level, content_type, order_index) VALUES
('Autoconhecimento Básico', 'Introdução ao processo de autoconhecimento e reflexão pessoal', 'personal', 20, 'beginner', 'article', 1),
('Gestão de Emoções', 'Aprenda a identificar e gerenciar suas emoções de forma saudável', 'personal', 25, 'intermediate', 'exercise', 2),
('Relacionamentos Saudáveis', 'Como construir e manter relacionamentos equilibrados', 'relationship', 30, 'intermediate', 'article', 3),
('Propósito de Vida', 'Descobrindo seu propósito e direção na vida', 'career', 35, 'advanced', 'reflection', 4);
