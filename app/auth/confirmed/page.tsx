import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ConfirmedPage() {
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
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">¡Cuenta confirmada!</CardTitle>
            <CardDescription>Tu email ha sido verificado exitosamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                ¡Perfecto! Tu cuenta ha sido confirmada y ya puedes acceder a todas las funcionalidades de Renove-se.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">¿Qué puedes hacer ahora?</h3>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Acceder a tu dashboard personalizado</li>
                  <li>• Completar tu perfil de transformación</li>
                  <li>• Comenzar tu viaje de crecimiento personal</li>
                  <li>• Explorar todas nuestras herramientas</li>
                </ul>
              </div>

              <Button asChild className="w-full">
                <Link href="/dashboard">Ir a mi Dashboard</Link>
              </Button>

              <p className="text-xs text-muted-foreground">
                ¿Tienes problemas?{" "}
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
