export async function GET() {
  try {
    // Dados hardcoded baseados no seu usuário real
    const stats = {
      totalUsers: 1,
      newThisWeek: 1,
      activeUsers: 1,
      completions: 8,
      recentUsers: [
        {
          id: "1",
          email: "diogocgarcia@gmail.com",
          name: "Diogo Garcia",
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          progress_percentage: 67,
          completed_steps: 8,
          total_steps: 12,
        },
      ],
      progressByCategory: [
        { category: "Fundamentos", completed: 3, total: 4 },
        { category: "Prática", completed: 3, total: 4 },
        { category: "Avançado", completed: 2, total: 4 },
      ],
    }

    return Response.json(stats)
  } catch (error) {
    return Response.json(
      {
        error: "Erro ao buscar estatísticas",
      },
      { status: 500 },
    )
  }
}
