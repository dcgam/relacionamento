"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { ArrowLeft, TrendingUp, Clock, Target, Activity, Calendar, Search, Filter, Download } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminUser {
  id: string
  email: string
  role: string
  is_active: boolean
}

interface ProgressData {
  id: string
  user_id: string
  step_name: string
  step_category: string
  status: string
  completion_date?: string
  data?: any
  notes?: string
  created_at: string
  updated_at: string
  profiles: {
    email: string
    first_name?: string
    last_name?: string
    country?: string
    city?: string
    motivation_level?: number
  }
}

interface SessionData {
  id: string
  user_id: string
  session_start: string
  session_end?: string
  duration_minutes?: number
  pages_visited?: string[]
  actions_taken?: any
  profiles: {
    email: string
    first_name?: string
    last_name?: string
  }
}

interface CategoryStats {
  category: string
  total_steps: number
  completed_steps: number
  in_progress_steps: number
  completion_rate: number
}

interface ProgressTrackingProps {
  adminUser: AdminUser
  progressData: ProgressData[]
  sessionsData: SessionData[]
  categoryStats: CategoryStats[]
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export function ProgressTracking({ adminUser, progressData, sessionsData, categoryStats }: ProgressTrackingProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState("7")
  const router = useRouter()

  const filteredProgress = useMemo(() => {
    return progressData.filter((progress) => {
      const matchesSearch =
        progress.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${progress.profiles.first_name || ""} ${progress.profiles.last_name || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        progress.step_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = filterCategory === "all" || progress.step_category === filterCategory
      const matchesStatus = filterStatus === "all" || progress.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [progressData, searchTerm, filterCategory, filterStatus])

  const recentSessions = useMemo(() => {
    const days = Number.parseInt(dateRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return sessionsData.filter((session) => new Date(session.session_start) >= cutoffDate)
  }, [sessionsData, dateRange])

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

  const getCategoryBadge = (category: string) => {
    const colors = {
      onboarding: "bg-blue-50 text-blue-700 border-blue-200",
      assessment: "bg-purple-50 text-purple-700 border-purple-200",
      program: "bg-green-50 text-green-700 border-green-200",
      milestone: "bg-orange-50 text-orange-700 border-orange-200",
    }

    return (
      <Badge variant="outline" className={colors[category as keyof typeof colors] || "bg-gray-50 text-gray-700"}>
        {category}
      </Badge>
    )
  }

  const getUserDisplayName = (profiles: any) => {
    if (profiles.first_name || profiles.last_name) {
      return `${profiles.first_name || ""} ${profiles.last_name || ""}`.trim()
    }
    return profiles.email
  }

  const exportProgressData = () => {
    const dataStr = JSON.stringify(filteredProgress, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `renove-se-progress-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Prepare chart data
  const categoryChartData = categoryStats.map((stat) => ({
    name: stat.category,
    completados: stat.completed_steps,
    "en progreso": stat.in_progress_steps,
    total: stat.total_steps,
    tasa: stat.completion_rate,
  }))

  const statusDistribution = [
    {
      name: "Completado",
      value: progressData.filter((p) => p.status === "completed").length,
      color: "#10B981",
    },
    {
      name: "En progreso",
      value: progressData.filter((p) => p.status === "in_progress").length,
      color: "#3B82F6",
    },
    {
      name: "No iniciado",
      value: progressData.filter((p) => p.status === "not_started").length,
      color: "#6B7280",
    },
    {
      name: "Omitido",
      value: progressData.filter((p) => p.status === "skipped").length,
      color: "#F59E0B",
    },
  ]

  // Activity over time (last 30 days)
  const activityData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split("T")[0],
        sessions: 0,
        completions: 0,
      }
    })

    recentSessions.forEach((session) => {
      const sessionDate = new Date(session.session_start).toISOString().split("T")[0]
      const dayData = last30Days.find((day) => day.date === sessionDate)
      if (dayData) {
        dayData.sessions++
      }
    })

    progressData
      .filter((p) => p.completion_date)
      .forEach((progress) => {
        const completionDate = new Date(progress.completion_date!).toISOString().split("T")[0]
        const dayData = last30Days.find((day) => day.date === completionDate)
        if (dayData) {
          dayData.completions++
        }
      })

    return last30Days
  }, [recentSessions, progressData])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Seguimiento de Progreso</h1>
                <p className="text-sm text-gray-500">Análisis detallado del progreso de usuarios</p>
              </div>
            </div>
            <Button onClick={exportProgressData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar Datos
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="progress">Progreso Detallado</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Pasos</CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{progressData.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Pasos registrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Completados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {progressData.filter((p) => p.status === "completed").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(
                      (progressData.filter((p) => p.status === "completed").length / progressData.length) * 100,
                    )}
                    % del total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">En Progreso</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {progressData.filter((p) => p.status === "in_progress").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pasos activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Sesiones Recientes</CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{recentSessions.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Últimos {dateRange} días</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Progreso por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completados" fill="#10B981" />
                      <Bar dataKey="en progreso" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Estados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filtros</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="search"
                        placeholder="Usuario o paso..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category-filter">Categoría</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                        <SelectItem value="program">Program</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Estado</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="not_started">No iniciado</SelectItem>
                        <SelectItem value="in_progress">En progreso</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="skipped">Omitido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Table */}
            <Card>
              <CardHeader>
                <CardTitle>Progreso Detallado ({filteredProgress.length} registros)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Paso</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Completado</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProgress.slice(0, 50).map((progress) => (
                        <TableRow key={progress.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{getUserDisplayName(progress.profiles)}</p>
                              <p className="text-sm text-gray-500">{progress.profiles.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{progress.step_name}</p>
                          </TableCell>
                          <TableCell>{getCategoryBadge(progress.step_category)}</TableCell>
                          <TableCell>{getStatusBadge(progress.status)}</TableCell>
                          <TableCell>
                            {progress.completion_date ? (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-sm">
                                  {new Date(progress.completion_date).toLocaleDateString("es-ES")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-600 max-w-xs truncate">{progress.notes || "-"}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Actividad de Usuarios</h3>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="14">Últimos 14 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Diaria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sessions" stroke="#3B82F6" name="Sesiones" />
                    <Line type="monotone" dataKey="completions" stroke="#10B981" name="Completaciones" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sesiones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{getUserDisplayName(session.profiles)}</p>
                        <p className="text-sm text-gray-500">{session.profiles.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(session.session_start).toLocaleDateString("es-ES")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.duration_minutes ? `${session.duration_minutes} min` : "En curso"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tasa de Completación Global</span>
                      <span className="font-bold">
                        {Math.round(
                          (progressData.filter((p) => p.status === "completed").length / progressData.length) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Usuarios Activos (7 días)</span>
                      <span className="font-bold">{new Set(recentSessions.map((s) => s.user_id)).size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Promedio Sesiones por Usuario</span>
                      <span className="font-bold">
                        {(recentSessions.length / new Set(recentSessions.map((s) => s.user_id)).size || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendencias por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats.map((stat) => (
                      <div key={stat.category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{stat.category}</span>
                          <span className="text-sm text-gray-600">{stat.completion_rate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stat.completion_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
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
