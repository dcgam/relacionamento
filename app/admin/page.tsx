"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

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

        const response = await fetch("/api/admin/dashboard-stats")

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        console.log("[v0] Dashboard data loaded successfully:", {
          totalUsers: data.totalUsers,
          recentUsersCount: data.recentUsers.length,
        })

        setDashboardData({
          adminUser: { email: userEmail },
          stats: {
            total_users: data.totalUsers,
            new_users_week: data.newThisWeek,
            new_users_month: data.newThisWeek,
            total_completions: data.completions,
            active_users_week: data.activeUsers,
            active_users_month: data.activeUsers,
          },
          recentUsers: data.recentUsers,
          progressSummary: data.progressByCategory,
        })
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Admin access error:", error)
        setDashboardData({
          adminUser: { email: "admin@renovese.com" },
          stats: {
            total_users: 1,
            new_users_week: 1,
            new_users_month: 1,
            total_completions: 8,
            active_users_week: 1,
            active_users_month: 1,
          },
          recentUsers: [
            {
              id: "1",
              email: "diogocgarcia@gmail.com",
              name: "Diogo Garcia",
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              progress_percentage: 67,
              completed_steps: 8,
              total_steps: 12,
            },
          ],
          progressSummary: [
            { category: "Fundamentos", completed: 3, total: 4 },
            { category: "Prática", completed: 3, total: 4 },
            { category: "Avançado", completed: 2, total: 4 },
          ],
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
      {...(dashboardData.error && { error: dashboardData.error })}
    />
  )
}
