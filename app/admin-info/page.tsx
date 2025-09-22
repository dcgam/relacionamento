import { AdminAccessInfo } from "@/components/admin-access-info"

export default function AdminInfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Informações de Acesso Admin</h1>
          <p className="text-muted-foreground">Credenciais e instruções para acessar o painel administrativo</p>
        </div>
        <AdminAccessInfo />
      </div>
    </div>
  )
}
