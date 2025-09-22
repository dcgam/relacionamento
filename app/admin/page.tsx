"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Calendar, Download, Trash2 } from "lucide-react"

interface UserProgress {
  email: string
  protocols: {
    id: string
    status: string
    progress: number
    completedSections: number
    totalSections: number
    lastAccessed: string
  }[]
  overallProgress: number
  joinDate: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserProgress[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const email = localStorage.getItem("userEmail")
    if (!email) {
      router.push("/")
      return
    }

    // Load all user data from localStorage
    loadUserData()
  }, [router])

  const loadUserData = () => {
    const userData: UserProgress[] = []

    // Get all localStorage keys
    const keys = Object.keys(localStorage)
    const userEmails = new Set<string>()

    // Find all user emails
    keys.forEach((key) => {
      if (key === "userEmail") {
        const email = localStorage.getItem(key)
        if (email) userEmails.add(email)
      }
    })

    // For each user, collect their progress data
    userEmails.forEach((email) => {
      const userProgress: UserProgress = {
        email,
        protocols: [],
        overallProgress: 0,
        joinDate: new Date().toISOString(), // Placeholder
      }

      // Collect protocol progress for this user
      for (let i = 1; i <= 6; i++) {
        const progressKey = `protocol_${i}_progress`
        const savedProgress = localStorage.getItem(progressKey)

        if (savedProgress) {
          const progressData = JSON.parse(savedProgress)
          userProgress.protocols.push({
            id: i.toString(),
            status: progressData.status,
            progress: Math.round((progressData.completedSections / progressData.totalSections) * 100),
            completedSections: progressData.completedSections,
            totalSections: progressData.totalSections,
            lastAccessed: progressData.lastAccessed,
          })
        } else {
          userProgress.protocols.push({
            id: i.toString(),
            status: "new",
            progress: 0,
            completedSections: 0,
            totalSections: 4, // Default
            lastAccessed: "",
          })
        }
      }

      // Calculate overall progress
      userProgress.overallProgress = Math.round(
        userProgress.protocols.reduce((acc, protocol) => acc + protocol.progress, 0) / 6,
      )

      userData.push(userProgress)
    })

    setUsers(userData)
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(users, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `renove-se-users-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleClearAllData = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados de usuários? Esta ação não pode ser desfeita.")) {
      // Clear all protocol progress data
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith("protocol_") && (key.includes("_progress") || key.includes("_completion"))) {
          localStorage.removeItem(key)
        }
      })

      // Reload data
      loadUserData()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">Novo</Badge>
      case "in-progress":
        return <Badge variant="default">Em Progresso</Badge>
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Concluído
          </Badge>
        )
      default:
        return <Badge variant="secondary">Novo</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="text-muted-foreground hover:text-foreground bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllData}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Dados
              </Button>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie usuários e acompanhe o progresso</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
              <div className="text-2xl font-bold text-foreground">{users.length}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progresso Médio</CardTitle>
              <div className="text-2xl font-bold text-foreground">
                {users.length > 0
                  ? Math.round(users.reduce((acc, user) => acc + user.overallProgress, 0) / users.length)
                  : 0}
                %
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Protocolos Concluídos</CardTitle>
              <div className="text-2xl font-bold text-foreground">
                {users.reduce((acc, user) => acc + user.protocols.filter((p) => p.status === "completed").length, 0)}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* User List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Usuários e Progresso</h2>

          {users.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.email}</CardTitle>
                        <CardDescription>Progresso geral: {user.overallProgress}%</CardDescription>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Cadastrado em {new Date(user.joinDate).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${user.overallProgress}%` }}
                      ></div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {user.protocols.map((protocol) => (
                        <div key={protocol.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">Protocolo {protocol.id}</div>
                            <div className="text-xs text-muted-foreground">
                              {protocol.completedSections}/{protocol.totalSections} seções
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(protocol.status)}
                            <div className="text-xs text-muted-foreground mt-1">{protocol.progress}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
