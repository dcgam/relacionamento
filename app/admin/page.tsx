import { redirect } from "next/navigation"
import { requireAdminAccess } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  try {
    // Check admin access
    const { adminUser } = await requireAdminAccess()

    // Get dashboard data
    const supabase = await createClient()

    // Get user statistics
    const { data: stats } = await supabase.from("admin_dashboard_stats").select("*").single()

    // Get recent users with their profiles
    const { data: recentUsers } = await supabase
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

    // Get user progress summary
    const { data: progressSummary } = await supabase.from("user_progress").select(`
        user_id,
        step_category,
        status,
        profiles!inner(email, first_name, last_name)
      `)

    return (
      <AdminDashboard
        adminUser={adminUser}
        stats={stats}
        recentUsers={recentUsers || []}
        progressSummary={progressSummary || []}
      />
    )
  } catch (error) {
    console.error("[v0] Admin access error:", error)
    redirect("/admin/login")
  }
}
