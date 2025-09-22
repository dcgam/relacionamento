import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
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
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-amber-600">Error en la confirmación</CardTitle>
            <CardDescription>Hubo un problema al confirmar tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                El enlace de confirmación puede haber expirado o ya fue utilizado.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">¿Qué puedes hacer?</h3>
                <ul className="text-sm text-amber-700 space-y-1 text-left">
                  <li>• Intenta hacer login con tu email y contraseña</li>
                  <li>• Si no funciona, solicita un nuevo email de confirmación</li>
                  <li>• Verifica que el enlace esté completo</li>
                  <li>• Revisa tu carpeta de spam</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/">Intentar Login</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/register">Registrarse de nuevo</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                ¿Necesitas ayuda?{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contáctanos
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
