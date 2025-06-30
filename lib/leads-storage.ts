"use client"

export interface Lead {
  id: string
  timestamp: string
  name: string
  email: string
  whatsapp: string
  age: string
  gender: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  interessado: boolean
  answers: Array<{
    questionId: number
    score: number
    theme: string
  }>
  totalScore: number
}

export class LeadsStorage {
  private static STORAGE_KEY = "quiz_leads_data"

  static saveLead(leadData: Omit<Lead, "id" | "timestamp">): Lead {
    const lead: Lead = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      ...leadData,
    }

    const existingLeads = this.getAllLeads()
    existingLeads.push(lead)

    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingLeads))
    }

    return lead
  }

  static getAllLeads(): Lead[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static clearAllLeads(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  static exportToCSV(): string {
    const leads = this.getAllLeads()

    const headers = [
      "ID",
      "Data/Hora",
      "Nome",
      "Email",
      "WhatsApp",
      "Idade",
      "Gênero",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "UTM Content",
      "UTM Term",
      "Interessado",
      "Score Total",
      "Respostas Quiz",
    ]

    const csvContent = [
      headers.join(","),
      ...leads.map((lead) =>
        [
          lead.id,
          new Date(lead.timestamp).toLocaleString("pt-BR"),
          `"${lead.name}"`,
          lead.email,
          `"${lead.whatsapp}"`,
          lead.age,
          lead.gender,
          lead.utm_source || "",
          lead.utm_medium || "",
          lead.utm_campaign || "",
          lead.utm_content || "",
          lead.utm_term || "",
          lead.interessado ? "Sim" : "Não",
          lead.totalScore,
          `"${lead.answers.map((a) => `Q${a.questionId}:${a.score}`).join("; ")}"`,
        ].join(","),
      ),
    ].join("\n")

    return csvContent
  }

  static downloadCSV(): void {
    const csvContent = this.exportToCSV()
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `quiz_leads_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
