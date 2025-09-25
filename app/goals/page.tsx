"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Plus, Calendar, Edit, Trash2, CheckCircle, Clock, ArrowLeft, Filter, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Goal {
  id: string
  title: string
  description: string
  category: string
  status: "active" | "completed" | "paused"
  priority: "low" | "medium" | "high"
  target_date: string
  progress_percentage: number
  created_at: string
  updated_at: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    loadGoals()
  }, [])

  useEffect(() => {
    filterGoals()
  }, [goals, searchTerm, statusFilter, categoryFilter])

  const loadGoals = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setGoals(data || [])
    } catch (error) {
      console.error("[v0] Error loading goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterGoals = () => {
    let filtered = goals

    if (searchTerm) {
      filtered = filtered.filter(
        (goal) =>
          goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          goal.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((goal) => goal.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((goal) => goal.category === categoryFilter)
    }

    setFilteredGoals(filtered)
  }

  const deleteGoal = async (goalId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId)

      if (error) throw error

      setGoals(goals.filter((goal) => goal.id !== goalId))
    } catch (error) {
      console.error("[v0] Error deleting goal:", error)
    }
  }

  const toggleGoalStatus = async (goalId: string, currentStatus: string) => {
    const supabase = createClient()
    const newStatus = currentStatus === "completed" ? "active" : "completed"
    const newProgress = newStatus === "completed" ? 100 : 0

    try {
      const { error } = await supabase
        .from("goals")
        .update({
          status: newStatus,
          progress_percentage: newProgress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", goalId)

      if (error) throw error

      setGoals(
        goals.map((goal) =>
          goal.id === goalId ? { ...goal, status: newStatus as any, progress_percentage: newProgress } : goal,
        ),
      )
    } catch (error) {
      console.error("[v0] Error updating goal status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200"
      case "active":
        return "text-primary bg-primary/10 border-primary/20"
      case "paused":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída"
      case "active":
        return "Ativa"
      case "paused":
        return "Pausada"
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Média"
      case "low":
        return "Baixa"
      default:
        return priority
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "personal":
        return "Pessoal"
      case "relationship":
        return "Relacionamento"
      case "health":
        return "Saúde"
      case "career":
        return "Carreira"
      case "spiritual":
        return "Espiritual"
      default:
        return category
    }
  }

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date() && new Date(targetDate).toDateString() !== new Date().toDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Target className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando suas metas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Suas Metas</h1>
                <p className="text-sm text-muted-foreground">
                  {goals.length} {goals.length === 1 ? "meta" : "metas"} •{" "}
                  {goals.filter((g) => g.status === "completed").length} concluídas
                </p>
              </div>
            </div>

            <Link href="/goals/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar metas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="paused">Pausadas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="personal">Pessoal</SelectItem>
                  <SelectItem value="relationship">Relacionamento</SelectItem>
                  <SelectItem value="health">Saúde</SelectItem>
                  <SelectItem value="career">Carreira</SelectItem>
                  <SelectItem value="spiritual">Espiritual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(goal.status)}>{getStatusText(goal.status)}</Badge>
                      <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                        {getPriorityText(goal.priority)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Link href={`/goals/${goal.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteGoal(goal.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{getCategoryText(goal.category)}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span className={isOverdue(goal.target_date) ? "text-red-600" : ""}>
                        {new Date(goal.target_date).toLocaleDateString("pt-BR")}
                      </span>
                      {isOverdue(goal.target_date) && goal.status !== "completed" && (
                        <Badge variant="destructive" className="text-xs">
                          Atrasada
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="mb-4 line-clamp-3">{goal.description}</CardDescription>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{goal.progress_percentage}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleGoalStatus(goal.id, goal.status)}
                        className="bg-transparent"
                      >
                        {goal.status === "completed" ? (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            Reativar
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Concluir
                          </>
                        )}
                      </Button>

                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(goal.updated_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "Nenhuma meta encontrada"
                : "Você ainda não tem metas"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "Tente ajustar os filtros para encontrar suas metas"
                : "Comece definindo seus objetivos e acompanhe seu progresso"}
            </p>
            <Link href="/goals/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
