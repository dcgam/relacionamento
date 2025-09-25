"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  Play,
  Clock,
  ArrowLeft,
  CheckCircle,
  Heart,
  Target,
  Save,
  ExternalLink,
  RotateCcw,
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
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

export default function ModuleDetailPage() {
  const [module, setModule] = useState<TransformationModule | null>(null)
  const [progress, setProgress] = useState<UserModuleProgress | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const router = useRouter()
  const params = useParams()
  const moduleId = params.id as string

  useEffect(() => {
    loadModule()
  }, [moduleId])

  const loadModule = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      // Load module
      const { data: moduleData, error: moduleError } = await supabase
        .from("transformation_modules")
        .select("*")
        .eq("id", moduleId)
        .eq("is_active", true)
        .single()

      if (moduleError) throw moduleError

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_module_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .single()

      setModule(moduleData)
      setProgress(progressData || null)
      setNotes(progressData?.notes || "")

      // Update last accessed time
      if (progressData) {
        await supabase
          .from("user_module_progress")
          .update({ last_accessed_at: new Date().toISOString() })
          .eq("id", progressData.id)
      }
    } catch (error) {
      console.error("[v0] Error loading module:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProgress = async (newProgress: number, newStatus?: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !module) return

    try {
      const updateData: any = {
        progress_percentage: newProgress,
        last_accessed_at: new Date().toISOString(),
      }

      if (newStatus) {
        updateData.status = newStatus
        if (newStatus === "completed") {
          updateData.completed_at = new Date().toISOString()
          updateData.progress_percentage = 100
        }
      }

      if (progress) {
        // Update existing progress
        const { error } = await supabase.from("user_module_progress").update(updateData).eq("id", progress.id)

        if (error) throw error

        setProgress({ ...progress, ...updateData })
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from("user_module_progress")
          .insert({
            user_id: user.id,
            module_id: moduleId,
            status: newStatus || "in_progress",
            started_at: new Date().toISOString(),
            ...updateData,
          })
          .select()
          .single()

        if (error) throw error

        setProgress(data)
      }
    } catch (error) {
      console.error("[v0] Error updating progress:", error)
    }
  }

  const saveNotes = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !progress) return

    setIsSavingNotes(true)

    try {
      const { error } = await supabase.from("user_module_progress").update({ notes }).eq("id", progress.id)

      if (error) throw error

      setProgress({ ...progress, notes })
    } catch (error) {
      console.error("[v0] Error saving notes:", error)
    } finally {
      setIsSavingNotes(false)
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
        return <Play className="w-5 h-5" />
      case "article":
        return <BookOpen className="w-5 h-5" />
      case "exercise":
        return <Target className="w-5 h-5" />
      case "meditation":
        return <Heart className="w-5 h-5" />
      default:
        return <BookOpen className="w-5 h-5" />
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando módulo...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold text-foreground">Módulo não encontrado</h3>
          <Link href="/modules">
            <Button>Voltar aos Módulos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isCompleted = progress?.status === "completed"
  const isInProgress = progress?.status === "in_progress"
  const currentProgress = progress?.progress_percentage || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/modules">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground line-clamp-1">{module.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{getCategoryText(module.category)}</span>
                  <span>•</span>
                  <span>{formatDuration(module.estimated_duration_minutes)}</span>
                </div>
              </div>
            </div>

            {isCompleted && <CheckCircle className="w-6 h-6 text-green-600" />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Module Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-primary">{getContentTypeIcon(module.content_type)}</div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(module.difficulty_level)}>
                      {getDifficultyText(module.difficulty_level)}
                    </Badge>
                    <Badge variant="outline">{getContentTypeText(module.content_type)}</Badge>
                  </div>
                </div>

                <CardTitle className="text-2xl">{module.title}</CardTitle>
                <CardDescription className="text-base">{module.description}</CardDescription>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(module.estimated_duration_minutes)}</span>
                  </div>
                  <span>{getCategoryText(module.category)}</span>
                </div>
              </CardHeader>

              {progress && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Seu Progresso</span>
                      <span className="text-sm text-muted-foreground">{currentProgress}%</span>
                    </div>
                    <Progress value={currentProgress} className="h-3" />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Content Access */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Conteúdo do Módulo</CardTitle>
                <CardDescription>Acesse o material de estudo e complete o módulo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {module.content_url ? (
                  <div className="space-y-4">
                    <Button asChild className="w-full">
                      <a href={module.content_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Acessar {getContentTypeText(module.content_type)}
                      </a>
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      {!isCompleted && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => updateProgress(Math.min(currentProgress + 25, 100))}
                            className="bg-transparent"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            +25% Progresso
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => updateProgress(100, "completed")}
                            className="bg-transparent"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar Completo
                          </Button>
                        </>
                      )}

                      {isCompleted && (
                        <Button
                          variant="outline"
                          onClick={() => updateProgress(0, "in_progress")}
                          className="bg-transparent col-span-2"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Refazer Módulo
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Conteúdo em breve</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Suas Anotações</CardTitle>
                <CardDescription>Registre seus insights e reflexões sobre este módulo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Anotações pessoais</Label>
                  <Textarea
                    id="notes"
                    placeholder="Escreva suas reflexões, aprendizados e insights..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                  />
                </div>

                <Button onClick={saveNotes} disabled={isSavingNotes || !progress}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingNotes ? "Salvando..." : "Salvar Anotações"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress & Actions */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress ? (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{currentProgress}%</div>
                      <p className="text-sm text-muted-foreground">Concluído</p>
                    </div>

                    <Progress value={currentProgress} className="h-3" />

                    <div className="space-y-2 text-sm">
                      {progress.started_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Iniciado em:</span>
                          <span>{new Date(progress.started_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}

                      {progress.completed_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Concluído em:</span>
                          <span>{new Date(progress.completed_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último acesso:</span>
                        <span>{new Date(progress.last_accessed_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">Você ainda não iniciou este módulo</p>
                    <Button onClick={() => updateProgress(0, "in_progress")}>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Módulo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/modules" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BookOpen className="w-4 h-4 mr-3" />
                    Todos os Módulos
                  </Button>
                </Link>

                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Target className="w-4 h-4 mr-3" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Heart className="w-4 h-4 mr-3" />
                    Análise de Progresso
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Completion Celebration */}
            {isCompleted && (
              <Card className="border-0 shadow-sm gradient-purple">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">Parabéns!</h3>
                  <p className="text-sm text-white/90">Você concluiu este módulo com sucesso!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
