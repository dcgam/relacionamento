"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  Settings,
  BookOpen,
  Play,
  Target,
  Heart,
  Clock,
  Users,
  Copy,
  FileText,
  Video,
  CheckSquare,
  MessageCircle,
  ExternalLink,
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

interface ModuleConfiguration {
  id: string
  module_id: string
  prerequisites: string[]
  unlock_criteria: any
  completion_requirements: any
  tags: string[]
  featured: boolean
}

interface ContentTemplate {
  id: string
  name: string
  description: string
  template_type: string
  content_template: string
  variables: any
  is_active: boolean
}

const mockModules: TransformationModule[] = [
  {
    id: "1",
    title: "Autoconhecimento Básico",
    description: "Introdução ao processo de autoconhecimento e reflexão pessoal",
    category: "personal",
    estimated_duration_minutes: 20,
    difficulty_level: "beginner",
    content_type: "article",
    content_url: "",
    is_active: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Gestão de Emoções",
    description: "Aprenda a identificar e gerenciar suas emoções de forma saudável",
    category: "personal",
    estimated_duration_minutes: 25,
    difficulty_level: "intermediate",
    content_type: "exercise",
    content_url: "",
    is_active: true,
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Relacionamentos Saudáveis",
    description: "Como construir e manter relacionamentos equilibrados",
    category: "relationship",
    estimated_duration_minutes: 30,
    difficulty_level: "intermediate",
    content_type: "article",
    content_url: "",
    is_active: true,
    order_index: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Propósito de Vida",
    description: "Descobrindo seu propósito e direção na vida",
    category: "career",
    estimated_duration_minutes: 35,
    difficulty_level: "advanced",
    content_type: "article",
    content_url: "",
    is_active: true,
    order_index: 4,
    created_at: new Date().toISOString(),
  },
]

