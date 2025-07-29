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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Cargando...</p>
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
      description: "Genera y mejora contenido con inteligencia artificial avanzada",
      icon: "✍️",
      href: "/escritor-ia",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Correos IA",
      description: "Redacta emails profesionales automáticamente con contexto",
      icon: "📧",
      href: "/correos-ia",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      name: "Chat IA con Prompts",
      description: "Conversa con IA usando prompts predefinidos y personalizados",
      icon: "💬",
      href: "/prompts",
      gradient: "from-purple-500 to-pink-500"
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <span className="text-black font-bold text-sm">RC</span>
              </div>
              <h1 className="text-lg font-semibold text-white">Red Creativa Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/ajustes"
                className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
              >
                Ajustes
              </Link>
              <Link
                href="/planes"
                className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
              >
                Planes
              </Link>
              <div className="text-sm text-zinc-400">
                <span className="font-medium">{user?.displayName || user?.email}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-zinc-800"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Potenciado por IA
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Herramientas de IA
              <br />
              <span className="text-zinc-400">para creativos</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Genera contenido, redacta emails y chatea con IA. 
              Todo lo que necesitas para potenciar tu creatividad.
            </p>
            <div className="mt-8">
              <Link
                href="/escritor-ia"
                className="inline-flex items-center px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-zinc-200 transition-colors"
              >
                Comenzar ahora
              </Link>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {tools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                className="group bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:bg-zinc-800 transition-colors"
              >
                <div className="text-2xl mb-4">{tool.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-zinc-300 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  {tool.description}
                </p>
                <div className="inline-flex items-center text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">
                  Usar herramienta
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-white mb-8 text-center">
              Estadísticas de uso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">1,247</div>
                <div className="text-zinc-400 text-sm">Textos generados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">892</div>
                <div className="text-zinc-400 text-sm">Correos enviados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">456</div>
                <div className="text-zinc-400 text-sm">Chats realizados</div>
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