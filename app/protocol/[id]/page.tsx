"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, CheckCircle, Clock, BookOpen, RotateCcw } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface ProtocolContent {
  id: string
  title: string
  estimatedTime: string
  sections: {
    title: string
    content: string
    type: "text" | "exercise" | "reflection"
  }[]
}

export default function ProtocolPage() {
  const router = useRouter()
  const params = useParams()
  const isMobile = useIsMobile()
  const [currentSection, setCurrentSection] = useState(0)
  const [completedSections, setCompletedSections] = useState<number[]>([])
  const [protocol, setProtocol] = useState<ProtocolContent | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const email = localStorage.getItem("userEmail")
    if (!email) {
      router.push("/")
      return
    }

    // Load protocol content based on ID
    const protocolData = getProtocolContent(params.id as string)
    setProtocol(protocolData)

    const completionKey = `protocol_${params.id}_completion`
    const savedCompletion = localStorage.getItem(completionKey)
    if (savedCompletion) {
      setCompletedSections(JSON.parse(savedCompletion))
    }
  }, [params.id, router])

  useEffect(() => {
    if (protocol) {
      const completionKey = `protocol_${protocol.id}_completion`
      localStorage.setItem(completionKey, JSON.stringify(completedSections))

      // Also save overall protocol progress
      const progressKey = `protocol_${protocol.id}_progress`
      const progressData = {
        completedSections: completedSections.length,
        totalSections: protocol.sections.length,
        lastAccessed: new Date().toISOString(),
        status:
          completedSections.length === 0
            ? "new"
            : completedSections.length === protocol.sections.length
              ? "completed"
              : "in-progress",
      }
      localStorage.setItem(progressKey, JSON.stringify(progressData))
    }
  }, [completedSections, protocol])

  const getProtocolContent = (id: string): ProtocolContent => {
    const protocols: Record<string, ProtocolContent> = {
      "1": {
        id: "1",
        title: "Etapa 1: Autoconhecimento",
        estimatedTime: "15 min",
        sections: [
          {
            title: "Bem-vinda ao seu processo de autoconhecimento",
            type: "text",
            content: `O autoconhecimento é a base de qualquer relacionamento saudável. Antes de podermos nos conectar verdadeiramente com outra pessoa, precisamos entender quem somos, quais são nossos valores, necessidades e padrões de comportamento.

Nesta etapa, você irá explorar aspectos fundamentais da sua personalidade e história que influenciam diretamente seus relacionamentos. Este é um momento de honestidade e compaixão consigo mesma.`,
          },
          {
            title: "Reflexão: Seus valores fundamentais",
            type: "reflection",
            content: `Pare por um momento e reflita sobre estas perguntas:

• Quais são os 5 valores mais importantes para você em um relacionamento?
• Como estes valores se manifestam no seu dia a dia?
• Você tem comunicado claramente estes valores ao seu parceiro?

Anote suas respostas em um caderno ou no seu celular. Estas reflexões serão importantes para as próximas etapas.`,
          },
          {
            title: "Exercício: Mapeando seus padrões",
            type: "exercise",
            content: `Agora vamos identificar padrões que podem estar afetando seu relacionamento:

**Exercício prático:**
1. Pense em 3 situações recentes de conflito ou tensão no seu relacionamento
2. Para cada situação, identifique:
   - Qual foi o gatilho emocional?
   - Como você reagiu?
   - O que você realmente precisava naquele momento?
   - Como poderia ter reagido de forma diferente?

Este exercício não é sobre culpa, mas sobre consciência. Reconhecer padrões é o primeiro passo para transformá-los.`,
          },
          {
            title: "Integrando o aprendizado",
            type: "text",
            content: `Parabéns por completar esta primeira etapa! O autoconhecimento é um processo contínuo, e você deu um passo importante hoje.

**Principais insights desta etapa:**
- Seus valores são a bússola do seu relacionamento
- Reconhecer padrões permite escolhas mais conscientes
- A compaixão consigo mesma é essencial para o crescimento

Na próxima etapa, vamos trabalhar como comunicar essas descobertas de forma efetiva e amorosa.`,
          },
        ],
      },
      "2": {
        id: "2",
        title: "Etapa 2: Comunicação Consciente",
        estimatedTime: "20 min",
        sections: [
          {
            title: "A arte da comunicação consciente",
            type: "text",
            content: `A comunicação é a ponte que conecta dois corações. Quando nos comunicamos conscientemente, criamos espaço para compreensão mútua, intimidade e crescimento conjunto.

Nesta etapa, você aprenderá técnicas práticas para expressar suas necessidades, ouvir com empatia e transformar conflitos em oportunidades de conexão mais profunda.`,
          },
          {
            title: 'Exercício: A técnica do "Eu sinto"',
            type: "exercise",
            content: `Vamos praticar uma forma mais efetiva de expressar sentimentos:

**Em vez de:** "Você nunca me escuta!"
**Experimente:** "Eu me sinto desvalorizada quando não percebo que minhas palavras estão sendo ouvidas."

**Sua vez:**
Pense em 3 frases que você costuma dizer quando está chateada e reescreva-as usando a fórmula:
"Eu me sinto _____ quando _____ porque eu preciso de _____"

Esta técnica reduz a defensividade e abre espaço para diálogo construtivo.`,
          },
          {
            title: "Reflexão: Escuta empática",
            type: "reflection",
            content: `A verdadeira escuta vai além das palavras. É sobre compreender o coração por trás da mensagem.

**Reflita:**
• Quando foi a última vez que você realmente ouviu seu parceiro sem pensar na sua resposta?
• Que sinais não-verbais você percebe quando ele está tentando se comunicar?
• Como você pode criar mais espaço para escuta genuína no seu relacionamento?

Lembre-se: escutar não significa concordar, mas sim compreender.`,
          },
        ],
      },
      // Add more protocols as needed
    }

    return (
      protocols[id] || {
        id: id,
        title: "Protocolo não encontrado",
        estimatedTime: "0 min",
        sections: [
          {
            title: "Conteúdo em desenvolvimento",
            type: "text",
            content: "Este protocolo está sendo preparado especialmente para você. Em breve estará disponível!",
          },
        ],
      }
    )
  }

  const handleNext = () => {
    if (!protocol) return

    if (currentSection < protocol.sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleComplete = () => {
    if (!completedSections.includes(currentSection)) {
      setCompletedSections([...completedSections, currentSection])
    }
  }

  const handleResetCompletion = () => {
    setCompletedSections([])
    if (protocol) {
      const completionKey = `protocol_${protocol.id}_completion`
      const progressKey = `protocol_${protocol.id}_progress`
      localStorage.removeItem(completionKey)
      localStorage.removeItem(progressKey)
    }
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  if (!protocol) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando protocolo...</p>
        </div>
      </div>
    )
  }

  const progress = ((currentSection + 1) / protocol.sections.length) * 100
  const currentSectionData = protocol.sections[currentSection]
  const isCompleted = completedSections.includes(currentSection)

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "exercise":
        return "💪"
      case "reflection":
        return "🤔"
      default:
        return "📖"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{protocol.estimatedTime}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetCompletion}
                className="text-muted-foreground hover:text-foreground"
                title="Resetar progresso"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">{protocol.title}</h1>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Seção {currentSection + 1} de {protocol.sections.length}
              </span>
              <span className="text-sm font-medium text-primary">{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-border">
          <CardContent className="p-8">
            {/* Section Header */}
            <div className="flex items-start space-x-3 mb-6">
              <div className="text-2xl">{getSectionIcon(currentSectionData.type)}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">{currentSectionData.title}</h2>
                {isCompleted && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Seção concluída</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-line">{currentSectionData.content}</div>
            </div>

            {/* Action Buttons */}
            <div
              className={`mt-8 pt-6 border-t border-border ${
                isMobile ? "space-y-4" : "flex items-center justify-between"
              }`}
            >
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSection === 0}
                className={isMobile ? "w-full" : ""}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              <div className={`flex items-center ${isMobile ? "flex-col space-y-3 w-full" : "space-x-3"}`}>
                {!isCompleted && (
                  <Button
                    variant="outline"
                    onClick={handleComplete}
                    className={`border-accent text-accent-foreground hover:bg-accent/10 bg-transparent ${
                      isMobile ? "w-full" : ""
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como concluída
                  </Button>
                )}

                {currentSection < protocol.sections.length - 1 ? (
                  <Button onClick={handleNext} className={isMobile ? "w-full" : ""}>
                    Próxima
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleBackToDashboard}
                    className={`bg-accent text-accent-foreground hover:bg-accent/90 ${isMobile ? "w-full" : ""}`}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Finalizar Protocolo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
