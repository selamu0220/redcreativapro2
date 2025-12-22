'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

interface UsageStatsData {
  totalGenerations: number
  generationsToday: number
  dailyLimit: number
  subscriptionStatus: string
  lastGenerationAt: string | null
}

export default function EstadisticasSimplePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UsageStatsData | null>(null)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-zinc-400 text-lg">Cargando estadísticas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-zinc-900 border border-red-800 rounded-xl p-8 max-w-md">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Error al cargar estadísticas</h3>
            <p className="text-red-400 mb-4">{error}</p>
            {user?.email && (
              <p className="text-zinc-400 text-sm mb-4">Usuario: {user.email}</p>
            )}
            <button 
              onClick={fetchUsageStats}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-zinc-400 text-xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sin datos disponibles</h3>
            <p className="text-zinc-400">No se encontraron estadísticas para mostrar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tus Estadísticas
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Visualiza tu progreso y uso de las herramientas de Red Creativa Pro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-500 text-xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Total Generaciones</h3>
                <p className="text-3xl font-bold text-blue-400">{stats.totalGenerations}</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-500 text-xl">📈</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Hoy</h3>
                <p className="text-3xl font-bold text-green-400">{stats.generationsToday}</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-500 text-xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Límite Diario</h3>
                <p className="text-3xl font-bold text-orange-400">{stats.dailyLimit}</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-500 text-xl">⭐</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Estado</h3>
                <p className="text-lg font-bold text-purple-400 capitalize">{stats.subscriptionStatus}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={fetchUsageStats}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}