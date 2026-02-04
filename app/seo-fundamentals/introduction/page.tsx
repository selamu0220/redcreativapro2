import Link from 'next/link'
import type { Metadata } from 'next'
import SEOModuleLayout from '../../components/seo/SEOModuleLayout'
import EducationalContentSchema from '../../components/seo/EducationalContentSchema'

export const metadata: Metadata = {
  title: 'Introducción al SEO | Fundamentos Básicos de Optimización',
  description: 'Aprende qué es el SEO, por qué es importante para tu negocio y cómo funciona el proceso de Google: rastreo, indexación y ranking.',
  alternates: { canonical: 'https://redcreativa.pro/seo-fundamentals/introduction' },
  openGraph: {
    title: 'Introducción al SEO | Fundamentos Básicos',
    description: 'Comprende los conceptos básicos del SEO y cómo Google procesa tu sitio web.',
    type: 'article',
  },
  robots: { index: true, follow: true },
  other: {
    'article:section': 'SEO Education',
    'article:tag': 'SEO, Search Engine Optimization, Google, Digital Marketing'
  }
}

export default function SEOIntroductionPage() {
  return (
    <>
      <EducationalContentSchema
        title="Introducción al SEO | Fundamentos Básicos de Optimización"
        description="Aprende qué es el SEO, por qué es importante para tu negocio y cómo funciona el proceso de Google: rastreo, indexación y ranking."
        url="https://redcreativa.pro/seo-fundamentals/introduction"
        educationalLevel="Beginner"
        learningResourceType="Tutorial"
        teaches={[
          "Qué es el SEO y sus 5 puntos clave",
          "Por qué el SEO es importante para empresas y sitios web",
          "Cómo funciona Google: rastreo, indexación y ranking",
          "Fundamentos básicos de optimización para motores de búsqueda"
        ]}
        timeRequired="PT15M"
      />
      <SEOModuleLayout
      title="Introducción al SEO"
      description="Comprende qué es el SEO, por qué es importante y cómo funciona Google"
      nextModule={{
        title: "Investigación de Palabras Clave",
        href: "/seo-fundamentals/keyword-research"
      }}
      previousModule={{
        title: "Fundamentos de SEO",
        href: "/seo-fundamentals"
      }}
      currentModule="introduction"
      progress={20}
    >
      {/* Table of Contents */}
      <nav className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          En este módulo aprenderás:
        </h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center text-gray-700 dark:text-gray-300">
            <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <a href="#que-es-seo" className="hover:text-blue-600">Los 5 puntos clave del SEO</a>
          </li>
          <li className="flex items-center text-gray-700 dark:text-gray-300">
            <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <a href="#por-que-importa" className="hover:text-blue-600">Por qué el SEO es crucial para tu negocio</a>
          </li>
          <li className="flex items-center text-gray-700 dark:text-gray-300">
            <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <a href="#proceso-google" className="hover:text-blue-600">Cómo funciona Google: Rastreo → Indexación → Ranking</a>
          </li>
        </ul>
      </nav>

      {/* What is SEO Section */}
      <section id="que-es-seo" className="mb-12 scroll-mt-8">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ¿Qué es el SEO?
          </h2>
        </div>
        
        <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
            SEO (Search Engine Optimization) es el proceso de optimizar tu sitio web para mejorar su 
            visibilidad en los resultados orgánicos de los motores de búsqueda. Este proceso incluye 
            <Link href="/seo-fundamentals/keyword-research" className="text-blue-600 hover:text-blue-700 underline">investigación de palabras clave</Link>, 
            <Link href="/seo-fundamentals/on-page-seo" className="text-blue-600 hover:text-blue-700 underline ml-1">optimización on-page</Link>, 
            <Link href="/seo-fundamentals/link-building" className="text-blue-600 hover:text-blue-700 underline ml-1">construcción de enlaces</Link> y 
            <Link href="/seo-fundamentals/technical-seo" className="text-blue-600 hover:text-blue-700 underline ml-1">aspectos técnicos</Link>. 
            Aquí están los 5 puntos clave que debes entender:
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Key Points Cards - Enhanced with better visual hierarchy */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">
                  Tráfico Orgánico Gratuito
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  El SEO te permite obtener visitantes de forma gratuita desde los motores de búsqueda, 
                  sin pagar por cada clic como en la publicidad.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">
                  Visibilidad a Largo Plazo
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  A diferencia de la publicidad pagada, los resultados del SEO son duraderos y 
                  pueden generar tráfico durante meses o años.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">
                  Credibilidad y Confianza
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Los usuarios confían más en los resultados orgánicos que en los anuncios, 
                  lo que aumenta la credibilidad de tu marca.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">
                  Mejor Experiencia de Usuario
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  El SEO mejora la velocidad, usabilidad y estructura de tu sitio, 
                  beneficiando tanto a usuarios como a motores de búsqueda.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">
                  ROI Medible y Escalable
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Puedes medir el impacto del SEO en tráfico, conversiones y ventas, 
                  y escalar tus esfuerzos según los resultados obtenidos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why SEO Matters Section */}
      <section id="por-que-importa" className="mb-12 scroll-mt-8">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
            <span className="text-green-600 dark:text-green-400 font-bold text-sm">2</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ¿Por Qué Importa el SEO?
          </h2>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Para Empresas y Negocios
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Reduce costos de adquisición:</strong> El tráfico orgánico no requiere pago por clic</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Aumenta la autoridad de marca:</strong> Aparecer en primeras posiciones genera confianza</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Genera leads cualificados:</strong> Los usuarios buscan activamente tus productos/servicios</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Ventaja competitiva:</strong> Superar a competidores en resultados de búsqueda</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Para Sitios Web
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span><strong>Mejora la experiencia del usuario:</strong> Sitios más rápidos y fáciles de navegar</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span><strong>Aumenta el tráfico orgánico:</strong> Más visitantes sin inversión en publicidad</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span><strong>Optimiza la arquitectura:</strong> Mejor estructura y organización del contenido</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span><strong>Facilita la indexación:</strong> Los motores de búsqueda entienden mejor tu contenido</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Google's Process Section */}
      <section id="proceso-google" className="mb-12 scroll-mt-8">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
            <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">3</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cómo Funciona Google: El Proceso de 3 Pasos
          </h2>
        </div>
        
        <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
          <p className="text-gray-600 dark:text-gray-300">
            Para que tu sitio web aparezca en los resultados de búsqueda, Google sigue un proceso 
            sistemático de 3 etapas. Entender este proceso es fundamental para optimizar tu SEO:
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Step 1: Crawling */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0 self-center sm:self-start">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center sm:text-left">
                  1. Rastreo (Crawling)
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                    Google utiliza programas automatizados llamados "crawlers" o "bots" para descubrir 
                    y explorar páginas web en internet.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">¿Qué hacen los crawlers?</h4>
                      <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Siguen enlaces de página en página</li>
                        <li>• Descargan el contenido HTML</li>
                        <li>• Identifican nuevas URLs</li>
                        <li>• Respetan el archivo robots.txt</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Factores que afectan el rastreo:</h4>
                      <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Velocidad del sitio web</li>
                        <li>• Estructura de enlaces internos</li>
                        <li>• Sitemap XML</li>
                        <li>• Presupuesto de rastreo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Arrow to next step - hidden on mobile */}
            <div className="hidden sm:block absolute left-6 top-16 w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="hidden sm:block absolute left-5 top-24 w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>

          {/* Step 2: Indexing */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0 self-center sm:self-start">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center sm:text-left">
                  2. Indexación (Indexing)
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                    Google analiza y almacena el contenido de las páginas rastreadas en su índice, 
                    una base de datos masiva organizada por temas y palabras clave.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Proceso de indexación:</h4>
                      <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Analiza el contenido textual</li>
                        <li>• Procesa imágenes y videos</li>
                        <li>• Identifica el tema principal</li>
                        <li>• Extrae palabras clave relevantes</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Factores de indexación:</h4>
                      <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Calidad del contenido</li>
                        <li>• Estructura HTML correcta</li>
                        <li>• Meta tags optimizados</li>
                        <li>• Ausencia de errores técnicos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Arrow to next step - hidden on mobile */}
            <div className="hidden sm:block absolute left-6 top-16 w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="hidden sm:block absolute left-5 top-24 w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>

          {/* Step 3: Ranking */}
          <div>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  3. Ranking (Posicionamiento)
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Cuando un usuario realiza una búsqueda, Google utiliza algoritmos complejos para 
                    determinar qué páginas son más relevantes y en qué orden mostrarlas.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Factores de ranking principales:</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Relevancia del contenido</li>
                        <li>• Autoridad del dominio</li>
                        <li>• Experiencia del usuario</li>
                        <li>• Velocidad de carga</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Elementos evaluados:</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Intención de búsqueda</li>
                        <li>• Calidad de backlinks</li>
                        <li>• Optimización móvil</li>
                        <li>• Señales de E-A-T</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Summary */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Resumen del Proceso
          </h4>
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">1</div>
              <span className="text-gray-600 dark:text-gray-300">Rastreo</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600 mx-4"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">2</div>
              <span className="text-gray-600 dark:text-gray-300">Indexación</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600 mx-4"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">3</div>
              <span className="text-gray-600 dark:text-gray-300">Ranking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            ¿Qué Sigue?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ahora que entiendes los fundamentos del SEO y cómo funciona Google, es hora de 
            aprender a investigar y seleccionar las palabras clave correctas para tu contenido.
          </p>
          <Link 
            href="/seo-fundamentals/keyword-research"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continuar con Investigación de Palabras Clave
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </SEOModuleLayout>
    </>
  )
}
