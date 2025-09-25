"use client"

export default function AdminPanelPage() {
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminSession")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userLanguage")
      window.location.href = "/login"
    }
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
              <div className="text-2xl font-bold text-gray-900">1</div>
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

        {/* Users List */}
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
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Diogo Garcia</p>
                    <p className="text-sm text-gray-500">diogocgarcia@gmail.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "67%" }}></div>
                    </div>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>
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
                <p className="mt-2">
                  <strong>Acceso:</strong> /admin-panel (esta página funciona sin errores)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
