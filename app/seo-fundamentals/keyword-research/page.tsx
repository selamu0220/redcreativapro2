import type { Metadata } from 'next'
import Link from 'next/link'
import SEOModuleLayout from '../../components/seo/SEOModuleLayout'
import ChecklistComponent from '../../components/seo/ChecklistComponent'
import ExampleShowcase from '../../components/seo/ExampleShowcase'
import ToolRecommendation from '../../components/seo/ToolRecommendation'
import TrafficPotentialCalculator from '../../components/seo/TrafficPotentialCalculator'
import ThreeCAnalyzer from '../../components/seo/ThreeCAnalyzer'
import EducationalContentSchema from '../../components/seo/EducationalContentSchema'

export const metadata: Metadata = {
  title: 'Investigación de Palabras Clave | Fundamentos de SEO',
  description: 'Aprende a identificar y seleccionar las palabras clave correctas para tu contenido. Guía completa de investigación de keywords con técnicas avanzadas.',
  alternates: { canonical: 'https://redcreativa.pro/seo-fundamentals/keyword-research' },
}

export default function KeywordResearchPage() {
  return (
    <>
      <EducationalContentSchema
        title="Investigación de Palabras Clave | Fundamentos de SEO"
        description="Aprende a identificar y seleccionar las palabras clave correctas para tu contenido. Guía completa de investigación de keywords con técnicas avanzadas."
        url="https://redcreativa.pro/seo-fundamentals/keyword-research"
        educationalLevel="Intermediate"
        learningResourceType="Tutorial"
        teaches={[
          "Criterios para seleccionar palabras clave ganadoras",
          "Diferencia entre potencial de tráfico y volumen de búsqueda",
          "Técnica 3C para análisis de intención de búsqueda",
          "Herramientas de investigación de keywords",
          "Análisis de competidores para keywords"
        ]}
        timeRequired="PT25M"
      />
      <SEOModuleLayout
      title="Investigación de Palabras Clave"
      description="Aprende a identificar y seleccionar las palabras clave correctas que impulsen el tráfico orgánico hacia tu sitio web"
      currentModule="keyword-research"
      previousModule={{
        title: "Introducción al SEO",
        href: "/seo-fundamentals/introduction"
      }}
      nextModule={{
        title: "SEO On-Page",
        href: "/seo-fundamentals/on-page-seo"
      }}
      progress={40}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Por qué es crucial la investigación de palabras clave?
          </h2>
          <div className="prose prose-lg text-gray-700">
            <p>
              La investigación de palabras clave es el fundamento de cualquier estrategia SEO exitosa. 
              Sin las palabras clave correctas, estarás creando contenido que nadie busca, o compitiendo 
              en términos imposibles de rankear. Como aprendiste en la <Link href="/seo-fundamentals/introduction" className="text-blue-600 hover:text-blue-700 underline">introducción al SEO</Link>, 
              este es el primer paso crítico antes de cualquier <Link href="/seo-fundamentals/on-page-seo" className="text-blue-600 hover:text-blue-700 underline">optimización on-page</Link>.
            </p>
            <p>
              En este módulo aprenderás a identificar oportunidades reales de tráfico, evaluar la 
              competencia y seleccionar keywords que generen resultados medibles para tu negocio. 
              Estas keywords serán la base para tu <Link href="/seo-fundamentals/link-building" className="text-blue-600 hover:text-blue-700 underline">estrategia de link building</Link> 
              y optimización <Link href="/seo-fundamentals/technical-seo" className="text-blue-600 hover:text-blue-700 underline">técnica</Link>.
            </p>
          </div>
        </section>

        {/* Keyword Selection Criteria Checklist */}
        <KeywordSelectionChecklist />

        {/* Traffic Potential vs Search Volume */}
        <TrafficPotentialSection />

        {/* 3C Technique */}
        <ThreeCTechniqueSection />

        {/* Keyword Research Tools */}
        <KeywordResearchToolsSection />
      </div>
    </SEOModuleLayout>
    </>
  )
}

