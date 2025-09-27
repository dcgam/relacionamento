import os
import json
from supabase import create_client, Client

def setup_database():
    """Setup complete database schema for Renove-se app"""
    
    # Get Supabase credentials
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return False
    
    try:
        supabase: Client = create_client(url, key)
        print("✅ Connected to Supabase")
        
        # Create transformation_modules table
        modules_sql = """
        CREATE TABLE IF NOT EXISTS transformation_modules (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL DEFAULT 'personal',
            estimated_duration_minutes INTEGER DEFAULT 20,
            difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
            content_type TEXT CHECK (content_type IN ('article', 'video', 'exercise', 'meditation')) DEFAULT 'article',
            content_url TEXT,
            is_active BOOLEAN DEFAULT true,
            order_index INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        # Create module_sections table
        sections_sql = """
        CREATE TABLE IF NOT EXISTS module_sections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        """
        
        # Create user_module_progress table
        progress_sql = """
        CREATE TABLE IF NOT EXISTS user_module_progress (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            module_id TEXT NOT NULL REFERENCES transformation_modules(id) ON DELETE CASCADE,
            status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
            progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
            started_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, module_id)
        );
        """
        
        # Create content_templates table
        templates_sql = """
        CREATE TABLE IF NOT EXISTS content_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            template_type TEXT NOT NULL,
            content_template TEXT NOT NULL,
            variables JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        # Execute table creation
        print("📝 Creating tables...")
        supabase.rpc('exec_sql', {'sql': modules_sql}).execute()
        print("✅ transformation_modules table created")
        
        supabase.rpc('exec_sql', {'sql': sections_sql}).execute()
        print("✅ module_sections table created")
        
        supabase.rpc('exec_sql', {'sql': progress_sql}).execute()
        print("✅ user_module_progress table created")
        
        supabase.rpc('exec_sql', {'sql': templates_sql}).execute()
        print("✅ content_templates table created")
        
        # Insert sample modules if none exist
        existing_modules = supabase.table('transformation_modules').select('id').execute()
        
        if not existing_modules.data:
            print("📝 Inserting sample modules...")
            
            sample_modules = [
                {
                    'id': '1',
                    'title': 'Autoconhecimento Básico',
                    'description': 'Introdução ao processo de autoconhecimento e reflexão pessoal',
                    'category': 'personal',
                    'estimated_duration_minutes': 20,
                    'difficulty_level': 'beginner',
                    'content_type': 'article',
                    'content_url': '',
                    'is_active': True,
                    'order_index': 1
                },
                {
                    'id': '2',
                    'title': 'Gestão de Emoções',
                    'description': 'Aprenda a identificar e gerenciar suas emoções de forma saudável',
                    'category': 'personal',
                    'estimated_duration_minutes': 25,
                    'difficulty_level': 'intermediate',
                    'content_type': 'exercise',
                    'content_url': '',
                    'is_active': True,
                    'order_index': 2
                },
                {
                    'id': '3',
                    'title': 'Relacionamentos Saudáveis',
                    'description': 'Como construir e manter relacionamentos equilibrados',
                    'category': 'relationship',
                    'estimated_duration_minutes': 30,
                    'difficulty_level': 'intermediate',
                    'content_type': 'article',
                    'content_url': '',
                    'is_active': True,
                    'order_index': 3
                },
                {
                    'id': '4',
                    'title': 'Propósito de Vida',
                    'description': 'Descobrindo seu propósito e direção na vida',
                    'category': 'career',
                    'estimated_duration_minutes': 35,
                    'difficulty_level': 'advanced',
                    'content_type': 'article',
                    'content_url': '',
                    'is_active': True,
                    'order_index': 4
                }
            ]
            
            for module in sample_modules:
                supabase.table('transformation_modules').insert(module).execute()
                
                # Create default section for each module
                section_content = f"""# {module['title']}

{module['description']}

## Objetivos deste módulo

Ao completar este módulo, você será capaz de:
- Compreender os conceitos fundamentais
- Aplicar as técnicas na prática
- Desenvolver novas habilidades
- Refletir sobre seu crescimento pessoal

## Conteúdo Principal

Este é o conteúdo editável do módulo. O administrador pode modificar este texto, adicionar vídeos, links e outros recursos.

### Exemplo de Vídeo
Para adicionar um vídeo, cole a URL do YouTube ou Vimeo:
https://www.youtube.com/watch?v=exemplo

### Exemplo de Link
[Clique aqui para recurso adicional](https://exemplo.com)

### Reflexão
- O que você aprendeu com este módulo?
- Como pode aplicar isso em sua vida?
- Que próximos passos você pretende tomar?

*Tempo estimado: {module['estimated_duration_minutes']} minutos*"""
                
                section = {
                    'module_id': module['id'],
                    'title': 'Conteúdo Principal',
                    'content': section_content,
                    'section_type': 'video' if module['content_type'] == 'video' else 'text',
                    'order_index': 1,
                    'estimated_duration_minutes': module['estimated_duration_minutes'],
                    'is_active': True
                }
                
                supabase.table('module_sections').insert(section).execute()
            
            print("✅ Sample modules and sections inserted")
        
        # Insert sample templates
        existing_templates = supabase.table('content_templates').select('id').execute()
        
        if not existing_templates.data:
            print("📝 Inserting sample templates...")
            
            sample_templates = [
                {
                    'name': 'Artigo Básico',
                    'description': 'Template para artigos de conteúdo educativo',
                    'template_type': 'article',
                    'content_template': """# {{title}}

{{description}}

## Introdução

{{introduction}}

## Desenvolvimento

{{main_content}}

## Exercício Prático

{{exercise}}

## Conclusão

{{conclusion}}

### Para Refletir
- {{reflection_question_1}}
- {{reflection_question_2}}
- {{reflection_question_3}}""",
                    'variables': {
                        'title': 'Título do Artigo',
                        'description': 'Descrição do conteúdo',
                        'introduction': 'Introdução ao tema',
                        'main_content': 'Conteúdo principal',
                        'exercise': 'Exercício prático',
                        'conclusion': 'Conclusão',
                        'reflection_question_1': 'Primeira questão para reflexão',
                        'reflection_question_2': 'Segunda questão para reflexão',
                        'reflection_question_3': 'Terceira questão para reflexão'
                    },
                    'is_active': True
                },
                {
                    'name': 'Exercício de Reflexão',
                    'description': 'Template para exercícios de autoconhecimento',
                    'template_type': 'exercise',
                    'content_template': """# {{title}}

## Objetivo
{{objective}}

## Instruções
1. Reserve um tempo tranquilo para este exercício
2. Seja honesto(a) em suas respostas
3. Não há respostas certas ou erradas
4. Anote suas reflexões

## Exercício

{{exercise_content}}

### Questões para Reflexão
1. {{question_1}}
2. {{question_2}}
3. {{question_3}}

## Próximos Passos
{{next_steps}}""",
                    'variables': {
                        'title': 'Título do Exercício',
                        'objective': 'Objetivo do exercício',
                        'exercise_content': 'Conteúdo do exercício',
                        'question_1': 'Primeira questão',
                        'question_2': 'Segunda questão',
                        'question_3': 'Terceira questão',
                        'next_steps': 'Próximos passos sugeridos'
                    },
                    'is_active': True
                }
            ]
            
            for template in sample_templates:
                supabase.table('content_templates').insert(template).execute()
            
            print("✅ Sample templates inserted")
        
        print("\n🎉 Database setup completed successfully!")
        print("📋 Summary:")
        print("   - transformation_modules table ✅")
        print("   - module_sections table ✅")
        print("   - user_module_progress table ✅")
        print("   - content_templates table ✅")
        print("   - Sample data inserted ✅")
        print("\n💡 You can now edit module content in the Admin Panel!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {str(e)}")
        return False

if __name__ == "__main__":
    setup_database()
