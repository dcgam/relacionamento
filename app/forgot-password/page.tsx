"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Mail, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/i18n"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { createClient } from "@/lib/supabase/client"
import { EmailInfoAlert } from "@/components/email-info-alert"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const t = useTranslations()

  const [isTLoaded, setIsTLoaded] = useState(false)

  useEffect(() => {
    if (t) {
      setIsTLoaded(true)
    }
  }, [t])

  if (!isTLoaded) {
    return <div>Loading...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setError("")

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.log("[v0] Supabase reset password error:", error)
        throw error
      }

      console.log("[v0] Password reset email sent successfully")
      setIsSuccess(true)
      setMessage(t.resetLinkSent)
    } catch (err: any) {
      console.log("[v0] Error in password reset:", err)
      if (err.message?.includes("Email not confirmed")) {
        setError("Email não confirmado. Verifique sua caixa de entrada primeiro.")
      } else if (err.message?.includes("Invalid email")) {
        setError("Email inválido. Verifique o endereço digitado.")
      } else {
        setError(err.message || "Erro ao enviar email de recuperação. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Language Switcher */}
        <div className="flex justify-end">
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

        {/* Forgot Password Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground">{t.forgotPasswordTitle}</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {t.forgotPasswordDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSuccess ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading || !email}>
                    {isLoading ? t.sending : t.sendResetLink}
                  </Button>
                </form>
                <EmailInfoAlert type="reset" language={(t.locale || "pt") as "pt" | "es"} />
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm text-accent-foreground">{message}</p>
                </div>
                <EmailInfoAlert type="reset" language={(t.locale || "pt") as "pt" | "es"} />
                <Button onClick={() => router.push("/")} className="w-full h-12 text-base font-medium">
                  {t.backToLogin}
                </Button>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.backToLogin}
              </Link>
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
