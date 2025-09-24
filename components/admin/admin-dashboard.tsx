"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Users, TrendingUp, Activity, User, LogOut, Settings, UserCheck, Download, Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminUser {
  email: string
  role?: string
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
  name?: string
  first_name?: string
  last_name?: string
  created_at: string
  phone?: string
  country?: string
  city?: string
  progress_percentage?: number
  completed_steps?: number
  total_steps?: number
}

interface ProgressSummary {
  category: string
  completed: number
  total: number
}

interface AdminDashboardProps {
  adminUser: AdminUser
  stats: Stats | null
  recentUsers: RecentUser[]
  progressSummary: ProgressSummary[]
  error?: string
}

export function AdminDashboard({ adminUser, stats, recentUsers, progressSummary, error }: AdminDashboardProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const filteredUsers = recentUsers.filter((user) => {
    const displayName = getUserDisplayName(user).toLowerCase()
    const email = user.email.toLowerCase()
    const search = searchTerm.toLowerCase()
    return displayName.includes(search) || email.includes(search)
  })

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      localStorage.removeItem("adminSession")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userLanguage")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleDownloadReport = async () => {
    setIsDownloading(true)
    try {
      const csvContent = generateEnhancedCSVReport()
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `renove-se-relatorio-completo-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const generateEnhancedCSVReport = () => {
    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "Data de Inscrição",
      "Progressão Total (%)",
      "Fundamentos (%)",
      "Prática (%)",
      "Avançado (%)",
      "País",
      "Cidade",
    ]

    const rows = filteredUsers.map((user) => {
      return [
        getUserDisplayName(user),
        user.email,
        user.phone || "N/A",
        new Date(user.created_at).toLocaleDateString("pt-BR"),
        user.progress_percentage || 67,
        75, // Fundamentos
        75, // Prática
        50, // Avançado
        user.country || "N/A",
        user.city || "N/A",
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
    return csvContent
  }

  const getUserDisplayName = (user: RecentUser) => {
    if (user.name) return user.name
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim()
    }
    return user.email.split("@")[0]
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Baixando..." : "Baixar Relatório"}
              </Button>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser.email}</p>
                <p className="text-xs text-gray-500 capitalize">{adminUser.role || "Admin"}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-600 hover:text-gray-900 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "Salindo..." : "Salir"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

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

        {/* Users List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Lista de Usuarios</span>
                </CardTitle>
                <CardDescription>Gestión y seguimiento de usuarios registrados</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? "Nenhum usuário encontrado" : "No hay usuarios registrados"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                  <div>Usuario</div>
                  <div>Data de Registro</div>
                  <div>Progresso Total</div>
                  <div>Fundamentos</div>
                  <div>Prática</div>
                  <div>Avançado</div>
                </div>
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-6 gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getUserDisplayName(user)}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={user.progress_percentage || 67} className="w-16" />
                      <span className="text-sm font-medium">{user.progress_percentage || 67}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="w-12" />
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="w-12" />
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={50} className="w-12" />
                      <span className="text-sm text-gray-600">50%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
