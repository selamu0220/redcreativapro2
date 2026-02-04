import Link from 'next/link'
import type { Metadata } from 'next'
import SEOModuleLayout from '../../components/seo/SEOModuleLayout'
import ChecklistComponent from '../../components/seo/ChecklistComponent'
import ExampleShowcase from '../../components/seo/ExampleShowcase'
import EducationalContentSchema from '../../components/seo/EducationalContentSchema'

export const metadata: Metadata = {
  title: 'Link Building | Fundamentos de Construcción de Enlaces SEO',
  description: 'Aprende estrategias modernas de link building: 5 atributos de backlinks de calidad, técnicas Create→Buy→Earn, HARO, guest blogging y Skyscraper.',
  alternates: { canonical: 'https://redcreativa.pro/seo-fundamentals/link-building' },
  openGraph: {
    title: 'Link Building | Fundamentos de Construcción de Enlaces',
    description: 'Domina las estrategias modernas de link building con nuestra guía completa.',
    type: 'article',
  },
  robots: { index: true, follow: true }
}

// Backlink quality attributes checklist data
const backlinkQualityAttributes = [
  {
    id: 'relevance',
    title: 'Relevancia del Sitio y Contenido',
    description: 'El sitio que enlaza debe estar relacionado con tu industria, nicho o tema. Un enlace desde un blog de cocina hacia una tienda de utensilios de cocina es más valioso que uno desde un sitio de tecnología.',
    priority: 'high' as const,
    tooltip: 'Google valora más los enlaces que provienen de sitios temáticamente relacionados con el tuyo.'
  },
  {
    id: 'authority',
    title: 'Autoridad del Dominio',
    description: 'El sitio que enlaza debe tener autoridad y credibilidad en su campo. Métricas como Domain Rating (DR) de Ahrefs o Domain Authority (DA) de Moz indican la fuerza del dominio.',
    priority: 'high' as const,
    tooltip: 'Un enlace desde un sitio con DR 70+ tiene mucho más valor que uno con DR 20.'
  },
  {
    id: 'followed',
    title: 'Enlaces Dofollow (Seguidos)',
    description: 'Los enlaces deben ser "dofollow" para transferir autoridad. Los enlaces "nofollow" no pasan PageRank, aunque pueden generar tráfico referencial.',
    priority: 'medium' as const,
    tooltip: 'Revisa el código HTML del enlace. Si no tiene rel="nofollow", es un enlace dofollow.'
  },
  {
    id: 'anchor-descriptive',
    title: 'Anchor Text Descriptivo y Natural',
    description: 'El texto del enlace debe ser descriptivo y natural, no sobre-optimizado. Varía entre marca, URL, keywords y texto genérico como "aquí" o "más información".',
    priority: 'medium' as const,
    tooltip: 'Evita usar siempre la misma keyword como anchor text. Google penaliza la sobre-optimización.'
  },
  {
    id: 'editorial-placement',
    title: 'Ubicación Editorial en el Contenido',
    description: 'Los enlaces dentro del contenido principal (editorial) tienen más valor que los del footer, sidebar o comentarios. Deben estar contextualmente integrados.',
    priority: 'medium' as const,
    tooltip: 'Los enlaces en el primer párrafo o en medio del contenido suelen tener más peso que los del final.'
  }
]

