-- Create function to get progress statistics by category
CREATE OR REPLACE FUNCTION get_progress_stats_by_category()
RETURNS TABLE (
  category TEXT,
  total_steps BIGINT,
  completed_steps BIGINT,
  in_progress_steps BIGINT,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.step_category as category,
    COUNT(*) as total_steps,
    COUNT(*) FILTER (WHERE up.status = 'completed') as completed_steps,
    COUNT(*) FILTER (WHERE up.status = 'in_progress') as in_progress_steps,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE up.status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0
    END as completion_rate
  FROM public.user_progress up
  GROUP BY up.step_category
  ORDER BY completion_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_progress_stats_by_category() TO authenticated;

-- Create function to get user engagement metrics
CREATE OR REPLACE FUNCTION get_user_engagement_metrics(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_users BIGINT,
  active_users BIGINT,
  avg_session_duration NUMERIC,
  total_sessions BIGINT,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(DISTINCT id) FROM auth.users) as total_users,
    (SELECT COUNT(DISTINCT user_id) 
     FROM public.user_sessions 
     WHERE session_start >= NOW() - INTERVAL '1 day' * days_back) as active_users,
    (SELECT COALESCE(AVG(duration_minutes), 0) 
     FROM public.user_sessions 
     WHERE session_start >= NOW() - INTERVAL '1 day' * days_back 
     AND duration_minutes IS NOT NULL) as avg_session_duration,
    (SELECT COUNT(*) 
     FROM public.user_sessions 
     WHERE session_start >= NOW() - INTERVAL '1 day' * days_back) as total_sessions,
    (SELECT 
       CASE 
         WHEN COUNT(*) > 0 THEN 
           ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
         ELSE 0
       END
     FROM public.user_progress) as completion_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_engagement_metrics(INTEGER) TO authenticated;

-- Create view for admin analytics
CREATE OR REPLACE VIEW admin_analytics_summary AS
SELECT 
  'users' as metric_type,
  'total_registered' as metric_name,
  COUNT(*)::TEXT as metric_value,
  NOW() as calculated_at
FROM auth.users

UNION ALL

SELECT 
  'progress' as metric_type,
  'total_steps' as metric_name,
  COUNT(*)::TEXT as metric_value,
  NOW() as calculated_at
FROM public.user_progress

UNION ALL

SELECT 
  'progress' as metric_type,
  'completed_steps' as metric_name,
  COUNT(*)::TEXT as metric_value,
  NOW() as calculated_at
FROM public.user_progress
WHERE status = 'completed'

UNION ALL

SELECT 
  'sessions' as metric_type,
  'total_sessions' as metric_name,
  COUNT(*)::TEXT as metric_value,
  NOW() as calculated_at
FROM public.user_sessions

UNION ALL

SELECT 
  'sessions' as metric_type,
  'active_users_7d' as metric_name,
  COUNT(DISTINCT user_id)::TEXT as metric_value,
  NOW() as calculated_at
FROM public.user_sessions
WHERE session_start >= NOW() - INTERVAL '7 days';

-- Grant access to admin analytics view
GRANT SELECT ON admin_analytics_summary TO authenticated;

-- Create RLS policy for admin analytics
CREATE POLICY "admin_analytics_summary_select" ON admin_analytics_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.id = auth.uid() AND au.is_active = true
    )
  );
