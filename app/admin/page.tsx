import { redirect } from "next/navigation"
import { requireAdminAccess } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  try {
    // Log attempting admin access check
    console.log("[v0] Attempting admin access check...")

    // Check admin access
    const { adminUser } = await requireAdminAccess()
    console.log("[v0] Admin access granted for:", adminUser.email)

    // Get dashboard data
    const supabase = await createClient()

    // Get user statistics with fallback
    let stats = null
    try {
      const { data: statsData, error: statsError } = await supabase.from("admin_dashboard_stats").select("*").single()

      if (statsError) {
        console.log("[v0] Stats table not found, using fallback data")
        // Create fallback stats
        const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        stats = {
          total_users: totalUsers || 0,
          new_users_week: 0,
          new_users_month: 0,
          total_completions: 0,
          active_users_week: 0,
          active_users_month: 0,
        }
      } else {
        stats = statsData
      }
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
      stats = {
        total_users: 0,
        new_users_week: 0,
        new_users_month: 0,
        total_completions: 0,
        active_users_week: 0,
        active_users_month: 0,
      }
    }

    // Get recent users with their profiles
    const { data: recentUsers, error: usersError } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        first_name,
        last_name,
        created_at,
        updated_at,
        country,
        city,
        goals,
        motivation_level
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (usersError) {
      console.error("[v0] Error fetching users:", usersError)
    }

    // Get user progress summary with error handling
    let progressSummary = []
    try {
      const { data: progressData, error: progressError } = await supabase.from("user_progress").select(`
          user_id,
          step_category,
          status,
          profiles!inner(email, first_name, last_name)
        `)

      if (progressError) {
        console.log("[v0] Progress table not found, using empty data")
      } else {
        progressSummary = progressData || []
      }
    } catch (error) {
      console.error("[v0] Error fetching progress:", error)
    }

    console.log("[v0] Admin dashboard data loaded successfully")

    return (
      <AdminDashboard
        adminUser={adminUser}
        stats={stats}
        recentUsers={recentUsers || []}
        progressSummary={progressSummary}
      />
    )
  } catch (error) {
    console.error("[v0] Admin access error:", error)
    redirect("/admin/login")
  }
}
