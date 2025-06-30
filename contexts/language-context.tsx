"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "pt" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  pt: {
    // Quiz
    "quiz.title": "Seu relacionamento está realmente acabado?",
    "quiz.subtitle": "Descubra em 2 minutos se ainda há esperança ou se é hora de seguir em frente.",
    "quiz.social_proof": "Mais de 1.287 casais já fizeram este teste.",
    "quiz.cta": "🔍 FAZER O TESTE AGORA",
    "quiz.benefits": "✓ Gratuito ✓ Anônimo ✓ Resultado imediato",
    "quiz.question": "Pergunta",
    "quiz.of": "de",

    // Questions
    "question.1.text": "Como você descreveria a comunicação entre vocês atualmente?",
    "question.1.theme": "Conversa de Casal",
    "question.1.option.0": "Quase não conversamos ou só discutimos.",
    "question.1.option.1": "Conversamos o básico, mas evitamos assuntos difíceis.",
    "question.1.option.2": "Conseguimos conversar abertamente sobre a maioria das coisas.",

    "question.2.text": "Com que frequência vocês demonstram carinho e afeto um pelo outro?",
    "question.2.theme": "Demonstração de Afeto",
    "question.2.option.0": "Raramente ou nunca.",
    "question.2.option.1": "Às vezes, mas não como antes.",
    "question.2.option.2": "Frequentemente, de forma natural.",

    "question.3.text": "Quando vocês discordam, como geralmente terminam as conversas?",
    "question.3.theme": "Resolução de Conflitos",
    "question.3.option.0": "Com briga, silêncio ou um dos dois cedendo para evitar conflito.",
    "question.3.option.1": "Deixamos para lá, sem resolver de fato.",
    "question.3.option.2": "Buscamos um entendimento, mesmo que não concordemos totalmente.",

    "question.4.text": "Vocês se sentem como um time enfrentando a vida juntos?",
    "question.4.theme": "Parceria e Cumplicidade",
    "question.4.option.0": "Não, sinto que estamos competindo ou em caminhos separados.",
    "question.4.option.1": "Em algumas áreas sim, em outras não.",
    "question.4.option.2": "Sim, somos parceiros e nos apoiamos mutuamente.",

    "question.5.text": "Quanto tempo de qualidade (sem distrações) vocês passam juntos?",
    "question.5.theme": "Tempo de Qualidade",
    "question.5.option.0": "Praticamente nenhum.",
    "question.5.option.1": "Menos do que eu gostaria.",
    "question.5.option.2": "Temos nossos momentos e os valorizamos.",

    "question.6.text": "Você consegue se imaginar feliz com essa pessoa daqui a 5 anos, se nada mudar?",
    "question.6.theme": "Perspectiva de Futuro",
    "question.6.option.0": "Sinceramente, não.",
    "question.6.option.1": "Tenho muitas dúvidas.",
    "question.6.option.2": "Sim, mas sei que podemos melhorar.",

    // Form
    "form.title": "Seu resultado está pronto!",
    "form.subtitle": "Preencha os dados para acessar sua análise emocional e um plano gratuito de reaproximação.",
    "form.name": "Nome",
    "form.email": "E-mail",
    "form.whatsapp": "WhatsApp",
    "form.age": "Idade",
    "form.gender": "Gênero",
    "form.gender.male": "Masculino",
    "form.gender.female": "Feminino",
    "form.gender.other": "Prefiro não dizer",
    "form.cta": "🔍 VER MEU RESULTADO",
    "form.required": "*",
    "form.error": "Por favor, preencha os campos obrigatórios.",

    // Results
    "results.title": "Sua Análise Emocional",
    "results.status": "Status",
    "results.critical": "Crítico",
    "results.at_risk": "Em Risco",
    "results.healthy": "Saudável",
    "results.diagnosis": "Diagnóstico por área:",
    "results.below_average": "Abaixo da Média",
    "results.average": "Na Média",
    "results.above_average": "Acima da Média",

    // Sales
    "sales.title": "Pare de sofrer em silêncio. Existe uma saída.",
    "sales.subtitle":
      "Você não precisa escolher entre terminar ou continuar sofrendo. Existe um terceiro caminho: a reconexão verdadeira.",
    "sales.social_proof": "Por que 1.287 casais escolheram nossa IA para salvar seus relacionamentos?",
    "sales.method_title": "O Método que Transforma Dor em Amor",
    "sales.price": "De U$ 97 por apenas U$ 25",
    "sales.offer": "Oferta especial: Pare de sofrer hoje mesmo",
    "sales.urgency": "⏰ Esta oferta expira em 24 horas",
    "sales.cta": "💖 QUERO SAIR DA DOR AGORA",
    "sales.final_message": "Você merece ser feliz. Vocês merecem uma segunda chance.",
    "sales.final_warning": "Não deixe o orgulho destruir o que ainda pode ser salvo.",
  },
  es: {
    // Quiz
    "quiz.title": "¿Tu relación realmente ha terminado?",
    "quiz.subtitle": "Descubre en 2 minutos si aún hay esperanza o si es hora de seguir adelante.",
    "quiz.social_proof": "Más de 1.287 parejas ya han hecho esta prueba.",
    "quiz.cta": "🔍 HACER LA PRUEBA AHORA",
    "quiz.benefits": "✓ Gratis ✓ Anónimo ✓ Resultado inmediato",
    "quiz.question": "Pregunta",
    "quiz.of": "de",

    // Questions
    "question.1.text": "¿Cómo describirías la comunicación entre ustedes actualmente?",
    "question.1.theme": "Conversación de Pareja",
    "question.1.option.0": "Casi no hablamos o solo discutimos.",
    "question.1.option.1": "Hablamos lo básico, pero evitamos temas difíciles.",
    "question.1.option.2": "Podemos hablar abiertamente sobre la mayoría de las cosas.",

    "question.2.text": "¿Con qué frecuencia se demuestran cariño y afecto mutuamente?",
    "question.2.theme": "Demostración de Afecto",
    "question.2.option.0": "Rara vez o nunca.",
    "question.2.option.1": "A veces, pero no como antes.",
    "question.2.option.2": "Frecuentemente, de forma natural.",

    "question.3.text": "Cuando no están de acuerdo, ¿cómo suelen terminar las conversaciones?",
    "question.3.theme": "Resolución de Conflictos",
    "question.3.option.0": "Con pelea, silencio o uno de los dos cediendo para evitar conflicto.",
    "question.3.option.1": "Lo dejamos pasar, sin resolver realmente.",
    "question.3.option.2": "Buscamos un entendimiento, aunque no estemos totalmente de acuerdo.",

    "question.4.text": "¿Se sienten como un equipo enfrentando la vida juntos?",
    "question.4.theme": "Sociedad y Complicidad",
    "question.4.option.0": "No, siento que estamos compitiendo o en caminos separados.",
    "question.4.option.1": "En algunas áreas sí, en otras no.",
    "question.4.option.2": "Sí, somos socios y nos apoyamos mutuamente.",

    "question.5.text": "¿Cuánto tiempo de calidad (sin distracciones) pasan juntos?",
    "question.5.theme": "Tiempo de Calidad",
    "question.5.option.0": "Prácticamente ninguno.",
    "question.5.option.1": "Menos de lo que me gustaría.",
    "question.5.option.2": "Tenemos nuestros momentos y los valoramos.",

    "question.6.text": "¿Puedes imaginarte feliz con esta persona dentro de 5 años, si nada cambia?",
    "question.6.theme": "Perspectiva de Futuro",
    "question.6.option.0": "Sinceramente, no.",
    "question.6.option.1": "Tengo muchas dudas.",
    "question.6.option.2": "Sí, pero sé que podemos mejorar.",

    // Form
    "form.title": "¡Tu resultado está listo!",
    "form.subtitle": "Completa los datos para acceder a tu análisis emocional y un plan gratuito de reencuentro.",
    "form.name": "Nombre",
    "form.email": "E-mail",
    "form.whatsapp": "WhatsApp",
    "form.age": "Edad",
    "form.gender": "Género",
    "form.gender.male": "Masculino",
    "form.gender.female": "Femenino",
    "form.gender.other": "Prefiero no decir",
    "form.cta": "🔍 VER MI RESULTADO",
    "form.required": "*",
    "form.error": "Por favor, completa los campos obligatorios.",

    // Results
    "results.title": "Tu Análisis Emocional",
    "results.status": "Estado",
    "results.critical": "Crítico",
    "results.at_risk": "En Riesgo",
    "results.healthy": "Saludable",
    "results.diagnosis": "Diagnóstico por área:",
    "results.below_average": "Por Debajo del Promedio",
    "results.average": "En el Promedio",
    "results.above_average": "Por Encima del Promedio",

    // Sales
    "sales.title": "Deja de sufrir en silencio. Hay una salida.",
    "sales.subtitle":
      "No tienes que elegir entre terminar o seguir sufriendo. Existe un tercer camino: la reconexión verdadera.",
    "sales.social_proof": "¿Por qué 1.287 parejas eligieron nuestra IA para salvar sus relaciones?",
    "sales.method_title": "El Método que Transforma Dolor en Amor",
    "sales.price": "De U$ 97 por solo U$ 25",
    "sales.offer": "Oferta especial: Deja de sufrir hoy mismo",
    "sales.urgency": "⏰ Esta oferta expira en 24 horas",
    "sales.cta": "💖 QUIERO SALIR DEL DOLOR AHORA",
    "sales.final_message": "Mereces ser feliz. Merecen una segunda oportunidad.",
    "sales.final_warning": "No dejes que el orgullo destruya lo que aún se puede salvar.",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      // Detectar idioma por browser/IP
      const detectLanguage = () => {
        if (typeof window !== "undefined") {
          const browserLang = navigator.language.toLowerCase()
          console.log("Browser language detected:", browserLang)
          if (browserLang.startsWith("es")) {
            setLanguage("es")
          } else {
            setLanguage("pt")
          }
        }
        setIsLoading(false)
      }

      detectLanguage()
    } catch (error) {
      console.error("Error detecting language:", error)
      setLanguage("pt") // fallback
      setIsLoading(false)
    }
  }, [])

  const t = (key: string): string => {
    try {
      const translation = translations[language][key as keyof (typeof translations)[typeof language]]
      if (!translation) {
        console.warn(`Translation missing for key: ${key}`)
        return key
      }
      return translation
    } catch (error) {
      console.error("Translation error:", error)
      return key
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-[#252525] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
