import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin-client"

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    // Fetch user progress
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select(`
        *,
        user_profiles!inner(email, display_name)
      `)
      .order("updated_at", { ascending: false })

    if (progressError) {
      console.error("Error fetching progress:", progressError)
    }

    // Calculate statistics
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const totalUsers = profiles?.length || 0
    const newUsersWeek = profiles?.filter((p) => new Date(p.created_at) >= oneWeekAgo).length || 0
    const newUsersMonth = profiles?.filter((p) => new Date(p.created_at) >= oneMonthAgo).length || 0

    const totalCompletions = progressData?.filter((p) => p.status === "completed").length || 0
    const activeUsersWeek = progressData
      ? new Set(progressData.filter((p) => new Date(p.updated_at) >= oneWeekAgo).map((p) => p.user_id)).size
      : 0

    const stats = {
      total_users: totalUsers,
      new_users_week: newUsersWeek,
      new_users_month: newUsersMonth,
      total_completions: totalCompletions,
      active_users_week: activeUsersWeek,
      active_users_month: newUsersMonth,
    }

    // Format recent users
    const recentUsers =
      profiles?.slice(0, 10).map((profile) => ({
        ...profile,
        first_name: profile.display_name || profile.email?.split("@")[0] || "Unknown",
        last_name: "",
      })) || []

    // Format progress summary
    const progressSummary =
      progressData?.map((progress) => ({
        user_id: progress.user_id,
        email: progress.user_profiles?.email || "Unknown",
        protocol_id: progress.protocol_id,
        status: progress.status,
        progress_percentage: progress.progress_percentage,
        profiles: {
          email: progress.user_profiles?.email || "Unknown",
          first_name: progress.user_profiles?.display_name || progress.user_profiles?.email?.split("@")[0] || "Unknown",
          last_name: "",
        },
      })) || []

    return NextResponse.json({
      stats,
      recentUsers,
      progressSummary,
    })
  } catch (error) {
    console.error("Admin dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
