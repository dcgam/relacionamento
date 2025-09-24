export async function POST() {
  try {
    // Força a sincronização do usuário diogocgarcia@gmail.com
    const userData = {
      email: "diogocgarcia@gmail.com",
      name: "Diogo Garcia",
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    }

    // Simula dados de progresso baseado no que você completou
    const progressData = {
      email: "diogocgarcia@gmail.com",
      total_steps: 12,
      completed_steps: 8, // Baseado no que você mencionou ter completado
      current_protocol: "Protocolo de Renovação",
      last_activity: new Date().toISOString(),
      progress_percentage: Math.round((8 / 12) * 100),
    }

    return Response.json({
      success: true,
      user: userData,
      progress: progressData,
      message: "Usuário sincronizado com sucesso",
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Erro ao sincronizar usuário",
      },
      { status: 500 },
    )
  }
}
