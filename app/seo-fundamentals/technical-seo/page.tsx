import type { Metadata } from 'next'
import Link from 'next/link'
import SEOModuleLayout from '../../components/seo/SEOModuleLayout'
import ChecklistComponent from '../../components/seo/ChecklistComponent'
import SimpleToolRecommendation from '../../components/seo/SimpleToolRecommendation'
import EducationalContentSchema from '../../components/seo/EducationalContentSchema'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { AlertTriangle, CheckCircle, Globe, Smartphone, Zap, FileText, Search, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SEO Técnico | Fundamentos de Optimización Técnica para Motores de Búsqueda',
  description: 'Aprende los requisitos técnicos esenciales del SEO: HTTPS, diseño móvil, velocidad del sitio, XML sitemap, robots.txt y estado de indexación.',
  alternates: { canonical: 'https://redcreativa.pro/seo-fundamentals/technical-seo' },
  openGraph: {
    title: 'SEO Técnico | Fundamentos Técnicos del SEO',
    description: 'Domina los aspectos técnicos del SEO con nuestra guía completa de requisitos técnicos esenciales.',
    type: 'article',
    images: [{ url: 'https://redcreativa.pro/og-technical-seo.jpg', width: 1200, height: 630 }]
  },
  robots: { index: true, follow: true }
}

// Essential technical requirements checklist data
const technicalRequirements = [
  {
    id: 'https-ssl',
    title: 'HTTPS y Certificado SSL',
    description: 'Asegúrate de que tu sitio web use HTTPS con un certificado SSL válido. Google considera HTTPS como un factor de ranking.',
    priority: 'high' as const,
    tooltip: 'HTTPS protege la información de los usuarios y es un requisito básico para el SEO moderno. Los navegadores marcan los sitios HTTP como "no seguros".'
  },
  {
    id: 'mobile-friendly',
    title: 'Diseño Responsive y Mobile-Friendly',
    description: 'Tu sitio debe funcionar perfectamente en dispositivos móviles. Google usa indexación mobile-first.',
    priority: 'high' as const,
    tooltip: 'Más del 60% del tráfico web proviene de dispositivos móviles. Un sitio no optimizado para móviles perderá rankings significativamente.'
  },
  {
    id: 'site-speed',
    title: 'Velocidad de Carga Optimizada',
    description: 'Optimiza la velocidad de tu sitio. Apunta a menos de 3 segundos de tiempo de carga y buenos Core Web Vitals.',
    priority: 'high' as const,
    tooltip: 'La velocidad del sitio afecta tanto el SEO como la experiencia del usuario. Los sitios lentos tienen tasas de rebote más altas y peores rankings.'
  },
  {
    id: 'xml-sitemap',
    title: 'XML Sitemap Actualizado',
    description: 'Crea y mantén un XML sitemap actualizado que incluya todas las páginas importantes de tu sitio.',
    priority: 'medium' as const,
    tooltip: 'Los sitemaps ayudan a los motores de búsqueda a descubrir y rastrear tu contenido de manera más eficiente.'
  },
  {
    id: 'robots-txt',
    title: 'Archivo robots.txt Configurado',
    description: 'Configura correctamente tu archivo robots.txt para guiar a los crawlers sobre qué páginas rastrear.',
    priority: 'medium' as const,
    tooltip: 'El robots.txt controla cómo los motores de búsqueda acceden a tu sitio. Una configuración incorrecta puede bloquear contenido importante.'
  },
  {
    id: 'indexing-status',
    title: 'Estado de Indexación Monitoreado',
    description: 'Verifica regularmente que tus páginas importantes estén indexadas en Google Search Console.',
    priority: 'medium' as const,
    tooltip: 'Si tus páginas no están indexadas, no aparecerán en los resultados de búsqueda. El monitoreo regular previene problemas de indexación.'
  }
]

