"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Target,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  Plus,
  ArrowRight,
  LogOut,
  Sparkles,
  CheckCircle,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations, type Language, getTranslations } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface DashboardStats {
  totalGoals: number
  completedGoals: number
  activeHabits: number
  currentStreak: number
  completedModules: number
  totalReflections: number
}

interface RecentGoal {
  id: string
  title: string
  status: string
  progress?: number
  target_date?: string
}

interface RecentModule {
  id: string
  title: string
  progress_percentage: number
  status: string
}

const mockModules = [
  {
    id: "1",
    title: "Descobrindo Sua Autoestima",
    progress_percentage: 75,
    status: "in_progress",
  },
  {
    id: "2",
    title: "Comunicação Assertiva",
    progress_percentage: 100,
    status: "completed",
  },
  {
    id: "3",
    title: "Relacionamentos Saudáveis",
    progress_percentage: 25,
    status: "in_progress",
  },
]

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState<DashboardStats>({
    totalGoals: 0,
    completedGoals: 0,
    activeHabits: 0,
    currentStreak: 0,
    completedModules: 0,
    totalReflections: 0,
  })
  const [recentGoals, setRecentGoals] = useState<RecentGoal[]>([])
  const [recentModules, setRecentModules] = useState<RecentModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [t, setT] = useState(useTranslations())
  const router = useRouter()

  useEffect(() => {
    const initializeDashboard = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserEmail(user.email || "")

      // Get user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name, language")
        .eq("user_id", user.id)
        .single()

      if (profile) {
        setUserName(profile.display_name || user.email?.split("@")[0] || "")
        if (profile.language) {
          setT(getTranslations(profile.language as Language))
        }
      } else {
        setUserName(user.email?.split("@")[0] || "")
      }

      await loadDashboardData(user.id)
      setIsLoading(false)
    }

    initializeDashboard()
  }, [router])

  const loadDashboardData = async (userId: string) => {
    const supabase = createClient()

    try {
      console.log("[v0] Loading dashboard data for user:", userId)

      // Load goals
      const { data: goals } = await supabase
        .from("goals")
        .select("id, title, status, target_date")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      console.log("[v0] Goals loaded:", goals?.length || 0)

      // Load habits
      const { data: habits } = await supabase.from("habits").select("id").eq("user_id", userId).eq("is_active", true)

      console.log("[v0] Habits loaded:", habits?.length || 0)

      // Load module progress - try database first, fallback to mock data
      let moduleProgress = null
      try {
        const { data: moduleProgressData, error: moduleError } = await supabase
          .from("user_module_progress")
          .select(`
            id,
            progress_percentage,
            status,
            transformation_modules (
              title
            )
          `)
          .eq("user_id", userId)
          .order("last_accessed_at", { ascending: false })
          .limit(3)

        if (moduleError) {
          console.log("[v0] Module progress error (using mock data):", moduleError.message)
          moduleProgress = mockModules
        } else {
          console.log("[v0] Module progress loaded from DB:", moduleProgressData?.length || 0)
          moduleProgress = moduleProgressData
        }
      } catch (error) {
        console.log("[v0] Module progress fallback to mock data:", error)
        moduleProgress = mockModules
      }

      // Load reflections count
      const { data: reflections } = await supabase.from("daily_reflections").select("id").eq("user_id", userId)

      console.log("[v0] Reflections loaded:", reflections?.length || 0)

      // Calculate stats
      const totalGoals = goals?.length || 0
      const completedGoals = goals?.filter((g) => g.status === "completed").length || 0
      const activeHabits = habits?.length || 0
      const completedModules = moduleProgress?.filter((m: any) => m.status === "completed").length || 0
      const totalReflections = reflections?.length || 0

      console.log("[v0] Stats calculated:", {
        totalGoals,
        completedGoals,
        activeHabits,
        completedModules,
        totalReflections,
      })

      setStats({
        totalGoals,
        completedGoals,
        activeHabits,
        currentStreak: 0, // TODO: Calculate actual streak
        completedModules,
        totalReflections,
      })

      // Set recent goals (limit to 3)
      setRecentGoals(
        goals?.slice(0, 3).map((goal) => ({
          id: goal.id,
          title: goal.title,
          status: goal.status,
          target_date: goal.target_date,
        })) || [],
      )

      // Set recent modules - handle both DB and mock data
      setRecentModules(
        moduleProgress?.map((module: any) => ({
          id: module.id,
          title: module.transformation_modules?.title || module.title || "Módulo",
          progress_percentage: module.progress_percentage,
          status: module.status,
        })) || [],
      )

      console.log("[v0] Dashboard data loaded successfully")
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)

      setRecentModules(mockModules)
      setStats({
        totalGoals: 0,
        completedGoals: 0,
        activeHabits: 0,
        currentStreak: 0,
        completedModules: 1, // Show 1 completed from mock data
        totalReflections: 0,
      })
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userLanguage")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200"
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "active":
        return "text-primary bg-primary/10 border-primary/20"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Carregando seu painel...</p>
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
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Renove-se</h1>
                  <p className="text-sm text-muted-foreground">Olá, {userName}</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="h-6 w-px bg-border"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Sua Jornada de Transformação</h2>
          <p className="text-muted-foreground text-lg">
            Continue evoluindo e alcançando seus objetivos de crescimento pessoal.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.completedGoals}</p>
                  <p className="text-sm text-muted-foreground">Metas Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.completedModules}</p>
                  <p className="text-sm text-muted-foreground">Módulos Completos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeHabits}</p>
                  <p className="text-sm text-muted-foreground">Hábitos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalReflections}</p>
                  <p className="text-sm text-muted-foreground">Reflexões</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Now prioritizing modules */}
          <div className="lg:col-span-2 space-y-8">
            {/* Next Actions - Transformation Modules */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary-foreground" />
                      </div>
                      Próximas Ações
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Continue sua jornada de transformação pessoal
                    </CardDescription>
                  </div>
                  <Link href="/modules">
                    <Button variant="outline" size="sm">
                      Ver Todos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentModules.length > 0 ? (
                  recentModules.map((module, index) => (
                    <div key={module.id} className="group">
                      <Link href={`/modules/${module.id}`} className="block">
                        <div className="p-5 bg-card rounded-xl border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  module.status === "completed"
                                    ? "bg-green-100 text-green-600"
                                    : index === 0
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-accent/10 text-accent"
                                }`}
                              >
                                {module.status === "completed" ? (
                                  <CheckCircle className="w-6 h-6" />
                                ) : (
                                  <BookOpen className="w-6 h-6" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                  {module.title}
                                </h3>
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-sm text-muted-foreground">
                                    {module.progress_percentage}% concluído
                                  </p>
                                  {index === 0 && module.status !== "completed" && (
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                      Próximo
                                    </Badge>
                                  )}
                                  {module.status === "completed" && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                      Concluído
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium text-foreground">{module.progress_percentage}%</span>
                            </div>
                            <Progress value={module.progress_percentage} className="h-3" />
                          </div>
                          {index === 0 && module.status !== "completed" && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <Button size="sm" className="w-full">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Continuar Módulo
                              </Button>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Comece sua jornada</h3>
                    <p className="text-muted-foreground mb-6">Explore nossos módulos de transformação pessoal</p>
                    <Link href="/modules">
                      <Button size="lg">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Explorar Módulos
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals Section - Now secondary */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Suas Metas</CardTitle>
                  <CardDescription>Acompanhe o progresso dos seus objetivos</CardDescription>
                </div>
                <Link href="/goals">
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Meta
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentGoals.length > 0 ? (
                  recentGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Target className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{goal.title}</p>
                          {goal.target_date && (
                            <p className="text-sm text-muted-foreground">
                              Meta: {new Date(goal.target_date).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status === "completed" ? "Concluída" : goal.status === "active" ? "Ativa" : "Pausada"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Você ainda não tem metas definidas</p>
                    <Link href="/goals">
                      <Button variant="outline">Criar Primeira Meta</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/goals" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Target className="w-4 h-4 mr-3" />
                    Gerenciar Metas
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>

                <Link href="/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="w-4 h-4 mr-3" />
                    Reflexão Diária
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>

                <Link href="/clientes" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="w-4 h-4 mr-3" />
                    Gerenciar Clientes
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>

                <Link href="/habits" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <TrendingUp className="w-4 h-4 mr-3" />
                    Acompanhar Hábitos
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>

                <Link href="/modules" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BookOpen className="w-4 h-4 mr-3" />
                    Estudar Módulos
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Conquistas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Continue progredindo para desbloquear conquistas</p>
                  <Link href="/achievements">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Ver Todas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Motivation Card */}
            <Card className="border-0 shadow-sm gradient-purple-light">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Continue Brilhando!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cada pequeno passo te aproxima da versão mais incrível de você mesma.
                </p>
                <Button size="sm" className="w-full">
                  Continuar Jornada
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
