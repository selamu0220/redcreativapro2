import type { Metadata } from 'next'
import Link from 'next/link'
import SEOModuleLayout from '../../components/seo/SEOModuleLayout'
import ChecklistComponent from '../../components/seo/ChecklistComponent'
import EducationalContentSchema from '../../components/seo/EducationalContentSchema'

export const metadata: Metadata = {
  title: 'SEO On-Page | Optimización de Contenido y Páginas Web',
  description: 'Aprende las mejores prácticas de SEO on-page: desmiente mitos comunes, optimiza tu contenido y usa nuestro checklist definitivo.',
  alternates: { canonical: 'https://redcreativa.pro/seo-fundamentals/on-page-seo' },
}

export default function OnPageSEOPage() {
  // Myth-busting checklist items
  const mythBustingItems = [
    {
      id: 'keyword-stuffing-myth',
      title: 'Mito: "Más keywords = mejor ranking"',
      description: 'FALSO. El keyword stuffing penaliza tu contenido. Google prefiere contenido natural y útil que responda a la intención de búsqueda del usuario.',
      isCompleted: false
    },
    {
      id: 'exact-repetition-myth',
      title: 'Mito: "Debo repetir la keyword exacta X veces"',
      description: 'FALSO. No existe un número mágico de repeticiones. Usa sinónimos, variaciones y términos relacionados para crear contenido natural y completo.',
      isCompleted: false
    },
    {
      id: 'word-count-myth',
      title: 'Mito: "Necesito mínimo 2000 palabras para rankear"',
      description: 'FALSO. La longitud no garantiza rankings. Google valora la calidad, relevancia y utilidad del contenido, no solo la cantidad de palabras.',
      isCompleted: false
    }
  ]

  return (
    <>
      <EducationalContentSchema
        title="SEO On-Page | Optimización de Contenido y Páginas Web"
        description="Aprende las mejores prácticas de SEO on-page: desmiente mitos comunes, optimiza tu contenido y usa nuestro checklist definitivo."
        url="https://redcreativa.pro/seo-fundamentals/on-page-seo"
        educationalLevel="Intermediate"
        learningResourceType="Tutorial"
        teaches={[
          "Desmitificar conceptos erróneos del SEO on-page",
          "Proceso de optimización de contenido paso a paso",
          "Checklist definitivo de SEO on-page",
          "Mejores prácticas de optimización técnica",
          "Estrategias de contenido que superan a la competencia"
        ]}
        timeRequired="PT20M"
      />
      <SEOModuleLayout
      title="SEO On-Page"
      description="Optimiza tu contenido y páginas web para mejores rankings en buscadores"
      currentModule="on-page-seo"
      previousModule={{
        title: "Investigación de Palabras Clave",
        href: "/seo-fundamentals/keyword-research"
      }}
      nextModule={{
        title: "Link Building",
        href: "/seo-fundamentals/link-building"
      }}
      progress={60}
    >
      {/* Introduction */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ¿Qué es el SEO On-Page?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          El SEO on-page se refiere a todas las optimizaciones que puedes hacer directamente en tu sitio web 
          para mejorar su posicionamiento en los motores de búsqueda. Después de completar tu <Link href="/seo-fundamentals/keyword-research" className="text-blue-600 hover:text-blue-700 underline">investigación de palabras clave</Link>, 
          el SEO on-page es el siguiente paso crítico antes de enfocarte en <Link href="/seo-fundamentals/link-building" className="text-blue-600 hover:text-blue-700 underline">link building</Link> 
          y <Link href="/seo-fundamentals/technical-seo" className="text-blue-600 hover:text-blue-700 underline">optimización técnica</Link>. 
          Incluye la optimización de contenido, estructura HTML, experiencia de usuario y elementos técnicos de cada página.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Concepto Clave
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            El SEO on-page moderno se centra en crear contenido que satisfaga completamente la intención 
            de búsqueda del usuario, no en manipular algoritmos con técnicas obsoletas.
          </p>
        </div>
      </section>

      {/* Myth Busting Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🚫 Desmintiendo Mitos Comunes del SEO On-Page
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Antes de aprender las mejores prácticas, es crucial desaprender conceptos erróneos que pueden 
          perjudicar tu SEO. Estos son los 3 mitos más peligrosos del SEO on-page:
        </p>

        <ChecklistComponent
          title="Mitos del SEO On-Page que Debes Evitar"
          items={mythBustingItems}
          type="on-page"
        />

        {/* Detailed Myth Explanations */}
        <div className="mt-8 space-y-8">
          {/* Myth 1: Keyword Stuffing */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
              ❌ Mito #1: "Más keywords = mejor ranking"
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">¿Por qué es falso?</h4>
                <p className="text-red-700 dark:text-red-300">
                  El keyword stuffing (relleno de palabras clave) es una práctica penalizada por Google desde 2012. 
                  Los algoritmos modernos detectan fácilmente contenido no natural y lo clasifican como spam.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">✅ La práctica correcta:</h4>
                <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-1">
                  <li>Usa tu keyword principal de forma natural en el título y algunas veces en el contenido</li>
                  <li>Incluye sinónimos y términos relacionados (LSI keywords)</li>
                  <li>Enfócate en responder completamente la intención de búsqueda</li>
                  <li>Escribe para humanos, no para robots</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Myth 2: Exact Repetition */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
              ❌ Mito #2: "Debo repetir la keyword exacta X veces"
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">¿Por qué es falso?</h4>
                <p className="text-orange-700 dark:text-orange-300">
                  No existe una "densidad de keywords" mágica (ni 2%, ni 5%, ni ningún porcentaje). 
                  Google entiende el contexto y las variaciones de las palabras clave gracias a su 
                  procesamiento de lenguaje natural avanzado.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">✅ La práctica correcta:</h4>
                <ul className="list-disc list-inside text-orange-700 dark:text-orange-300 space-y-1">
                  <li>Usa variaciones naturales de tu keyword principal</li>
                  <li>Incluye términos semánticamente relacionados</li>
                  <li>Varía la estructura de las frases</li>
                  <li>Prioriza la legibilidad y fluidez del texto</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Myth 3: Word Count */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
              ❌ Mito #3: "Necesito mínimo 2000 palabras para rankear"
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">¿Por qué es falso?</h4>
                <p className="text-yellow-700 dark:text-yellow-300">
                  La longitud del contenido no es un factor de ranking directo. Muchas páginas cortas 
                  pero altamente relevantes superan a contenido largo pero superficial. Google valora 
                  la satisfacción del usuario, no el conteo de palabras.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">✅ La práctica correcta:</h4>
                <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>Escribe lo necesario para responder completamente la consulta</li>
                  <li>Prioriza la profundidad y utilidad sobre la longitud</li>
                  <li>Analiza qué tipo de contenido prefieren los usuarios para tu keyword</li>
                  <li>Optimiza para métricas de engagement (tiempo en página, tasa de rebote)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices Summary */}
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
            ✅ Principios Fundamentales del SEO On-Page Moderno
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Enfoque en el Usuario</h4>
              <ul className="list-disc list-inside text-green-700 dark:text-green-300 space-y-1 text-sm">
                <li>Satisface completamente la intención de búsqueda</li>
                <li>Crea contenido útil y accionable</li>
                <li>Optimiza la experiencia de usuario</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Optimización Natural</h4>
              <ul className="list-disc list-inside text-green-700 dark:text-green-300 space-y-1 text-sm">
                <li>Usa keywords de forma natural y contextual</li>
                <li>Incluye términos semánticamente relacionados</li>
                <li>Mantén la legibilidad y fluidez del texto</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Content Optimization Process Guide */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🎯 Proceso de Optimización de Contenido
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Sigue este proceso sistemático para crear contenido que supere a la competencia y satisfaga 
          completamente la intención de búsqueda de los usuarios.
        </p>

        {/* Step-by-step Process */}
        <div className="space-y-8">
          {/* Step 1: Analyze Top Pages */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Analiza las Páginas Top de tu Keyword
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Antes de escribir, estudia qué contenido ya está funcionando para tu palabra clave objetivo.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Proceso detallado:</h4>
                  <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2">
                    <li>Busca tu keyword objetivo en Google</li>
                    <li>Analiza los primeros 10 resultados orgánicos</li>
                    <li>Identifica patrones comunes en:</li>
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Tipo de contenido (artículo, guía, lista, etc.)</li>
                      <li>Formato (texto, video, infografías)</li>
                      <li>Ángulo o enfoque principal</li>
                      <li>Longitud aproximada del contenido</li>
                    </ul>
                  </ol>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Ejemplo Práctico:</h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Keyword:</strong> "cómo hacer SEO on-page"<br/>
                    <strong>Análisis:</strong> Los top 10 son principalmente guías paso a paso (tipo), 
                    con formato de artículo largo (formato), enfocadas en principiantes (ángulo), 
                    de 2000-4000 palabras (longitud).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Identify Subtopics */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Identifica Subtemas y Preguntas Relacionadas
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Descubre todos los subtemas que debes cubrir para crear contenido más completo que la competencia.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Métodos de investigación:</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                      <li>Analiza los H2 y H3 de páginas top</li>
                      <li>Usa "People Also Ask" de Google</li>
                      <li>Revisa búsquedas relacionadas al final de Google</li>
                      <li>Utiliza herramientas como AnswerThePublic</li>
                      <li>Consulta foros y comunidades (Reddit, Quora)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Qué buscar:</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                      <li>Subtemas no cubiertos por competidores</li>
                      <li>Preguntas frecuentes de usuarios</li>
                      <li>Problemas específicos sin resolver</li>
                      <li>Casos de uso particulares</li>
                      <li>Ejemplos prácticos demandados</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">✅ Caso de Estudio:</h4>
                  <p className="text-green-800 dark:text-green-200 text-sm mb-2">
                    <strong>Keyword:</strong> "marketing de contenidos"
                  </p>
                  <div className="text-green-700 dark:text-green-300 text-sm">
                    <strong>Subtemas identificados:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>Estrategia de contenidos paso a paso</li>
                      <li>Herramientas para marketing de contenidos</li>
                      <li>Métricas y KPIs importantes</li>
                      <li>Errores comunes y cómo evitarlos</li>
                      <li>Ejemplos de campañas exitosas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Create Comprehensive Content */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Crea Contenido Integral y Superior
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Desarrolla contenido que no solo iguale a la competencia, sino que la supere en valor y utilidad.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Metodología de creación:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Estructura del contenido:</h5>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                          <li>Introducción que engancha</li>
                          <li>Tabla de contenidos clara</li>
                          <li>Secciones lógicamente organizadas</li>
                          <li>Conclusión con llamada a la acción</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Elementos de valor:</h5>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                          <li>Ejemplos prácticos y casos reales</li>
                          <li>Plantillas y recursos descargables</li>
                          <li>Capturas de pantalla explicativas</li>
                          <li>Listas de verificación accionables</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">🎯 Fórmula del Contenido Superior:</h4>
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      <strong>Contenido Competidor + Subtemas Únicos + Ejemplos Prácticos + Recursos Adicionales = Contenido Superior</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Optimize for User Experience */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Optimiza para la Experiencia del Usuario
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  El contenido técnicamente perfecto debe ser también fácil de consumir y navegar.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legibilidad</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                      <li>Párrafos cortos (2-3 líneas)</li>
                      <li>Frases claras y directas</li>
                      <li>Uso de listas y viñetas</li>
                      <li>Espaciado adecuado</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Navegación</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                      <li>Tabla de contenidos</li>
                      <li>Enlaces internos relevantes</li>
                      <li>Botones "volver arriba"</li>
                      <li>Breadcrumbs claros</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Engagement</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                      <li>Elementos interactivos</li>
                      <li>Llamadas a la acción claras</li>
                      <li>Contenido multimedia</li>
                      <li>Comentarios y feedback</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            📋 Resumen del Proceso de Optimización
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Antes de escribir:</h4>
              <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                <li>Analiza la competencia en detalle</li>
                <li>Identifica gaps de contenido</li>
                <li>Planifica la estructura completa</li>
                <li>Define el valor único que aportarás</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Durante la creación:</h4>
              <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                <li>Mantén el foco en la intención de búsqueda</li>
                <li>Incluye ejemplos y casos prácticos</li>
                <li>Optimiza para legibilidad y UX</li>
                <li>Añade elementos de valor únicos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Definitive On-Page SEO Checklist */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          ✅ Checklist Definitivo de SEO On-Page
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Usa esta lista de verificación completa para asegurar que cada página de tu sitio web 
          esté optimizada correctamente para los motores de búsqueda.
        </p>

        {/* Technical Elements Checklist */}
        <div className="space-y-6">
          {/* Title and Meta Elements */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </span>
              Títulos y Meta Elementos
            </h3>
            
            <ChecklistComponent
              title="Optimización de Títulos y Meta Descripciones"
              items={[
                {
                  id: 'title-optimization',
                  title: 'Título SEO (Title Tag)',
                  description: 'Incluye keyword principal, máximo 60 caracteres, único por página, atractivo para usuarios',
                  isCompleted: false
                },
                {
                  id: 'meta-description',
                  title: 'Meta Descripción',
                  description: 'Resumen convincente de 150-160 caracteres, incluye keyword, llamada a la acción clara',
                  isCompleted: false
                },
                {
                  id: 'h1-tag',
                  title: 'Etiqueta H1',
                  description: 'Una sola H1 por página, incluye keyword principal, describe claramente el contenido',
                  isCompleted: false
                },
                {
                  id: 'heading-hierarchy',
                  title: 'Jerarquía de Encabezados',
                  description: 'Estructura lógica H1 > H2 > H3, keywords en H2 relevantes, facilita la lectura',
                  isCompleted: false
                }
              ]}
              type="on-page"
            />
          </div>

          {/* URL and Technical Structure */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </span>
              URLs y Estructura Técnica
            </h3>
            
            <ChecklistComponent
              title="Optimización de URLs y Aspectos Técnicos"
              items={[
                {
                  id: 'url-structure',
                  title: 'Estructura de URL',
                  description: 'URL corta y descriptiva, incluye keyword, sin caracteres especiales, fácil de leer',
                  isCompleted: false
                },
                {
                  id: 'canonical-tag',
                  title: 'Etiqueta Canonical',
                  description: 'Especifica la versión preferida de la página, evita contenido duplicado',
                  isCompleted: false
                },
                {
                  id: 'schema-markup',
                  title: 'Schema Markup',
                  description: 'Datos estructurados relevantes (Article, FAQ, HowTo), mejora rich snippets',
                  isCompleted: false
                },
                {
                  id: 'page-speed',
                  title: 'Velocidad de Carga',
                  description: 'Core Web Vitals optimizados, imágenes comprimidas, CSS/JS minificado',
                  isCompleted: false
                }
              ]}
              type="on-page"
            />
          </div>

          {/* Content Optimization */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </span>
              Optimización de Contenido
            </h3>
            
            <ChecklistComponent
              title="Contenido y Keywords"
              items={[
                {
                  id: 'keyword-placement',
                  title: 'Ubicación de Keywords',
                  description: 'Keyword principal en título, H1, primeros 100 palabras, de forma natural',
                  isCompleted: false
                },
                {
                  id: 'semantic-keywords',
                  title: 'Keywords Semánticas',
                  description: 'Sinónimos y términos relacionados, variaciones naturales, contexto completo',
                  isCompleted: false
                },
                {
                  id: 'content-depth',
                  title: 'Profundidad del Contenido',
                  description: 'Cubre completamente el tema, responde preguntas relacionadas, valor único',
                  isCompleted: false
                },
                {
                  id: 'readability',
                  title: 'Legibilidad',
                  description: 'Párrafos cortos, frases claras, listas y viñetas, espaciado adecuado',
                  isCompleted: false
                }
              ]}
              type="on-page"
            />
          </div>

          {/* Internal Links and Navigation */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                4
              </span>
              Enlaces Internos y Navegación
            </h3>
            
            <ChecklistComponent
              title="Estructura de Enlaces"
              items={[
                {
                  id: 'internal-links',
                  title: 'Enlaces Internos Estratégicos',
                  description: 'Enlaces a páginas relevantes, anchor text descriptivo, distribución de autoridad',
                  isCompleted: false
                },
                {
                  id: 'external-links',
                  title: 'Enlaces Externos de Calidad',
                  description: 'Enlaces a fuentes autoritativas, abren en nueva pestaña, rel="noopener"',
                  isCompleted: false
                },
                {
                  id: 'breadcrumbs',
                  title: 'Breadcrumbs',
                  description: 'Navegación clara de la jerarquía, mejora UX y comprensión de estructura',
                  isCompleted: false
                },
                {
                  id: 'navigation-menu',
                  title: 'Menú de Navegación',
                  description: 'Estructura lógica, categorías claras, accesible desde cualquier página',
                  isCompleted: false
                }
              ]}
              type="on-page"
            />
          </div>

          {/* Images and Media */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                5
              </span>
              Imágenes y Multimedia
            </h3>
            
            <ChecklistComponent
              title="Optimización de Medios"
              items={[
                {
                  id: 'image-alt-text',
                  title: 'Texto Alt de Imágenes',
                  description: 'Descripciones precisas y útiles, incluye keywords cuando sea natural, accesibilidad',
                  isCompleted: false
                },
                {
                  id: 'image-optimization',
                  title: 'Optimización de Imágenes',
                  description: 'Formato WebP/AVIF, tamaño apropiado, compresión sin pérdida de calidad',
                  isCompleted: false
                },
                {
                  id: 'image-filenames',
                  title: 'Nombres de Archivo',
                  description: 'Nombres descriptivos con keywords, guiones en lugar de espacios',
                  isCompleted: false
                },
                {
                  id: 'lazy-loading',
                  title: 'Carga Diferida',
                  description: 'Lazy loading para imágenes below-the-fold, mejora velocidad inicial',
                  isCompleted: false
                }
              ]}
              type="on-page"
            />
          </div>

          {/* User Experience */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                6
              </span>
              Experiencia de Usuario
            </h3>
            
            <ChecklistComponent
              title="UX y Engagement"
              items={[
                {
                  id: 'mobile-responsive',
                  title: 'Diseño Responsive',
                  description: 'Optimizado para móviles, texto legible, botones táctiles adecuados',
                  isCompleted: false
                },
                {
                  id: 'cta-optimization',
                  title: 'Llamadas a la Acción',
                  description: 'CTAs claros y visibles, texto accionable, ubicación estratégica',
                  isCompleted: false
                },
                {
                  id: 'content-formatting',
                  title: 'Formato del Contenido',
                  description: 'Uso de negritas, cursivas, listas, tablas para mejorar escaneabilidad',
                  isCompleted: false
                },
                {
                  id: 'social-sharing',
                  title: 'Compartir en Redes',
                  description: 'Botones de compartir, Open Graph tags, Twitter Cards configurados',
                  isCompleted: false
                }
              ]}
              type="on-page"
            />
          </div>
        </div>

        {/* Checklist Summary */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
            🎯 Resumen del Checklist
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Elementos Críticos</h4>
              <ul className="list-disc list-inside text-green-700 dark:text-green-300 space-y-1 text-sm">
                <li>Title tag optimizado</li>
                <li>Meta descripción atractiva</li>
                <li>H1 con keyword principal</li>
                <li>URL descriptiva</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Contenido de Calidad</h4>
              <ul className="list-disc list-inside text-green-700 dark:text-green-300 space-y-1 text-sm">
                <li>Keywords naturales</li>
                <li>Contenido completo</li>
                <li>Enlaces internos relevantes</li>
                <li>Imágenes optimizadas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Experiencia Usuario</h4>
              <ul className="list-disc list-inside text-green-700 dark:text-green-300 space-y-1 text-sm">
                <li>Velocidad de carga rápida</li>
                <li>Diseño responsive</li>
                <li>Navegación clara</li>
                <li>CTAs efectivos</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-800/30 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">
              <strong>💡 Consejo Pro:</strong> No intentes optimizar todo a la vez. Prioriza los elementos críticos 
              primero, luego mejora gradualmente los aspectos de contenido y experiencia de usuario.
            </p>
          </div>
        </div>
      </section>
    </SEOModuleLayout>
    </>
  )
}
