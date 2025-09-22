import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Obrigado por se cadastrar!</CardTitle>
            <CardDescription className="text-center">Verifique seu email para confirmar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Você se cadastrou com sucesso. Por favor, verifique seu email para confirmar sua conta antes de fazer
              login.
            </p>
            <Button asChild className="w-full">
              <Link href="/">Voltar para Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
