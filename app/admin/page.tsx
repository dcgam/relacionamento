"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LeadsStorage, type Lead } from "@/lib/leads-storage"
import { Download, Search, Trash2, Users, TrendingUp, DollarSign, Calendar } from "lucide-react"

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const allLeads = LeadsStorage.getAllLeads()
      setLeads(allLeads)
      setFilteredLeads(allLeads)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (searchTerm) {
      const filtered = leads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.whatsapp.includes(searchTerm),
      )
      setFilteredLeads(filtered)
    } else {
      setFilteredLeads(leads)
    }
  }, [searchTerm, leads])

  const handleAuth = () => {
    if (password === "admin123") {
      setIsAuthenticated(true)
    } else {
      alert("Senha incorreta!")
    }
  }

  const handleDownload = () => {
    LeadsStorage.downloadCSV()
  }

  const handleClearAll = () => {
    if (confirm("Tem certeza que deseja apagar todos os leads? Esta ação não pode ser desfeita.")) {
      LeadsStorage.clearAllLeads()
      setLeads([])
      setFilteredLeads([])
    }
  }

  const stats = {
    total: leads.length,
    interessados: leads.filter((lead) => lead.interessado).length,
    scoreAlto: leads.filter((lead) => lead.totalScore >= 8).length,
    scoreBaixo: leads.filter((lead) => lead.totalScore <= 4).length,
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111111] to-[#252525] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-lg border-2 border-white/30 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-rose-400">🔐 Acesso Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
            />
            <Button onClick={handleAuth} className="w-full bg-rose-500 hover:bg-rose-600">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111111] to-[#252525] text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-rose-400">📊 Dashboard de Leads</h1>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Baixar CSV
            </Button>
            <Button onClick={handleClearAll} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Tudo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-blue-300">Total de Leads</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.interessados}</div>
              <div className="text-green-300">Interessados</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.scoreAlto}</div>
              <div className="text-yellow-300">Score Alto (8+)</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.scoreBaixo}</div>
              <div className="text-red-300">Score Baixo (≤4)</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, email ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Leads Table */}
        <Card className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-lg border-2 border-white/30">
          <CardHeader>
            <CardTitle className="text-white">📋 Leads Capturados ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 text-gray-300">Data</th>
                    <th className="text-left p-3 text-gray-300">Nome</th>
                    <th className="text-left p-3 text-gray-300">Email</th>
                    <th className="text-left p-3 text-gray-300">WhatsApp</th>
                    <th className="text-left p-3 text-gray-300">Score</th>
                    <th className="text-left p-3 text-gray-300">Status</th>
                    <th className="text-left p-3 text-gray-300">UTM</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3 text-gray-300">
                        {new Date(lead.timestamp).toLocaleDateString("pt-BR")}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(lead.timestamp).toLocaleTimeString("pt-BR")}
                        </span>
                      </td>
                      <td className="p-3 text-white font-medium">{lead.name}</td>
                      <td className="p-3 text-gray-300">{lead.email}</td>
                      <td className="p-3 text-gray-300">{lead.whatsapp}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            lead.totalScore <= 4 ? "destructive" : lead.totalScore >= 8 ? "default" : "secondary"
                          }
                        >
                          {lead.totalScore}/12
                        </Badge>
                      </td>
                      <td className="p-3">
                        {lead.interessado ? (
                          <Badge className="bg-green-600">💰 Interessado</Badge>
                        ) : (
                          <Badge variant="outline">📋 Lead</Badge>
                        )}
                      </td>
                      <td className="p-3 text-xs text-gray-400">
                        {lead.utm_source && (
                          <div>
                            <strong>Source:</strong> {lead.utm_source}
                          </div>
                        )}
                        {lead.utm_campaign && (
                          <div>
                            <strong>Campaign:</strong> {lead.utm_campaign}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeads.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  {leads.length === 0 ? "Nenhum lead capturado ainda." : "Nenhum lead encontrado para a busca."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