// Component for Keyword Selection Criteria Checklist (Task 4.1)
function KeywordSelectionChecklist() {
  const keywordCriteria = [
    {
      id: 'search-demand',
      title: 'Demanda de Búsqueda Suficiente',
      description: 'La keyword debe tener un volumen de búsqueda mensual que justifique el esfuerzo. Busca términos con al menos 100-500 búsquedas mensuales para nichos específicos, o 1000+ para mercados más amplios.',
      priority: 'high' as const,
      tooltip: 'Usa herramientas como Ahrefs, SEMrush o Google Keyword Planner para verificar el volumen de búsqueda mensual.'
    },
    {
      id: 'traffic-potential',
      title: 'Alto Potencial de Tráfico',
      description: 'Evalúa cuánto tráfico orgánico reciben actualmente las páginas que rankean en el top 3. Esto es más importante que el volumen de búsqueda puro.',
      priority: 'high' as const,
      tooltip: 'El potencial de tráfico se calcula analizando el tráfico orgánico real de las páginas que ya rankean para esa keyword.'
    },
    {
      id: 'business-potential',
      title: 'Relevancia para tu Negocio',
      description: 'La keyword debe estar directamente relacionada con tu producto, servicio o contenido. Pregúntate: ¿las personas que buscan esto se convertirían en clientes?',
      priority: 'high' as const,
      tooltip: 'Clasifica las keywords por su potencial de conversión: alta (compra directa), media (consideración), baja (informacional).'
    },
    {
      id: 'search-intent',
      title: 'Intención de Búsqueda Clara',
      description: 'Comprende qué busca realmente el usuario: información, navegación, transacción o investigación comercial. Tu contenido debe satisfacer esa intención específica.',
      priority: 'medium' as const,
      tooltip: 'Analiza los resultados actuales de Google para entender qué tipo de contenido prefiere el algoritmo para esa búsqueda.'
    },
    {
      id: 'ranking-difficulty',
      title: 'Dificultad de Ranking Alcanzable',
      description: 'Evalúa la competencia actual. Para sitios nuevos, enfócate en keywords con KD (Keyword Difficulty) menor a 30. Sitios establecidos pueden apuntar a KD 30-60.',
      priority: 'medium' as const,
      tooltip: 'La dificultad de keyword se basa en la autoridad de dominio de los sitios que actualmente rankean en el top 10.'
    }
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Criterios para Seleccionar Palabras Clave Ganadoras
      </h2>
      <p className="text-gray-700 mb-6">
        No todas las keywords son iguales. Usa esta checklist para evaluar cada palabra clave 
        antes de crear contenido. Una keyword que cumple todos estos criterios tiene muchas 
        más probabilidades de generar tráfico y conversiones.
      </p>
      
      <ChecklistComponent
        title="Checklist de Selección de Keywords"
        description="Evalúa cada palabra clave potencial con estos 5 criterios esenciales"
        items={keywordCriteria}
        type="keyword-research"
      />
    </section>
  )
}

