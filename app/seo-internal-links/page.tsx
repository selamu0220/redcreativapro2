import React from 'react'
import InternalLinkManager from '@/app/components/InternalLinkManager'
import InternalLinkDashboard from '@/app/components/InternalLinkDashboard'
import ContentWithInternalLinks from '@/app/components/ContentWithInternalLinks'

const sampleContent = `
La inteligencia artificial está transformando la forma en que creamos y gestionamos contenido digital. En Red Creativa Pro, hemos desarrollado herramientas avanzadas que permiten a los creativos aprovechar al máximo estas tecnologías.

Nuestro escritor IA utiliza modelos de lenguaje de última generación para generar contenido de alta calidad. Esta herramienta es especialmente útil para marketing digital, donde la velocidad y la relevancia son cruciales.

La automatización de flujos de trabajo se ha convertido en una necesidad para las empresas modernas. Con nuestras soluciones de IA, puedes optimizar procesos que antes requerían horas de trabajo manual.

Para aquellos interesados en SEO, nuestro dashboard de optimización proporciona insights valiosos sobre el rendimiento de tu contenido. La colaboración académica también se beneficia enormemente de estas herramientas, especialmente en proyectos de investigación complejos.

El futuro del contenido creativo está en la sinergia entre la creatividad humana y la inteligencia artificial. Nuestras herramientas están diseñadas para potenciar esta colaboración, no para reemplazar la creatividad humana.
`

const sampleLinks = [
  {
    position: 150,
    anchorText: 'escritor IA',
    targetUrl: '/escritor-ia',
    targetTitle: 'Escritor IA - Generador de Contenido Inteligente'
  },
  {
    position: 280,
    anchorText: 'marketing digital',
    targetUrl: '/blog/generador-contenido-ia-marketing-digital-2025',
    targetTitle: 'Generador de Contenido IA para Marketing Digital 2025'
  },
  {
    position: 420,
    anchorText: 'automatización de flujos de trabajo',
    targetUrl: '/blog/automatizacion-flujos-trabajo-ia-productividad',
    targetTitle: 'Automatización de Flujos de Trabajo con IA: Productividad Extrema'
  }
]

export default function SEOInternalLinksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Enlaces Internos SEO
              </h1>
              <p className="mt-2 text-gray-600">
                Optimización automática de enlaces internos para mejorar SEO y navegación
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Sistema Activo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Demo Content with Internal Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Demostración: Contenido con Enlaces Internos Automáticos
            </h2>
            <div className="prose max-w-none">
              <ContentWithInternalLinks
                content={sampleContent}
                internalLinks={sampleLinks}
                className="text-gray-700 leading-relaxed"
                linkClassName="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200"
                enableTracking={true}
              />
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>💡 Nota:</strong> Los enlaces en azul han sido generados automáticamente por nuestro sistema de IA. 
                Hacen clic en ellos para ver cómo funcionan y se rastrean.
              </div>
            </div>
          </div>

          {/* Internal Link Manager */}
          <InternalLinkManager
            pageId="seo-internal-links-demo"
            content={sampleContent}
          />

          {/* Dashboard */}
          <InternalLinkDashboard />

          {/* Features Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Características del Sistema
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-blue-600 text-2xl mb-2">🤖</div>
                <h3 className="font-semibold text-gray-900 mb-2">IA Contextual</h3>
                <p className="text-sm text-gray-600">
                  Análisis inteligente del contenido para sugerir enlaces relevantes basados en contexto y semántica.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-green-600 text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Avanzado</h3>
                <p className="text-sm text-gray-600">
                  Seguimiento detallado de clicks, CTR y rendimiento de enlaces internos para optimización continua.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-purple-600 text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">SEO Optimizado</h3>
                <p className="text-sm text-gray-600">
                  Distribución inteligente de PageRank y detección automática de páginas huérfanas.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-yellow-600 text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-900 mb-2">Automatización</h3>
                <p className="text-sm text-gray-600">
                  Generación y aplicación automática de enlaces internos sin intervención manual.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                <div className="text-red-600 text-2xl mb-2">♿</div>
                <h3 className="font-semibold text-gray-900 mb-2">Accesibilidad</h3>
                <p className="text-sm text-gray-600">
                  Enlaces con aria-labels apropiados y navegación compatible con lectores de pantalla.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                <div className="text-indigo-600 text-2xl mb-2">🔄</div>
                <h3 className="font-semibold text-gray-900 mb-2">Actualización Dinámica</h3>
                <p className="text-sm text-gray-600">
                  Los enlaces se actualizan automáticamente cuando se publica nuevo contenido relacionado.
                </p>
              </div>
            </div>
          </div>

          {/* Implementation Guide */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Guía de Implementación
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Instalación del Sistema</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Importa los componentes <code className="bg-gray-100 px-1 rounded">InternalLinkManager</code> y 
                    <code className="bg-gray-100 px-1 rounded ml-1">ContentWithInternalLinks</code> en tu aplicación.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Configuración de Contenido</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ejecuta el script <code className="bg-gray-100 px-1 rounded">generate-internal-links.js</code> para 
                    analizar tu contenido existente y generar sugerencias automáticas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Integración con Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configura Google Analytics 4 o tu sistema de analytics preferido para rastrear 
                    el rendimiento de los enlaces internos.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Monitoreo y Optimización</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Utiliza el dashboard para monitorear el rendimiento y optimizar 
                    continuamente la estrategia de enlaces internos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ejemplo de Código
            </h2>
            
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
{`// Implementación básica
import ContentWithInternalLinks from '@/components/ContentWithInternalLinks'
import { InternalLinkingService } from '@/lib/internal-linking'

function BlogPost({ post }) {
  const [internalLinks, setInternalLinks] = useState([])
  
  useEffect(() => {
    const linkingService = new InternalLinkingService(blogPosts)
    const autoLinks = linkingService.generateAutomatedLinks(
      post.id, 
      post.content, 
      3
    )
    setInternalLinks(autoLinks)
  }, [post])

  return (
    <article>
      <h1>{post.title}</h1>
      <ContentWithInternalLinks
        content={post.content}
        internalLinks={internalLinks}
        enableTracking={true}
      />
    </article>
  )
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
