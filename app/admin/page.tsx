"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { createClient } from "@/lib/supabase/client"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log("[v0] Checking admin access...")

        // Check localStorage for admin session
        const adminSession = localStorage.getItem("adminSession")
        const userEmail = localStorage.getItem("userEmail")

        if (!adminSession || adminSession !== "true" || userEmail !== "admin@renovese.com") {
          console.log("[v0] No valid admin session found")
          router.push("/login")
          return
        }

        console.log("[v0] Admin session verified, loading dashboard data...")

        const supabase = createClient()

        console.log("[v0] Fetching user profiles data...")
        const {
          data: allProfiles,
          error: profilesError,
          count: totalCount,
        } = await supabase
          .from("user_profiles")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })

        console.log("[v0] User profiles query result:", {
          data: allProfiles,
          error: profilesError,
          count: totalCount,
          dataLength: allProfiles?.length,
        })

        let profiles = allProfiles || []

        if (profilesError) {
          console.error("[v0] Error fetching user profiles:", profilesError)
          // Try alternative method - direct auth users query
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
          console.log("[v0] Auth users fallback:", { authUsers, authError })

          if (authUsers?.users) {
            profiles = authUsers.users.map((user) => ({
              id: user.id,
              user_id: user.id,
              email: user.email,
              display_name: user.email?.split("@")[0] || "Unknown",
              created_at: user.created_at,
              updated_at: user.updated_at,
            }))
          }
        }

        console.log("[v0] Fetching user progress...")
        const { data: progressData, error: progressError } = await supabase
          .from("user_progress")
          .select(`
            *,
            user_profiles!inner(email, display_name)
          `)
          .order("updated_at", { ascending: false })

        console.log("[v0] Progress query result:", {
          data: progressData,
          error: progressError,
          count: progressData?.length,
        })

        // Calculate statistics from the data we have
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const totalUsers = profiles.length
        const newUsersWeek = profiles.filter((p) => new Date(p.created_at) >= oneWeekAgo).length
        const newUsersMonth = profiles.filter((p) => new Date(p.created_at) >= oneMonthAgo).length

        const totalCompletions = progressData ? progressData.filter((p) => p.status === "completed").length : 0
        const activeUsersWeek = progressData
          ? new Set(progressData.filter((p) => new Date(p.updated_at) >= oneWeekAgo).map((p) => p.user_id)).size
          : 0

        const stats = {
          total_users: totalUsers,
          new_users_week: newUsersWeek,
          new_users_month: newUsersMonth,
          total_completions: totalCompletions,
          active_users_week: activeUsersWeek,
          active_users_month: newUsersMonth, // Approximation
        }

        console.log("[v0] Calculated stats:", stats)

        // Get recent users (limit to 10)
        const recentUsers = profiles.slice(0, 10).map((profile) => ({
          ...profile,
          first_name: profile.display_name || profile.email?.split("@")[0] || "Unknown",
          last_name: "",
        }))

        console.log("[v0] Recent users:", recentUsers)

        const progressSummary = progressData
          ? progressData.map((progress) => ({
              user_id: progress.user_id,
              email: progress.user_profiles?.email || "Unknown",
              protocol_id: progress.protocol_id,
              status: progress.status,
              progress_percentage: progress.progress_percentage,
              profiles: {
                email: progress.user_profiles?.email || "Unknown",
                first_name:
                  progress.user_profiles?.display_name || progress.user_profiles?.email?.split("@")[0] || "Unknown",
                last_name: "",
              },
            }))
          : []

        console.log("[v0] Final dashboard data:", {
          totalUsers,
          recentUsersCount: recentUsers.length,
          progressCount: progressSummary.length,
        })

        setDashboardData({
          adminUser: { email: userEmail },
          stats,
          recentUsers,
          progressSummary,
        })
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Admin access error:", error)
        setDashboardData({
          adminUser: { email: "admin@renovese.com" },
          stats: {
            total_users: 0,
            new_users_week: 0,
            new_users_month: 0,
            total_completions: 0,
            active_users_week: 0,
            active_users_month: 0,
          },
          recentUsers: [],
          progressSummary: [],
          error: error.message,
        })
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Erro ao carregar dados do painel</p>
        </div>
      </div>
    )
  }

  return (
    <AdminDashboard
      adminUser={dashboardData.adminUser}
      stats={dashboardData.stats}
      recentUsers={dashboardData.recentUsers}
      progressSummary={dashboardData.progressSummary}
      error={dashboardData.error}
    />
  )
}
