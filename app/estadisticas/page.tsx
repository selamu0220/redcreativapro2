'use client'

import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'

function EstadisticasPage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchUsageStats = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('Fetching stats for user:', user?.email)

      const response = await fetch('/api/usage-stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar estadísticas')
      }

      setStats(data)
    } catch (err: any) {
      console.error('Error al obtener estadísticas:', err)
      setError(`Error al cargar estadísticas: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.email) {
      fetchUsageStats()
    } else {
      setLoading(false)
      setError('No hay usuario autenticado')
    }
  }, [user])

  // Simple stats display component
  const SimpleStats = () => {
    if (loading) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 animate-fade-in-up">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
            <span className="text-zinc-400 text-lg">Cargando estadísticas...</span>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-zinc-900 border border-red-800 rounded-xl p-8 animate-fade-in-up">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Error al cargar estadísticas</h3>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchUsageStats}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      )
    }

    if (!stats) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 animate-fade-in-up">
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-zinc-400 text-xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sin datos disponibles</h3>
            <p className="text-zinc-400">No se encontraron estadísticas para mostrar</p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Resumen de Uso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-800 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-500 text-xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Total Generaciones</h3>
              <p className="text-3xl font-bold text-blue-400">{stats.totalGenerations || 0}</p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-500 text-xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Hoy</h3>
              <p className="text-3xl font-bold text-green-400">{stats.generationsToday || 0}</p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-500 text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Límite Diario</h3>
              <p className="text-3xl font-bold text-orange-400">{stats.dailyLimit || 0}</p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-500 text-xl">⭐</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Estado</h3>
              <p className="text-lg font-bold text-purple-400 capitalize">{stats.subscriptionStatus || 'free'}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={fetchUsageStats}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            🔄 Actualizar Estadísticas
          </button>
        </div>
      </div>
    )
  }

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
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                Inicio
              </Link>
              <Link href="/escritor-ia" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                Escritor IA
              </Link>

              <Link href="/calendario" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                Calendario
              </Link>
              <Link href="/historial" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                Historial
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

          {/* Simple Stats Component */}
          <SimpleStats />

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


            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EstadisticasPage
