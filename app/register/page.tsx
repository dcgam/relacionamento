"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Mail, Lock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/i18n"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { createClient } from "@/lib/supabase/client"
import { EmailInfoAlert } from "@/components/email-info-alert"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const t = useTranslations()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [router])

  useEffect(() => {
    // Clear error when passwords match
    if (password && confirmPassword && password !== confirmPassword) {
      setError(t.passwordMismatch)
    } else {
      setError("")
    }
  }, [password, confirmPassword, t.passwordMismatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t.passwordMismatch)
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error

      router.push("/auth/sign-up-success")
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = email && password && confirmPassword && password === confirmPassword

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Logo and Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{t.welcome}</h1>
            <p className="text-muted-foreground text-balance">{t.welcomeSubtitle}</p>
          </div>
        </div>

        {/* Registration Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground">{t.createAccount}</CardTitle>
            <CardDescription className="text-center text-muted-foreground">{t.enterEmail}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Registration Form - removed success state display */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={t.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading || !isFormValid}>
                {isLoading ? t.registering : t.createAccount}
              </Button>
            </form>

            {/* Email Info Alert */}
            <EmailInfoAlert type="signup" language={t.locale as "pt" | "es"} />

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t.alreadyHaveAccount}{" "}
                <Link href="/" className="text-primary hover:underline font-medium">
                  {t.loginHere}
                </Link>
              </p>
            </div>
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
