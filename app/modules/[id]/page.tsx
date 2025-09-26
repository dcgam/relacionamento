"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Play, Clock, ArrowLeft, CheckCircle, Heart, Target, Save } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { parse } from "marked"

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

interface ModuleSection {
  id: string
  module_id: string
  title: string
  content: string
  section_type: "text" | "video" | "exercise" | "reflection" | "quiz"
  order_index: number
  estimated_duration_minutes: number
  is_active: boolean
}

const mockTransformationModules = [
  {
    id: "1",
    title: "Descobrindo Sua Autoestima",
    description:
      "Aprenda a reconhecer e valorizar suas qualidades únicas. Este módulo te guiará através de exercícios práticos para desenvolver uma autoestima saudável.",
    category: "self_esteem",
    estimated_duration_minutes: 45,
    difficulty_level: "beginner" as const,
    content_type: "article" as const,
    content_url: "",
    is_active: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Comunicação Assertiva",
    description:
      "Desenvolva habilidades para se expressar com clareza e confiança. Aprenda técnicas de comunicação que fortalecem seus relacionamentos.",
    category: "communication",
    estimated_duration_minutes: 60,
    difficulty_level: "intermediate" as const,
    content_type: "video" as const,
    content_url: "",
    is_active: true,
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Relacionamentos Saudáveis",
    description:
      "Construa conexões mais profundas e significativas. Descubra como criar e manter relacionamentos que nutrem seu crescimento pessoal.",
    category: "relationships",
    estimated_duration_minutes: 50,
    difficulty_level: "intermediate" as const,
    content_type: "exercise" as const,
    content_url: "",
    is_active: true,
    order_index: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Inteligência Emocional",
    description:
      "Compreenda e gerencie suas emoções de forma eficaz. Desenvolva a capacidade de reconhecer e regular suas emoções e as dos outros.",
    category: "emotional_intelligence",
    estimated_duration_minutes: 40,
    difficulty_level: "advanced" as const,
    content_type: "article" as const,
    content_url: "",
    is_active: true,
    order_index: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Mindfulness Diário",
    description:
      "Pratique a atenção plena para reduzir o estresse. Incorpore técnicas de mindfulness em sua rotina diária para maior bem-estar.",
    category: "mindfulness",
    estimated_duration_minutes: 30,
    difficulty_level: "beginner" as const,
    content_type: "meditation" as const,
    content_url: "",
    is_active: true,
    order_index: 5,
    created_at: new Date().toISOString(),
  },
]

