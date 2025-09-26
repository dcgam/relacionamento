import os
import requests
import json

def setup_supabase_tables():
    """Setup transformation tables using Supabase API"""
    
    supabase_url = os.environ.get('SUPABASE_URL')
    service_role_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not service_role_key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        return False
    
    headers = {
        'apikey': service_role_key,
        'Authorization': f'Bearer {service_role_key}',
        'Content-Type': 'application/json'
    }
    
    # SQL to create all tables
    sql_commands = [
        """
        CREATE TABLE IF NOT EXISTS transformation_modules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL DEFAULT 'personal_growth',
            estimated_duration_minutes INTEGER DEFAULT 30,
            difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
            content_type TEXT DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'exercise', 'meditation')),
            content_url TEXT,
            is_active BOOLEAN DEFAULT true,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS user_module_progress (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            module_id UUID NOT NULL,
            status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
            progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
            started_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            notes TEXT DEFAULT '',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, module_id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS goals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
            target_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS habits (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS daily_reflections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            content TEXT NOT NULL,
            mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
    ]
    
    # Execute each SQL command
    for i, sql in enumerate(sql_commands):
        try:
            response = requests.post(
                f'{supabase_url}/rest/v1/rpc/exec_sql',
                headers=headers,
                json={'sql': sql}
            )
            
            if response.status_code == 200:
                print(f"✅ Executed SQL command {i+1}")
            else:
                print(f"❌ Failed to execute SQL command {i+1}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error executing SQL command {i+1}: {e}")
    
    # Insert sample data
    sample_modules = [
        {
            'title': 'Descobrindo Sua Autoestima',
            'description': 'Aprenda a reconhecer e valorizar suas qualidades únicas',
            'category': 'self_esteem',
            'estimated_duration_minutes': 45,
            'difficulty_level': 'beginner',
            'content_type': 'article',
            'content_url': 'https://example.com/autoestima-1',
            'order_index': 1
        },
        {
            'title': 'Comunicação Assertiva',
            'description': 'Desenvolva habilidades para se expressar com clareza e confiança',
            'category': 'communication',
            'estimated_duration_minutes': 60,
            'difficulty_level': 'intermediate',
            'content_type': 'video',
            'content_url': 'https://example.com/comunicacao-1',
            'order_index': 2
        },
        {
            'title': 'Relacionamentos Saudáveis',
            'description': 'Construa conexões mais profundas e significativas',
            'category': 'relationships',
            'estimated_duration_minutes': 50,
            'difficulty_level': 'intermediate',
            'content_type': 'exercise',
            'content_url': 'https://example.com/relacionamentos-1',
            'order_index': 3
        },
        {
            'title': 'Inteligência Emocional',
            'description': 'Compreenda e gerencie suas emoções de forma eficaz',
            'category': 'emotional_intelligence',
            'estimated_duration_minutes': 40,
            'difficulty_level': 'advanced',
            'content_type': 'article',
            'content_url': 'https://example.com/inteligencia-emocional-1',
            'order_index': 4
        },
        {
            'title': 'Mindfulness Diário',
            'description': 'Pratique a atenção plena para reduzir o estresse',
            'category': 'mindfulness',
            'estimated_duration_minutes': 30,
            'difficulty_level': 'beginner',
            'content_type': 'meditation',
            'content_url': 'https://example.com/mindfulness-1',
            'order_index': 5
        }
    ]
    
    # Insert sample modules
    try:
        response = requests.post(
            f'{supabase_url}/rest/v1/transformation_modules',
            headers=headers,
            json=sample_modules
        )
        
        if response.status_code in [200, 201]:
            print("✅ Inserted sample transformation modules")
        else:
            print(f"❌ Failed to insert sample modules: {response.text}")
            
    except Exception as e:
        print(f"❌ Error inserting sample modules: {e}")
    
    print("🎉 Supabase setup completed!")
    return True

if __name__ == "__main__":
    setup_supabase_tables()
