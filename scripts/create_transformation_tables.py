import os
import psycopg2
from psycopg2.extras import RealDictCursor

def create_transformation_tables():
    """Create transformation modules and related tables"""
    
    # Get database connection from environment
    database_url = os.environ.get('POSTGRES_URL')
    if not database_url:
        print("❌ POSTGRES_URL environment variable not found")
        return False
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔗 Connected to database")
        
        # Create transformation_modules table
        cursor.execute("""
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
        """)
        
        print("✅ Created transformation_modules table")
        
        # Create user_module_progress table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_module_progress (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                module_id UUID NOT NULL REFERENCES transformation_modules(id) ON DELETE CASCADE,
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
        """)
        
        print("✅ Created user_module_progress table")
        
        # Create goals table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS goals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
                target_date DATE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        
        print("✅ Created goals table")
        
        # Create habits table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS habits (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        
        print("✅ Created habits table")
        
        # Create daily_reflections table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_reflections (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        
        print("✅ Created daily_reflections table")
        
        # Insert sample transformation modules
        cursor.execute("""
            INSERT INTO transformation_modules (title, description, category, estimated_duration_minutes, difficulty_level, content_type, content_url, order_index)
            VALUES 
            ('Descobrindo Sua Autoestima', 'Aprenda a reconhecer e valorizar suas qualidades únicas', 'self_esteem', 45, 'beginner', 'article', 'https://example.com/autoestima-1', 1),
            ('Comunicação Assertiva', 'Desenvolva habilidades para se expressar com clareza e confiança', 'communication', 60, 'intermediate', 'video', 'https://example.com/comunicacao-1', 2),
            ('Relacionamentos Saudáveis', 'Construa conexões mais profundas e significativas', 'relationships', 50, 'intermediate', 'exercise', 'https://example.com/relacionamentos-1', 3),
            ('Inteligência Emocional', 'Compreenda e gerencie suas emoções de forma eficaz', 'emotional_intelligence', 40, 'advanced', 'article', 'https://example.com/inteligencia-emocional-1', 4),
            ('Mindfulness Diário', 'Pratique a atenção plena para reduzir o estresse', 'mindfulness', 30, 'beginner', 'meditation', 'https://example.com/mindfulness-1', 5)
            ON CONFLICT DO NOTHING;
        """)
        
        print("✅ Inserted sample transformation modules")
        
        # Enable RLS (Row Level Security)
        cursor.execute("ALTER TABLE transformation_modules ENABLE ROW LEVEL SECURITY;")
        cursor.execute("ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;")
        cursor.execute("ALTER TABLE goals ENABLE ROW LEVEL SECURITY;")
        cursor.execute("ALTER TABLE habits ENABLE ROW LEVEL SECURITY;")
        cursor.execute("ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;")
        
        print("✅ Enabled RLS on all tables")
        
        # Create policies for transformation_modules (public read)
        cursor.execute("""
            CREATE POLICY IF NOT EXISTS "transformation_modules_select_policy" ON transformation_modules
            FOR SELECT USING (is_active = true);
        """)
        
        # Create policies for user_module_progress (user can only see their own)
        cursor.execute("""
            CREATE POLICY IF NOT EXISTS "user_module_progress_policy" ON user_module_progress
            FOR ALL USING (auth.uid() = user_id);
        """)
        
        # Create policies for goals (user can only see their own)
        cursor.execute("""
            CREATE POLICY IF NOT EXISTS "goals_policy" ON goals
            FOR ALL USING (auth.uid() = user_id);
        """)
        
        # Create policies for habits (user can only see their own)
        cursor.execute("""
            CREATE POLICY IF NOT EXISTS "habits_policy" ON habits
            FOR ALL USING (auth.uid() = user_id);
        """)
        
        # Create policies for daily_reflections (user can only see their own)
        cursor.execute("""
            CREATE POLICY IF NOT EXISTS "daily_reflections_policy" ON daily_reflections
            FOR ALL USING (auth.uid() = user_id);
        """)
        
        print("✅ Created RLS policies")
        
        # Commit changes
        conn.commit()
        print("🎉 Database setup completed successfully!")
        
        # Verify tables were created
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('transformation_modules', 'user_module_progress', 'goals', 'habits', 'daily_reflections')
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"📋 Created tables: {[table['table_name'] for table in tables]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        if conn:
            conn.rollback()
        return False
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    create_transformation_tables()
