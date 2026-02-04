'use client'

import React, { useState, useEffect } from 'react'
import { InternalLinkingService, PageLinkProfile } from '@/lib/internal-linking'
import { blogPosts } from '@/lib/blog-data'
import { useInternalLinkTracking } from './ContentWithInternalLinks'

interface LinkPerformanceData {
  url: string
  clicks: number
  sources: string[]
  lastClick: Date
  ctr?: number
  avgTimeOnPage?: number
}

interface OrphanPage {
  id: string
  title: string
  url: string
  category: string
  priority: number
}

export default function InternalLinkDashboard() {
  const [linkingService] = useState(() => new InternalLinkingService(blogPosts))
  const { getLinkPerformance } = useInternalLinkTracking()

  const [performanceData, setPerformanceData] = useState<LinkPerformanceData[]>([])
  const [orphanPages, setOrphanPages] = useState<OrphanPage[]>([])
  const [pageProfiles, setPageProfiles] = useState<PageLinkProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadDashboardData()
  }, [selectedTimeRange])

  const loadDashboardData = async () => {
    setIsLoading(true)

    try {
      // Load performance data from tracking
      const performance = getLinkPerformance()
      setPerformanceData(performance)

      // Analyze all pages for orphan status
      const allPages = [
        { id: 'home', title: 'Inicio', url: '/', category: 'main', priority: 1.0 },
        { id: 'escritor-ia', title: 'Escritor IA', url: '/escritor-ia', category: 'tools', priority: 0.95 },
        { id: 'seo-dashboard', title: 'SEO Dashboard', url: '/seo-dashboard', category: 'tools', priority: 0.9 },
        { id: 'dashboard', title: 'Dashboard', url: '/dashboard', category: 'app', priority: 0.9 },
        { id: 'blog', title: 'Blog', url: '/blog', category: 'content', priority: 0.9 },
        { id: 'planes', title: 'Planes', url: '/planes', category: 'commercial', priority: 0.9 },
        ...blogPosts.map(post => ({
          id: post.id,
          title: post.title,
          url: `/blog/${post.id}`,
          category: post.category,
          priority: 0.6
        }))
      ]

      // Mock existing links for analysis (in real app, this would come from database)
      const mockExistingLinks: any[] = []

      // Analyze each page
      const profiles = allPages.map(page =>
        linkingService.analyzePageLinkProfile(page.id, mockExistingLinks)
      )
      setPageProfiles(profiles)

      // Find orphan pages
      const orphans = allPages.filter(page => {
        const profile = profiles.find(p => p.pageId === page.id)
        return profile?.orphanStatus && page.id !== 'home'
      })
      setOrphanPages(orphans)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Últimos 7 días'
      case '30d': return 'Últimos 30 días'
      case '90d': return 'Últimos 90 días'
      default: return 'Últimos 30 días'
    }
  }

  const topPerformingLinks = performanceData
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  const totalClicks = performanceData.reduce((sum, link) => sum + link.clicks, 0)
  const averageCTR = performanceData.length > 0
    ? performanceData.reduce((sum, link) => sum + (link.ctr || 0), 0) / performanceData.length
    : 0

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Dashboard de Enlaces Internos
          </h2>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalClicks}</div>
            <div className="text-sm text-blue-800">Clicks Totales</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{performanceData.length}</div>
            <div className="text-sm text-green-800">Enlaces Activos</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{orphanPages.length}</div>
            <div className="text-sm text-yellow-800">Páginas Huérfanas</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{(averageCTR * 100).toFixed(1)}%</div>
            <div className="text-sm text-purple-800">CTR Promedio</div>
          </div>
        </div>
      </div>

      {/* Top Performing Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Enlaces con Mejor Rendimiento
        </h3>
        {topPerformingLinks.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay datos de rendimiento disponibles</p>
        ) : (
          <div className="space-y-3">
            {topPerformingLinks.map((link, index) => (
              <div key={link.url} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {link.url}
                  </div>
                  <div className="text-sm text-gray-600">
                    Fuentes: {link.sources.join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    {link.clicks}
                  </div>
                  <div className="text-xs text-gray-500">clicks</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orphan Pages */}
      {orphanPages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Páginas Huérfanas ({orphanPages.length})
          </h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="text-amber-600 mr-2">⚠️</div>
              <div className="text-sm text-amber-800">
                Las páginas huérfanas no tienen enlaces entrantes y pueden tener problemas de SEO.
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {orphanPages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-red-900">
                    {page.title}
                  </div>
                  <div className="text-sm text-red-600">
                    {page.url} • {page.category}
                  </div>
                </div>
                <div className="text-sm text-red-500">
                  Prioridad: {page.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page Link Profiles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Perfiles de Enlaces por Página
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Página
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enlaces Salientes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enlaces Entrantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Densidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hub Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageProfiles.slice(0, 20).map((profile) => (
                <tr key={profile.pageId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {profile.pageId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.internalLinksOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.internalLinksIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.linkDensity.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.hubScore.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {profile.orphanStatus ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Huérfana
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Conectada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recomendaciones de Optimización
        </h3>
        <div className="space-y-3">
          {orphanPages.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="font-medium text-amber-800 mb-2">
                🔗 Conectar páginas huérfanas
              </div>
              <div className="text-sm text-amber-700">
                Tienes {orphanPages.length} páginas sin enlaces entrantes. Considera agregar enlaces desde páginas relacionadas.
              </div>
            </div>
          )}

          {performanceData.length < 10 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-800 mb-2">
                📈 Aumentar enlaces internos
              </div>
              <div className="text-sm text-blue-700">
                Pocos enlaces internos detectados. Implementa más enlaces contextuales para mejorar la navegación y SEO.
              </div>
            </div>
          )}

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="font-medium text-green-800 mb-2">
              ✅ Implementar seguimiento avanzado
            </div>
            <div className="text-sm text-green-700">
              Considera implementar Google Analytics 4 para obtener métricas más detalladas de rendimiento de enlaces internos.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