// Link building strategies data
const linkBuildingStrategies = [
  {
    id: 'create-strategy',
    title: 'Crear (Create)',
    description: 'Desarrolla contenido tan valioso que otros sitios quieran enlazarlo naturalmente',
    approaches: [
      'Contenido Skyscraper: Mejora contenido existente popular',
      'Estudios originales con datos únicos',
      'Herramientas gratuitas útiles para tu industria',
      'Infografías y recursos visuales compartibles',
      'Guías definitivas y recursos completos'
    ],
    pros: ['Enlaces naturales y de alta calidad', 'Tráfico directo adicional', 'Autoridad de marca'],
    cons: ['Requiere tiempo y recursos significativos', 'No garantiza enlaces inmediatos'],
    recommended: true
  },
  {
    id: 'buy-strategy',
    title: 'Comprar (Buy)',
    description: 'Invierte en oportunidades de enlaces pagados de forma ética y transparente',
    approaches: [
      'Patrocinios de eventos y conferencias',
      'Publicidad en newsletters relevantes',
      'Membresías en asociaciones de la industria',
      'Patrocinio de contenido educativo',
      'Colaboraciones pagadas con influencers'
    ],
    pros: ['Resultados más predecibles', 'Control sobre timing y placement'],
    cons: ['Costo continuo', 'Riesgo si no se hace éticamente'],
    recommended: false
  },
  {
    id: 'earn-strategy',
    title: 'Ganar (Earn)',
    description: 'Construye relaciones y autoridad para que otros quieran enlazarte voluntariamente',
    approaches: [
      'HARO (Help a Reporter Out) para conseguir menciones',
      'Guest blogging en sitios de autoridad',
      'Participación activa en comunidades de la industria',
      'Networking con otros profesionales del sector',
      'Crear contenido que resuelva problemas reales'
    ],
    pros: ['Enlaces de máxima calidad', 'Relaciones duraderas', 'Costo-efectivo'],
    cons: ['Requiere tiempo para construir relaciones', 'Resultados menos predecibles'],
    recommended: true
  }
]

// Link building tactics examples
const linkBuildingTactics = [
  {
    id: 'haro-example',
    scenario: 'Estrategia HARO: Responder a consultas de periodistas para conseguir menciones en medios de autoridad.',
    implementation: 'Suscríbete a HARO, filtra consultas relevantes a tu expertise, responde con información valiosa y datos únicos en menos de 2 horas. Incluye tu bio y enlace al sitio web.',
    result: 'Conseguimos 12 menciones en medios como Forbes, Entrepreneur y Inc. en 6 meses. Cada mención generó entre 200-1500 visitas y mejoró significativamente la autoridad del dominio.',
    metrics: [
      { label: 'Menciones Conseguidas', value: '12', change: '+400%' },
      { label: 'Tráfico Referencial', value: '8,400', change: '+320%' },
      { label: 'Domain Rating', value: '+15 puntos', change: 'Mejora significativa' }
    ],
    tags: ['HARO', 'Relaciones Públicas', 'Autoridad']
  },
  {
    id: 'guest-blogging-example',
    scenario: 'Guest Blogging Estratégico: Escribir contenido valioso para blogs de autoridad en tu industria.',
    implementation: 'Identifica blogs con DR 40+ en tu nicho, analiza su contenido más popular, propón temas únicos que aporten valor, escribe artículos de 1500+ palabras con ejemplos prácticos.',
    result: 'Publicamos 8 guest posts en 6 meses en sitios como Moz, Search Engine Land y Content Marketing Institute. Cada post generó 2-3 enlaces contextuales de alta calidad.',
    metrics: [
      { label: 'Guest Posts', value: '8', change: 'Alta calidad' },
      { label: 'Enlaces Conseguidos', value: '18', change: 'Dofollow' },
      { label: 'Tráfico Nuevo', value: '12,300', change: '+280%' }
    ],
    tags: ['Guest Blogging', 'Contenido', 'Autoridad']
  },
  {
    id: 'skyscraper-example',
    scenario: 'Técnica Skyscraper: Mejorar contenido existente popular y conseguir que quienes enlazan al original enlacen al tuyo.',
    implementation: 'Encuentra contenido con muchos backlinks usando Ahrefs, crea una versión 10x mejor (más completa, actualizada, con ejemplos), contacta a quienes enlazan al original.',
    result: 'Creamos "Guía Definitiva de SEO 2025" mejorando una guía de 2020. Conseguimos 47 nuevos backlinks en 4 meses de sitios que enlazaban a la versión anterior.',
    metrics: [
      { label: 'Backlinks Nuevos', value: '47', change: '+156%' },
      { label: 'Tráfico Orgánico', value: '15,600', change: '+420%' },
      { label: 'Keywords Ranking', value: '89', change: 'Top 10' }
    ],
    tags: ['Skyscraper', 'Contenido Superior', 'Outreach']
  }
]

