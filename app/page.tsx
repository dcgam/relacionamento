"use client"

import { useState, Suspense } from "react"
import type { Answer } from "@/components/quiz"
import Quiz from "@/components/quiz"
import UserForm from "@/components/user-form"
import Results from "@/components/results"
import LanguageSelector from "@/components/language-selector"
import { LanguageProvider } from "@/contexts/language-context"

function QuizFlow() {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [userData, setUserData] = useState(null)

  const handleQuizComplete = (finalAnswers: Answer[]) => {
    setAnswers(finalAnswers)
    setQuizCompleted(true)
  }

  const handleFormSubmit = (data: any) => {
    setUserData(data)
    setFormSubmitted(true)
  }

  const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0)

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#111111] to-[#252525] text-white font-sans overflow-x-hidden">
      <LanguageSelector />
      {!quizCompleted && <Quiz onComplete={handleQuizComplete} />}
      {quizCompleted && !formSubmitted && <UserForm onSubmit={handleFormSubmit} answers={answers} />}
      {formSubmitted && userData && <Results score={totalScore} answers={answers} userData={userData} />}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-[#252525] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
        <p className="text-lg">Carregando quiz...</p>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <LanguageProvider>
      <Suspense fallback={<LoadingFallback />}>
        <QuizFlow />
      </Suspense>
    </LanguageProvider>
  )
}
