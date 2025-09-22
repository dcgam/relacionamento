import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Key, Link, User, Settings } from "lucide-react"

export function AdminAccessInfo() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Acesso ao Painel de Administração
          </CardTitle>
          <CardDescription>Credenciais e links para acessar o sistema administrativo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <span className="font-medium">URL de Login:</span>
              </div>
              <Badge variant="outline">/admin/login</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Email:</span>
              </div>
              <Badge variant="outline">admin@renovese.com</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="font-medium">Senha:</span>
              </div>
              <Badge variant="outline">Admin123!</Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              URLs do Sistema
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Dashboard Principal:</span>
                <code className="bg-muted px-2 py-1 rounded">/admin</code>
              </div>
              <div className="flex justify-between">
                <span>Gestão de Usuários:</span>
                <code className="bg-muted px-2 py-1 rounded">/admin/users</code>
              </div>
              <div className="flex justify-between">
                <span>Progresso dos Usuários:</span>
                <code className="bg-muted px-2 py-1 rounded">/admin/progress</code>
              </div>
              <div className="flex justify-between">
                <span>Configuração de Emails:</span>
                <code className="bg-muted px-2 py-1 rounded">/admin/email-config</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
