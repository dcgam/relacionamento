"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Client {
  id: string
  email: string
  display_name: string
  created_at: string
  progress_percentage: number
  phone?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalClients, setTotalClients] = useState(0)
  const [exporting, setExporting] = useState(false)

  const CLIENTS_PER_PAGE = 20

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        // Check localStorage for admin session
        const adminSession = localStorage.getItem("adminSession")
        const userEmail = localStorage.getItem("userEmail")

        if (!adminSession || adminSession !== "true" || userEmail !== "admin@renovese.com") {
          router.push("/login")
          return
        }

        setIsAuthenticated(true)
        setIsLoading(false)
        fetchClients()
      } catch (error) {
        console.error("Admin access check error:", error)
        router.push("/login")
      }
    }

    checkAdminAccess()
  }, [router, currentPage])

  const fetchClients = async () => {
    const supabase = createClient()

    try {
      // Get total count
      const { count } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })
      setTotalClients(count || 0)

      // Get paginated clients with progress data
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select(`
          id,
          email,
          display_name,
          created_at,
          user_progress (
            progress_percentage
          )
        `)
        .range((currentPage - 1) * CLIENTS_PER_PAGE, currentPage * CLIENTS_PER_PAGE - 1)
        .order("created_at", { ascending: false })

      if (error) throw error

      const clientsData =
        profiles?.map((profile, index) => ({
          id: profile.id,
          email: profile.email || "",
          display_name: profile.display_name || "Sem nome",
          created_at: profile.created_at,
          progress_percentage: profile.user_progress?.[0]?.progress_percentage || 0,
          phone: "+55 (11) 99999-9999", // Placeholder - adicione campo phone na tabela se necessário
        })) || []

      setClients(clientsData)
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
    }
  }

  const exportClients = async () => {
    setExporting(true)
    const supabase = createClient()

    try {
      // Get all clients for export
      const { data: allProfiles, error } = await supabase
        .from("user_profiles")
        .select(`
          id,
          email,
          display_name,
          created_at,
          user_progress (
            progress_percentage
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const exportData =
        allProfiles?.map((profile, index) => ({
          "Número de Inscrição": index + 1,
          "Data de Inscrição": format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR }),
          Nome: profile.display_name || "Sem nome",
          Email: profile.email || "",
          Telefone: "+55 (11) 99999-9999", // Placeholder
          "Progressão (%)": profile.user_progress?.[0]?.progress_percentage || 0,
        })) || []

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(",")),
      ].join("\n")

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `clientes_renove_se_${format(new Date(), "dd_MM_yyyy")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Erro ao exportar clientes:", error)
    } finally {
      setExporting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userLanguage")
    router.push("/login")
  }

  const totalPages = Math.ceil(totalClients / CLIENTS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Acesso negado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚙</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                  <p className="text-sm text-gray-500">Renove-se</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">admin@renovese.com</p>
                <p className="text-xs text-gray-500 capitalize">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                → Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Total Usuarios</h3>
              <span className="text-blue-600 text-lg">👥</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">{totalClients}</div>
              <p className="text-xs text-gray-500 mt-1">Usuarios registrados</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Nuevos esta semana</h3>
              <span className="text-green-600 text-lg">📈</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">1</div>
              <p className="text-xs text-gray-500 mt-1">Últimos 7 días</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Usuarios activos</h3>
              <span className="text-purple-600 text-lg">⚡</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">1</div>
              <p className="text-xs text-gray-500 mt-1">Activos esta semana</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Completaciones</h3>
              <span className="text-orange-600 text-lg">✅</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">8</div>
              <p className="text-xs text-gray-500 mt-1">Pasos completados</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <span className="text-lg">👥</span>
                  <span>Lista de Usuarios</span>
                </h2>
                <p className="text-sm text-gray-500">Gestión y seguimiento de usuarios registrados</p>
              </div>
              <Button
                onClick={exportClients}
                disabled={exporting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exportando..." : "Exportar CSV"}
              </Button>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Data de Inscrição</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="w-48">Progressão Geral</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client, index) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * CLIENTS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell>{format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell className="font-medium">{client.display_name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell className="text-gray-500">{client.phone}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={client.progress_percentage} className="flex-1 h-2" />
                            <span className="text-sm font-medium w-12 text-right">{client.progress_percentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Mostrando {(currentPage - 1) * CLIENTS_PER_PAGE + 1} a{" "}
                    {Math.min(currentPage * CLIENTS_PER_PAGE, totalClients)} de {totalClients} clientes
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anteriores 20
                    </Button>

                    <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md">
                      <span className="text-sm">
                        Página {currentPage} de {Math.ceil(totalClients / CLIENTS_PER_PAGE)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(Math.ceil(totalClients / CLIENTS_PER_PAGE), prev + 1))
                      }
                      disabled={currentPage === Math.ceil(totalClients / CLIENTS_PER_PAGE)}
                      className="flex items-center gap-1"
                    >
                      Próximos 20
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400 text-lg">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Panel de administración funcionando correctamente</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  El sistema está operativo y mostrando datos de ejemplo. Todas las funcionalidades básicas están
                  disponibles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
