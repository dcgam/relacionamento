"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export type Answer = {
  questionId: number
  score: number
  theme: string
}

type QuizProps = {
  onComplete: (answers: Answer[]) => void
}

declare global {
  interface Window {
    fbq: any
  }
}

export default function Quiz({ onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const { t } = useLanguage()

  const questions = [
    {
      id: 1,
      text: t("question.1.text"),
      theme: t("question.1.theme"),
      image: "/images/bk-couple-1.jpg", // Comunicação
      options: [
        { text: t("question.1.option.0"), score: 0 },
        { text: t("question.1.option.1"), score: 1 },
        { text: t("question.1.option.2"), score: 2 },
      ],
    },
    {
      id: 2,
      text: t("question.2.text"),
      theme: t("question.2.theme"),
      image: "/images/bk-couple-2.jpg", // Afeto
      options: [
        { text: t("question.2.option.0"), score: 0 },
        { text: t("question.2.option.1"), score: 1 },
        { text: t("question.2.option.2"), score: 2 },
      ],
    },
    {
      id: 3,
      text: t("question.3.text"),
      theme: t("question.3.theme"),
      image: "/images/bk-couple-3.jpg", // Conflitos
      options: [
        { text: t("question.3.option.0"), score: 0 },
        { text: t("question.3.option.1"), score: 1 },
        { text: t("question.3.option.2"), score: 2 },
      ],
    },
    {
      id: 4,
      text: t("question.4.text"),
      theme: t("question.4.theme"),
      image: "/images/bk-couple-4.jpg", // Parceria
      options: [
        { text: t("question.4.option.0"), score: 0 },
        { text: t("question.4.option.1"), score: 1 },
        { text: t("question.4.option.2"), score: 2 },
      ],
    },
    {
      id: 5,
      text: t("question.5.text"),
      theme: t("question.5.theme"),
      image: "/images/bk-couple-5.jpg", // Tempo de qualidade
      options: [
        { text: t("question.5.option.0"), score: 0 },
        { text: t("question.5.option.1"), score: 1 },
        { text: t("question.5.option.2"), score: 2 },
      ],
    },
    {
      id: 6,
      text: t("question.6.text"),
      theme: t("question.6.theme"),
      image: "/images/bk-couple-6.jpg", // Futuro
      options: [
        { text: t("question.6.option.0"), score: 0 },
        { text: t("question.6.option.1"), score: 1 },
        { text: t("question.6.option.2"), score: 2 },
      ],
    },
  ]

  const handleAnswer = (score: number, questionId: number) => {
    const question = questions.find((q) => q.id === questionId)
    const newAnswers = [...answers, { questionId, score, theme: question?.theme || "" }]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Evento Preform - Completou o quiz
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("trackCustom", "Preform", {
          content_name: "Quiz Emocional Completo",
          value: newAnswers.reduce((sum, answer) => sum + answer.score, 0),
          currency: "USD",
        })
      }
      onComplete(newAnswers)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (!showQuiz) {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4">
        {/* Background com imagem principal e overlay forte */}
        <div className="absolute inset-0 z-0">
          <img src="/images/bk-couple-main.jpg" alt="Casal em crise" className="h-full w-full object-cover" />
          {/* Overlay escuro de 70% para garantir legibilidade */}
          <div className="absolute inset-0 bg-black/70"></div>
          {/* Overlay gradiente adicional para mais profundidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
        </div>

        <div className="relative z-10 w-full max-w-[800px] mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              {t("quiz.title").split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-rose-400">{t("quiz.title").split(" ").slice(-2).join(" ")}</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed drop-shadow-lg">
              {t("quiz.subtitle")}
              <br />
              <span className="text-rose-300">{t("quiz.social_proof")}</span>
            </p>

            <Button
              onClick={() => setShowQuiz(true)}
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-6 px-12 text-xl rounded-2xl shadow-2xl shadow-rose-500/30 transition-all duration-300 hover:scale-105 transform"
            >
              {t("quiz.cta")}
            </Button>

            <p className="text-sm text-gray-400 mt-4">{t("quiz.benefits")}</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <img
            src={questions[currentQuestion].image || "/placeholder.svg"}
            alt="Imagem de fundo representando o tema da pergunta"
            className="h-full w-full object-cover"
          />
          {/* Overlay escuro principal - 60% para garantir contraste */}
          <div className="absolute inset-0 bg-black/60"></div>
          {/* Overlay gradiente para mais profundidade visual */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
          {/* Vinheta sutil nas bordas */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-[640px] mx-auto">
        {/* Barra de progresso com efeito 3D */}
        <div className="w-full bg-gray-800/50 rounded-full h-3 mb-6 shadow-inner border border-gray-700/50 backdrop-blur-sm">
          <div
            className="bg-gradient-to-r from-rose-500 to-rose-400 h-3 rounded-full transition-all duration-500 shadow-lg shadow-rose-500/30 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>

        <p className="text-center text-sm mb-6 font-light tracking-wider text-gray-200 drop-shadow-lg">
          {`${t("quiz.question")} ${currentQuestion + 1} ${t("quiz.of")} ${questions.length}`}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Card principal com efeito 3D */}
            <Card className="bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-lg border-2 border-white/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transform perspective-1000 hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.9)] transition-all duration-500">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl md:text-2xl font-medium mb-6 text-white drop-shadow-2xl leading-tight">
                  {questions[currentQuestion].text}
                </h2>

                <div className="flex flex-col space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="group relative bg-gradient-to-br from-white/30 via-white/20 to-white/10 border-2 border-white/50 hover:border-white/70 hover:from-white/40 hover:to-white/20 w-full text-sm py-4 px-5 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(255,255,255,0.15)] rounded-xl backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
                      onClick={() => handleAnswer(option.score, questions[currentQuestion].id)}
                    >
                      <span className="relative z-10 text-white font-semibold drop-shadow-sm">{option.text}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
