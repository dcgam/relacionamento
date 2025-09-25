"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
  Play,
  Clock,
  Star,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  Lock,
  Heart,
  Target,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface TransformationModule {
  id: string
  title: string
  description: string
  category: string
  estimated_duration_minutes: number
  difficulty_level: "beginner" | "intermediate" | "advanced"
  content_type: "article" | "video" | "exercise" | "meditation"
  content_url: string
  is_active: boolean
  order_index: number
  created_at: string
}

interface UserModuleProgress {
  id: string
  module_id: string
  status: "not_started" | "in_progress" | "completed"
  progress_percentage: number
  started_at: string | null
  completed_at: string | null
  last_accessed_at: string
  notes: string
}

export default function ModulesPage() {
  const [modules, setModules] = useState<TransformationModule[]>([])
  const [userProgress, setUserProgress] = useState<{ [key: string]: UserModuleProgress }>({})
  const [filteredModules, setFilteredModules] = useState<TransformationModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    loadModules()
  }, [])

  useEffect(() => {
    filterModules()
  }, [modules, searchTerm, categoryFilter, difficultyFilter, statusFilter])

  const loadModules = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("transformation_modules")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })

      if (modulesError) throw modulesError

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_module_progress")
        .select("*")
        .eq("user_id", user.id)

      if (progressError) throw progressError

      setModules(modulesData || [])

      // Convert progress array to object for easy lookup
      const progressMap: { [key: string]: UserModuleProgress } = {}
      progressData?.forEach((progress) => {
        progressMap[progress.module_id] = progress
      })
      setUserProgress(progressMap)
    } catch (error) {
      console.error("[v0] Error loading modules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterModules = () => {
    let filtered = modules

    if (searchTerm) {
      filtered = filtered.filter(
        (module) =>
          module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((module) => module.category === categoryFilter)
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter((module) => module.difficulty_level === difficultyFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((module) => {
        const progress = userProgress[module.id]
        if (statusFilter === "completed") return progress?.status === "completed"
        if (statusFilter === "in_progress") return progress?.status === "in_progress"
        if (statusFilter === "not_started") return !progress || progress.status === "not_started"
        return true
      })
    }

    setFilteredModules(filtered)
  }

  const startModule = async (moduleId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    try {
      const { error } = await supabase.from("user_module_progress").upsert({
        user_id: user.id,
        module_id: moduleId,
        status: "in_progress",
        progress_percentage: 0,
        started_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      })

      if (error) throw error

      // Update local state
      setUserProgress({
        ...userProgress,
        [moduleId]: {
          id: "",
          module_id: moduleId,
          status: "in_progress",
          progress_percentage: 0,
          started_at: new Date().toISOString(),
          completed_at: null,
          last_accessed_at: new Date().toISOString(),
          notes: "",
        },
      })
    } catch (error) {
      console.error("[v0] Error starting module:", error)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-green-600 bg-green-50 border-green-200"
      case "intermediate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "advanced":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  const getDifficultyText = (level: string) => {
    switch (level) {
      case "beginner":
        return "Iniciante"
      case "intermediate":
        return "Intermediário"
      case "advanced":
        return "Avançado"
      default:
        return level
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />
      case "article":
        return <BookOpen className="w-4 h-4" />
      case "exercise":
        return <Target className="w-4 h-4" />
      case "meditation":
        return <Heart className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getContentTypeText = (type: string) => {
    switch (type) {
      case "video":
        return "Vídeo"
      case "article":
        return "Artigo"
      case "exercise":
        return "Exercício"
      case "meditation":
        return "Meditação"
      default:
        return type
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "self_esteem":
        return "Autoestima"
      case "relationships":
        return "Relacionamentos"
      case "communication":
        return "Comunicação"
      case "emotional_intelligence":
        return "Inteligência Emocional"
      case "personal_growth":
        return "Crescimento Pessoal"
      case "mindfulness":
        return "Mindfulness"
      default:
        return category
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const completedModules = Object.values(userProgress).filter((p) => p.status === "completed").length
  const inProgressModules = Object.values(userProgress).filter((p) => p.status === "in_progress").length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando módulos de transformação...</p>
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
                <h1 className="text-2xl font-bold text-foreground">Módulos de Transformação</h1>
                <p className="text-sm text-muted-foreground">
                  {modules.length} módulos • {completedModules} concluídos • {inProgressModules} em progresso
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm gradient-purple-light">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{modules.length}</p>
                  <p className="text-sm text-muted-foreground">Módulos Disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedModules}</p>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{inProgressModules}</p>
                  <p className="text-sm text-muted-foreground">Em Progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Progresso Geral</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar módulos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="self_esteem">Autoestima</SelectItem>
                  <SelectItem value="relationships">Relacionamentos</SelectItem>
                  <SelectItem value="communication">Comunicação</SelectItem>
                  <SelectItem value="emotional_intelligence">Int. Emocional</SelectItem>
                  <SelectItem value="personal_growth">Crescimento</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="not_started">Não Iniciados</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        {filteredModules.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((module) => {
              const progress = userProgress[module.id]
              const isCompleted = progress?.status === "completed"
              const isInProgress = progress?.status === "in_progress"
              const isLocked = false // For now, all modules are unlocked

              return (
                <Card
                  key={module.id}
                  className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                    isCompleted ? "ring-2 ring-green-200" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getDifficultyColor(module.difficulty_level)}>
                          {getDifficultyText(module.difficulty_level)}
                        </Badge>
                        <Badge variant="outline">{getCategoryText(module.category)}</Badge>
                      </div>
                      {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                    </div>

                    <CardTitle className="text-lg line-clamp-2 flex items-start space-x-2">
                      <div className="text-primary mt-1">{getContentTypeIcon(module.content_type)}</div>
                      <span>{module.title}</span>
                    </CardTitle>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(module.estimated_duration_minutes)}</span>
                      </div>
                      <span>{getContentTypeText(module.content_type)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="mb-4 line-clamp-3">{module.description}</CardDescription>

                    {progress && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{progress.progress_percentage}%</span>
                        </div>
                        <Progress value={progress.progress_percentage} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {isCompleted ? (
                        <Button variant="outline" className="w-full bg-transparent" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Concluído
                        </Button>
                      ) : isInProgress ? (
                        <Link href={`/modules/${module.id}`} className="w-full">
                          <Button className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            Continuar
                          </Button>
                        </Link>
                      ) : isLocked ? (
                        <Button variant="outline" className="w-full bg-transparent" disabled>
                          <Lock className="w-4 h-4 mr-2" />
                          Bloqueado
                        </Button>
                      ) : (
                        <Button
                          onClick={() => startModule(module.id)}
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Começar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || statusFilter !== "all"
                ? "Nenhum módulo encontrado"
                : "Nenhum módulo disponível"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || statusFilter !== "all"
                ? "Tente ajustar os filtros para encontrar módulos"
                : "Os módulos de transformação aparecerão aqui"}
            </p>
          </div>
        )}

        {/* Motivation Section */}
        {completedModules > 0 && (
          <Card className="border-0 shadow-sm gradient-purple mt-8">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Parabéns pelo seu progresso!</h3>
              <p className="text-white/90 mb-4">
                Você já concluiu {completedModules} {completedModules === 1 ? "módulo" : "módulos"} de transformação.
                Continue assim!
              </p>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {Math.round((completedModules / modules.length) * 100)}% do caminho percorrido
              </Badge>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
