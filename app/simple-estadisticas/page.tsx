'use client'

import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'

interface SimpleStats {
  totalGenerations: number
  generationsToday: number
}

export default function SimpleEstadisticas() {
  const { user, supabaseUser } = useAuth()
  const [stats, setStats] = useState<SimpleStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!supabaseUser?.email) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/usage-stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabaseUser])

  if (loading) return <div className="text-white">Cargando...</div>
  if (!stats) return <div className="text-white">No hay datos</div>

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Estadísticas Simples</h1>
      <div className="bg-zinc-900 p-6 rounded-lg">
        <p>Total generaciones: {stats.totalGenerations}</p>
        <p>Generaciones hoy: {stats.generationsToday}</p>
        <p>Usuario: {supabaseUser?.email || 'No user'}</p>
      </div>
    </div>
  )
}