export default function ModuleDetailPage() {
  const [module, setModule] = useState<TransformationModule | null>(null)
  const [sections, setSections] = useState<ModuleSection[]>([])
  const [progress, setProgress] = useState<UserModuleProgress | null>(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
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
      console.log("[v0] Loading module and sections for:", moduleId)

      // Load module - try database first, fallback to mock data
      let moduleData = null
      let sectionsData = []

      try {
        const { data: dbModule, error: moduleError } = await supabase
          .from("transformation_modules")
          .select("*")
          .eq("id", moduleId)
          .eq("is_active", true)
          .single()

        if (moduleError) {
          console.log("[v0] Module not found in DB, using mock data")
          // Find mock module
          moduleData = mockTransformationModules.find((m) => m.id === moduleId)
        } else {
          moduleData = dbModule
        }

        // Load sections from database
        const { data: dbSections, error: sectionsError } = await supabase
          .from("module_sections")
          .select("*")
          .eq("module_id", moduleId)
          .eq("is_active", true)
          .order("order_index", { ascending: true })

        if (!sectionsError && dbSections) {
          sectionsData = dbSections
          console.log("[v0] Loaded sections from DB:", sectionsData.length)
        } else {
          console.log("[v0] No sections found in DB, creating default content")
          // Create default section from module description
          if (moduleData) {
            sectionsData = [
              {
                id: "default-1",
                module_id: moduleId,
                title: "Conteúdo Principal",
                content: moduleData.description + "\n\n" + getDefaultContent(moduleData.content_type),
                section_type: moduleData.content_type === "video" ? "video" : "text",
                order_index: 1,
                estimated_duration_minutes: moduleData.estimated_duration_minutes,
                is_active: true,
              },
            ]
          }
        }
      } catch (error) {
        console.log("[v0] Database error, using mock data:", error)
        moduleData = mockTransformationModules.find((m) => m.id === moduleId)
        if (moduleData) {
          sectionsData = [
            {
              id: "mock-1",
              module_id: moduleId,
              title: "Conteúdo Principal",
              content: moduleData.description + "\n\n" + getDefaultContent(moduleData.content_type),
              section_type: moduleData.content_type === "video" ? "video" : "text",
              order_index: 1,
              estimated_duration_minutes: moduleData.estimated_duration_minutes,
              is_active: true,
            },
          ]
        }
      }

      if (!moduleData) {
        console.error("[v0] Module not found:", moduleId)
        setIsLoading(false)
        return
      }

      // Load user progress
      let progressData = null
      try {
        const { data: dbProgress, error: progressError } = await supabase
          .from("user_module_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("module_id", moduleId)
          .single()

        if (!progressError) {
          progressData = dbProgress
        }
      } catch (error) {
        console.log("[v0] Progress not found, will create when user starts")
      }

      setModule(moduleData)
      setSections(sectionsData)
      setProgress(progressData || null)
      setNotes(progressData?.notes || "")

      // Update last accessed time if progress exists
      if (progressData) {
        await supabase
          .from("user_module_progress")
          .update({ last_accessed_at: new Date().toISOString() })
          .eq("id", progressData.id)
      }

      console.log("[v0] Module loaded successfully with", sectionsData.length, "sections")
    } catch (error) {
      console.error("[v0] Error loading module:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultContent = (contentType: string) => {
    switch (contentType) {
      case "video":
        return `## Assista ao Vídeo

Este módulo contém conteúdo em vídeo para seu aprendizado.

**Instruções:**
1. Assista ao vídeo com atenção
2. Faça anotações dos pontos principais
3. Pratique os exercícios sugeridos

*Tempo estimado: ${module?.estimated_duration_minutes || 20} minutos*`

      case "exercise":
        return `## Exercício Prático

Este módulo contém exercícios práticos para aplicar o conhecimento.

**Como fazer:**
1. Leia as instruções cuidadosamente
2. Reserve um tempo tranquilo para o exercício
3. Seja honesto(a) em suas respostas
4. Anote suas reflexões

*Tempo estimado: ${module?.estimated_duration_minutes || 20} minutos*`

      case "meditation":
        return `## Prática de Meditação

Este módulo oferece uma prática guiada de meditação.

**Preparação:**
1. Encontre um local silencioso
2. Sente-se confortavelmente
3. Respire profundamente algumas vezes
4. Siga as instruções da prática

*Duração: ${module?.estimated_duration_minutes || 20} minutos*`

      default:
        return `## Conteúdo do Módulo

Bem-vindo(a) a este módulo de transformação pessoal.

**O que você vai aprender:**
- Conceitos fundamentais sobre o tema
- Técnicas práticas para aplicar no dia a dia
- Exercícios de reflexão e autoconhecimento

**Como aproveitar melhor:**
1. Leia com atenção todo o conteúdo
2. Faça as anotações que julgar importantes
3. Pratique os exercícios sugeridos
4. Reflita sobre como aplicar em sua vida

*Tempo estimado de leitura: ${module?.estimated_duration_minutes || 20} minutos*`
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

  const getSectionTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />
      case "text":
        return <BookOpen className="w-4 h-4" />
      case "exercise":
        return <Target className="w-4 h-4" />
      case "reflection":
        return <Heart className="w-4 h-4" />
      case "quiz":
        return <Target className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getSectionTypeText = (type: string) => {
    switch (type) {
      case "text":
        return "Texto"
      case "video":
        return "Vídeo"
      case "exercise":
        return "Exercício"
      case "reflection":
        return "Reflexão"
      case "quiz":
        return "Quiz"
      default:
        return type
    }
  }

  const convertToEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }

    // Vimeo
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0]
      return `https://player.vimeo.com/video/${videoId}`
    }

    return null
  }

  const parseMarkdown = (text: string) => {
    return parse(text)
  }

  const renderSectionContent = (section: ModuleSection) => {
    const content = section.content

    // Check if content contains video embed (YouTube, Vimeo, etc.)
    const videoRegex =
      /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|player\.vimeo\.com\/video\/)([a-zA-Z0-9_-]+)/g
    const videoMatch = content.match(videoRegex)

    // Check if content contains links
    const linkRegex = /\[([^\]]+)\]$$([^)]+)$$/g
    const hasLinks = linkRegex.test(content)

    return (
      <div className="space-y-6">
        {/* Video Embed */}
        {videoMatch && (
          <div className="space-y-4">
            {videoMatch.map((url, index) => {
              const embedUrl = convertToEmbedUrl(url)
              if (embedUrl) {
                return (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )
              }
              return null
            })}
          </div>
        )}

        {/* Text Content with Markdown support */}
        <div className="prose prose-lg max-w-none">
          <div
            className="whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(content),
            }}
          />
        </div>

        {/* Section Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{getSectionTypeText(section.section_type)}</Badge>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{section.estimated_duration_minutes} min</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentSectionIndex > 0 && (
              <Button variant="outline" onClick={() => setCurrentSectionIndex(currentSectionIndex - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}

            {currentSectionIndex < sections.length - 1 ? (
              <Button
                onClick={() => {
                  setCurrentSectionIndex(currentSectionIndex + 1)
                  updateProgress(Math.min(((currentSectionIndex + 1) / sections.length) * 100, 100))
                }}
              >
                Próxima
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            ) : (
              <Button onClick={() => updateProgress(100, "completed")} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluir Módulo
              </Button>
            )}
          </div>
        </div>
      </div>
    )
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
  const currentProgress = progress?.progress_percentage || 0
  const currentSection = sections[currentSectionIndex]

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
                  <span>
                    Seção {currentSectionIndex + 1} de {sections.length}
                  </span>
                  <span>•</span>
                  <span>{currentSection?.title}</span>
                </div>
              </div>
            </div>

            {isCompleted && <CheckCircle className="w-6 h-6 text-green-600" />}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso do Módulo</span>
              <span className="font-medium">{Math.round(currentProgress)}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Section */}
            {currentSection && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getSectionTypeIcon(currentSection.section_type)}
                    <span>{currentSection.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderSectionContent(currentSection)}</CardContent>
              </Card>
            )}

            {/* Notes Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Suas Anotações</CardTitle>
                <CardDescription>Registre seus insights sobre este módulo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Escreva suas reflexões, aprendizados e insights..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <Button onClick={saveNotes} disabled={isSavingNotes || !progress}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingNotes ? "Salvando..." : "Salvar Anotações"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Navigation & Progress */}
          <div className="space-y-6">
            {/* Sections Navigation */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Seções</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSectionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      index === currentSectionIndex
                        ? "bg-primary text-primary-foreground border-primary"
                        : index < currentSectionIndex
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs font-medium">
                        {index < currentSectionIndex ? <CheckCircle className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{section.title}</p>
                        <p className="text-xs opacity-75">{section.estimated_duration_minutes} min</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!progress && (
                  <Button onClick={() => updateProgress(0, "in_progress")} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Módulo
                  </Button>
                )}

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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