// Monitoring tools data
const monitoringTools = [
  {
    toolName: 'Google Search Console',
    description: 'Herramienta gratuita de Google para monitorear el rendimiento de tu sitio en búsquedas.',
    useCase: 'Monitoreo básico de indexación, errores de rastreo y rendimiento de búsqueda',
    steps: [
      'Verifica la propiedad de tu sitio web',
      'Envía tu XML sitemap',
      'Revisa el informe de cobertura semanalmente',
      'Monitorea errores de rastreo y páginas no indexadas',
      'Analiza consultas de búsqueda y CTR'
    ],
    isRecommended: true
  },
  {
    toolName: 'Ahrefs Webmaster Tools',
    description: 'Herramienta gratuita de Ahrefs para auditorías técnicas completas de SEO.',
    useCase: 'Auditorías técnicas profundas y monitoreo de backlinks',
    steps: [
      'Registra tu sitio web gratuitamente',
      'Ejecuta una auditoría completa del sitio',
      'Revisa errores técnicos prioritarios',
      'Monitorea backlinks y menciones',
      'Programa auditorías regulares'
    ],
    isRecommended: true
  },
  {
    toolName: 'PageSpeed Insights',
    description: 'Herramienta de Google para analizar la velocidad y Core Web Vitals de tu sitio.',
    useCase: 'Optimización de velocidad y experiencia del usuario',
    steps: [
      'Ingresa la URL de tu página',
      'Analiza métricas de velocidad móvil y desktop',
      'Revisa sugerencias de optimización',
      'Implementa mejoras prioritarias',
      'Re-evalúa después de cambios'
    ],
    isRecommended: true
  },
  {
    toolName: 'Screaming Frog SEO Spider',
    description: 'Herramienta de escritorio para rastrear y auditar sitios web técnicamente.',
    useCase: 'Auditorías técnicas detalladas y análisis de estructura del sitio',
    steps: [
      'Descarga e instala la versión gratuita',
      'Rastrea tu sitio web completo',
      'Identifica errores 404, redirects y duplicados',
      'Analiza títulos, meta descriptions y headings',
      'Exporta reportes para correcciones'
    ],
    isRecommended: false
  }
]

