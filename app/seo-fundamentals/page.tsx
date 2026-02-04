import Link from 'next/link'
import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'

export const metadata: Metadata = {
  title: 'Fundamentos de SEO | Guía Completa de Optimización para Motores de Búsqueda',
  description: 'Aprende los fundamentos esenciales del SEO: investigación de palabras clave, SEO on-page, link building y SEO técnico. Guía completa basada en las mejores prácticas.',
  alternates: { canonical: 'https://redcreativa.pro/seo-fundamentals' },
  openGraph: {
    title: 'Fundamentos de SEO | Guía Completa',
    description: 'Domina los fundamentos del SEO con nuestra guía completa: desde investigación de keywords hasta SEO técnico.',
    type: 'article',
    images: [{ url: 'https://redcreativa.pro/og-seo-fundamentals.jpg', width: 1200, height: 630 }]
  },
  robots: { index: true, follow: true }
}

// SEO modules data structure
const seoModules = [
  {
    id: 'introduction',
    title: 'Introducción al SEO',
    description: 'Comprende qué es el SEO, por qué es importante y cómo funciona Google',
    estimatedTime: '10 min',
    difficulty: 'Principiante',
    completed: false,
    sections: [
      'Qué es el SEO (5 puntos clave)',
      'Por qué importa el SEO',
      'Proceso de Google: Rastreo → Indexación → Ranking'
    ]
  },
  {
    id: 'keyword-research',
    title: 'Investigación de Palabras Clave',
    description: 'Aprende a identificar y seleccionar las palabras clave correctas para tu contenido',
    estimatedTime: '25 min',
    difficulty: 'Intermedio',
    completed: false,
    sections: [
      'Criterios de selección de keywords (4-5 puntos)',
      'Potencial de tráfico vs Volumen de búsqueda',
      'Técnica 3C para análisis de intención',
      'Herramientas y procesos de investigación',
      'Descubrimiento de keywords de competidores'
    ]
  },
  {
    id: 'on-page-seo',
    title: 'SEO On-Page',
    description: 'Optimiza tu contenido y páginas para mejores rankings en buscadores',
    estimatedTime: '20 min',
    difficulty: 'Intermedio',
    completed: false,
    sections: [
      'Desmintiendo 3 mitos comunes del SEO',
      'Proceso de optimización de contenido',
      'Checklist definitivo de SEO on-page'
    ]
  },
  {
    id: 'link-building',
    title: 'Link Building',
    description: 'Construye autoridad a través de enlaces de calidad y relaciones estratégicas',
    estimatedTime: '30 min',
    difficulty: 'Avanzado',
    completed: false,
    sections: [
      'Definición moderna del link building',
      '5 atributos de backlinks de calidad',
      'Estrategias: Crear → Comprar → Ganar',
      'Tácticas específicas (HARO, Guest blogging, Skyscraper)',
      'Templates de outreach y mejores prácticas'
    ]
  },
  {
    id: 'technical-seo',
    title: 'SEO Técnico',
    description: 'Asegura que tu sitio web cumple con los requisitos técnicos de los motores de búsqueda',
    estimatedTime: '15 min',
    difficulty: 'Intermedio',
    completed: false,
    sections: [
      'Requisitos técnicos esenciales (5-6 elementos)',
      'Herramientas de monitoreo recomendadas',
      'Resumen de la fórmula ganadora del SEO'
    ]
  }
]

export default function SEOFundamentalsPage() {
  // Calculate overall progress (placeholder - would be dynamic in real implementation)
  const completedModules = seoModules.filter(module => module.completed).length
  const overallProgress = (completedModules / seoModules.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <nav className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link className="flex items-center space-x-2" href="/">
              <div className="h-6 w-6 rounded-sm bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">RC</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Red Creativa Pro</span>
            </Link>
            
            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/blog" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">
                Blog
              </Link>
              <Link href="/herramientas-ia-copywriting" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">
                Herramientas IA
              </Link>
              <Link href="/auth" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">
                Iniciar Sesión
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              type="button"
              title="Abrir menú de navegación"
              aria-label="Abrir menú de navegación"
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-blue-600">Inicio</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Fundamentos de SEO</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Fundamentos de SEO: Guía Completa de Optimización para Motores de Búsqueda
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl">
            Domina los conceptos esenciales del SEO con esta guía completa. Aprende investigación de palabras clave, 
            optimización on-page, link building y SEO técnico basado en las mejores prácticas de la industria.
          </p>
          
          {/* Progress Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tu Progreso</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completedModules} de {seoModules.length} módulos completados
              </span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>
        </div>

        {/* SEO Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {seoModules.map((module) => (
            <Card key={module.id} className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{module.title}</CardTitle>
                    <CardDescription className="text-sm mb-4">
                      {module.description}
                    </CardDescription>
                  </div>
                  {module.completed && (
                    <div className="ml-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {module.estimatedTime}
                  </span>
                  <Badge variant={module.difficulty === 'Principiante' ? 'secondary' : module.difficulty === 'Intermedio' ? 'default' : 'destructive'}>
                    {module.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 mb-4">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white">Contenido del módulo:</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {module.sections.map((section, sectionIndex) => (
                      <li key={sectionIndex} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {section}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link 
                  href={`/seo-fundamentals/${module.id}`}
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {module.completed ? 'Revisar módulo' : 'Comenzar módulo'}
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recursos Adicionales</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Herramientas de SEO</CardTitle>
                <CardDescription>
                  Descubre las mejores herramientas para implementar tus estrategias de SEO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link 
                    href="/herramientas-ia-copywriting"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Herramientas de IA para Copywriting
                  </Link>
                  <Link 
                    href="/seo-dashboard"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Dashboard de SEO
                  </Link>
                  <Link 
                    href="/seo-internal-links"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Análisis de Enlaces Internos
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blog de SEO</CardTitle>
                <CardDescription>
                  Mantente actualizado con las últimas tendencias y estrategias de SEO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link 
                    href="/blog/seo-contenido-ia-posicionamiento-google-2025"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → SEO con IA para Google 2025
                  </Link>
                  <Link 
                    href="/blog/optimizar-contenido-seo-ia-2025"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Optimizar Contenido SEO con IA
                  </Link>
                  <Link 
                    href="/blog"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Ver todos los artículos
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recursos Prácticos</CardTitle>
                <CardDescription>
                  Plantillas y herramientas para aplicar lo aprendido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link 
                    href="/plantillas"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Plantillas de Contenido
                  </Link>
                  <Link 
                    href="/correos-ia"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Generador de Emails
                  </Link>
                  <Link 
                    href="/escritor-ia"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Escritor IA
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded-sm bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">RC</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Red Creativa Pro</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/politica-privacidad" className="hover:text-blue-600">Privacidad</Link>
              <Link href="/terminos-servicio" className="hover:text-blue-600">Términos</Link>
              <Link href="/contacto" className="hover:text-blue-600">Contacto</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