// Traffic Potential vs Search Volume Section (Task 4.2)
function TrafficPotentialSection() {
  const comparisonExamples = [
    {
      id: 'example-1',
      scenario: 'Keyword: "mejores auriculares bluetooth" - Volumen de búsqueda: 8,100/mes según Google Keyword Planner. Parece una keyword muy atractiva por su alto volumen.',
      implementation: 'Analizamos el tráfico orgánico real de las páginas que rankean en el top 3 usando Ahrefs. Descubrimos que la página #1 recibe solo 2,400 visitas/mes, la #2 recibe 1,800 visitas/mes, y la #3 recibe 1,200 visitas/mes.',
      result: 'El potencial de tráfico real es de solo 2,400 visitas/mes (70% menos que el volumen de búsqueda). Esto indica que hay muchas variaciones de la búsqueda que no generan clics, o que Google muestra resultados diversos.',
      metrics: [
        { label: 'Volumen de Búsqueda', value: '8,100/mes', change: 'Dato teórico' },
        { label: 'Tráfico Real Top 1', value: '2,400/mes', change: '-70%' },
        { label: 'Potencial Realista', value: '2,400/mes', change: 'Dato real' }
      ],
      tags: ['Alto Volumen', 'Bajo Potencial', 'Competitivo']
    },
    {
      id: 'example-2', 
      scenario: 'Keyword: "auriculares gaming baratos" - Volumen de búsqueda: 1,200/mes. Parece menos atractiva que la anterior por su menor volumen.',
      implementation: 'Revisamos el tráfico orgánico de las páginas top. La página #1 recibe 3,200 visitas/mes, la #2 recibe 2,100 visitas/mes. Notamos que estas páginas también rankean para muchas keywords relacionadas.',
      result: 'El potencial de tráfico real es de 3,200 visitas/mes (167% más que el volumen de búsqueda). Esta keyword tiene mejor potencial porque captura múltiples intenciones de búsqueda relacionadas.',
      metrics: [
        { label: 'Volumen de Búsqueda', value: '1,200/mes', change: 'Dato teórico' },
        { label: 'Tráfico Real Top 1', value: '3,200/mes', change: '+167%' },
        { label: 'Keywords Adicionales', value: '45', change: 'Bonus' }
      ],
      tags: ['Bajo Volumen', 'Alto Potencial', 'Long-tail']
    },
    {
      id: 'example-3',
      scenario: 'Keyword: "como limpiar auriculares" - Volumen de búsqueda: 2,900/mes. Keyword informacional con volumen moderado.',
      implementation: 'Analizamos las páginas top y encontramos que rankean para múltiples variaciones: "limpiar auriculares bluetooth", "desinfectar auriculares", "mantener auriculares". El contenido captura todo el cluster semántico.',
      result: 'El potencial de tráfico es de 4,800 visitas/mes (65% más que el volumen). Las páginas informacionales bien optimizadas capturan múltiples intenciones relacionadas, maximizando el tráfico total.',
      metrics: [
        { label: 'Volumen Principal', value: '2,900/mes', change: 'Keyword base' },
        { label: 'Tráfico Total', value: '4,800/mes', change: '+65%' },
        { label: 'Variaciones Capturadas', value: '23', change: 'Cluster completo' }
      ],
      tags: ['Informacional', 'Cluster Semántico', 'Escalable']
    }
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Potencial de Tráfico vs Volumen de Búsqueda
      </h2>
      
      <div className="prose prose-lg text-gray-700 mb-6">
        <p>
          <strong>El error más común en SEO:</strong> elegir keywords solo por su volumen de búsqueda. 
          El volumen te dice cuántas veces se busca un término, pero el <em>potencial de tráfico</em> 
          te dice cuánto tráfico puedes obtener realmente si rankeas #1.
        </p>
      </div>

      {/* Key Concept Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            ❌ Volumen de Búsqueda
          </h3>
          <ul className="text-sm text-red-700 space-y-2">
            <li>• Cuántas veces se busca un término específico</li>
            <li>• Dato teórico basado en herramientas</li>
            <li>• No considera variaciones ni competencia</li>
            <li>• Puede ser engañoso para tomar decisiones</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            ✅ Potencial de Tráfico
          </h3>
          <ul className="text-sm text-green-700 space-y-2">
            <li>• Tráfico real que recibe la página #1</li>
            <li>• Incluye todas las keywords relacionadas</li>
            <li>• Considera el comportamiento real de usuarios</li>
            <li>• Predictor más preciso de resultados</li>
          </ul>
        </div>
      </div>

      {/* Interactive Comparison Tool */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔍 Calculadora de Potencial de Tráfico
        </h3>
        <TrafficPotentialCalculator />
      </div>

      {/* Real Examples */}
      <ExampleShowcase
        title="Ejemplos Reales: Volumen vs Potencial"
        description="Casos reales que demuestran por qué el potencial de tráfico es más importante que el volumen de búsqueda"
        examples={comparisonExamples}
        type="keyword-metrics"
      />

      {/* How to Calculate Traffic Potential */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          📊 Cómo Calcular el Potencial de Tráfico
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl mb-2">1️⃣</div>
            <h4 className="font-semibold text-gray-900 mb-2">Busca la Keyword</h4>
            <p className="text-sm text-gray-700">
              Ingresa tu keyword objetivo en Google y analiza los primeros 3 resultados orgánicos.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl mb-2">2️⃣</div>
            <h4 className="font-semibold text-gray-900 mb-2">Analiza con Ahrefs</h4>
            <p className="text-sm text-gray-700">
              Usa Ahrefs Site Explorer para ver el tráfico orgánico total de cada URL en los resultados top.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl mb-2">3️⃣</div>
            <h4 className="font-semibold text-gray-900 mb-2">Toma el Mayor</h4>
            <p className="text-sm text-gray-700">
              El tráfico de la página #1 es tu potencial de tráfico realista si logras rankear ahí.
            </p>
          </div>
        </div>
      </div>

      {/* Key Takeaway */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          💡 Regla de Oro
        </h3>
        <p className="text-yellow-700">
          <strong>Siempre prioriza el potencial de tráfico sobre el volumen de búsqueda.</strong> Una keyword 
          con 500 búsquedas/mes pero 2,000 de potencial de tráfico es mejor que una con 5,000 búsquedas/mes 
          pero solo 1,000 de potencial.
        </p>
      </div>
    </section>
  )
}



// 3C Technique Section (Task 4.3)
function ThreeCTechniqueSection() {
  const threeCExamples = [
    {
      id: '3c-example-1',
      scenario: 'Keyword: "mejor software de contabilidad" - Necesitamos entender qué tipo de contenido prefiere Google para esta búsqueda comercial.',
      implementation: 'Aplicamos la técnica 3C analizando los top 3 resultados: 1) Content Type: Todos son artículos de blog (no páginas de producto). 2) Content Format: Listas comparativas "Los 10 mejores..." con tablas de características. 3) Content Angle: Enfoque en "mejor para pequeñas empresas" y "más fácil de usar".',
      result: 'Creamos un artículo "Los 12 Mejores Software de Contabilidad para Pequeñas Empresas 2025" con tabla comparativa, pros/contras, y enfoque en facilidad de uso. Resultado: Posición #2 en 4 meses, 2,800 visitas/mes.',
      metrics: [
        { label: 'Posición Final', value: '#2', change: 'Top 3' },
        { label: 'Tráfico Mensual', value: '2,800', change: '+180%' },
        { label: 'Tiempo a Ranking', value: '4 meses', change: 'Rápido' }
      ],
      tags: ['Comercial', 'Lista Comparativa', 'B2B']
    },
    {
      id: '3c-example-2',
      scenario: 'Keyword: "como hacer marketing digital" - Búsqueda informacional amplia que necesita un enfoque específico para destacar.',
      implementation: 'Análisis 3C de competidores: 1) Content Type: Guías completas y tutoriales paso a paso. 2) Content Format: Artículos largos (3000+ palabras) con subtítulos numerados y ejemplos visuales. 3) Content Angle: "Para principiantes" y "sin experiencia previa" dominan los primeros resultados.',
      result: 'Desarrollamos "Guía Completa de Marketing Digital para Principiantes: 15 Pasos Prácticos (Con Ejemplos Reales)". Incluimos casos de estudio, plantillas descargables y checklist. Posición #1 en 6 meses, 4,200 visitas/mes.',
      metrics: [
        { label: 'Posición Final', value: '#1', change: 'Top ranking' },
        { label: 'Tráfico Mensual', value: '4,200', change: '+250%' },
        { label: 'Palabras Clave', value: '67', change: 'Cluster completo' }
      ],
      tags: ['Informacional', 'Guía Completa', 'Principiantes']
    },
    {
      id: '3c-example-3',
      scenario: 'Keyword: "plantillas de email marketing gratis" - Búsqueda transaccional donde los usuarios buscan recursos descargables.',
      implementation: 'Investigación 3C revela: 1) Content Type: Páginas de recursos/herramientas con descargas, no artículos informativos. 2) Content Format: Galerías visuales con previews de plantillas y botones de descarga prominentes. 3) Content Angle: "Gratis", "profesionales" y "listas para usar" son los ángulos ganadores.',
      result: 'Creamos página de recursos "50+ Plantillas de Email Marketing Profesionales Gratis (Descarga Inmediata)" con galería visual, categorización por industria, y formulario de descarga. Posición #3 en 3 meses, 1,900 descargas/mes.',
      metrics: [
        { label: 'Posición Final', value: '#3', change: 'Primera página' },
        { label: 'Descargas/mes', value: '1,900', change: 'Alta conversión' },
        { label: 'Leads Generados', value: '1,900', change: 'ROI positivo' }
      ],
      tags: ['Transaccional', 'Lead Magnet', 'Recursos Gratis']
    }
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Técnica 3C para Análisis de Intención de Búsqueda
      </h2>
      
      <div className="prose prose-lg text-gray-700 mb-6">
        <p>
          La técnica 3C te ayuda a entender exactamente qué tipo de contenido debes crear 
          analizando los resultados que ya rankean. Es tu hoja de ruta para crear contenido 
          que Google considera relevante para cada búsqueda específica.
        </p>
      </div>

      {/* 3C Framework Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            📄 Content Type
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            ¿Qué TIPO de contenido prefiere Google?
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Artículos de blog</li>
            <li>• Páginas de producto</li>
            <li>• Páginas de categoría</li>
            <li>• Páginas de herramientas</li>
            <li>• Videos o tutoriales</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            📋 Content Format
          </h3>
          <p className="text-sm text-green-700 mb-3">
            ¿Qué FORMATO funciona mejor?
          </p>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Listas ("Los 10 mejores...")</li>
            <li>• Guías paso a paso</li>
            <li>• Comparativas</li>
            <li>• Tutoriales</li>
            <li>• Casos de estudio</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
            🎯 Content Angle
          </h3>
          <p className="text-sm text-purple-700 mb-3">
            ¿Qué ENFOQUE o ángulo usar?
          </p>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• "Para principiantes"</li>
            <li>• "Gratis" vs "Premium"</li>
            <li>• "Rápido y fácil"</li>
            <li>• "Profesional"</li>
            <li>• "2025" (actualidad)</li>
          </ul>
        </div>
      </div>

      {/* Interactive 3C Analyzer */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔍 Analizador 3C Interactivo
        </h3>
        <ThreeCAnalyzer />
      </div>

      {/* Step-by-Step Process */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📝 Proceso Paso a Paso de la Técnica 3C
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Busca tu keyword objetivo</h4>
              <p className="text-sm text-gray-700">Ingresa tu keyword en Google y analiza los primeros 3-5 resultados orgánicos (ignora anuncios).</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Identifica el Content Type</h4>
              <p className="text-sm text-gray-700">¿Son artículos de blog, páginas de producto, herramientas, o videos? Nota el patrón dominante.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Analiza el Content Format</h4>
              <p className="text-sm text-gray-700">¿Son listas, guías, comparativas? Revisa la estructura y longitud del contenido.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Detecta el Content Angle</h4>
              <p className="text-sm text-gray-700">¿Qué palabras clave aparecen en los títulos? "Mejor", "gratis", "fácil", "2025", etc.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-semibold">
              5
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Crea tu contenido optimizado</h4>
              <p className="text-sm text-gray-700">Usa el mismo tipo, formato y ángulo, pero hazlo mejor: más completo, actualizado, o con un enfoque único.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Examples */}
      <ExampleShowcase
        title="Ejemplos Reales de la Técnica 3C"
        description="Casos prácticos donde la técnica 3C llevó a rankings top y tráfico significativo"
        examples={threeCExamples}
        type="3c-technique"
      />

      {/* Pro Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          💡 Tips Avanzados de la Técnica 3C
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">🔄 Busca patrones</h4>
            <p className="text-sm text-yellow-700">
              Si 4 de 5 resultados usan el mismo formato, es una señal fuerte de lo que Google prefiere.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">📅 Considera la frescura</h4>
            <p className="text-sm text-yellow-700">
              Para keywords con "2025" o "mejor", el contenido actualizado tiene ventaja.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">🎯 Mejora, no copies</h4>
            <p className="text-sm text-yellow-700">
              Usa la misma estructura pero añade valor: más ejemplos, mejor diseño, información única.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">📱 Revisa en móvil</h4>
            <p className="text-sm text-yellow-700">
              Los resultados pueden variar entre desktop y móvil. Analiza ambos.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Keyword Research Tools Section (Task 4.4)
function KeywordResearchToolsSection() {
  const keywordTools = [
    {
      id: 'ahrefs-keywords-explorer',
      toolName: 'Ahrefs Keywords Explorer',
      description: 'La herramienta más completa para investigación de keywords con datos precisos de volumen, dificultad y potencial de tráfico.',
      useCase: 'Ideal para investigación profunda de keywords, análisis de competidores y descubrimiento de oportunidades de long-tail.',
      steps: [
        'Ingresa tu keyword semilla en Keywords Explorer',
        'Revisa las métricas: Volumen, KD (Keyword Difficulty), CPC',
        'Ve a "Matching terms" para encontrar variaciones',
        'Usa "Questions" para keywords informacionales',
        'Filtra por KD < 30 para oportunidades fáciles',
        'Exporta las keywords seleccionadas a una hoja de cálculo'
      ],
      isRecommended: true,
      priority: 'high' as const,
      pricing: {
        type: 'paid' as const,
        startingPrice: '$99/mes'
      },
      pros: [
        'Datos de volumen más precisos del mercado',
        'Métricas de potencial de tráfico real',
        'Base de datos masiva de keywords',
        'Análisis de competidores integrado'
      ],
      cons: [
        'Precio elevado para principiantes',
        'Curva de aprendizaje pronunciada',
        'Puede ser abrumador para usuarios nuevos'
      ],
      rating: 5,
      difficulty: 'intermediate' as const,
      url: 'https://ahrefs.com/keywords-explorer',
      category: 'Premium Tools'
    },
    {
      id: 'google-keyword-planner',
      toolName: 'Google Keyword Planner',
      description: 'Herramienta gratuita de Google para investigación básica de keywords, especialmente útil para campañas de Google Ads.',
      useCase: 'Perfecto para validar volúmenes de búsqueda y encontrar ideas iniciales de keywords, especialmente si planeas hacer Google Ads.',
      steps: [
        'Accede a Google Ads y ve a Keyword Planner',
        'Selecciona "Descubrir nuevas keywords"',
        'Ingresa tu producto/servicio o sitio web',
        'Configura ubicación geográfica e idioma',
        'Revisa las sugerencias y volúmenes de búsqueda',
        'Descarga el archivo CSV con las keywords'
      ],
      isRecommended: true,
      priority: 'high' as const,
      pricing: {
        type: 'free' as const
      },
      pros: [
        'Completamente gratuito',
        'Datos directos de Google',
        'Integración con Google Ads',
        'Fácil de usar para principiantes'
      ],
      cons: [
        'Rangos de volumen imprecisos sin campañas activas',
        'Funcionalidad limitada comparado con herramientas premium',
        'No muestra métricas de dificultad'
      ],
      rating: 4,
      difficulty: 'beginner' as const,
      url: 'https://ads.google.com/home/tools/keyword-planner/',
      category: 'Free Tools'
    },
    {
      id: 'ubersuggest',
      toolName: 'Ubersuggest',
      description: 'Herramienta freemium de Neil Patel que ofrece investigación de keywords, análisis de competidores y auditorías SEO.',
      useCase: 'Excelente para pequeñas empresas que necesitan funcionalidad premium a precio accesible, especialmente para análisis de competidores.',
      steps: [
        'Ingresa tu keyword en la barra de búsqueda',
        'Selecciona tu país/idioma objetivo',
        'Revisa el overview: volumen, SEO difficulty, paid difficulty',
        'Ve a "Keyword Ideas" para más sugerencias',
        'Usa "Content Ideas" para ver qué contenido rankea',
        'Exporta hasta 300 keywords en el plan gratuito'
      ],
      isRecommended: false,
      priority: 'medium' as const,
      pricing: {
        type: 'freemium' as const,
        startingPrice: '$12/mes'
      },
      pros: [
        'Precio muy accesible',
        'Plan gratuito generoso',
        'Interfaz simple y clara',
        'Incluye análisis de contenido'
      ],
      cons: [
        'Datos menos precisos que Ahrefs/SEMrush',
        'Base de datos más pequeña',
        'Limitaciones en el plan gratuito'
      ],
      rating: 3,
      difficulty: 'beginner' as const,
      url: 'https://neilpatel.com/ubersuggest/',
      category: 'Budget Tools'
    },
    {
      id: 'semrush-keyword-magic',
      toolName: 'SEMrush Keyword Magic Tool',
      description: 'Potente herramienta de investigación de keywords con la base de datos más grande del mercado y funciones avanzadas de filtrado.',
      useCase: 'Ideal para agencias y empresas grandes que necesitan investigación masiva de keywords y análisis competitivo detallado.',
      steps: [
        'Accede a Keyword Magic Tool en SEMrush',
        'Ingresa tu keyword semilla',
        'Usa los filtros avanzados (volumen, KD%, intención)',
        'Agrupa keywords por temas usando "Subgroups"',
        'Analiza la intención de búsqueda con los iconos',
        'Exporta hasta 10,000 keywords según tu plan'
      ],
      isRecommended: true,
      priority: 'high' as const,
      pricing: {
        type: 'paid' as const,
        startingPrice: '$119/mes'
      },
      pros: [
        'Base de datos más grande (20+ billones de keywords)',
        'Filtros avanzados muy potentes',
        'Análisis de intención automático',
        'Agrupación inteligente de keywords'
      ],
      cons: [
        'Precio elevado',
        'Interfaz puede ser compleja',
        'Curva de aprendizaje empinada'
      ],
      rating: 5,
      difficulty: 'advanced' as const,
      url: 'https://www.semrush.com/analytics/keywordmagic/',
      category: 'Premium Tools'
    },
    {
      id: 'answerthepublic',
      toolName: 'AnswerThePublic',
      description: 'Herramienta especializada en encontrar preguntas que la gente hace sobre tu tema, perfecta para contenido informacional.',
      useCase: 'Excelente para crear contenido de blog, FAQs y páginas informacionales basadas en preguntas reales de usuarios.',
      steps: [
        'Ingresa tu keyword principal',
        'Selecciona idioma y país',
        'Revisa las visualizaciones de preguntas (qué, cómo, por qué, etc.)',
        'Explora las preposiciones (para, con, sin, etc.)',
        'Identifica comparaciones (vs, como, mejor que)',
        'Descarga los datos o toma screenshots de las visualizaciones'
      ],
      isRecommended: false,
      priority: 'medium' as const,
      pricing: {
        type: 'freemium' as const,
        startingPrice: '$99/mes'
      },
      pros: [
        'Especializado en preguntas de usuarios',
        'Visualizaciones muy útiles',
        'Perfecto para contenido informacional',
        'Datos de múltiples países'
      ],
      cons: [
        'No muestra volúmenes de búsqueda',
        'Limitado a 3 búsquedas diarias gratis',
        'No incluye métricas de dificultad'
      ],
      rating: 4,
      difficulty: 'beginner' as const,
      url: 'https://answerthepublic.com/',
      category: 'Specialized Tools'
    }
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Herramientas y Procesos de Investigación de Keywords
      </h2>
      
      <div className="prose prose-lg text-gray-700 mb-6">
        <p>
          La investigación efectiva de keywords requiere las herramientas correctas y procesos 
          sistemáticos. Aquí tienes las mejores herramientas del mercado con guías paso a paso 
          para maximizar su potencial.
        </p>
      </div>

      {/* Tools Recommendation Component */}
      <ToolRecommendation
        tools={keywordTools}
        title="Herramientas Recomendadas para Investigación de Keywords"
        description="Desde opciones gratuitas hasta herramientas premium, encuentra la que mejor se adapte a tu presupuesto y necesidades"
        showComparison={true}
      />

      {/* Competitor Keyword Discovery Process */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          🕵️ Técnica: Descubrimiento de Keywords de Competidores
        </h3>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Método "Competidores Orgánicos → Top Pages"
          </h4>
          <p className="text-gray-700 mb-4">
            Esta técnica te permite descubrir las keywords más valiosas de tus competidores 
            analizando sus páginas con mejor rendimiento orgánico.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Proceso con Ahrefs:</h5>
              <ol className="text-sm text-gray-700 space-y-2">
                <li>1. Ve a Site Explorer e ingresa el dominio competidor</li>
                <li>2. Haz clic en "Top Pages" en el menú lateral</li>
                <li>3. Ordena por "Traffic" para ver las páginas más exitosas</li>
                <li>4. Haz clic en cada página para ver sus keywords</li>
                <li>5. Filtra por posiciones 1-10 y volumen {'>'} 100</li>
                <li>6. Exporta las keywords más relevantes para tu negocio</li>
              </ol>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Proceso con SEMrush:</h5>
              <ol className="text-sm text-gray-700 space-y-2">
                <li>1. Ingresa el dominio en "Organic Research"</li>
                <li>2. Ve a la pestaña "Pages"</li>
                <li>3. Ordena por "Traffic" descendente</li>
                <li>4. Analiza las URLs con más tráfico orgánico</li>
                <li>5. Haz clic en "View all keywords" para cada página</li>
                <li>6. Filtra y exporta keywords relevantes</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Keyword Research Workflow */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Workflow Completo de Investigación de Keywords
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Brainstorming Inicial</h5>
                <p className="text-sm text-gray-700">Lista 10-20 keywords semilla relacionadas con tu negocio. Piensa como tu cliente ideal.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Expansión con Herramientas</h5>
                <p className="text-sm text-gray-700">Usa Ahrefs/SEMrush para expandir cada keyword semilla y encontrar variaciones long-tail.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Análisis de Competidores</h5>
                <p className="text-sm text-gray-700">Identifica 3-5 competidores directos y analiza sus keywords más exitosas usando la técnica "Top Pages".</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                4
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Filtrado y Priorización</h5>
                <p className="text-sm text-gray-700">Aplica los criterios de selección: volumen, potencial de tráfico, relevancia, dificultad y intención.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-semibold text-sm">
                5
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Agrupación y Planificación</h5>
                <p className="text-sm text-gray-700">Agrupa keywords por temas/páginas y crea tu calendario de contenido basado en prioridades.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-yellow-800 mb-4">
            💡 Tips Avanzados para Investigación de Keywords
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-yellow-800 mb-2">🎯 Encuentra Gaps de Contenido</h5>
              <p className="text-sm text-yellow-700 mb-3">
                Busca keywords donde tus competidores no están rankeando bien. Estas son oportunidades de oro.
              </p>
              
              <h5 className="font-semibold text-yellow-800 mb-2">📱 No Olvides las Búsquedas Móviles</h5>
              <p className="text-sm text-yellow-700 mb-3">
                Las búsquedas móviles suelen ser más conversacionales. Incluye preguntas y frases naturales.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-yellow-800 mb-2">🔄 Actualiza Regularmente</h5>
              <p className="text-sm text-yellow-700 mb-3">
                Las tendencias de búsqueda cambian. Revisa y actualiza tu lista de keywords cada 3-6 meses.
              </p>
              
              <h5 className="font-semibold text-yellow-800 mb-2">📊 Combina Múltiples Fuentes</h5>
              <p className="text-sm text-yellow-700">
                No dependas de una sola herramienta. Combina datos de Google Keyword Planner, Ahrefs, y SEMrush.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
