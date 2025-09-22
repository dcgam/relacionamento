"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail } from "lucide-react"

interface EmailInfoAlertProps {
  type: "signup" | "reset"
  language: "pt" | "es"
}

export function EmailInfoAlert({ type, language }: EmailInfoAlertProps) {
  const content = {
    pt: {
      signup: {
        title: "Sobre o email de confirmação",
        description:
          "Verifique sua caixa de entrada e pasta de spam. O email virá de noreply@mail.app.supabase.io. Se não receber, pode ser devido às limitações do servidor gratuito do Supabase.",
      },
      reset: {
        title: "Sobre o email de recuperação",
        description:
          "Verifique sua caixa de entrada e pasta de spam. O email virá de noreply@mail.app.supabase.io. Se não receber, pode ser devido às limitações do servidor gratuito do Supabase.",
      },
    },
    es: {
      signup: {
        title: "Sobre el email de confirmación",
        description:
          "Revisa tu bandeja de entrada y carpeta de spam. El email vendrá de noreply@mail.app.supabase.io. Si no lo recibes, puede ser debido a las limitaciones del servidor gratuito de Supabase.",
      },
      reset: {
        title: "Sobre el email de recuperación",
        description:
          "Revisa tu bandeja de entrada y carpeta de spam. El email vendrá de noreply@mail.app.supabase.io. Si no lo recibes, puede ser debido a las limitaciones del servidor gratuito de Supabase.",
      },
    },
  }

  const validLanguage = language && content[language] ? language : "pt"
  const validType = type && content[validLanguage][type] ? type : "signup"

  const { title, description } = content[validLanguage][validType] || {
    title: "Sobre o email",
    description: "Verifique sua caixa de entrada e pasta de spam.",
  }

  return (
    <Alert className="mt-4">
      <Mail className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>{title}:</strong> {description}
      </AlertDescription>
    </Alert>
  )
}
