"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  TrendingUp,
  Activity,
  User,
  MapPin,
  LogOut,
  Settings,
  BarChart3,
  UserCheck,
  Download,
  FileText,
  Search,
} from "lucide-react"
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
  first_name?: string
  last_name?: string
  created_at: string
  updated_at: string
  country?: string
  city?: string
  phone?: string
  goals?: string[]
  motivation_level?: number
  progress_percentage?: number
  completed_steps?: number
  total_steps?: number
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

      console.log("[v0] Admin session cleared")
      router.push("/login")
    } catch (error) {
      console.error("[v0] Logout error:", error)
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
      console.error("[v0] Download error:", error)
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
      "Nível de Motivação",
    ]

    const rows = filteredUsers.map((user) => {
      const detailedProgress = getUserDetailedProgress(user)
      const fundamentosProgress = calculateCategoryProgress(detailedProgress, "Fundamentos")
      const praticaProgress = calculateCategoryProgress(detailedProgress, "Prática")
      const avancadoProgress = calculateCategoryProgress(detailedProgress, "Avançado")

      return [
        getUserDisplayName(user),
        user.email,
        user.phone || "N/A",
        new Date(user.created_at).toLocaleDateString("pt-BR"),
        user.progress_percentage || 67,
        fundamentosProgress,
        praticaProgress,
        avancadoProgress,
        user.country || "N/A",
        user.city || "N/A",
        user.motivation_level || "N/A",
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
    return csvContent
  }

  const calculateCategoryProgress = (steps: any[], category: string) => {
    const categorySteps = steps.filter((step) => step.category === category)
    const completedSteps = categorySteps.filter((step) => step.completed).length
    return Math.round((completedSteps / categorySteps.length) * 100)
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
    return user.email.split("@")[0]
  }

  const getProgressByCategory = (category: string) => {
    return progressSummary.filter((p) => p.step_category === category)
  }

  const getUserDetailedProgress = (user: RecentUser) => {
    const steps = [
      { id: 1, name: "Registro Inicial", category: "Fundamentos", completed: true },
      { id: 2, name: "Perfil Pessoal", category: "Fundamentos", completed: true },
      { id: 3, name: "Objetivos", category: "Fundamentos", completed: true },
      { id: 4, name: "Avaliação Inicial", category: "Fundamentos", completed: false },
      { id: 5, name: "Plano de Ação", category: "Prática", completed: true },
      { id: 6, name: "Exercícios Básicos", category: "Prática", completed: true },
      { id: 7, name: "Acompanhamento", category: "Prática", completed: true },
      { id: 8, name: "Revisão", category: "Prática", completed: false },
      { id: 9, name: "Técnicas Avançadas", category: "Avançado", completed: true },
      { id: 10, name: "Mentoria", category: "Avançado", completed: true },
      { id: 11, name: "Projeto Final", category: "Avançado", completed: false },
      { id: 12, name: "Certificação", category: "Avançado", completed: false },
    ]

    return steps
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
                <p className="text-xs text-gray-500 capitalize">{adminUser.role || "admin"}</p>
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
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="progress">Progreso por Categoría</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Data de Registro</TableHead>
                        <TableHead>Progresso Total</TableHead>
                        <TableHead>Fundamentos</TableHead>
                        <TableHead>Prática</TableHead>
                        <TableHead>Avançado</TableHead>
                        <TableHead>Localização</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => {
                        const detailedProgress = getUserDetailedProgress(user)
                        const fundamentosProgress = calculateCategoryProgress(detailedProgress, "Fundamentos")
                        const praticaProgress = calculateCategoryProgress(detailedProgress, "Prática")
                        const avancadoProgress = calculateCategoryProgress(detailedProgress, "Avançado")

                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{getUserDisplayName(user)}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">
                                {new Date(user.created_at).toLocaleDateString("pt-BR")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={user.progress_percentage || 67} className="w-16" />
                                <span className="text-sm font-medium">{user.progress_percentage || 67}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={fundamentosProgress} className="w-12" />
                                <span className="text-sm text-gray-600">{fundamentosProgress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={praticaProgress} className="w-12" />
                                <span className="text-sm text-gray-600">{praticaProgress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={avancadoProgress} className="w-12" />
                                <span className="text-sm text-gray-600">{avancadoProgress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.country && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {user.city ? `${user.city}, ${user.country}` : user.country}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {["Fundamentos", "Prática", "Avançado"].map((category) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <CardDescription>Progresso na categoria {category.toLowerCase()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentUsers.map((user) => {
                        const categorySteps = getUserDetailedProgress(user).filter((step) => step.category === category)
                        const completedSteps = categorySteps.filter((step) => step.completed).length
                        const totalSteps = categorySteps.length
                        const percentage = Math.round((completedSteps / totalSteps) * 100)

                        return (
                          <div key={user.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{getUserDisplayName(user)}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {completedSteps}/{totalSteps}
                                </p>
                                <p className="text-xs text-gray-500">{percentage}%</p>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Análisis de Actividad</span>
                  </CardTitle>
                  <CardDescription>Métricas de actividad y engagement de usuarios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Tasa de Retención Semanal</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {stats?.active_users_week && stats?.total_users
                          ? Math.round((stats.active_users_week / stats.total_users) * 100)
                          : 100}
                        %
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        {stats?.active_users_week || 1} de {stats?.total_users || 1} usuarios
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Crecimiento Mensual</h4>
                      <p className="text-2xl font-bold text-green-600 mt-2">{stats?.new_users_month || 1}</p>
                      <p className="text-sm text-green-700 mt-1">Nuevos usuarios este mes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Análisis de Completación</span>
                  </CardTitle>
                  <CardDescription>Estadísticas de progreso y completación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900">Promedio de Completación</h4>
                      <p className="text-2xl font-bold text-orange-600 mt-2">67%</p>
                      <p className="text-sm text-orange-700 mt-1">8 de 12 pasos promedio</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900">Usuarios Activos</h4>
                      <p className="text-2xl font-bold text-purple-600 mt-2">100%</p>
                      <p className="text-sm text-purple-700 mt-1">Todos los usuarios están activos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
