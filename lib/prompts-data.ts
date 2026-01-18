
export interface PromptPage {
  slug: string
  title: string
  excerpt: string
  seoTitle?: string
  seoDescription?: string
  publishedAt: string
  tags: string[]
  category?: string
  relatedLinks?: { href: string; label: string }[]
  faq?: { question: string; answer: string }[]
}

export const promptPages: PromptPage[] = [
  // --- EXISTING PROMPTS (Categorized) ---
  {
    slug: 'anuncios-facebook',
    title: 'Prompts IA para Anuncios de Facebook que Convierten',
    excerpt: 'Colección de prompts optimizados para crear anuncios de Facebook persuasivos y listos para publicar.',
    seoTitle: 'Prompts IA para Anuncios de Facebook | Copy que convierte',
    seoDescription: 'Usa estos prompts de IA para crear anuncios de Facebook persuasivos. Plantillas, ejemplos y buenas prácticas listas para usar.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'facebook ads', 'copywriting', 'social ads'],
    category: 'Social Media',
    relatedLinks: [
      { href: '/herramientas-ia-copywriting', label: 'Hub de herramientas IA' },
      { href: '/corrector-textos-ia', label: 'Corrector de textos IA' }
    ],
    faq: [
      { question: '¿Cómo adaptar el tono al público?', answer: 'Define audiencia y tono en el prompt: profesional, cercano, técnico o emocional, e incluye ejemplos de lenguaje.' },
      { question: '¿Qué métricas optimizar?', answer: 'Optimiza CTR del titular, claridad del beneficio y la llamada a la acción. Itera con tests A/B.' }
    ]
  },
  {
    slug: 'email-b2b',
    title: 'Prompts IA para Emails B2B de Alto Rendimiento',
    excerpt: 'Prompts para cold outreach, seguimiento y cierre en entornos B2B con personalización efectiva.',
    seoTitle: 'Prompts IA para Email B2B | Outreach que responde',
    seoDescription: 'Plantillas de prompts para emails B2B efectivos: apertura, objeciones y cierres. Personalización y estructuras que funcionan.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'email', 'b2b', 'ventas'],
    category: 'Email Marketing',
    relatedLinks: [{ href: '/correos-ia', label: 'Generador de correos IA' }],
    faq: [
      { question: '¿Cómo evitar spam?', answer: 'Evita palabras spam, usa personalización auténtica y ofrece valor concreto. Mide respuestas y ajusta.' },
      { question: '¿Qué longitud ideal?', answer: '50–120 palabras con CTA claro y una propuesta de valor específica por email.' }
    ]
  },
  {
    slug: 'descripcion-producto-ecommerce',
    title: 'Prompts IA para Descripción de Producto eCommerce',
    excerpt: 'Prompts para fichas con beneficio, características clave, objeciones y SEO (keywords + entidades).',
    seoTitle: 'Prompts IA para Descripciones de Producto | eCommerce SEO',
    seoDescription: 'Genera descripciones de producto que posicionan y convierten con estos prompts IA. Incluye estructura y ejemplos.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'ecommerce', 'seo', 'producto'],
    category: 'eCommerce'
  },
  {
    slug: 'titulares-blog',
    title: 'Prompts IA para Titulares de Blog con Alto CTR',
    excerpt: 'Fórmulas de titulares orientadas a beneficio, curiosidad y autoridad con variaciones por intención.',
    seoTitle: 'Prompts IA para Titulares de Blog | Sube el CTR',
    seoDescription: 'Fórmulas y prompts IA para titulares que mejoran el CTR. Incluye plantillas por intención y ejemplos.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'blog', 'ctr', 'titulares'],
    category: 'Blogging'
  },
  {
    slug: 'linkedin-posts',
    title: 'Prompts IA para Posts de LinkedIn con Engagement',
    excerpt: 'Estructuras para posts de experto, storytelling, valor accionable y CTA a lead magnet.',
    seoTitle: 'Prompts IA para LinkedIn | Posts que generan oportunidades',
    seoDescription: 'Plantillas de prompts IA para LinkedIn que generan engagement y leads. Incluye ejemplos y CTAs.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'linkedin', 'social', 'engagement'],
    category: 'Social Media'
  },
  {
    slug: 'twitter-hilos',
    title: 'Prompts IA para Hilos de Twitter/X que se Comparten',
    excerpt: 'Prompts para hilos con estructura de gancho, valor y cierre. Multiformato con bullets y ejemplos.',
    seoTitle: 'Prompts IA para Hilos de X | Fórmulas que funcionan',
    seoDescription: 'Crea hilos de X/Twitter con IA usando estas plantillas. Incluye estructuras y ganchos efectivos.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'twitter', 'x', 'social'],
    category: 'Social Media'
  },
  {
    slug: 'seo-meta-descriptions',
    title: 'Prompts IA para Meta Descriptions SEO que Aumentan CTR',
    excerpt: 'Plantillas para descripciones con beneficio, keywords y prueba social. 120–155 caracteres.',
    seoTitle: 'Prompts IA para Meta Descriptions SEO | CTR alto',
    seoDescription: 'Meta descriptions con IA orientadas a CTR. Prompts, ejemplos y checklist de calidad.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'seo', 'meta', 'ctr'],
    category: 'SEO Technical'
  },
  {
    slug: 'guiones-video',
    title: 'Prompts IA para Guiones de Video y Shorts',
    excerpt: 'Estructuras para guiones con gancho, problema, solución y CTA. Incluye formatos cortos.',
    seoTitle: 'Prompts IA para Guiones de Video | Shorts y YouTube',
    seoDescription: 'Guiones de video con IA: plantillas para explicar, persuadir y convertir. Incluye shorts.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'video', 'shorts', 'guion'],
    category: 'Video Marketing'
  },
  {
    slug: 'landing-page',
    title: 'Prompts IA para Landing Pages que Venden',
    excerpt: 'Secciones clave: problema, solución, beneficios, prueba social y CTA. Estructuras listas.',
    seoTitle: 'Prompts IA para Landing Pages | Convierte más',
    seoDescription: 'Plantillas IA para landing pages de alto rendimiento. Estructuras, ejemplos y checklist.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'landing', 'conversion', 'copywriting'],
    category: 'Copywriting'
  },
  {
    slug: 'cold-outreach',
    title: 'Prompts IA para Cold Outreach que Responde',
    excerpt: 'Mensajes breves y personalizados por sector, con CTA claro y follow-up inteligente.',
    seoTitle: 'Prompts IA para Cold Outreach | Respuestas reales',
    seoDescription: 'Estructuras de outreach con IA que consiguen respuestas. Personalización y cadencias.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'outreach', 'ventas', 'b2b'],
    category: 'Email Marketing'
  },

  // --- NEW PROMPTS: SEO ON-PAGE ---
  {
    slug: 'seo-keyword-integration',
    title: 'Integración Orgánica de Keywords Principales',
    excerpt: 'Prompt para insertar palabras clave sin forzar la lectura. Mantiene la naturalidad y densidad óptima.',
    seoTitle: 'Prompts IA para Integrar Keywords | SEO Natural',
    seoDescription: 'Aprende a usar IA para insertar keywords de forma natural en tus textos. Evita el keyword stuffing.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'keywords', 'on-page'],
    category: 'SEO On-Page'
  },
  {
    slug: 'seo-lsi-keywords',
    title: 'Generación de Keywords Semánticas (LSI)',
    excerpt: 'Identifica y aplica términos relacionados semánticamente para enriquecer el contexto del contenido.',
    seoTitle: 'Prompts IA para Keywords LSI | Semántica SEO',
    seoDescription: 'Mejora la relevancia de tu contenido con keywords LSI generadas por IA. Expande tu alcance semántico.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'lsi', 'keywords'],
    category: 'SEO On-Page'
  },
  {
    slug: 'seo-intro-hook',
    title: 'Párrafos Introductorios Optimizados para SEO',
    excerpt: 'Crea introducciones que enganchen al usuario e incluyan la keyword principal en las primeras 100 palabras.',
    seoTitle: 'Prompts IA para Intros SEO | Gancho y Keywords',
    seoDescription: 'Redacta introducciones perfectas para SEO con IA. Atrapa al lector y posiciona desde la primera línea.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'intro', 'copywriting'],
    category: 'SEO On-Page'
  },
  {
    slug: 'seo-conclusion-cta',
    title: 'Conclusiones con Resumen y CTA SEO',
    excerpt: 'Genera cierres que refuercen la intención de búsqueda y dirijan al usuario a la acción deseada.',
    seoTitle: 'Prompts IA para Conclusiones SEO | Cierre Efectivo',
    seoDescription: 'Estructura conclusiones que resumen, satisfacen la intención y convierten. Prompts listos para usar.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'conclusion', 'cta'],
    category: 'SEO On-Page'
  },
  {
    slug: 'seo-content-upgrade',
    title: 'Actualización de Contenidos Antiguos (Content Refresh)',
    excerpt: 'Prompt para analizar contenido desactualizado y sugerir mejoras de frescura y relevancia SEO.',
    seoTitle: 'Prompts IA para Actualizar Contenido | SEO Refresh',
    seoDescription: 'Revive tus posts antiguos. Usa IA para identificar datos obsoletos y mejorar la relevancia SEO.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'content refresh', 'actualizacion'],
    category: 'SEO On-Page'
  },
  {
    slug: 'seo-featured-snippet',
    title: 'Optimización para Featured Snippets (Posición 0)',
    excerpt: 'Estructura respuestas directas (definiciones, listas, tablas) para capturar fragmentos destacados.',
    seoTitle: 'Prompts IA para Featured Snippets | Posición Cero',
    seoDescription: 'Estructura tu contenido para ganar la posición cero en Google. Prompts para definiciones y listas.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'featured snippet', 'zero click'],
    category: 'SEO On-Page'
  },
  {
    slug: 'seo-internal-linking',
    title: 'Estrategia de Enlazado Interno Contextual',
    excerpt: 'Sugiere anchor texts y puntos de enlace relevantes dentro del texto para mejorar la autoridad de página.',
    seoTitle: 'Prompts IA para Enlazado Interno | SEO Linkbuilding',
    seoDescription: 'Mejora tu estructura web con sugerencias de enlaces internos por IA. Anchor texts optimizados.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'interlinking', 'estructura'],
    category: 'SEO On-Page'
  },
  {
    slug: 'seo-readability-fixer',
    title: 'Mejora de Legibilidad Flesch-Kincaid',
    excerpt: 'Reescribe párrafos densos para hacerlos más escaneables y fáciles de leer, crucial para retenar usuarios.',
    seoTitle: 'Prompts IA para Legibilidad | Mejora UX y SEO',
    seoDescription: 'Haz tu contenido más legible. Prompts para simplificar frases y mejorar la puntuación de legibilidad.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'legibilidad', 'ux'],
    category: 'SEO On-Page'
  },
  {
    slug: 'seo-image-alt',
    title: 'Generador de Alt Text para Imágenes',
    excerpt: 'Crea textos alternativos descriptivos y ricos en keywords para accesibilidad y SEO de imágenes.',
    seoTitle: 'Prompts IA para Alt Text | SEO de Imágenes',
    seoDescription: 'Optimiza tus imágenes con Alt Text generado por IA. Accesibilidad y posicionamiento visual.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'imagenes', 'alt text'],
    category: 'SEO On-Page'
  },
  {
    slug: 'seo-url-slugs',
    title: 'Creación de URLs (Slugs) Amigables',
    excerpt: 'Convierte títulos largos en URLs cortas, descriptivas y optimizadas con la keyword principal.',
    seoTitle: 'Prompts IA para URLs SEO | Slugs Limpios',
    seoDescription: 'Genera URLs limpias y amigables para SEO a partir de tus títulos. Prompts rápidos y efectivos.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'urls', 'slugs'],
    category: 'SEO On-Page'
  },

  // --- NEW PROMPTS: META DESCRIPTIONS & HEADINGS ---
  {
    slug: 'seo-meta-intent',
    title: 'Meta Descriptions Orientadas a Intención',
    excerpt: 'Adapta la meta descripción según si la búsqueda es informacional, transaccional o navegacional.',
    seoTitle: 'Prompts IA Meta Descriptions | Intención de Búsqueda',
    seoDescription: 'Alinea tus meta descriptions con la intención del usuario para maximizar CTR.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'meta', 'intencion'],
    category: 'Meta Descriptions'
  },
  {
    slug: 'seo-meta-clickbait',
    title: 'Meta Descriptions con "Curiosidad Ética"',
    excerpt: 'Técnicas de copywriting para generar curiosidad en las SERPs sin caer en clickbait engañoso.',
    seoTitle: 'Prompts IA Meta Tags | Curiosidad y CTR',
    seoDescription: 'Aumenta clics con meta descriptions intrigantes pero honestas. Técnicas de copy para SERPs.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'meta', 'copywriting'],
    category: 'Meta Descriptions'
  },
  {
    slug: 'seo-h2-questions',
    title: 'H2 Basados en Preguntas (People Also Ask)',
    excerpt: 'Genera subtítulos H2 que responden directamente a preguntas frecuentes de los usuarios.',
    seoTitle: 'Prompts IA H2 | Preguntas Frecuentes SEO',
    seoDescription: 'Estructura tu contenido con preguntas reales de los usuarios. Gana relevancia semántica.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'headings', 'paa'],
    category: 'Headings Structure'
  },
  {
    slug: 'seo-h1-variants',
    title: 'Variaciones de H1 de Alto Impacto',
    excerpt: 'Genera 10 opciones de título H1 optimizado combinando keyword + beneficio + gancho.',
    seoTitle: 'Prompts IA Títulos H1 | Impacto y SEO',
    seoDescription: 'No te quedes con el primer título. Genera variantes H1 optimizadas para SEO y conversión.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'headings', 'titulos'],
    category: 'Headings Structure'
  },
  {
    slug: 'seo-outline-generator',
    title: 'Generador de Estructuras (Outlines) Completas',
    excerpt: 'Crea un esquema jerárquico (H1, H2, H3) completo basado en una keyword y sus competidores.',
    seoTitle: 'Prompts IA Estructura Web | Outlines SEO',
    seoDescription: 'Crea esquemas de contenido perfectos en segundos. Jerarquía lógica para Google y usuarios.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'estructura', 'outline'],
    category: 'Content Structure'
  },

  // --- NEW PROMPTS: TYPES OF CONTENT ---
  {
    slug: 'seo-listicle-format',
    title: 'Estructura para Artículos de Lista (Listicles)',
    excerpt: 'Formato optimizado para listas "Top 10", "Mejores X", facilitando el escaneo y retención.',
    seoTitle: 'Prompts IA Listicles | Contenido Viral SEO',
    seoDescription: 'Crea artículos tipo lista que posicionan. Estructura y formato para retener lectores.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'content', 'listicle'],
    category: 'Content Structure'
  },
  {
    slug: 'seo-comparison-post',
    title: 'Estructura Comparativa (Vs.)',
    excerpt: 'Prompt para artículos "Producto A vs Producto B", con tablas comparativas y análisis neutral.',
    seoTitle: 'Prompts IA Comparativas | Posts de Afiliación',
    seoDescription: 'Domina las búsquedas comparativas. Estructura para análisis de productos y servicios.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'content', 'comparativa'],
    category: 'Content Structure'
  },
  {
    slug: 'seo-howto-guide',
    title: 'Guía Paso a Paso (How-To)',
    excerpt: 'Estructura lógica para tutoriales, usando pasos numerados y lenguaje imperativo claro.',
    seoTitle: 'Prompts IA Guías How-To | Tutoriales SEO',
    seoDescription: 'Crea tutoriales paso a paso inconfundibles. Formato ideal para capturar respuestas ricas.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'content', 'tutorial'],
    category: 'Content Structure'
  },
  {
    slug: 'seo-pill-content',
    title: 'Micro-Contenido para Redes Sociales (Repurposing)',
    excerpt: 'Extrae "píldoras" de valor de un artículo largo para compartir en LinkedIn o Twitter.',
    seoTitle: 'Prompts IA Repurposing | Blog a Social',
    seoDescription: 'Recicla tu contenido SEO. Extrae nuggets de valor para redes sociales automáticamente.',
    publishedAt: '2026-01-18',
    tags: ['social', 'repurposing', 'content'],
    category: 'Content Structure'
  },

  // --- NEW PROMPTS: SCHEMA & TECH ---
  {
    slug: 'seo-faq-schema',
    title: 'Generador de JSON-LD para FAQ Page',
    excerpt: 'Crea el código de marcado de datos estructurados para una sección de preguntas frecuentes.',
    seoTitle: 'Prompts IA FAQ Schema | Rich Snippets',
    seoDescription: 'Genera código Schema.org para FAQs sin saber programar. Mejora tu visibilidad en Google.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'schema', 'json-ld'],
    category: 'Schema/Rich Snippets'
  },
  {
    slug: 'seo-review-schema',
    title: 'Generador de Schema de Reseña de Producto',
    excerpt: 'Formatea una reseña para que Google entienda la valoración, autor y producto analizado.',
    seoTitle: 'Prompts IA Review Schema | Estrellas en Google',
    seoDescription: 'Consigue las estrellas en los resultados de búsqueda. Genera Schema de reseñas fácilmente.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'schema', 'review'],
    category: 'Schema/Rich Snippets'
  },
  {
    slug: 'seo-howto-schema',
    title: 'Generador de Schema How-To',
    excerpt: 'Marca tus tutoriales para que aparezcan con imágenes y pasos destacados en móvil.',
    seoTitle: 'Prompts IA How-To Schema | Resultados Móviles',
    seoDescription: 'Optimiza tus guías para dispositivos móviles con marcado How-To. Código listo para copiar.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'schema', 'howto'],
    category: 'Schema/Rich Snippets'
  },

  // --- NEW PROMPTS: LOCAL SEO ---
  {
    slug: 'seo-gmb-post',
    title: 'Posts para Google Business Profile',
    excerpt: 'Contenido corto y geo-localizado para actualizaciones de perfil de negocio (ofertas, eventos).',
    seoTitle: 'Prompts IA Google Business | SEO Local',
    seoDescription: 'Mantén activo tu perfil de Google Business. Prompts para posts ofertas y novedades locales.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'local', 'gmb'],
    category: 'Local SEO'
  },
  {
    slug: 'seo-local-landing',
    title: 'Estructura Landing Page Local (Servicio + Ciudad)',
    excerpt: 'Prompt para crear páginas de aterrizaje específicas por ubicación evitando contenido duplicado.',
    seoTitle: 'Prompts IA Landing Local | SEO Geo',
    seoDescription: 'Posiciona en múltiples ciudades. Estructura para landings locales únicas y relevantes.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'local', 'landing'],
    category: 'Local SEO'
  },
  {
    slug: 'seo-review-response',
    title: 'Respuestas a Reseñas (Positivas y Negativas)',
    excerpt: 'Genera respuestas profesionales y empáticas que incluyen keywords locales y de servicio.',
    seoTitle: 'Prompts IA Responder Reseñas | Reputación',
    seoDescription: 'Gestiona tu reputación online. Respuestas rápidas y profesionales para reseñas de clientes.',
    publishedAt: '2026-01-18',
    tags: ['seo', 'local', 'reviews'],
    category: 'Local SEO'
  }
]

export function getPromptBySlug(slug: string): PromptPage | undefined {
  return promptPages.find(p => p.slug === slug)
}

export function getAllPromptSlugs(): string[] {
  return promptPages.map(p => p.slug)
}
