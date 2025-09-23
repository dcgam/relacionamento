"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Mail, Lock, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/i18n"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isAdminMode, setIsAdminMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        // Check if user is admin
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", user.id)
          .eq("is_active", true)
          .single()

        if (adminUser) {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
    }
    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const supabase = createClient()

    try {
      console.log("[v0] Attempting login with email:", email)
      console.log("[v0] Admin mode:", isAdminMode)

      if (isAdminMode) {
        // Direct admin credential check
        if (email === "admin@renovese.com" && password === "admin123") {
          console.log("[v0] Admin credentials verified, redirecting to /admin")
          // Store admin session
          localStorage.setItem("adminSession", "true")
          localStorage.setItem("userEmail", email)
          localStorage.setItem("userLanguage", t.language)
          router.push("/admin")
          return
        } else {
          console.log("[v0] Invalid admin credentials")
          throw new Error("Credenciais de administrador inválidas")
        }
      }

      // Regular user authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (authError) {
        console.log("[v0] Auth error:", authError)
        throw authError
      }

      if (!authData.user) {
        console.log("[v0] No user data returned")
        throw new Error("No user data returned")
      }

      console.log("[v0] User authenticated:", authData.user.email)

      // Store email and language in localStorage
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userLanguage", t.language)

      console.log("[v0] Regular user login, redirecting to /dashboard")
      router.push("/dashboard")
    } catch (err: any) {
      console.log("[v0] Login error:", err)
      setError(err.message || "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Logo and Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isAdminMode ? "bg-blue-600" : "bg-primary"
              }`}
            >
              {isAdminMode ? (
                <Shield className="w-8 h-8 text-white" />
              ) : (
                <Heart className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{isAdminMode ? "Admin - Renove-se" : t.welcome}</h1>
            <p className="text-muted-foreground text-balance">
              {isAdminMode ? "Acesso exclusivo para administradores" : t.welcomeSubtitle}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAdminMode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Usuário
            </button>
            <button
              type="button"
              onClick={() => setIsAdminMode(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAdminMode ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground">
              {isAdminMode ? "Acesso Administrativo" : t.startTransformation}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {isAdminMode ? "Entre com suas credenciais de admin" : t.enterEmail}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={isAdminMode ? "admin@renovese.com" : t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full h-12 text-base font-medium ${isAdminMode ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                disabled={isLoading || !email || !password}
              >
                {isLoading
                  ? isAdminMode
                    ? "Verificando..."
                    : t.sending
                  : isAdminMode
                    ? "Acessar Painel"
                    : t.startButton}
              </Button>
            </form>

            {!isAdminMode && (
              <>
                <div className="text-center">
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    {t.forgotPassword}
                  </Link>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {t.dontHaveAccount}{" "}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                      {t.registerHere}
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{t.termsNotice}</p>
        </div>
      </div>
    </div>
  )
}
