"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart, MessageCircle, Users, Lock, Smartphone, Loader2, Heart, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitQuizData } from "@/lib/actions"
import { LeadsStorage } from "@/lib/leads-storage"
import { useLanguage } from "@/contexts/language-context"

type ResultsProps = {
  score: number
  answers: { questionId: number; score: number; theme: string }[]
  userData: any
}

const Gauge = ({ score }: { score: number }) => {
  const maxScore = 12
  const percentage = score / maxScore
  const rotation = -90 + percentage * 180

  let color = "text-green-400"
  if (percentage <= 0.33) color = "text-red-500"
  else if (percentage <= 0.66) color = "text-yellow-400"

  return (
    <div className="relative w-64 h-32">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <motion.path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ strokeDasharray: "0, 251.2" }}
          animate={{ strokeDasharray: `${percentage * 125.6}, 251.2` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        className={`absolute bottom-0 left-1/2 w-1 h-20 origin-bottom ${color}`}
        style={{ transform: `translateX(-50%) rotate(0deg)` }}
        animate={{ rotate: rotation }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="w-full h-full bg-current rounded-t-full"></div>
        <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-gray-800 bg-current"></div>
      </motion.div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <div className="text-4xl font-bold">{score}</div>
      </div>
    </div>
  )
}

export default function Results({ score, answers, userData }: ResultsProps) {
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  let resultStatus, resultMessage
  if (score <= 4) {
    resultStatus = t("results.critical")
    resultMessage =
      "A base do seu relacionamento mostra sinais claros de desgaste. A comunicação e a conexão parecem estar em um ponto crítico. É um momento decisivo para agir antes que a distância se torne irreversível."
  } else if (score <= 8) {
    resultStatus = t("results.at_risk")
    resultMessage =
      "Seu relacionamento está em uma zona de alerta. Existem bons momentos, mas os desafios e a desconexão estão se tornando mais frequentes. Ignorar esses sinais pode levar a problemas mais profundos."
  } else {
    resultStatus = t("results.healthy")
    resultMessage =
      "Vocês têm uma base sólida, mas como todo relacionamento, há espaço para crescer. Fortalecer ainda mais a conexão pode blindar vocês contra futuras crises e aprofundar o amor que já existe."
  }

  const handleCtaClick = async () => {
    setLoading(true)

    // 🎯 EVENTO CLIQUE_VENDA - Meta Pixel (Evento Personalizado)
    if (typeof window !== "undefined" && (window as any).fbq) {
      ;(window as any).fbq("trackCustom", "Clique_Venda", {
        content_name: "Quiz Emocional - Clique Checkout",
        content_category: "Relacionamento",
        value: 25,
        currency: "USD",
      })
    }

    // 🎯 EVENTO CLIQUE_VENDA - Google Tag Manager
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      ;(window as any).dataLayer.push({
        event: "clique_venda",
        event_category: "Checkout",
        event_label: "Botão Comprar",
        value: 25,
      })
    }

    const dataToSend = {
      ...userData,
      interessado: true,
    }

    try {
      await submitQuizData(dataToSend)

      // 💾 ATUALIZAR LEAD COMO INTERESSADO
      LeadsStorage.saveLead({
        name: dataToSend.name,
        email: dataToSend.email,
        whatsapp: dataToSend.whatsapp,
        age: dataToSend.age,
        gender: dataToSend.gender,
        utm_source: dataToSend.utm_source,
        utm_medium: dataToSend.utm_medium,
        utm_campaign: dataToSend.utm_campaign,
        utm_content: dataToSend.utm_content,
        utm_term: dataToSend.utm_term,
        interessado: true, // MARCADO COMO INTERESSADO
        answers: dataToSend.answers,
        totalScore: dataToSend.answers.reduce((sum: number, answer: any) => sum + answer.score, 0),
      })

      window.location.href = "https://pay.kiwify.com/uSsa5xx"
    } catch (error) {
      console.error("Failed to submit interest:", error)
      setLoading(false)
    }
  }

  const benefits = [
    { icon: BarChart, text: "Vídeos temáticos e curtos" },
    { icon: MessageCircle, text: "Interação por WhatsApp" },
    { icon: Users, text: "Desafios práticos de reconexão" },
    { icon: Lock, text: "100% privado e imparcial" },
    { icon: Smartphone, text: "Sempre na palma da mão" },
  ]

  const getScoreColor = (percentage: number) => {
    if (percentage < 50) return "text-red-500"
    if (percentage <= 70) return "text-yellow-400"
    return "text-green-400"
  }

  const getScoreStatus = (percentage: number) => {
    if (percentage < 50) return t("results.below_average")
    if (percentage <= 70) return t("results.average")
    return t("results.above_average")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full min-h-screen flex flex-col items-center justify-center py-12 px-4"
    >
      <div className="w-full max-w-[800px] mx-auto">
        {/* Results Section com efeitos 3D aprimorados */}
        <div className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-lg border-2 border-white/30 rounded-2xl p-8 md:p-12 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transform perspective-1000">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-lg">{t("results.title")}</h2>

          <div className="flex justify-center my-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-full border border-white/10 shadow-2xl">
                <Gauge score={score} />
              </div>
            </div>
          </div>

          <h3
            className={`text-2xl md:text-3xl font-bold mb-6 drop-shadow-lg ${
              score <= 4 ? "text-red-400" : score <= 8 ? "text-yellow-400" : "text-green-400"
            }`}
          >
            {t("results.status")}: {resultStatus}
          </h3>

          <p className="text-gray-200 text-lg leading-relaxed max-w-2xl mx-auto mb-10 drop-shadow-sm">
            {resultMessage}
          </p>

          <h4 className="text-xl font-semibold mb-6 text-white">{t("results.diagnosis")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {answers.map((ans, index) => {
              const percentage = (ans.score / 2) * 100
              const colorClass = getScoreColor(percentage)
              const status = getScoreStatus(percentage)

              return (
                <div key={ans.questionId} className="bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-300 font-medium">{ans.theme}</p>
                    <span className={`text-lg font-bold ${colorClass}`}>{percentage.toFixed(0)}%</span>
                  </div>
                  <p className={`text-xs ${colorClass} font-medium`}>({status})</p>
                  <div className="w-full bg-gray-700/50 rounded-full h-2 mt-2 shadow-inner">
                    <div
                      className={`h-2 rounded-full shadow-lg transition-all duration-1000 ${
                        percentage < 50 ? "bg-red-500" : percentage <= 70 ? "bg-yellow-400" : "bg-green-400"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sales Section com efeitos aprimorados */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight max-w-2xl mx-auto text-white drop-shadow-lg mb-6">
            {t("sales.title").split(".")[0]}. <span className="text-rose-400">{t("sales.title").split(".")[1]}.</span>
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed drop-shadow-sm mb-8">
            {t("sales.subtitle")}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 my-12 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-6 rounded-2xl border-2 border-white/30 shadow-[0_15px_35px_rgba(0,0,0,0.4)] group-hover:shadow-[0_20px_45px_rgba(236,72,153,0.3)] transition-all duration-300 transform group-hover:scale-105 backdrop-blur-md"
              >
                <benefit.icon className="w-8 h-8 text-rose-400 drop-shadow-lg" />
              </div>
            ))}
          </div>

          {/* Mini página de vendas */}
          <div className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-lg border-2 border-white/30 rounded-2xl p-8 md:p-10 my-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">{t("sales.social_proof")}</h3>

            <div className="bg-gradient-to-r from-rose-500/10 to-purple-500/10 rounded-xl p-6 mb-8 border border-rose-500/20">
              <h4 className="text-xl font-semibold text-rose-400 mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6" />
                {t("sales.method_title")}
              </h4>
              <p className="text-gray-300 leading-relaxed mb-4">
                Nossa IA não é apenas um chatbot. É um sistema inteligente que trabalha individualmente com cada cônjuge
                através do WhatsApp, criando um ambiente seguro e sigiloso para a verdadeira transformação acontecer.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-rose-400 mt-1 flex-shrink-0" />
                  <span>Conversas individuais e privadas com cada cônjuge</span>
                </div>
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-rose-400 mt-1 flex-shrink-0" />
                  <span>Interações personalizadas via WhatsApp 24/7</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-rose-400 mt-1 flex-shrink-0" />
                  <span>Atividades presenciais guiadas para reconexão</span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-rose-400 mt-1 flex-shrink-0" />
                  <span>Monitoramento e estímulo contínuo do progresso</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-rose-400">🎯 Resultados Comprovados</h4>
                <p className="text-gray-300 leading-relaxed">
                  87% dos casais que seguiram nosso método por 30 dias saíram da zona de conflito e redescobriram a
                  intimidade perdida.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-rose-400">💰 Investimento Inteligente</h4>
                <p className="text-gray-300 leading-relaxed">
                  Por menos de U$ 1 por dia, você tem acesso a um terapeuta de casal disponível 24h no seu WhatsApp.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-rose-400">🔒 Sigilo Absoluto</h4>
                <p className="text-gray-300 leading-relaxed">
                  Sem constrangimento, sem julgamentos. A IA trabalha individualmente com cada um, respeitando o ritmo e
                  as necessidades específicas.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-rose-400">⚡ Transformação Rápida</h4>
                <p className="text-gray-300 leading-relaxed">
                  Saia da dor em 7 dias. Reconecte-se verdadeiramente em 30 dias ou seu dinheiro de volta.
                </p>
              </div>
            </div>

            <div className="text-center bg-gradient-to-r from-rose-500/20 to-purple-500/20 rounded-xl p-6 border border-rose-500/30">
              <p className="text-2xl text-white mb-2 font-bold">{t("sales.price")}</p>
              <p className="text-lg text-gray-300 mb-2">
                <span className="text-rose-400 font-semibold">{t("sales.offer")}</span>
              </p>
              <p className="text-sm text-gray-400">{t("sales.urgency")}</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-lg text-gray-300 mb-4">{t("sales.final_message")}</p>
            <p className="text-rose-300 font-semibold">{t("sales.final_warning")}</p>
          </div>

          <Button
            onClick={handleCtaClick}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-8 px-12 text-xl rounded-2xl shadow-2xl shadow-rose-500/30 transition-all duration-300 hover:scale-105 transform hover:shadow-rose-500/40"
          >
            {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : t("sales.cta")}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
