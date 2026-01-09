'use client'

import React from 'react'
import Link from 'next/link'
import {
  Home,
  PenTool,
  Mail,
  BarChart3,
  LayoutDashboard,
  CreditCard,
  BookOpen,
  Phone,
  HelpCircle,
  Shield,
  Calendar,
  Users,
  FileText,
  Zap,
  Settings,
  Globe,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

interface SitemapSection {
  title: string
  icon: React.ReactNode
  links: {
    name: string
    url: string
    description?: string
    priority: 'high' | 'medium' | 'low'
    external?: boolean
  }[]
}

const sitemapData: SitemapSection[] = [
  {
    title: 'Páginas Principales',
    icon: <Home className="w-5 h-5" />,
    links: [
      { name: 'Inicio', url: '/', description: 'Página principal de Red Creativa Pro', priority: 'high' },
      { name: 'Dashboard', url: '/dashboard', description: 'Panel de control principal', priority: 'high' },
      { name: 'Planes y Precios', url: '/planes', description: 'Opciones de suscripción', priority: 'high' }
    ]
  },
  {
    title: 'Herramientas de IA',
    icon: <Zap className="w-5 h-5" />,
    links: [
      { name: 'Escritor IA', url: '/escritor-ia', description: 'Generador de contenido con inteligencia artificial', priority: 'high' },
      { name: 'SEO Dashboard', url: '/seo-dashboard', description: 'Herramientas de optimización SEO', priority: 'high' },
      { name: 'Prompts', url: '/prompts', description: 'Biblioteca de prompts para IA', priority: 'medium' }
    ]
  },
  {
    title: 'Gestión de Contenido',
    icon: <FileText className="w-5 h-5" />,
    links: [
      { name: 'Blog', url: '/blog', description: 'Artículos y recursos', priority: 'high' },
      { name: 'Documentos', url: '/documentos', description: 'Gestión de documentos', priority: 'medium' },
      { name: 'Plantillas', url: '/plantillas', description: 'Plantillas prediseñadas', priority: 'medium' }
    ]
  },
  {
    title: 'Gestión y Organización',
    icon: <LayoutDashboard className="w-5 h-5" />,
    links: [
      { name: 'Calendario', url: '/calendario', description: 'Programación y eventos', priority: 'medium' },
      { name: 'Estadísticas', url: '/estadisticas', description: 'Análisis y métricas', priority: 'medium' }
    ]
  },
  {
    title: 'Cuenta y Configuración',
    icon: <Settings className="w-5 h-5" />,
    links: [
      { name: 'Ajustes', url: '/ajustes', description: 'Configuración de cuenta', priority: 'medium' },
      { name: 'Suscripción', url: '/suscripcion', description: 'Gestión de suscripción', priority: 'medium' },
      { name: 'Historial', url: '/historial', description: 'Historial de actividad', priority: 'low' }
    ]
  },
  {
    title: 'Soporte y Legal',
    icon: <HelpCircle className="w-5 h-5" />,
    links: [
      { name: 'Contacto', url: '/contacto', description: 'Formulario de contacto', priority: 'medium' },
      { name: 'Centro de Ayuda', url: '/centro-ayuda', description: 'Documentación y tutoriales', priority: 'medium' },
      { name: 'Preguntas Frecuentes', url: '/preguntas-frecuentes', description: 'FAQ y respuestas comunes', priority: 'medium' },
      { name: 'Aviso Legal', url: '/aviso-legal', description: 'Términos legales', priority: 'low' }
    ]
  }
]

const PriorityBadge = ({ priority }: { priority: 'high' | 'medium' | 'low' }) => {
  const colors = {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const labels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[priority]}`}>
      {labels[priority]}
    </span>
  )
}

export default function SitemapVisual() {
  const leftColumnSections = sitemapData.slice(0, Math.ceil(sitemapData.length / 2))
  const rightColumnSections = sitemapData.slice(Math.ceil(sitemapData.length / 2))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Globe className="w-8 h-8 text-blue-600" />
                Mapa del Sitio
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Navegación completa de Red Creativa Pro
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Páginas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sitemapData.reduce((acc, section) => acc + section.links.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Herramientas IA</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sitemapData.find(s => s.title === 'Herramientas de IA')?.links.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Secciones</p>
                <p className="text-2xl font-bold text-gray-900">{sitemapData.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {leftColumnSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {section.icon}
                    </div>
                    {section.title}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="group">
                        <Link
                          href={link.url}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900 group-hover:text-blue-700">
                                {link.name}
                              </h3>
                              <PriorityBadge priority={link.priority} />
                            </div>
                            {link.description && (
                              <p className="text-sm text-gray-600">{link.description}</p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {rightColumnSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {section.icon}
                    </div>
                    {section.title}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="group">
                        <Link
                          href={link.url}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900 group-hover:text-purple-700">
                                {link.name}
                              </h3>
                              <PriorityBadge priority={link.priority} />
                            </div>
                            {link.description && (
                              <p className="text-sm text-gray-600">{link.description}</p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Necesitas ayuda navegando?
            </h3>
            <p className="text-gray-600 mb-4">
              Nuestro equipo está aquí para ayudarte a aprovechar al máximo Red Creativa Pro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Contactar Soporte
              </Link>
              <Link
                href="/centro-ayuda"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Centro de Ayuda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}