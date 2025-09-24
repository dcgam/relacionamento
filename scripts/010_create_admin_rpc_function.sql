-- Criar função RPC para admin acessar dados
CREATE OR REPLACE FUNCTION public.get_all_profiles_for_admin()
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  phone text,
  date_of_birth date,
  gender text,
  country text,
  city text,
  occupation text,
  goals text[],
  motivation_level integer,
  preferred_language text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return all profiles for admin access
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.date_of_birth,
    p.gender,
    p.country,
    p.city,
    p.occupation,
    p.goals,
    p.motivation_level,
    p.preferred_language,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_all_profiles_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_for_admin() TO anon;
