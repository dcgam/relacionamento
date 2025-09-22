import { redirect } from "next/navigation"
import { requireAdminAccess } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { UserManagement } from "@/components/admin/user-management"

export default async function AdminUsersPage() {
  try {
    // Check admin access
    const { adminUser } = await requireAdminAccess()

    // Get all users with their profiles and progress
    const supabase = await createClient()

    const { data: users } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        date_of_birth,
        gender,
        country,
        city,
        occupation,
        goals,
        motivation_level,
        preferred_language,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    // Get user progress for each user
    const { data: allProgress } = await supabase.from("user_progress").select(`
        user_id,
        step_name,
        step_category,
        status,
        completion_date,
        data,
        notes
      `)

    // Get user sessions for activity tracking
    const { data: userSessions } = await supabase
      .from("user_sessions")
      .select(`
        user_id,
        session_start,
        session_end,
        duration_minutes,
        pages_visited,
        actions_taken
      `)
      .order("session_start", { ascending: false })

    return (
      <UserManagement
        adminUser={adminUser}
        users={users || []}
        userProgress={allProgress || []}
        userSessions={userSessions || []}
      />
    )
  } catch (error) {
    console.error("[v0] Admin access error:", error)
    redirect("/admin/login")
  }
}
