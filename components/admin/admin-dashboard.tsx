"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  TrendingUp,
  Activity,
  Calendar,
  User,
  MapPin,
  Heart,
  LogOut,
  Settings,
  BarChart3,
  UserCheck,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AdminUser {
  id: string
  email: string
  role: string
  is_active: boolean
}

interface Stats {
  total_users: number
  new_users_week: number
  new_users_month: number
  total_completions: number
  active_users_week: number
  active_users_month: number
}

interface RecentUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  created_at: string
  updated_at: string
  country?: string
  city?: string
  goals?: string[]
  motivation_level?: number
}

interface ProgressSummary {
  user_id: string
  step_category: string
  status: string
  profiles: {
    email: string
    first_name?: string
    last_name?: string
  }
}

interface AdminDashboardProps {
  adminUser: AdminUser
  stats: Stats | null
  recentUsers: RecentUser[]
  progressSummary: ProgressSummary[]
}

export function AdminDashboard({ adminUser, stats, recentUsers, progressSummary }: AdminDashboardProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()

    try {
      await supabase.auth.signOut()
      router.push("/admin/login")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not_started":
        return <Badge variant="secondary">No iniciado</Badge>
      case "in_progress":
        return <Badge variant="default">En progreso</Badge>
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completado
          </Badge>
        )
      case "skipped":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Omitido
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getUserDisplayName = (user: RecentUser) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim()
    }
    return user.email
  }

  const getProgressByCategory = (category: string) => {
    return progressSummary.filter((p) => p.step_category === category)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                  <p className="text-sm text-gray-500">Renove-se</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser.email}</p>
                <p className="text-xs text-gray-500 capitalize">{adminUser.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-600 hover:text-gray-900 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "Saliendo..." : "Salir"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Nuevos esta semana</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.new_users_week || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Últimos 7 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Usuarios activos</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.active_users_week || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Activos esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completaciones</CardTitle>
              <UserCheck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.total_completions || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Pasos completados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Usuarios Recientes</TabsTrigger>
            <TabsTrigger value="progress">Progreso por Categoría</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Usuarios Recientes</span>
                </CardTitle>
                <CardDescription>Los últimos usuarios registrados en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay usuarios registrados</p>
                    </div>
                  ) : (
                    recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getUserDisplayName(user)}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.country && (
                              <div className="flex items-center space-x-1 mt-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {user.city ? `${user.city}, ${user.country}` : user.country}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(user.created_at).toLocaleDateString("es-ES")}</span>
                          </div>
                          {user.motivation_level && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Heart className="w-3 h-3 text-red-500" />
                              <span className="text-xs text-gray-500">Motivación: {user.motivation_level}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding</CardTitle>
                  <CardDescription>Progreso en el proceso de incorporación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getProgressByCategory("onboarding").map((progress, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {progress.profiles.first_name || progress.profiles.email}
                          </p>
                          <p className="text-xs text-gray-500">{progress.profiles.email}</p>
                        </div>
                        {getStatusBadge(progress.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evaluaciones</CardTitle>
                  <CardDescription>Progreso en evaluaciones iniciales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getProgressByCategory("assessment").map((progress, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {progress.profiles.first_name || progress.profiles.email}
                          </p>
                          <p className="text-xs text-gray-500">{progress.profiles.email}</p>
                        </div>
                        {getStatusBadge(progress.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Análisis de Actividad</span>
                </CardTitle>
                <CardDescription>Métricas de actividad y engagement de usuarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Tasa de Retención Semanal</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {stats?.active_users_week && stats?.total_users
                        ? Math.round((stats.active_users_week / stats.total_users) * 100)
                        : 0}
                      %
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {stats?.active_users_week || 0} de {stats?.total_users || 0} usuarios
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Crecimiento Mensual</h4>
                    <p className="text-2xl font-bold text-green-600 mt-2">{stats?.new_users_month || 0}</p>
                    <p className="text-sm text-green-700 mt-1">Nuevos usuarios este mes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