export default function LinkBuildingPage() {
  return (
    <>
      <EducationalContentSchema
        title="Link Building | Fundamentos de Construcción de Enlaces SEO"
        description="Aprende estrategias modernas de link building: 5 atributos de backlinks de calidad, técnicas Create→Buy→Earn, HARO, guest blogging y Skyscraper."
        url="https://redcreativa.pro/seo-fundamentals/link-building"
        educationalLevel="Advanced"
        learningResourceType="Tutorial"
        teaches={[
          "5 atributos de backlinks de calidad",
          "Estrategias Create → Buy → Earn",
          "Técnicas HARO y guest blogging",
          "Técnica Skyscraper para link building",
          "Outreach efectivo y construcción de relaciones"
        ]}
        timeRequired="PT30M"
      />
      <SEOModuleLayout
      title="Link Building"
      description="Construye autoridad a través de enlaces de calidad y relaciones estratégicas con sitios relevantes"
      currentModule="link-building"
      previousModule={{
        title: "SEO On-Page",
        href: "/seo-fundamentals/on-page-seo"
      }}
      nextModule={{
        title: "SEO Técnico",
        href: "/seo-fundamentals/technical-seo"
      }}
      progress={60}
    >
      {/* Introduction */}
      <section className="mb-8">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            ¿Qué es el Link Building Moderno?
          </h3>
          <p className="text-purple-800 leading-relaxed">
            El link building moderno se centra en <strong>construir relaciones con sitios relevantes</strong> y 
            crear contenido tan valioso que otros quieran enlazarlo naturalmente. Ya no se trata de conseguir 
            cualquier enlace, sino de obtener enlaces de calidad que aporten autoridad real a tu sitio. 
            Después de optimizar tu <Link href="/seo-fundamentals/keyword-research" className="text-purple-600 hover:text-purple-700 underline">investigación de palabras clave</Link> y 
            <Link href="/seo-fundamentals/on-page-seo" className="text-purple-600 hover:text-purple-700 underline ml-1">SEO on-page</Link>, 
            el link building es el factor que puede llevarte de la página 2 a los primeros resultados.
          </p>
        </div>
      </section>

      {/* 5 Backlink Quality Attributes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          5 Atributos de Backlinks de Calidad
        </h2>
        <p className="text-gray-600 mb-6">
          No todos los enlaces son iguales. Estos son los 5 atributos que determinan la calidad 
          y el valor de un backlink para tu SEO. Evalúa cada enlace potencial con estos criterios 
          antes de invertir tiempo en conseguirlo.
        </p>

        <ChecklistComponent
          title="Atributos de Backlinks de Calidad"
          description="Evalúa cada enlace potencial con estos 5 criterios esenciales"
          items={backlinkQualityAttributes}
          type="technical"
        />
      </section>

      {/* Link Building Strategies Framework */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Estrategias de Link Building: Create → Buy → Earn
        </h2>
        <p className="text-gray-600 mb-6">
          Existen 3 enfoques principales para conseguir backlinks. La estrategia "Earn" (Ganar) 
          es la más recomendada por su sostenibilidad y calidad a largo plazo.
        </p>

        <div className="space-y-6">
          {linkBuildingStrategies.map((strategy, index) => (
            <div 
              key={strategy.id}
              className={`
                rounded-lg border p-6 
                ${strategy.recommended 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`
                  text-xl font-semibold 
                  ${strategy.recommended ? 'text-green-900' : 'text-gray-900'}
                `}>
                  {strategy.title}
                  {strategy.recommended && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Recomendado
                    </span>
                  )}
                </h3>
              </div>
              
              <p className={`
                mb-4 
                ${strategy.recommended ? 'text-green-800' : 'text-gray-700'}
              `}>
                {strategy.description}
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Enfoques:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {strategy.approaches.map((approach, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {approach}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ventajas:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {strategy.pros.map((pro, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Desventajas:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {strategy.cons.map((con, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Specific Link Building Tactics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Tácticas Específicas: HARO, Guest Blogging y Skyscraper
        </h2>
        <p className="text-gray-600 mb-6">
          Estas son las 3 tácticas más efectivas para conseguir backlinks de calidad. 
          Cada una tiene su proceso específico y casos de uso ideales.
        </p>

        <ExampleShowcase
          title="Tácticas de Link Building Probadas"
          description="Casos reales de implementación exitosa de las principales tácticas de link building"
          examples={linkBuildingTactics}
          type="backlink-analysis"
        />
      </section>

      {/* Outreach Templates and Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Templates de Outreach y Mejores Prácticas
        </h2>
        <p className="text-gray-600 mb-6">
          El outreach efectivo es clave para el éxito del link building. Usa estos templates 
          y mejores prácticas para aumentar tus tasas de respuesta y conseguir más enlaces.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Email Templates */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📧 Templates de Email
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Template HARO:</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Asunto:</strong> [Expertise] - Respuesta a tu consulta sobre [Tema]</p>
                  <p><strong>Cuerpo:</strong></p>
                  <div className="bg-white p-3 rounded border text-xs">
                    Hola [Nombre],<br/><br/>
                    Vi tu consulta en HARO sobre [tema específico]. Como [tu expertise/título], 
                    puedo aportar los siguientes insights:<br/><br/>
                    [2-3 puntos específicos con datos/ejemplos]<br/><br/>
                    Si necesitas más información o una cita específica, estaré encantado de ayudar.<br/><br/>
                    Saludos,<br/>
                    [Tu nombre y bio breve]
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Template Guest Post:</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Asunto:</strong> Propuesta de guest post: [Título específico]</p>
                  <div className="bg-white p-3 rounded border text-xs">
                    Hola [Nombre],<br/><br/>
                    Soy seguidor de [nombre del blog] y especialmente me gustó tu artículo sobre [tema específico].<br/><br/>
                    Me gustaría proponer un guest post: "[Título específico]" que cubriría [3 puntos únicos].<br/><br/>
                    Puedes ver ejemplos de mi trabajo en: [2-3 enlaces a tu mejor contenido]<br/><br/>
                    ¿Te interesaría que desarrolle esta propuesta?<br/><br/>
                    Saludos,<br/>
                    [Tu nombre]
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ✅ Mejores Prácticas
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personalización:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Menciona contenido específico del sitio objetivo</li>
                  <li>• Usa el nombre real de la persona de contacto</li>
                  <li>• Referencia trabajos o logros recientes</li>
                  <li>• Adapta el tono al estilo del sitio</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Timing y Seguimiento:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Envía emails martes-jueves, 10am-2pm</li>
                  <li>• Primer seguimiento después de 1 semana</li>
                  <li>• Segundo seguimiento después de 2 semanas</li>
                  <li>• Máximo 3 intentos de contacto</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Errores a Evitar:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Emails genéricos masivos</li>
                  <li>• Pedir enlaces directamente</li>
                  <li>• No ofrecer valor a cambio</li>
                  <li>• Insistir después de un "no"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📊 Métricas de Éxito en Outreach
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">15-25%</div>
              <div className="text-sm text-blue-800">Tasa de Respuesta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">5-10%</div>
              <div className="text-sm text-blue-800">Tasa de Conversión</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2-3</div>
              <div className="text-sm text-blue-800">Seguimientos Máximo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">48h</div>
              <div className="text-sm text-blue-800">Tiempo de Respuesta</div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            ¿Qué Sigue?
          </h3>
          <p className="text-green-800 mb-4">
            Has aprendido las estrategias fundamentales de link building. Ahora es momento de 
            asegurar que tu sitio web tenga una base técnica sólida para maximizar el valor 
            de todos los enlaces que consigas.
          </p>
          <Link 
            href="/seo-fundamentals/technical-seo"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Continuar con SEO Técnico
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
