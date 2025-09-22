"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Target,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface AdminUser {
  id: string
  email: string
  role: string
  is_active: boolean
}

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  date_of_birth?: string
  gender?: string
  country?: string
  city?: string
  occupation?: string
  goals?: string[]
  motivation_level?: number
  preferred_language?: string
  created_at: string
  updated_at: string
}

interface UserProgress {
  user_id: string
  step_name: string
  step_category: string
  status: string
  completion_date?: string
  data?: any
  notes?: string
}

interface UserSession {
  user_id: string
  session_start: string
  session_end?: string
  duration_minutes?: number
  pages_visited?: string[]
  actions_taken?: any
}

interface UserManagementProps {
  adminUser: AdminUser
  users: UserProfile[]
  userProgress: UserProgress[]
  userSessions: UserSession[]
}

export function UserManagement({ adminUser, users, userProgress, userSessions }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const router = useRouter()

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase().includes(searchTerm.toLowerCase())

      if (filterStatus === "all") return matchesSearch

      const userProgressData = userProgress.filter((p) => p.user_id === user.id)
      const hasCompletedSteps = userProgressData.some((p) => p.status === "completed")
      const hasInProgressSteps = userProgressData.some((p) => p.status === "in_progress")

      if (filterStatus === "active" && hasInProgressSteps) return matchesSearch
      if (filterStatus === "completed" && hasCompletedSteps) return matchesSearch
      if (filterStatus === "inactive" && !hasInProgressSteps && !hasCompletedSteps) return matchesSearch

      return false
    })
  }, [users, searchTerm, filterStatus, userProgress])

  const getUserProgress = (userId: string) => {
    return userProgress.filter((p) => p.user_id === userId)
  }

  const getUserSessions = (userId: string) => {
    return userSessions.filter((s) => s.user_id === userId)
  }

  const getProgressStats = (userId: string) => {
    const progress = getUserProgress(userId)
    const total = progress.length
    const completed = progress.filter((p) => p.status === "completed").length
    const inProgress = progress.filter((p) => p.status === "in_progress").length

    return { total, completed, inProgress, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  const getLastActivity = (userId: string) => {
    const sessions = getUserSessions(userId)
    if (sessions.length === 0) return null

    const lastSession = sessions[0] // Already sorted by session_start desc
    return new Date(lastSession.session_start)
  }

  const getUserDisplayName = (user: UserProfile) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim()
    }
    return user.email
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

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          phone: editingUser.phone,
          country: editingUser.country,
          city: editingUser.city,
          occupation: editingUser.occupation,
          motivation_level: editingUser.motivation_level,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingUser.id)

      if (error) throw error

      // Refresh the page to show updated data
      router.refresh()
      setIsEditDialogOpen(false)
      setEditingUser(null)
    } catch (error) {
      console.error("[v0] Error updating user:", error)
    }
  }

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
                <h1 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-sm text-gray-500">Administrar perfiles y progreso de usuarios</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros y Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar usuarios</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Buscar por email o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="status-filter">Estado</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="completed">Con completaciones</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Usuarios ({filteredUsers.length})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Última actividad</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const stats = getProgressStats(user.id)
                    const lastActivity = getLastActivity(user.id)

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
                              {user.motivation_level && (
                                <p className="text-xs text-gray-400">Motivación: {user.motivation_level}/10</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.country ? (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {user.city ? `${user.city}, ${user.country}` : user.country}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No especificado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${stats.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{stats.percentage}%</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {stats.completed}/{stats.total} completados
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lastActivity ? (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{lastActivity.toLocaleDateString("es-ES")}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Sin actividad</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(user.created_at).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalles del Usuario</DialogTitle>
                                  <DialogDescription>
                                    Información completa y progreso de {getUserDisplayName(user)}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-6">
                                    {/* User Info */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <h4 className="font-medium mb-2">Información Personal</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{selectedUser.email}</span>
                                          </div>
                                          {selectedUser.phone && (
                                            <div className="flex items-center space-x-2">
                                              <Phone className="w-4 h-4 text-gray-400" />
                                              <span>{selectedUser.phone}</span>
                                            </div>
                                          )}
                                          {selectedUser.date_of_birth && (
                                            <div className="flex items-center space-x-2">
                                              <Calendar className="w-4 h-4 text-gray-400" />
                                              <span>
                                                {new Date(selectedUser.date_of_birth).toLocaleDateString("es-ES")}
                                              </span>
                                            </div>
                                          )}
                                          {selectedUser.occupation && (
                                            <div className="flex items-center space-x-2">
                                              <Target className="w-4 h-4 text-gray-400" />
                                              <span>{selectedUser.occupation}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Objetivos</h4>
                                        <div className="space-y-1">
                                          {selectedUser.goals && selectedUser.goals.length > 0 ? (
                                            selectedUser.goals.map((goal, index) => (
                                              <Badge key={index} variant="secondary" className="mr-1 mb-1">
                                                {goal}
                                              </Badge>
                                            ))
                                          ) : (
                                            <span className="text-sm text-gray-500">No especificados</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Progress */}
                                    <div>
                                      <h4 className="font-medium mb-2">Progreso por Pasos</h4>
                                      <div className="space-y-2">
                                        {getUserProgress(selectedUser.id).map((progress, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                          >
                                            <div>
                                              <p className="text-sm font-medium">{progress.step_name}</p>
                                              <p className="text-xs text-gray-500 capitalize">
                                                {progress.step_category}
                                              </p>
                                            </div>
                                            {getStatusBadge(progress.status)}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>Modificar información del usuario</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    value={editingUser.first_name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={editingUser.last_name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={editingUser.phone || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={editingUser.country || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={editingUser.city || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="motivation_level">Nivel de Motivación (1-10)</Label>
                  <Input
                    id="motivation_level"
                    type="number"
                    min="1"
                    max="10"
                    value={editingUser.motivation_level || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, motivation_level: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveUser}>Guardar Cambios</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
