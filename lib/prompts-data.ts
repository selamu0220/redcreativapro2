export interface PromptPage {
  slug: string
  title: string
  excerpt: string
  seoTitle?: string
  seoDescription?: string
  publishedAt: string
  tags: string[]
  relatedLinks?: { href: string; label: string }[]
  faq?: { question: string; answer: string }[]
}

export const promptPages: PromptPage[] = [
  {
    slug: 'anuncios-facebook',
    title: 'Prompts IA para Anuncios de Facebook que Convierten',
    excerpt: 'Colección de prompts optimizados para crear anuncios de Facebook persuasivos y listos para publicar.',
    seoTitle: 'Prompts IA para Anuncios de Facebook | Copy que convierte',
    seoDescription: 'Usa estos prompts de IA para crear anuncios de Facebook persuasivos. Plantillas, ejemplos y buenas prácticas listas para usar.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'facebook ads', 'copywriting', 'social ads'],
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
    tags: ['prompts', 'ecommerce', 'seo', 'producto']
  },
  {
    slug: 'titulares-blog',
    title: 'Prompts IA para Titulares de Blog con Alto CTR',
    excerpt: 'Fórmulas de titulares orientadas a beneficio, curiosidad y autoridad con variaciones por intención.',
    seoTitle: 'Prompts IA para Titulares de Blog | Sube el CTR',
    seoDescription: 'Fórmulas y prompts IA para titulares que mejoran el CTR. Incluye plantillas por intención y ejemplos.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'blog', 'ctr', 'titulares']
  },
  {
    slug: 'linkedin-posts',
    title: 'Prompts IA para Posts de LinkedIn con Engagement',
    excerpt: 'Estructuras para posts de experto, storytelling, valor accionable y CTA a lead magnet.',
    seoTitle: 'Prompts IA para LinkedIn | Posts que generan oportunidades',
    seoDescription: 'Plantillas de prompts IA para LinkedIn que generan engagement y leads. Incluye ejemplos y CTAs.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'linkedin', 'social', 'engagement']
  },
  {
    slug: 'twitter-hilos',
    title: 'Prompts IA para Hilos de Twitter/X que se Comparten',
    excerpt: 'Prompts para hilos con estructura de gancho, valor y cierre. Multiformato con bullets y ejemplos.',
    seoTitle: 'Prompts IA para Hilos de X | Fórmulas que funcionan',
    seoDescription: 'Crea hilos de X/Twitter con IA usando estas plantillas. Incluye estructuras y ganchos efectivos.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'twitter', 'x', 'social']
  },
  {
    slug: 'seo-meta-descriptions',
    title: 'Prompts IA para Meta Descriptions SEO que Aumentan CTR',
    excerpt: 'Plantillas para descripciones con beneficio, keywords y prueba social. 120–155 caracteres.',
    seoTitle: 'Prompts IA para Meta Descriptions SEO | CTR alto',
    seoDescription: 'Meta descriptions con IA orientadas a CTR. Prompts, ejemplos y checklist de calidad.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'seo', 'meta', 'ctr']
  },
  {
    slug: 'guiones-video',
    title: 'Prompts IA para Guiones de Video y Shorts',
    excerpt: 'Estructuras para guiones con gancho, problema, solución y CTA. Incluye formatos cortos.',
    seoTitle: 'Prompts IA para Guiones de Video | Shorts y YouTube',
    seoDescription: 'Guiones de video con IA: plantillas para explicar, persuadir y convertir. Incluye shorts.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'video', 'shorts', 'guion']
  },
  {
    slug: 'landing-page',
    title: 'Prompts IA para Landing Pages que Venden',
    excerpt: 'Secciones clave: problema, solución, beneficios, prueba social y CTA. Estructuras listas.',
    seoTitle: 'Prompts IA para Landing Pages | Convierte más',
    seoDescription: 'Plantillas IA para landing pages de alto rendimiento. Estructuras, ejemplos y checklist.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'landing', 'conversion', 'copywriting']
  },
  {
    slug: 'cold-outreach',
    title: 'Prompts IA para Cold Outreach que Responde',
    excerpt: 'Mensajes breves y personalizados por sector, con CTA claro y follow-up inteligente.',
    seoTitle: 'Prompts IA para Cold Outreach | Respuestas reales',
    seoDescription: 'Estructuras de outreach con IA que consiguen respuestas. Personalización y cadencias.',
    publishedAt: '2025-12-01',
    tags: ['prompts', 'outreach', 'ventas', 'b2b']
  }
]

export function getPromptBySlug(slug: string): PromptPage | undefined {
  return promptPages.find(p => p.slug === slug)
}

export function getAllPromptSlugs(): string[] {
  return promptPages.map(p => p.slug)
}

