"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Download, Users } from "lucide-react"
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalClients, setTotalClients] = useState(0)
  const [exporting, setExporting] = useState(false)

  const CLIENTS_PER_PAGE = 20

  useEffect(() => {
    fetchClients()
  }, [currentPage])

  const fetchClients = async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
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

  const totalPages = Math.ceil(totalClients / CLIENTS_PER_PAGE)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Listagem de Clientes</h1>
              <p className="text-muted-foreground">{totalClients} clientes cadastrados</p>
            </div>
          </div>

          <Button onClick={exportClients} disabled={exporting} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {exporting ? "Exportando..." : "Exportar Base"}
          </Button>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                        <TableCell className="text-muted-foreground">{client.phone}</TableCell>
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
                  <div className="text-sm text-muted-foreground">
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

                    <div className="flex items-center gap-1 px-3 py-1 bg-muted rounded-md">
                      <span className="text-sm">
                        Página {currentPage} de {totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Próximos 20
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
