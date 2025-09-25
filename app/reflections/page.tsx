"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Heart, ArrowLeft, Plus, Trash2, Save, X, Sparkles, Sun, Moon, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DailyReflection {
  id: string
  reflection_date: string
  mood_rating: number
  gratitude_notes: string
  challenges_faced: string
  achievements: string
  tomorrow_intentions: string
  created_at: string
  updated_at: string
}

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<DailyReflection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newReflection, setNewReflection] = useState({
    mood_rating: 7,
    gratitude_notes: "",
    challenges_faced: "",
    achievements: "",
    tomorrow_intentions: "",
  })
  const router = useRouter()

  useEffect(() => {
    loadReflections()
  }, [])

  const loadReflections = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      const { data, error } = await supabase
        .from("daily_reflections")
        .select("*")
        .eq("user_id", user.id)
        .order("reflection_date", { ascending: false })

      if (error) throw error

      setReflections(data || [])
    } catch (error) {
      console.error("[v0] Error loading reflections:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveReflection = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    try {
      const today = new Date().toISOString().split("T")[0]

      const { error } = await supabase.from("daily_reflections").upsert({
        user_id: user.id,
        reflection_date: today,
        ...newReflection,
      })

      if (error) throw error

      setIsCreating(false)
      setNewReflection({
        mood_rating: 7,
        gratitude_notes: "",
        challenges_faced: "",
        achievements: "",
        tomorrow_intentions: "",
      })
      loadReflections()
    } catch (error) {
      console.error("[v0] Error saving reflection:", error)
    }
  }

  const deleteReflection = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("daily_reflections").delete().eq("id", id)

      if (error) throw error

      setReflections(reflections.filter((r) => r.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting reflection:", error)
    }
  }

  const getMoodEmoji = (rating: number) => {
    if (rating <= 3) return "😢"
    if (rating <= 5) return "😐"
    if (rating <= 7) return "🙂"
    if (rating <= 9) return "😊"
    return "🤩"
  }

  const getMoodColor = (rating: number) => {
    if (rating <= 3) return "text-red-600 bg-red-50 border-red-200"
    if (rating <= 5) return "text-orange-600 bg-orange-50 border-orange-200"
    if (rating <= 7) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    if (rating <= 9) return "text-green-600 bg-green-50 border-green-200"
    return "text-purple-600 bg-purple-50 border-purple-200"
  }

  const todayReflection = reflections.find((r) => r.reflection_date === new Date().toISOString().split("T")[0])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando suas reflexões...</p>
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Reflexões Diárias</h1>
                <p className="text-sm text-muted-foreground">{reflections.length} reflexões registradas</p>
              </div>
            </div>

            {!todayReflection && !isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Reflexão
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Reflection Form */}
        {(isCreating || todayReflection) && (
          <Card className="border-0 shadow-sm mb-8 gradient-purple-light">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-primary" />
                <span>Reflexão de Hoje</span>
                <Badge variant="secondary">{new Date().toLocaleDateString("pt-BR")}</Badge>
              </CardTitle>
              <CardDescription>
                {todayReflection ? "Você já refletiu hoje! Que incrível!" : "Como foi seu dia hoje?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isCreating ? (
                <>
                  <div className="space-y-3">
                    <Label>Como você se sente hoje? ({newReflection.mood_rating}/10)</Label>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{getMoodEmoji(newReflection.mood_rating)}</span>
                      <Slider
                        value={[newReflection.mood_rating]}
                        onValueChange={(value) => setNewReflection({ ...newReflection, mood_rating: value[0] })}
                        max={10}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <Badge className={getMoodColor(newReflection.mood_rating)}>{newReflection.mood_rating}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Pelo que você é grata hoje?</Label>
                    <Textarea
                      placeholder="Liste 3 coisas pelas quais você é grata hoje..."
                      value={newReflection.gratitude_notes}
                      onChange={(e) => setNewReflection({ ...newReflection, gratitude_notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quais desafios você enfrentou?</Label>
                    <Textarea
                      placeholder="Descreva os principais desafios do seu dia..."
                      value={newReflection.challenges_faced}
                      onChange={(e) => setNewReflection({ ...newReflection, challenges_faced: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quais foram suas conquistas?</Label>
                    <Textarea
                      placeholder="Celebre suas vitórias, por menores que sejam..."
                      value={newReflection.achievements}
                      onChange={(e) => setNewReflection({ ...newReflection, achievements: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>O que você pretende fazer amanhã?</Label>
                    <Textarea
                      placeholder="Defina suas intenções para amanhã..."
                      value={newReflection.tomorrow_intentions}
                      onChange={(e) => setNewReflection({ ...newReflection, tomorrow_intentions: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={saveReflection}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Reflexão
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : todayReflection ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMoodEmoji(todayReflection.mood_rating)}</span>
                    <Badge className={getMoodColor(todayReflection.mood_rating)}>
                      Humor: {todayReflection.mood_rating}/10
                    </Badge>
                  </div>

                  {todayReflection.gratitude_notes && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Gratidão</h4>
                      <p className="text-muted-foreground">{todayReflection.gratitude_notes}</p>
                    </div>
                  )}

                  {todayReflection.achievements && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Conquistas</h4>
                      <p className="text-muted-foreground">{todayReflection.achievements}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Previous Reflections */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Reflexões Anteriores</h2>
          </div>

          {reflections.filter((r) => r.reflection_date !== new Date().toISOString().split("T")[0]).length > 0 ? (
            <div className="grid gap-6">
              {reflections
                .filter((r) => r.reflection_date !== new Date().toISOString().split("T")[0])
                .map((reflection) => (
                  <Card key={reflection.id} className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getMoodEmoji(reflection.mood_rating)}</span>
                          <div>
                            <CardTitle className="text-lg">
                              {new Date(reflection.reflection_date).toLocaleDateString("pt-BR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </CardTitle>
                            <Badge className={getMoodColor(reflection.mood_rating)}>
                              Humor: {reflection.mood_rating}/10
                            </Badge>
                          </div>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Reflexão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta reflexão? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReflection(reflection.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {reflection.gratitude_notes && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Gratidão</span>
                          </h4>
                          <p className="text-muted-foreground">{reflection.gratitude_notes}</p>
                        </div>
                      )}

                      {reflection.challenges_faced && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Desafios</h4>
                          <p className="text-muted-foreground">{reflection.challenges_faced}</p>
                        </div>
                      )}

                      {reflection.achievements && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>Conquistas</span>
                          </h4>
                          <p className="text-muted-foreground">{reflection.achievements}</p>
                        </div>
                      )}

                      {reflection.tomorrow_intentions && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Intenções</h4>
                          <p className="text-muted-foreground">{reflection.tomorrow_intentions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Suas reflexões aparecerão aqui</h3>
              <p className="text-muted-foreground mb-6">
                Comece a registrar suas reflexões diárias para acompanhar sua jornada
              </p>
              {!isCreating && (
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Primeira Reflexão
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
