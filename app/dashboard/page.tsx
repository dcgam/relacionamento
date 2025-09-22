"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  User,
  MessageCircle,
  Brain,
  Sparkles,
  Target,
  BookOpen,
  ArrowRight,
  LogOut,
  Settings,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations, type Language, getTranslations } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { createClient } from "@/lib/supabase/client"

interface Protocol {
  id: string
  titleKey: keyof ReturnType<typeof useTranslations>
  descriptionKey: keyof ReturnType<typeof useTranslations>
  icon: React.ReactNode
  status: "new" | "in-progress" | "completed"
  estimatedTime: string
  progress?: number
}

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("")
  const [t, setT] = useState(useTranslations())
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      setUserEmail(user.email || "")
    }

    checkAuth()

    const email = localStorage.getItem("userEmail")
    const language = (localStorage.getItem("userLanguage") as Language) || "pt"

    if (!email) {
      router.push("/")
      return
    }

    setUserEmail(email)
    setT(getTranslations(language))

    const baseProtocols: Protocol[] = [
      {
        id: "1",
        titleKey: "protocol1Title",
        descriptionKey: "protocol1Description",
        icon: <User className="w-6 h-6" />,
        status: "new",
        estimatedTime: `15 ${getTranslations(language).minutes}`,
      },
      {
        id: "2",
        titleKey: "protocol2Title",
        descriptionKey: "protocol2Description",
        icon: <MessageCircle className="w-6 h-6" />,
        status: "new",
        estimatedTime: `20 ${getTranslations(language).minutes}`,
      },
      {
        id: "3",
        titleKey: "protocol3Title",
        descriptionKey: "protocol3Description",
        icon: <Brain className="w-6 h-6" />,
        status: "new",
        estimatedTime: `18 ${getTranslations(language).minutes}`,
      },
      {
        id: "4",
        titleKey: "protocol4Title",
        descriptionKey: "protocol4Description",
        icon: <Sparkles className="w-6 h-6" />,
        status: "new",
        estimatedTime: `25 ${getTranslations(language).minutes}`,
      },
      {
        id: "5",
        titleKey: "protocol5Title",
        descriptionKey: "protocol5Description",
        icon: <Target className="w-6 h-6" />,
        status: "new",
        estimatedTime: `12 ${getTranslations(language).minutes}`,
      },
      {
        id: "6",
        titleKey: "protocol6Title",
        descriptionKey: "protocol6Description",
        icon: <BookOpen className="w-6 h-6" />,
        status: "new",
        estimatedTime: `10 ${getTranslations(language).minutes}`,
      },
    ]

    // Update protocols with saved progress
    const updatedProtocols = baseProtocols.map((protocol) => {
      const progressKey = `protocol_${protocol.id}_progress`
      const savedProgress = localStorage.getItem(progressKey)

      if (savedProgress) {
        const progressData = JSON.parse(savedProgress)
        return {
          ...protocol,
          status: progressData.status,
          progress: Math.round((progressData.completedSections / progressData.totalSections) * 100),
        }
      }

      return protocol
    })

    setProtocols(updatedProtocols)
  }, [router])

  const overallProgress =
    protocols.length > 0
      ? Math.round(protocols.reduce((acc, protocol) => acc + (protocol.progress || 0), 0) / protocols.length)
      : 0

  const completedProtocols = protocols.filter((p) => p.status === "completed").length

  const getStatusBadge = (status: Protocol["status"]) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
            {t.new}
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="default" className="bg-primary/20 text-primary">
            {t.inProgress}
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {t.completed}
          </Badge>
        )
      default:
        return null
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()

    localStorage.removeItem("userEmail")
    localStorage.removeItem("userLanguage")
    router.push("/")
  }

  const handleProtocolClick = (protocolId: string) => {
    router.push(`/protocol/${protocolId}`)
  }

  const handleAdminAccess = () => {
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t.welcome}</h1>
              <p className="text-sm text-muted-foreground">
                {t.hello}, {userEmail.split("@")[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-border"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdminAccess}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">{t.renewalProtocol}</h2>
          <p className="text-muted-foreground text-balance max-w-2xl mx-auto">{t.protocolSubtitle}</p>
        </div>

        {/* Progress Overview */}
        <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{t.yourProgress}</h3>
            <div className="text-sm text-muted-foreground">
              {completedProtocols} {t.completedOf} {protocols.length}
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Protocol Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {protocols.map((protocol) => (
            <Card
              key={protocol.id}
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border"
              onClick={() => handleProtocolClick(protocol.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">
                    {protocol.icon}
                  </div>
                  {getStatusBadge(protocol.status)}
                </div>
                <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                  {t[protocol.titleKey]}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-muted-foreground mb-4 text-pretty">
                  {t[protocol.descriptionKey]}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">⏱️ {protocol.estimatedTime}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-12 p-6 bg-card border border-border rounded-lg text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">{t.needSupport}</h3>
          <p className="text-muted-foreground mb-4">{t.supportMessage}</p>
          <Button variant="outline" className="border-accent text-accent-foreground hover:bg-accent/10 bg-transparent">
            {t.contactSupport}
          </Button>
        </div>
      </main>
    </div>
  )
}
