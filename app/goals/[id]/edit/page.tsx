"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Target, Save } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Slider } from "@/components/ui/slider"

interface GoalForm {
  title: string
  description: string
  category: string
  priority: string
  status: string
  target_date: string
  progress_percentage: number
}

export default function EditGoalPage() {
  const [form, setForm] = useState<GoalForm>({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    status: "active",
    target_date: "",
    progress_percentage: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGoal, setIsLoadingGoal] = useState(true)
  const [errors, setErrors] = useState<Partial<GoalForm>>({})
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

  useEffect(() => {
    loadGoal()
  }, [goalId])

  const loadGoal = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      const { data, error } = await supabase.from("goals").select("*").eq("id", goalId).eq("user_id", user.id).single()

      if (error) throw error

      if (data) {
        setForm({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          status: data.status,
          target_date: data.target_date,
          progress_percentage: data.progress_percentage,
        })
      }
    } catch (error) {
      console.error("[v0] Error loading goal:", error)
      router.push("/goals")
    } finally {
      setIsLoadingGoal(false)
    }
  }

  const validateForm = () => {
    const newErrors: Partial<GoalForm> = {}

    if (!form.title.trim()) {
      newErrors.title = "Título é obrigatório"
    }

    if (!form.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    }

    if (!form.category) {
      newErrors.category = "Categoria é obrigatória"
    }

    if (!form.target_date) {
      newErrors.target_date = "Data meta é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("goals")
        .update({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          priority: form.priority,
          status: form.status,
          target_date: form.target_date,
          progress_percentage: form.progress_percentage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", goalId)

      if (error) throw error

      router.push("/goals")
    } catch (error) {
      console.error("[v0] Error updating goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof GoalForm, value: string | number) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  if (isLoadingGoal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Target className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando meta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/goals">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editar Meta</h1>
              <p className="text-sm text-muted-foreground">Atualize os detalhes da sua meta</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Editar Meta</CardTitle>
                <CardDescription>Atualize os detalhes e acompanhe o progresso da sua meta</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título da Meta *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Melhorar comunicação no relacionamento"
                  value={form.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva sua meta em detalhes. O que você quer alcançar? Como vai medir o sucesso?"
                  value={form.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={form.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="relationship">Relacionamento</SelectItem>
                      <SelectItem value="health">Saúde</SelectItem>
                      <SelectItem value="career">Carreira</SelectItem>
                      <SelectItem value="spiritual">Espiritual</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={form.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Date */}
                <div className="space-y-2">
                  <Label htmlFor="target_date">Data Meta *</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={form.target_date}
                    onChange={(e) => handleInputChange("target_date", e.target.value)}
                    className={errors.target_date ? "border-destructive" : ""}
                  />
                  {errors.target_date && <p className="text-sm text-destructive">{errors.target_date}</p>}
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-4">
                <Label>Progresso: {form.progress_percentage}%</Label>
                <Slider
                  value={[form.progress_percentage]}
                  onValueChange={(value) => handleInputChange("progress_percentage", value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <Link href="/goals">
                  <Button variant="outline" type="button" className="bg-transparent">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