export default function TechnicalSEOPage() {
  return (
    <>
      <EducationalContentSchema
        title="SEO Técnico | Fundamentos de Optimización Técnica para Motores de Búsqueda"
        description="Aprende los requisitos técnicos esenciales del SEO: HTTPS, diseño móvil, velocidad del sitio, XML sitemap, robots.txt y estado de indexación."
        url="https://redcreativa.pro/seo-fundamentals/technical-seo"
        educationalLevel="Intermediate"
        learningResourceType="Tutorial"
        teaches={[
          "Requisitos técnicos esenciales para SEO",
          "Herramientas de validación y monitoreo técnico",
          "Solución de problemas técnicos comunes",
          "Implementación de HTTPS y optimización móvil",
          "Monitoreo de indexación y rendimiento técnico"
        ]}
        timeRequired="PT15M"
      />
      <SEOModuleLayout
      title="SEO Técnico"
      description="Asegura que tu sitio web cumple con los requisitos técnicos esenciales para un buen posicionamiento en motores de búsqueda."
      currentModule="technical-seo"
      previousModule={{
        title: "Link Building",
        href: "/seo-fundamentals/link-building"
      }}
      progress={75}
    >
      {/* Introduction */}
      <section className="mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                ¿Por qué es importante el SEO Técnico?
              </h3>
              <p className="text-blue-800 leading-relaxed">
                El SEO técnico es la base sobre la cual se construye todo tu éxito en motores de búsqueda. 
                Sin una base técnica sólida, incluso la mejor <Link href="/seo-fundamentals/keyword-research" className="text-blue-600 hover:text-blue-700 underline">investigación de palabras clave</Link>, 
                <Link href="/seo-fundamentals/on-page-seo" className="text-blue-600 hover:text-blue-700 underline ml-1">optimización on-page</Link> y 
                <Link href="/seo-fundamentals/link-building" className="text-blue-600 hover:text-blue-700 underline ml-1">estrategia de link building</Link> no 
                lograrán los rankings que mereces. Esta sección cubre los requisitos técnicos esenciales 
                que todo sitio web debe cumplir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Technical Requirements Checklist */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Requisitos Técnicos Esenciales
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Esta checklist cubre los 6 elementos técnicos más importantes que debes verificar y 
            mantener en tu sitio web. Cada elemento tiene un impacto directo en tu capacidad de 
            posicionarte en los motores de búsqueda.
          </p>
        </div>

        <ChecklistComponent
          title="Checklist de SEO Técnico"
          description="Verifica que tu sitio cumple con estos requisitos técnicos fundamentales"
          items={technicalRequirements}
          type="technical"
        />
      </section>

      {/* Technical Validation Tools */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Herramientas de Validación Rápida
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Usa estas herramientas para verificar rápidamente el estado técnico de tu sitio:
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-600" />
                <CardTitle className="text-lg text-green-900">HTTPS Check</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800 mb-3">
                Verifica si tu sitio tiene HTTPS habilitado correctamente.
              </p>
              <a 
                href="https://www.ssllabs.com/ssltest/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800"
              >
                SSL Labs Test →
              </a>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg text-blue-900">Mobile Test</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 mb-3">
                Prueba qué tan mobile-friendly es tu sitio web.
              </p>
              <a 
                href="https://search.google.com/test/mobile-friendly" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                Google Mobile Test →
              </a>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-lg text-purple-900">Speed Test</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-800 mb-3">
                Analiza la velocidad y Core Web Vitals de tu sitio.
              </p>
              <a 
                href="https://pagespeed.web.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-800"
              >
                PageSpeed Insights →
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Monitoring Tools Section */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Herramientas de Monitoreo Recomendadas
          </h2>
          <p className="text-gray-600 leading-relaxed">
            El SEO técnico requiere monitoreo continuo. Estas herramientas te ayudarán a mantener 
            la salud técnica de tu sitio web a largo plazo y detectar problemas antes de que 
            afecten tus rankings.
          </p>
        </div>

        <div className="space-y-6">
          {monitoringTools.map((tool, index) => (
            <SimpleToolRecommendation
              key={index}
              toolName={tool.toolName}
              description={tool.description}
              useCase={tool.useCase}
              steps={tool.steps}
              isRecommended={tool.isRecommended}
            />
          ))}
        </div>
      </section>

      {/* Common Technical Issues */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Problemas Técnicos Comunes y Soluciones
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Estos son los problemas técnicos más frecuentes que encontrarás y cómo solucionarlos:
          </p>
        </div>

        <div className="space-y-4">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-red-900">Páginas No Indexadas</CardTitle>
                <Badge variant="destructive">Crítico</Badge>
              </div>
              <CardDescription>
                Tus páginas importantes no aparecen en Google Search Console como indexadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Causas comunes:</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Robots.txt bloqueando el contenido</li>
                  <li>• Meta tag noindex en las páginas</li>
                  <li>• Páginas no enlazadas internamente</li>
                  <li>• Sitemap XML desactualizado o incorrecto</li>
                </ul>
                <h4 className="font-medium text-gray-900 mt-4">Solución:</h4>
                <p className="text-sm text-gray-600">
                  Revisa Google Search Console → Cobertura, verifica robots.txt, 
                  asegúrate de que las páginas tengan enlaces internos y actualiza tu sitemap.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-yellow-900">Velocidad Lenta</CardTitle>
                <Badge variant="secondary">Importante</Badge>
              </div>
              <CardDescription>
                Tu sitio carga lentamente, afectando tanto SEO como experiencia del usuario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Optimizaciones prioritarias:</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Optimizar y comprimir imágenes (WebP format)</li>
                  <li>• Minimizar CSS y JavaScript</li>
                  <li>• Habilitar compresión GZIP/Brotli</li>
                  <li>• Usar CDN para contenido estático</li>
                  <li>• Optimizar Core Web Vitals (LCP, FID, CLS)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-900">Errores de Rastreo</CardTitle>
                <Badge variant="outline">Moderado</Badge>
              </div>
              <CardDescription>
                Google encuentra errores 404, problemas de servidor o redirects incorrectos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Acciones recomendadas:</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Corregir enlaces rotos (404s)</li>
                  <li>• Implementar redirects 301 para URLs cambiadas</li>
                  <li>• Revisar errores de servidor (5xx)</li>
                  <li>• Actualizar enlaces internos obsoletos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SEO Formula Summary */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Fórmula Ganadora del SEO
            </h2>
            <p className="text-lg text-gray-600">
              Resumen de todo lo que has aprendido en los módulos de SEO
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Keywords</h3>
              <p className="text-sm text-gray-600">
                Investiga y selecciona palabras clave con potencial de tráfico y relevancia comercial
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contenido</h3>
              <p className="text-sm text-gray-600">
                Crea contenido completo y optimizado que satisfaga la intención de búsqueda
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enlaces</h3>
              <p className="text-sm text-gray-600">
                Construye autoridad a través de backlinks de calidad y relaciones estratégicas
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Técnico</h3>
              <p className="text-sm text-gray-600">
                Mantén una base técnica sólida con velocidad, indexación y experiencia móvil
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Plan de Acción para Implementar
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Semana 1-2: Fundación Técnica</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Implementar HTTPS y optimizar velocidad</li>
                  <li>✓ Configurar Google Search Console</li>
                  <li>✓ Crear y enviar XML sitemap</li>
                  <li>✓ Verificar indexación de páginas importantes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Semana 3-4: Contenido y Keywords</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Investigar palabras clave prioritarias</li>
                  <li>✓ Optimizar páginas existentes (on-page)</li>
                  <li>✓ Crear contenido nuevo basado en gaps</li>
                  <li>✓ Implementar estructura de enlaces internos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Mes 2: Link Building</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Identificar oportunidades de enlaces</li>
                  <li>✓ Crear contenido linkeable (Skyscraper)</li>
                  <li>✓ Iniciar outreach a sitios relevantes</li>
                  <li>✓ Participar en HARO y guest blogging</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Ongoing: Monitoreo</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Revisar Search Console semanalmente</li>
                  <li>✓ Monitorear rankings y tráfico orgánico</li>
                  <li>✓ Auditar sitio mensualmente</li>
                  <li>✓ Ajustar estrategia basada en datos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SEOModuleLayout>
    </>
  )
}
