'use client'

import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import UsageStats from '../components/UsageStats'

function EstadisticasPage() {
  const { user, logout } = useAuth()

  return (
    <ProtectedRoute>
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
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                  Inicio
                </Link>
                <Link href="/escritor-ia" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                  Escritor IA
                </Link>
                <Link href="/correos-ia" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                  Correos IA
                </Link>
                <Link href="/estadisticas" className="text-white font-medium text-sm">
                  Estadísticas
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                <Link
                  href="/ajustes"
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Ajustes
                </Link>
                <div className="text-sm text-zinc-400">
                  <span className="font-medium">{user?.displayName || user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-zinc-800"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Estadísticas en Tiempo Real
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Tu Actividad
                <br />
                <span className="text-zinc-400">con IA</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Visualiza tu progreso y uso de las herramientas de Red Creativa Pro en tiempo real.
              </p>
            </div>

            {/* Usage Stats Component */}
            <UsageStats />

            {/* Additional Info */}
            <div className="mt-16 bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Información Importante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-300">
                <div className="space-y-3">
                  <p className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Actualización automática cada 30 segundos
                  </p>
                  <p className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Datos almacenados de forma segura
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Botón "Actualizar" para datos más recientes
                  </p>
                  <p className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Historial completo desde el registro
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                Acceso Rápido a Herramientas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4">
                      ✍️
                    </div>
                    <h3 className="text-xl font-semibold text-white">Escritor IA</h3>
                  </div>
                  <p className="text-zinc-400 mb-6 leading-relaxed">
                    Mejora y genera textos con inteligencia artificial avanzada
                  </p>
                  <Link
                    href="/escritor-ia"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-300 group-hover:scale-105"
                  >
                    Ir a Escritor IA
                    <span className="ml-2">→</span>
                  </Link>
                </div>
                
                <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4">
                      📧
                    </div>
                    <h3 className="text-xl font-semibold text-white">Correos IA</h3>
                  </div>
                  <p className="text-zinc-400 mb-6 leading-relaxed">
                    Genera y envía correos profesionales automáticamente
                  </p>
                  <Link
                    href="/correos-ia"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-300 group-hover:scale-105"
                  >
                    Ir a Correos IA
                    <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default EstadisticasPage