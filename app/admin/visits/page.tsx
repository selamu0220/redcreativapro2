'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Download, Eye, Calendar, TrendingUp, BarChart3, RefreshCw, Trash2 } from 'lucide-react'
import { useVisitTracker, type VisitData, type VisitStats } from '@/lib/visit-tracker'

export default function VisitsAdminPage() {
  const { getAllVisits, getStats, exportData, clearData } = useVisitTracker()
  const [visits, setVisits] = useState<VisitData[]>([])
  const [stats, setStats] = useState<VisitStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = () => {
    setIsLoading(true)
    try {
      const allVisits = getAllVisits()
      const visitStats = getStats()
      setVisits(allVisits)
      setStats(visitStats)
    } catch (error) {
      console.error('Error loading visit data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blog-visits-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos de visitas? Esta acción no se puede deshacer.')) {
      clearData()
      loadData()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando datos de visitas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">RC</span>
              </div>
              <span className="text-lg font-semibold text-white">Red Creativa Pro</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/blog" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Inicio
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard de Visitas</h1>
          <p className="text-zinc-400">Monitorea el progreso SEO de tu blog</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-400">Total de Visitas</h3>
                <Eye className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalVisits.toLocaleString()}</p>
              <p className="text-xs text-zinc-500 mt-1">
                Meta: 30,000 visitas ({((stats.totalVisits / 30000) * 100).toFixed(1)}%)
              </p>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-400">Artículos con Visitas</h3>
                <BarChart3 className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalArticles}</p>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-400">Promedio por Artículo</h3>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.averageVisitsPerArticle.toFixed(1)}</p>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-400">Más Visitado</h3>
                <Calendar className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-lg font-bold text-white">
                {stats.mostVisitedArticle ? stats.mostVisitedArticle.visits : 0}
              </p>
              {stats.mostVisitedArticle && (
                <p className="text-xs text-zinc-500 mt-1 truncate">
                  {stats.mostVisitedArticle.title}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={loadData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Datos</span>
          </button>

          <button
            onClick={handleClearData}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpiar Datos</span>
          </button>
        </div>

        {/* Visits Table */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold">Visitas por Artículo</h2>
          </div>
          
          {visits.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos de visitas aún</p>
              <p className="text-sm mt-2">Las visitas se registrarán automáticamente cuando los usuarios visiten los artículos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Artículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Visitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Primera Visita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Última Visita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {visits.map((visit) => (
                    <tr key={visit.articleId} className="hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white truncate max-w-xs">
                            {visit.title}
                          </p>
                          <p className="text-xs text-zinc-500">ID: {visit.articleId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                          {visit.visits} visitas
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {formatDate(visit.firstVisit)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {formatDate(visit.lastVisit)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/blog/${visit.articleId}`}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Ver artículo
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Progress to Goal */}
        {stats && stats.totalVisits > 0 && (
          <div className="mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-4">Progreso hacia la Meta de 30,000 Visitas</h3>
            <div className="w-full bg-zinc-800 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.totalVisits / 30000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>{stats.totalVisits.toLocaleString()} visitas</span>
              <span>30,000 visitas (meta)</span>
            </div>
            <p className="text-sm text-zinc-500 mt-2">
              Faltan {Math.max(30000 - stats.totalVisits, 0).toLocaleString()} visitas para alcanzar tu meta
            </p>
          </div>
        )}
      </div>
    </div>
  )
}