"use client"

import type React from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { submitQuizData } from "@/lib/actions"
import { LeadsStorage } from "@/lib/leads-storage"
import type { Answer } from "./quiz"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

type UserFormProps = {
  onSubmit: (data: any) => void
  answers: Answer[]
}

const countries = [
  { code: "+55", flag: "🇧🇷", name: "Brasil", format: "(XX) XXXXX-XXXX" },
  { code: "+1", flag: "🇺🇸", name: "EUA", format: "(XXX) XXX-XXXX" },
  { code: "+34", flag: "🇪🇸", name: "Espanha", format: "XXX XXX XXX" },
  { code: "+351", flag: "🇵🇹", name: "Portugal", format: "XXX XXX XXX" },
  { code: "+33", flag: "🇫🇷", name: "França", format: "XX XX XX XX XX" },
  { code: "+49", flag: "🇩🇪", name: "Alemanha", format: "XXX XXXXXXX" },
  { code: "+44", flag: "🇬🇧", name: "Reino Unido", format: "XXXX XXX XXXX" },
]

export default function UserForm({ onSubmit, answers }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+55",
    whatsapp: "",
    age: "",
    gender: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useLanguage()

  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const formatPhoneNumber = (value: string, countryCode: string) => {
    const numbers = value.replace(/\D/g, "")

    switch (countryCode) {
      case "+55": // Brasil
        if (numbers.length <= 11) {
          return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        }
        break
      case "+1": // EUA
        if (numbers.length <= 10) {
          return numbers.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
        }
        break
      case "+34": // Espanha
      case "+351": // Portugal
        if (numbers.length <= 9) {
          return numbers.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")
        }
        break
      default:
        return numbers
    }
    return numbers
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, formData.countryCode)
    setFormData({ ...formData, whatsapp: formatted })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.whatsapp) {
      setError(t("form.error"))
      return
    }
    setLoading(true)
    setError("")

    const utms = {
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
      utm_content: searchParams.get("utm_content"),
      utm_term: searchParams.get("utm_term"),
    }

    const dataToSend = {
      ...formData,
      whatsapp: `${formData.countryCode} ${formData.whatsapp}`,
      ...utms,
      answers,
      interessado: false,
    }

    try {
      const result = await submitQuizData(dataToSend)

      // 💾 SALVAR LEAD INTERNAMENTE
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
        interessado: false,
        answers: dataToSend.answers,
        totalScore: dataToSend.answers.reduce((sum: number, answer: any) => sum + answer.score, 0),
      })

      // 🎯 EVENTO LEAD - Meta Pixel (Evento Padrão)
      if (typeof window !== "undefined" && (window as any).fbq) {
        ;(window as any).fbq("track", "Lead", {
          content_name: "Quiz Emocional - Dados Coletados",
          content_category: "Relacionamento",
          value: 0,
          currency: "USD",
        })
      }

      // 🎯 EVENTO LEAD - Google Tag Manager
      if (typeof window !== "undefined" && (window as any).dataLayer) {
        ;(window as any).dataLayer.push({
          event: "lead_generated",
          event_category: "Quiz",
          event_label: "Dados Coletados",
          value: 0,
        })
      }

      onSubmit(dataToSend)
    } catch (err) {
      setError("Ocorreu um erro ao enviar seus dados. Tente novamente.")
      setLoading(false)
    }
  }

  const selectedCountry = countries.find((c) => c.code === formData.countryCode)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen w-full flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-[640px] bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-lg border-2 border-white/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] text-white">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl md:text-4xl font-bold text-rose-400 drop-shadow-lg">
            {t("form.title")}
          </CardTitle>
          <CardDescription className="text-white pt-3 text-lg leading-relaxed font-medium">
            {t("form.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-semibold">
                {t("form.name")} {t("form.required")}
              </Label>
              <Input
                id="name"
                name="name"
                placeholder={t("form.name")}
                required
                onChange={handleChange}
                className="bg-white/10 border-white/30 focus:ring-rose-500 focus:border-rose-400 backdrop-blur-sm text-white placeholder:text-gray-400 py-3 px-4 rounded-lg shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-semibold">
                {t("form.email")} {t("form.required")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("form.email")}
                required
                onChange={handleChange}
                className="bg-white/10 border-white/30 focus:ring-rose-500 focus:border-rose-400 backdrop-blur-sm text-white placeholder:text-gray-400 py-3 px-4 rounded-lg shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-white font-semibold">
                {t("form.whatsapp")} {t("form.required")}
              </Label>
              <div className="flex gap-2">
                <Select onValueChange={(value) => handleSelectChange("countryCode", value)} defaultValue="+55">
                  <SelectTrigger className="w-32 bg-white/10 border-white/30 backdrop-blur-sm text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 text-white border-white/20 backdrop-blur-md">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          {country.flag} {country.code}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  placeholder={selectedCountry?.format || "Número do WhatsApp"}
                  required
                  value={formData.whatsapp}
                  onChange={handlePhoneChange}
                  className="flex-1 bg-white/10 border-white/30 focus:ring-rose-500 focus:border-rose-400 backdrop-blur-sm text-white placeholder:text-gray-400 py-3 px-4 rounded-lg shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-white font-semibold">
                  {t("form.age")}
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder={t("form.age")}
                  onChange={handleChange}
                  className="bg-white/10 border-white/30 focus:ring-rose-500 focus:border-rose-400 backdrop-blur-sm text-white placeholder:text-gray-400 py-3 px-4 rounded-lg shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-white font-semibold">
                  {t("form.gender")}
                </Label>
                <Select onValueChange={(value) => handleSelectChange("gender", value)}>
                  <SelectTrigger className="bg-white/10 border-white/30 backdrop-blur-sm text-white py-3 px-4 rounded-lg shadow-inner">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 text-white border-white/20 backdrop-blur-md">
                    <SelectItem value="masculino">{t("form.gender.male")}</SelectItem>
                    <SelectItem value="feminino">{t("form.gender.female")}</SelectItem>
                    <SelectItem value="nao_dizer">{t("form.gender.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-rose-500/30 transform hover:scale-[1.02] transition-all duration-300"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t("form.cta")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
