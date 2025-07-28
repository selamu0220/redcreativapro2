'use client'

import Link from 'next/link'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { useEffect, useState } from 'react'

function HomePage() {
  const { user, logout } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const tools = [
    {
      name: "Escritor IA",
      description: "Genera y mejora contenido con inteligencia artificial",
      icon: "✍️",
      href: "/escritor-ia",
      color: "bg-blue-500"
    },
    {
      name: "Correos IA",
      description: "Redacta emails profesionales automáticamente",
      icon: "📧",
      href: "/correos-ia",
      color: "bg-green-500"
    },
    {
      name: "Chat IA con Prompts",
      description: "Conversa con IA usando prompts predefinidos",
      icon: "💬",
      href: "/prompts",
      color: "bg-purple-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Red Creativa Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.displayName || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Herramientas de IA para Creativos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Potencia tu creatividad con nuestras herramientas de inteligencia artificial. 
              Genera contenido, redacta emails y chatea con IA de forma profesional.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {tools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${tool.color} text-white rounded-lg text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
                <div className="px-8 pb-8">
                  <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 transition-colors">
                    Usar herramienta
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Settings Link */}
          <div className="text-center">
            <Link
              href="/ajustes"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              ⚙️ Ajustes
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Estadísticas de Uso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">1,247</div>
                <div className="text-gray-600 font-medium">Textos Generados</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">892</div>
                <div className="text-gray-600 font-medium">Correos Enviados</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">456</div>
                <div className="text-gray-600 font-medium">Chats Realizados</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  )
}