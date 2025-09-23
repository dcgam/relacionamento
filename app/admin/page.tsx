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

        // Get dashboard data
        const supabase = createClient()

        // Get total users count
        const { count: totalUsers, error: countError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        if (countError) {
          console.error("[v0] Error counting users:", countError)
        }

        console.log("[v0] Total users found:", totalUsers)

        // Get users created in the last week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const { count: newUsersWeek, error: weekError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", oneWeekAgo.toISOString())

        if (weekError) {
          console.error("[v0] Error counting weekly users:", weekError)
        }

        // Get users created in the last month
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

        const { count: newUsersMonth, error: monthError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", oneMonthAgo.toISOString())

        if (monthError) {
          console.error("[v0] Error counting monthly users:", monthError)
        }

        // Create stats object with real data
        const stats = {
          total_users: totalUsers || 0,
          new_users_week: newUsersWeek || 0,
          new_users_month: newUsersMonth || 0,
          total_completions: 0, // Will be calculated when we have progress data
          active_users_week: newUsersWeek || 0, // Using new users as proxy for active users
          active_users_month: newUsersMonth || 0,
        }

        console.log("[v0] Calculated stats:", stats)

        // Get recent users with their profiles
        const { data: recentUsers, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10)

        if (usersError) {
          console.error("[v0] Error fetching users:", usersError)
        } else {
          console.log("[v0] Recent users found:", recentUsers?.length || 0)
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
            console.log("[v0] Progress table not found, using empty data:", progressError.message)
          } else {
            progressSummary = progressData || []
            console.log("[v0] Progress data found:", progressSummary.length)
          }
        } catch (error) {
          console.error("[v0] Error fetching progress:", error)
        }

        console.log("[v0] Admin dashboard data loaded successfully")

        setDashboardData({
          adminUser: { email: userEmail },
          stats,
          recentUsers: recentUsers || [],
          progressSummary,
        })
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Admin access error:", error)
        router.push("/login")
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
    />
  )
}
