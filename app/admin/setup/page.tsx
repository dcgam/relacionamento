"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, CheckCircle, AlertCircle, Shield, Database, Users, BarChart3 } from "lucide-react"
import { useState } from "react"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sqlScript = `-- Crear el primer super admin
-- SUSTITUYA 'su-email@ejemplo.com' por el email real del administrador
INSERT INTO public.admin_users (id, email, role, is_active) 
SELECT 
  id, 
  email, 
  'super_admin',
  true
FROM auth.users 
WHERE email = '${email || "su-email@ejemplo.com"}'
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  updated_at = NOW();`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Panel de Administración</h1>
          <p className="mt-2 text-gray-600">Guía paso a paso para configurar el acceso de administrador</p>
        </div>

        <div className="grid gap-6">
          {/* Paso 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  1
                </div>
                Ejecutar Scripts de Base de Datos
              </CardTitle>
              <CardDescription>Primero debe ejecutar los scripts SQL para crear las tablas necesarias</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Ejecute los siguientes scripts en orden:
                  <br />
                  1. <code className="bg-gray-100 px-2 py-1 rounded">scripts/003_admin_system_setup.sql</code>
                  <br />
                  2. <code className="bg-gray-100 px-2 py-1 rounded">scripts/004_progress_analytics_functions.sql</code>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Paso 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  2
                </div>
                Crear Cuenta de Usuario Normal
              </CardTitle>
              <CardDescription>Registre una cuenta normal que se convertirá en administrador</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    1. Vaya a <code className="bg-gray-100 px-2 py-1 rounded">/register</code> y cree una cuenta normal
                    <br />
                    2. Confirme el email a través del enlace enviado
                    <br />
                    3. Asegúrese de que la cuenta esté activa antes de continuar
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Paso 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  3
                </div>
                Convertir Usuario en Administrador
              </CardTitle>
              <CardDescription>Ejecute el script SQL para otorgar permisos de administrador</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-email">Email del Administrador</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@renove-se.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Script SQL para ejecutar:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(sqlScript)}
                      className="flex items-center gap-2"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                  <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
                    <code>{sqlScript}</code>
                  </pre>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ejecute este script en su base de datos Supabase después de sustituir el email.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Paso 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                  4
                </div>
                Acceder al Panel de Administración
              </CardTitle>
              <CardDescription>Ya puede acceder al panel de administración</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Una vez completados los pasos anteriores:
                    <br />
                    1. Vaya a <code className="bg-gray-100 px-2 py-1 rounded">/admin/login</code>
                    <br />
                    2. Use las mismas credenciales de su cuenta normal
                    <br />
                    3. Será redirigido al panel de administración
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">Dashboard</h4>
                    <p className="text-sm text-gray-600">Estadísticas y métricas</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium">Usuarios</h4>
                    <p className="text-sm text-gray-600">Gestión de usuarios</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium">Progreso</h4>
                    <p className="text-sm text-gray-600">Seguimiento detallado</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