export default function ContentEditorPage() {
  const [modules, setModules] = useState<TransformationModule[]>([])
  const [selectedModule, setSelectedModule] = useState<TransformationModule | null>(null)
  const [sections, setSections] = useState<ModuleSection[]>([])
  const [configuration, setConfiguration] = useState<ModuleConfiguration | null>(null)
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("modules")
  const [editingModule, setEditingModule] = useState<TransformationModule | null>(null)
  const [editingSection, setEditingSection] = useState<ModuleSection | null>(null)
  const [showModuleDialog, setShowModuleDialog] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    try {
      console.log("[v0] Loading modules and templates...")

      // Load modules from database first, then fallback to mock data
      let modulesData = []

      try {
        const { data: dbModules, error: modulesError } = await supabase
          .from("transformation_modules")
          .select("*")
          .order("order_index", { ascending: true })

        if (!modulesError && dbModules && dbModules.length > 0) {
          modulesData = dbModules
          console.log("[v0] Loaded modules from database:", modulesData.length)
        } else {
          console.log("[v0] No modules in database, creating from mock data")
          // Insert mock modules into database for admin editing
          for (const mockModule of mockModules) {
            const { error: insertError } = await supabase
              .from("transformation_modules")
              .insert({
                id: mockModule.id,
                title: mockModule.title,
                description: mockModule.description,
                category: mockModule.category,
                estimated_duration_minutes: mockModule.estimated_duration_minutes,
                difficulty_level: mockModule.difficulty_level,
                content_type: mockModule.content_type,
                content_url: mockModule.content_url,
                is_active: mockModule.is_active,
                order_index: mockModule.order_index,
              })
              .select()
              .single()

            if (!insertError) {
              // Create default section for each module
              await supabase.from("module_sections").insert({
                module_id: mockModule.id,
                title: "Conteúdo Principal",
                content: getDefaultSectionContent(mockModule),
                section_type: mockModule.content_type === "video" ? "video" : "text",
                order_index: 1,
                estimated_duration_minutes: mockModule.estimated_duration_minutes,
                is_active: true,
              })
            }
          }

          // Reload after inserting
          const { data: newDbModules } = await supabase
            .from("transformation_modules")
            .select("*")
            .order("order_index", { ascending: true })

          modulesData = newDbModules || mockModules
        }
      } catch (error) {
        console.log("[v0] Database not available, using mock data")
        modulesData = mockModules
      }

      // Load templates
      let templatesData = []
      try {
        const { data, error: templatesError } = await supabase
          .from("content_templates")
          .select("*")
          .eq("is_active", true)

        if (!templatesError && data) {
          templatesData = data
        }
      } catch (error) {
        console.warn("[v0] Content templates not available yet")
      }

      console.log("[v0] Loaded templates:", templatesData.length)

      setModules(modulesData)
      setTemplates(templatesData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      setModules(mockModules)
      setTemplates([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadModuleDetails = async (moduleId: string) => {
    const supabase = createClient()

    try {
      console.log("[v0] Loading details for module:", moduleId)

      // Load sections - handle case where table might not exist yet
      let sectionsData = []
      try {
        const { data, error: sectionsError } = await supabase
          .from("module_sections")
          .select("*")
          .eq("module_id", moduleId)
          .order("order_index", { ascending: true })

        if (sectionsError) {
          console.warn("[v0] Module sections table not found")
        } else {
          sectionsData = data || []
        }
      } catch (error) {
        console.warn("[v0] Module sections not available yet")
      }

      // Load configuration - handle case where table might not exist yet
      let configData = null
      try {
        const { data, error: configError } = await supabase
          .from("module_configurations")
          .select("*")
          .eq("module_id", moduleId)
          .single()

        if (configError && configError.code !== "PGRST116") {
          console.warn("[v0] Module configurations table not found")
        } else {
          configData = data
        }
      } catch (error) {
        console.warn("[v0] Module configurations not available yet")
      }

      console.log("[v0] Loaded sections:", sectionsData.length)
      setSections(sectionsData)
      setConfiguration(configData)
    } catch (error) {
      console.error("[v0] Error loading module details:", error)
    }
  }

  const saveModule = async (moduleData: Partial<TransformationModule>) => {
    const supabase = createClient()

    try {
      if (editingModule?.id) {
        // Update existing module
        const { error } = await supabase.from("transformation_modules").update(moduleData).eq("id", editingModule.id)

        if (error) throw error
      } else {
        // Create new module
        const { error } = await supabase.from("transformation_modules").insert(moduleData)

        if (error) throw error
      }

      await loadData()
      setShowModuleDialog(false)
      setEditingModule(null)
    } catch (error) {
      console.error("[v0] Error saving module:", error)
    }
  }

  const saveSection = async (sectionData: Partial<ModuleSection>) => {
    const supabase = createClient()

    try {
      if (editingSection?.id) {
        // Update existing section
        const { error } = await supabase.from("module_sections").update(sectionData).eq("id", editingSection.id)

        if (error) throw error
      } else {
        // Create new section
        const { error } = await supabase.from("module_sections").insert({
          ...sectionData,
          module_id: selectedModule?.id,
          order_index: sections.length + 1,
        })

        if (error) throw error
      }

      if (selectedModule) {
        await loadModuleDetails(selectedModule.id)
      }
      setShowSectionDialog(false)
      setEditingSection(null)
    } catch (error) {
      console.error("[v0] Error saving section:", error)
    }
  }

  const deleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza que deseja deletar este módulo? Esta ação não pode ser desfeita.")) {
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.from("transformation_modules").delete().eq("id", moduleId)

      if (error) throw error

      await loadData()
      if (selectedModule?.id === moduleId) {
        setSelectedModule(null)
        setSections([])
        setConfiguration(null)
      }
    } catch (error) {
      console.error("[v0] Error deleting module:", error)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta seção?")) {
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.from("module_sections").delete().eq("id", sectionId)

      if (error) throw error

      if (selectedModule) {
        await loadModuleDetails(selectedModule.id)
      }
    } catch (error) {
      console.error("[v0] Error deleting section:", error)
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

  const getSectionTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "exercise":
        return <Target className="w-4 h-4" />
      case "reflection":
        return <MessageCircle className="w-4 h-4" />
      case "quiz":
        return <CheckSquare className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "relationship":
        return "Relacionamentos"
      case "personal":
        return "Desenvolvimento Pessoal"
      case "health":
        return "Saúde e Bem-estar"
      case "career":
        return "Carreira e Propósito"
      case "spiritual":
        return "Crescimento Espiritual"
      default:
        return category
    }
  }

  const getDefaultSectionContent = (module: TransformationModule) => {
    const baseContent = `# ${module.title}

${module.description}

## Objetivos deste módulo

Ao completar este módulo, você será capaz de:
- Compreender os conceitos fundamentais
- Aplicar as técnicas na prática
- Desenvolver novas habilidades
- Refletir sobre seu crescimento pessoal

## Conteúdo Principal

`

    switch (module.content_type) {
      case "video":
        return (
          baseContent +
          `
### Assista ao vídeo

*Cole aqui a URL do vídeo do YouTube ou Vimeo*

**Instruções:**
1. Assista ao vídeo com atenção
2. Faça anotações dos pontos principais
3. Pratique os exercícios sugeridos

### Reflexão

Após assistir ao vídeo, reflita sobre:
- Quais pontos mais chamaram sua atenção?
- Como você pode aplicar isso em sua vida?
- Que mudanças você gostaria de implementar?

*Tempo estimado: ${module.estimated_duration_minutes} minutos*`
        )

      case "exercise":
        return (
          baseContent +
          `
### Exercício Prático

**Instruções:**
1. Reserve um tempo tranquilo para este exercício
2. Seja honesto(a) em suas respostas
3. Não há respostas certas ou erradas
4. Anote suas reflexões no final

**Exercício:**

*Descreva aqui o exercício específico*

### Questões para Reflexão

1. O que você descobriu sobre si mesmo?
2. Que padrões você consegue identificar?
3. Que ações você pode tomar a partir dessas descobertas?

*Tempo estimado: ${module.estimated_duration_minutes} minutos*`
        )

      case "meditation":
        return (
          baseContent +
          `
### Prática de Meditação

**Preparação:**
1. Encontre um local silencioso e confortável
2. Sente-se com a coluna ereta
3. Respire profundamente algumas vezes
4. Feche os olhos suavemente

**Prática Guiada:**

*Descreva aqui a prática de meditação específica*

### Após a Prática

Reserve alguns minutos para:
- Observar como você se sente
- Anotar qualquer insight ou sensação
- Agradecer por este momento de cuidado consigo

*Duração: ${module.estimated_duration_minutes} minutos*`
        )

      default:
        return (
          baseContent +
          `
### Conceitos Fundamentais

*Desenvolva aqui o conteúdo principal do módulo*

### Técnicas Práticas

*Descreva técnicas que o usuário pode aplicar*

### Exercícios de Aplicação

*Inclua exercícios práticos relacionados ao tema*

### Para Saber Mais

*Adicione recursos adicionais, links úteis ou leituras complementares*

[Link para recurso adicional](https://exemplo.com)

### Reflexão Final

*Inclua questões para reflexão e autoavaliação*

*Tempo estimado de leitura: ${module.estimated_duration_minutes} minutos*`
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Settings className="w-16 h-16 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">Carregando editor de conteúdo...</p>
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
              <Link href="/admin-panel">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Editor de Conteúdo</h1>
                <p className="text-sm text-muted-foreground">Gerencie módulos, seções e configurações do programa</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {modules.length} Módulos
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {templates.length} Templates
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modules">Módulos</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gerenciar Módulos</h2>
              <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingModule(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Módulo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <DialogHeader>
                    <DialogTitle>{editingModule ? "Editar Módulo" : "Criar Novo Módulo"}</DialogTitle>
                    <DialogDescription>Configure as informações básicas do módulo de transformação</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[75vh] overflow-y-auto px-1">
                    <ModuleForm
                      module={editingModule}
                      onSave={saveModule}
                      onCancel={() => {
                        setShowModuleDialog(false)
                        setEditingModule(null)
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className={`border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    selectedModule?.id === module.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedModule(module)
                    loadModuleDetails(module.id)
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getDifficultyColor(module.difficulty_level)}>
                          {getDifficultyText(module.difficulty_level)}
                        </Badge>
                        <Badge variant="outline">{getCategoryText(module.category)}</Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingModule(module)
                            setShowModuleDialog(true)
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteModule(module.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <CardTitle className="text-lg line-clamp-2 flex items-start space-x-2">
                      <div className="text-primary mt-1">{getContentTypeIcon(module.content_type)}</div>
                      <span>{module.title}</span>
                    </CardTitle>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{module.estimated_duration_minutes} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>#{module.order_index}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-3 mb-4">{module.description}</CardDescription>

                    <div className="flex items-center justify-between">
                      <Badge variant={module.is_active ? "default" : "secondary"}>
                        {module.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                      {selectedModule?.id === module.id && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Selecionado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {selectedModule ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedModule.title}</h2>
                    <p className="text-sm text-muted-foreground">Gerencie o conteúdo e seções deste módulo</p>
                  </div>
                  <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingSection(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Seção
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>{editingSection ? "Editar Seção" : "Criar Nova Seção"}</DialogTitle>
                        <DialogDescription>Configure o conteúdo da seção do módulo</DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[80vh] overflow-y-auto px-1">
                        <SectionForm
                          section={editingSection}
                          templates={templates}
                          onSave={saveSection}
                          onCancel={() => {
                            setShowSectionDialog(false)
                            setEditingSection(null)
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <Card key={section.id} className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">{index + 1}</span>
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center space-x-2">
                                {getSectionTypeIcon(section.section_type)}
                                <span>{section.title}</span>
                              </CardTitle>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {section.section_type}
                                </Badge>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{section.estimated_duration_minutes} min</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingSection(section)
                                setShowSectionDialog(true)
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteSection(section.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-muted-foreground line-clamp-3 whitespace-pre-line">
                            {section.content.substring(0, 200)}...
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {sections.length === 0 && (
                    <Card className="border-dashed border-2 border-muted">
                      <CardContent className="p-8 text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma seção criada</h3>
                        <p className="text-muted-foreground mb-4">Comece criando a primeira seção deste módulo</p>
                        <Button onClick={() => setShowSectionDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Primeira Seção
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="p-12 text-center">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Selecione um módulo</h3>
                  <p className="text-muted-foreground mb-6">
                    Escolha um módulo na aba "Módulos" para editar seu conteúdo
                  </p>
                  <Button onClick={() => setActiveTab("modules")}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Ver Módulos
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Templates de Conteúdo</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{template.template_type}</Badge>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded line-clamp-3">
                      {template.content_template.substring(0, 100)}...
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Module Form Component
function ModuleForm({
  module,
  onSave,
  onCancel,
}: {
  module: TransformationModule | null
  onSave: (data: Partial<TransformationModule>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: module?.title || "",
    description: module?.description || "",
    category: module?.category || "personal",
    estimated_duration_minutes: module?.estimated_duration_minutes || 15,
    difficulty_level: module?.difficulty_level || "beginner",
    content_type: module?.content_type || "article",
    content_url: module?.content_url || "",
    is_active: module?.is_active ?? true,
    order_index: module?.order_index || 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relationship">Relacionamentos</SelectItem>
              <SelectItem value="personal">Desenvolvimento Pessoal</SelectItem>
              <SelectItem value="health">Saúde e Bem-estar</SelectItem>
              <SelectItem value="career">Carreira e Propósito</SelectItem>
              <SelectItem value="spiritual">Crescimento Espiritual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Dificuldade</Label>
          <Select
            value={formData.difficulty_level}
            onValueChange={(value: any) => setFormData({ ...formData, difficulty_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante</SelectItem>
              <SelectItem value="intermediate">Intermediário</SelectItem>
              <SelectItem value="advanced">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content_type">Tipo</Label>
          <Select
            value={formData.content_type}
            onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">Artigo</SelectItem>
              <SelectItem value="video">Vídeo</SelectItem>
              <SelectItem value="exercise">Exercício</SelectItem>
              <SelectItem value="meditation">Meditação</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duração (min)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.estimated_duration_minutes}
            onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: Number.parseInt(e.target.value) })}
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="content_url">URL do Conteúdo</Label>
          <Input
            id="content_url"
            value={formData.content_url}
            onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Ordem</Label>
          <Input
            id="order"
            type="number"
            value={formData.order_index}
            onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value) })}
            min="1"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Módulo ativo</Label>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>
    </form>
  )
}

// Section Form Component
function SectionForm({
  section,
  templates,
  onSave,
  onCancel,
}: {
  section: ModuleSection | null
  templates: ContentTemplate[]
  onSave: (data: Partial<ModuleSection>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: section?.title || "",
    content: section?.content || "",
    section_type: section?.section_type || "text",
    estimated_duration_minutes: section?.estimated_duration_minutes || 5,
    is_active: section?.is_active ?? true,
  })

  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFormData({
        ...formData,
        content: template.content_template,
      })
    }
  }

  const insertVideoEmbed = () => {
    const videoUrl = prompt("Cole a URL do vídeo (YouTube, Vimeo):")
    if (videoUrl) {
      const embedText = `\n\n## Vídeo\n\n${videoUrl}\n\n`
      setFormData({
        ...formData,
        content: formData.content + embedText,
      })
    }
  }

  const insertLink = () => {
    const linkText = prompt("Texto do link:")
    const linkUrl = prompt("URL do link:")
    if (linkText && linkUrl) {
      const linkMarkdown = `[${linkText}](${linkUrl})`
      setFormData({
        ...formData,
        content: formData.content + linkMarkdown,
      })
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="section-title">Título da Seção</Label>
          <Input
            id="section-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Introdução ao Autoconhecimento"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="section-type">Tipo de Seção</Label>
          <Select
            value={formData.section_type}
            onValueChange={(value: any) => setFormData({ ...formData, section_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="video">Vídeo</SelectItem>
              <SelectItem value="exercise">Exercício</SelectItem>
              <SelectItem value="reflection">Reflexão</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="section-duration">Duração Estimada (minutos)</Label>
          <Input
            id="section-duration"
            type="number"
            value={formData.estimated_duration_minutes}
            onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: Number.parseInt(e.target.value) })}
            min="1"
            max="120"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-select">Aplicar Template (Opcional)</Label>
          <div className="flex space-x-2">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Escolher template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tools */}
      <div className="space-y-2">
        <Label>Ferramentas de Conteúdo</Label>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={insertVideoEmbed}>
            <Video className="w-4 h-4 mr-2" />
            Inserir Vídeo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={insertLink}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Inserir Link
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="section-content">Conteúdo da Seção</Label>
        <div className="text-sm text-muted-foreground mb-2">
          <strong>Suporte completo a:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>
              <strong>Texto formatado:</strong> Use **negrito**, *itálico*, # títulos
            </li>
            <li>
              <strong>Vídeos:</strong> Cole URLs do YouTube ou Vimeo diretamente
            </li>
            <li>
              <strong>Links:</strong> Use [texto](url) ou o botão "Inserir Link"
            </li>
            <li>
              <strong>Listas:</strong> Use - para listas com marcadores
            </li>
            <li>
              <strong>Citações:</strong> Use &gt; para citações importantes
            </li>
          </ul>
        </div>
        <Textarea
          id="section-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Digite o conteúdo da seção aqui...

Exemplos de formatação:

# Título Principal
## Subtítulo

**Texto em negrito** e *texto em itálico*

- Item de lista 1
- Item de lista 2

[Link para recurso](https://exemplo.com)

Para vídeos, cole a URL diretamente:
https://www.youtube.com/watch?v=VIDEO_ID

&gt; Citação importante ou destaque"
          rows={15}
          className="font-mono text-sm"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="section-active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="section-active">Seção ativa</Label>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Salvar Seção
        </Button>
      </div>
    </form>
  )
}
