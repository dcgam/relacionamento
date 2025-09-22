import { redirect } from "next/navigation"
import { requireAdminAccess } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { ProgressTracking } from "@/components/admin/progress-tracking"

export default async function AdminProgressPage() {
  try {
    // Check admin access
    const { adminUser } = await requireAdminAccess()

    // Get detailed progress data
    const supabase = await createClient()

    // Get all user progress with user details
    const { data: progressData } = await supabase
      .from("user_progress")
      .select(`
        id,
        user_id,
        step_name,
        step_category,
        status,
        completion_date,
        data,
        notes,
        created_at,
        updated_at,
        profiles!inner(
          email,
          first_name,
          last_name,
          country,
          city,
          motivation_level
        )
      `)
      .order("updated_at", { ascending: false })

    // Get user sessions for activity analysis
    const { data: sessionsData } = await supabase
      .from("user_sessions")
      .select(`
        id,
        user_id,
        session_start,
        session_end,
        duration_minutes,
        pages_visited,
        actions_taken,
        profiles!inner(
          email,
          first_name,
          last_name
        )
      `)
      .order("session_start", { ascending: false })
      .limit(100)

    // Get progress statistics by category
    const { data: categoryStats } = await supabase.rpc("get_progress_stats_by_category")

    return (
      <ProgressTracking
        adminUser={adminUser}
        progressData={progressData || []}
        sessionsData={sessionsData || []}
        categoryStats={categoryStats || []}
      />
    )
  } catch (error) {
    console.error("[v0] Admin access error:", error)
    redirect("/admin/login")
  }
}
