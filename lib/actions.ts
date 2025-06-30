"use server"

export async function submitQuizData(data: any) {
  // Simular processamento
  console.log("📊 Dados do Quiz Recebidos:", {
    nome: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    respostas: data.answers?.map((a: any) => `Q${a.questionId}: ${a.score}`),
    utms: {
      source: data.utm_source,
      campaign: data.utm_campaign,
      medium: data.utm_medium,
    },
    interessado: data.interessado ? "Clicou para comprar" : "Completou quiz",
  })

  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Retornar dados para salvar no cliente
  return {
    success: true,
    message: "✅ Dados enviados com sucesso!",
    data: {
      leadId: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      leadData: data, // Retornar os dados para salvar localmente
    },
  }
}
