import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Welcome Section */}
        <div className="text-center space-y-4">
          <Link href="/landing" className="inline-block">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Verifique seu email</h1>
            <p className="text-muted-foreground text-balance">Enviamos um link de confirmação para seu email</p>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Confirme seu email</CardTitle>
            <CardDescription className="text-base">
              Enviamos um email de confirmação para você. Clique no link do email para ativar sua conta e começar sua
              jornada de transformação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-secondary/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Verifique sua caixa de entrada</p>
                  <p className="text-muted-foreground">O email pode levar alguns minutos para chegar</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-secondary/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Verifique o spam</p>
                  <p className="text-muted-foreground">Às vezes o email pode ir para a pasta de spam</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/auth/login">
                <Button className="w-full">Ir para login</Button>
              </Link>

              <Link href="/landing">
                <Button variant="outline" className="w-full bg-transparent">
                  Voltar ao início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Não recebeu o email? Verifique se o endereço está correto e tente novamente.
          </p>
        </div>
      </div>
    </div>
  )
}
