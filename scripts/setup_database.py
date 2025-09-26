import os
import psycopg2
from psycopg2.extras import RealDictCursor

def setup_database():
    # Get database connection from environment variables
    database_url = os.environ.get('POSTGRES_URL')
    
    if not database_url:
        print("Error: POSTGRES_URL environment variable not found")
        return
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("Connected to database successfully")
        
        # Create transformation_modules table
        create_table_sql = """
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
        """
        
        cursor.execute(create_table_sql)
        print("Created transformation_modules table")
        
        # Enable RLS
        cursor.execute("ALTER TABLE public.transformation_modules ENABLE ROW LEVEL SECURITY;")
        print("Enabled RLS on transformation_modules")
        
        # Create policies
        policies_sql = [
            """
            CREATE POLICY "Anyone can view active modules" ON public.transformation_modules 
              FOR SELECT USING (is_active = true);
            """,
            """
            CREATE POLICY "Admins can manage all modules" ON public.transformation_modules 
              FOR ALL USING (
                EXISTS (
                  SELECT 1 FROM public.admin_users 
                  WHERE id = auth.uid() 
                  AND is_active = true
                )
              );
            """
        ]
        
        for policy_sql in policies_sql:
            try:
                cursor.execute(policy_sql)
                print("Created policy")
            except psycopg2.Error as e:
                if "already exists" in str(e):
                    print("Policy already exists, skipping")
                else:
                    print(f"Error creating policy: {e}")
        
        # Insert sample data
        insert_sql = """
        INSERT INTO public.transformation_modules (title, description, category, estimated_duration_minutes, difficulty_level, content_type, order_index) 
        VALUES 
        ('Autoconhecimento Básico', 'Introdução ao processo de autoconhecimento e reflexão pessoal', 'personal', 20, 'beginner', 'article', 1),
        ('Gestão de Emoções', 'Aprenda a identificar e gerenciar suas emoções de forma saudável', 'personal', 25, 'intermediate', 'exercise', 2),
        ('Relacionamentos Saudáveis', 'Como construir e manter relacionamentos equilibrados', 'relationship', 30, 'intermediate', 'article', 3),
        ('Propósito de Vida', 'Descobrindo seu propósito e direção na vida', 'career', 35, 'advanced', 'article', 4)
        ON CONFLICT (id) DO NOTHING;
        """
        
        cursor.execute(insert_sql)
        print("Inserted sample data")
        
        # Commit changes
        conn.commit()
        
        # Verify data
        cursor.execute("SELECT COUNT(*) as count FROM public.transformation_modules;")
        result = cursor.fetchone()
        print(f"Total modules in database: {result['count']}")
        
        cursor.execute("SELECT title, category, difficulty_level FROM public.transformation_modules ORDER BY order_index;")
        modules = cursor.fetchall()
        
        print("\nModules in database:")
        for module in modules:
            print(f"- {module['title']} ({module['category']}, {module['difficulty_level']})")
        
        print("\nDatabase setup completed successfully!")
        
    except psycopg2.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    setup_database()
