"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  Target,
  Calendar,
  Award,
  ArrowLeft,
  BarChart3,
  PieChartIcon,
  Activity,
  Sparkles,
  CheckCircle,
  Heart,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface AnalyticsData {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  completionRate: number
  totalReflections: number
  currentStreak: number
  averageMoodRating: number
  totalModulesCompleted: number
  totalHabits: number
  activeHabits: number
}

interface ChartData {
  name: string
  value: number
  color?: string
}

interface TimeSeriesData {
  date: string
  goals: number
  reflections: number
  mood: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0,
    completionRate: 0,
    totalReflections: 0,
    currentStreak: 0,
    averageMoodRating: 0,
    totalModulesCompleted: 0,
    totalHabits: 0,
    activeHabits: 0,
  })
  const [goalsByCategory, setGoalsByCategory] = useState<ChartData[]>([])
  const [progressOverTime, setProgressOverTime] = useState<TimeSeriesData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      // Load goals data
      const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user.id)

      // Load reflections data
      const { data: reflections } = await supabase
        .from("daily_reflections")
        .select("*")
        .eq("user_id", user.id)
        .order("reflection_date", { ascending: false })

      // Load module progress
      const { data: moduleProgress } = await supabase.from("user_module_progress").select("*").eq("user_id", user.id)

      // Load habits
      const { data: habits } = await supabase.from("habits").select("*").eq("user_id", user.id)

      // Calculate analytics
      const totalGoals = goals?.length || 0
      const completedGoals = goals?.filter((g) => g.status === "completed").length || 0
      const activeGoals = goals?.filter((g) => g.status === "active").length || 0
      const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

      const totalReflections = reflections?.length || 0
      const averageMoodRating =
        reflections?.length > 0
          ? Math.round((reflections.reduce((sum, r) => sum + (r.mood_rating || 0), 0) / reflections.length) * 10) / 10
          : 0

      const totalModulesCompleted = moduleProgress?.filter((m) => m.status === "completed").length || 0
      const totalHabits = habits?.length || 0
      const activeHabits = habits?.filter((h) => h.is_active).length || 0

      setAnalytics({
        totalGoals,
        completedGoals,
        activeGoals,
        completionRate,
        totalReflections,
        currentStreak: 7, // Mock data for now
        averageMoodRating,
        totalModulesCompleted,
        totalHabits,
        activeHabits,
      })

      // Process goals by category
      const categoryData: { [key: string]: number } = {}
      goals?.forEach((goal) => {
        categoryData[goal.category] = (categoryData[goal.category] || 0) + 1
      })

      const categoryColors = {
        personal: "#8B5CF6",
        relationship: "#EC4899",
        health: "#10B981",
        career: "#F59E0B",
        spiritual: "#6366F1",
      }

      const categoryLabels = {
        personal: "Pessoal",
        relationship: "Relacionamento",
        health: "Saúde",
        career: "Carreira",
        spiritual: "Espiritual",
      }

      setGoalsByCategory(
        Object.entries(categoryData).map(([category, count]) => ({
          name: categoryLabels[category as keyof typeof categoryLabels] || category,
          value: count,
          color: categoryColors[category as keyof typeof categoryColors] || "#8B5CF6",
        })),
      )

      // Generate mock time series data for the last 30 days
      const timeSeriesData: TimeSeriesData[] = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const dateStr = date.toISOString().split("T")[0]
        const dayReflections = reflections?.filter((r) => r.reflection_date === dateStr) || []
        const dayGoalsCompleted =
          goals?.filter((g) => g.completed_at && new Date(g.completed_at).toDateString() === date.toDateString())
            .length || 0

        timeSeriesData.push({
          date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          goals: dayGoalsCompleted,
          reflections: dayReflections.length,
          mood: dayReflections.length > 0 ? dayReflections[0].mood_rating || 0 : 0,
        })
      }

      setProgressOverTime(timeSeriesData)
    } catch (error) {
      console.error("[v0] Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BarChart3 className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando suas análises...</p>
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
                <h1 className="text-2xl font-bold text-foreground">Análise de Progresso</h1>
                <p className="text-sm text-muted-foreground">Acompanhe sua jornada de transformação pessoal</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm gradient-purple-light">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{analytics.completionRate}%</p>
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
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
                  <p className="text-2xl font-bold text-foreground">{analytics.completedGoals}</p>
                  <p className="text-sm text-muted-foreground">Metas Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{analytics.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Dias Consecutivos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{analytics.averageMoodRating}</p>
                  <p className="text-sm text-muted-foreground">Humor Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Over Time */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Progresso ao Longo do Tempo</span>
                </CardTitle>
                <CardDescription>Acompanhe sua evolução nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressOverTime}>
                      <defs>
                        <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorReflections" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="goals"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorGoals)"
                        name="Metas Concluídas"
                      />
                      <Area
                        type="monotone"
                        dataKey="reflections"
                        stroke="#EC4899"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorReflections)"
                        name="Reflexões"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Goals by Category */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  <span>Metas por Categoria</span>
                </CardTitle>
                <CardDescription>Distribuição das suas metas por área de vida</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={goalsByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {goalsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {goalsByCategory.map((category, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-sm text-muted-foreground">
                        {category.name} ({category.value})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-8">
            {/* Achievement Summary */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Resumo de Conquistas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Metas Totais</span>
                  <span className="font-semibold">{analytics.totalGoals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Metas Ativas</span>
                  <span className="font-semibold">{analytics.activeGoals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reflexões Totais</span>
                  <span className="font-semibold">{analytics.totalReflections}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Módulos Completos</span>
                  <span className="font-semibold">{analytics.totalModulesCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hábitos Ativos</span>
                  <span className="font-semibold">{analytics.activeHabits}</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicators */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Indicadores de Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                    <span className="text-sm text-muted-foreground">{analytics.completionRate}%</span>
                  </div>
                  <Progress value={analytics.completionRate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bem-estar Geral</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((analytics.averageMoodRating / 10) * 100)}%
                    </span>
                  </div>
                  <Progress value={(analytics.averageMoodRating / 10) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consistência</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Motivation Card */}
            <Card className="border-0 shadow-sm gradient-purple">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Parabéns pelo Progresso!</h3>
                <p className="text-sm text-white/90 mb-4">
                  Você está no caminho certo para alcançar seus objetivos de transformação pessoal.
                </p>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  +{analytics.completionRate}% este mês
                </Badge>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/goals" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Target className="w-4 h-4 mr-3" />
                    Ver Todas as Metas
                  </Button>
                </Link>

                <Link href="/reflections" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="w-4 h-4 mr-3" />
                    Adicionar Reflexão
                  </Button>
                </Link>

                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Activity className="w-4 h-4 mr-3" />
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
