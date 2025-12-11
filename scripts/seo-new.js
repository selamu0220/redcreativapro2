const fs = require('fs')
const path = require('path')

function arg(k, def) {
  const a = process.argv.slice(2)
  for (const x of a) {
    const [key, val] = x.split('=')
    if (key === `--${k}`) return val
  }
  return def
}

function nowDate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function writeFile(p, content) {
  fs.writeFileSync(p, content)
}

function updateBlogData(post) {
  const file = path.join(process.cwd(), 'lib', 'blog-data.ts')
  const content = fs.readFileSync(file, 'utf8')
  const insertObj = `  {
    id: '${post.id}',
    title: '${post.title}',
    excerpt: '${post.excerpt}',
    category: '${post.category}',
    subcategory: '${post.subcategory}',
    author: '${post.author}',
    publishedAt: '${post.publishedAt}',
    readTime: '${post.readTime}',
    tags: ${JSON.stringify(post.tags)},
    featured: false,
    trending: false,
    views: 0,
    content: 'El contenido completo está en la página individual del artículo: /blog/${post.id}',
    seoTitle: '${post.seoTitle}',
    seoDescription: '${post.seoDescription}',
    image: '${post.image}'
  },
`
  const idx = content.lastIndexOf(']')
  if (idx === -1) throw new Error('blog-data.ts no contiene array de posts')
  const updated = content.slice(0, idx) + insertObj + content.slice(idx)
  fs.writeFileSync(file, updated)
}

function pageTemplate(post) {
  const preset = post.preset || { steps: ['Paso 1','Paso 2','Paso 3'], prompts: ['Prompt 1','Prompt 2','Prompt 3'], faq: [] }
  const steps = preset.steps.map(s => `<li>${s}</li>`).join('\n')
  const prompts = preset.prompts.map(s => `<li>${s}</li>`).join('\n')
  const faqEntities = (preset.faq || []).map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } }))
  return `import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: '${post.title} | Red Creativa Pro',
  description: '${post.excerpt}',
  keywords: '${post.keywords}',
  openGraph: {
    title: '${post.title} | Red Creativa Pro',
    description: '${post.excerpt}',
    type: 'article',
    publishedTime: '${post.publishedAt}',
    authors: ['${post.author}'],
    tags: ${JSON.stringify(post.tags)},
    images: [{ url: 'https://redcreativa.pro/blog/${post.id}/og-image.jpg', width: 1200, height: 630, alt: '${post.title}' }]
  },
  twitter: { card: 'summary_large_image', title: '${post.title}', images: ['https://redcreativa.pro/blog/${post.id}/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/${post.id}' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: '${post.title}',
  description: '${post.excerpt}',
  keywords: '${post.keywords}',
  author: { '@type': 'Person', name: '${post.author}' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '${post.publishedAt}',
  dateModified: '${post.publishedAt}',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/${post.id}' },
  inLanguage: 'es-ES'
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: ${JSON.stringify(faqEntities)}
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">${post.title}</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="px-2 py-1 rounded-full text-xs font-medium">${post.category}</span>
            <span>•</span>
            <span>${post.readTime} de lectura</span>
            <span>•</span>
            <span>${post.publishedAt.split('-').reverse().join(' de ')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">${post.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">${post.excerpt}</p>
        </header>
        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-bold mb-6">Introducción</h2>
          <p>${post.excerpt}</p>
          <h2 className="text-3xl font-bold mb-6">Pasos</h2>
          <ul className="list-disc list-inside space-y-2 mb-8">
${steps}
          </ul>
          <h2 className="text-3xl font-bold mb-6">Prompts</h2>
          <div className="border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
${prompts}
            </ul>
          </div>
          <div className="border-l-4 p-6 mb-8">
            <h3 className="text-lg font-medium mb-2">Recursos</h3>
            <p>Usa <Link href="/escritor-ia">Escritor IA</Link>, <Link href="/correos-ia">Correos IA</Link> y <Link href="/herramientas-ia-copywriting">Herramientas IA Copywriting</Link>.</p>
            <Link href="/escritor-ia" className="inline-flex items-center px-4 py-2 rounded-lg mt-4">
              Empezar ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
`
}

function main() {
  const id = arg('id')
  const title = arg('title')
  const excerpt = arg('desc')
  if (!id || !title || !excerpt) {
    console.log('Uso: npm run seo:new -- --id=slug --title="Titulo" --desc="Meta/Resumen" --tags=tag1,tag2')
    process.exit(1)
  }
  const tags = (arg('tags', '') || '').split(',').filter(Boolean)
  const keywords = (arg('keywords', '') || tags.join(', '))
  const category = arg('category', 'creatividad')
  const subcategory = arg('subcategory', 'marketing-digital')
  const author = arg('author', 'selamu')
  const publishedAt = arg('date', nowDate())
  const readTime = arg('readTime', '10 min')
  const image = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(title + ' Spanish AI')}&&image_size=landscape_16_9`
  const presetName = arg('preset', '')
  const presets = {
    'ecommerce-belleza': {
      steps: ['Recordatorio previo','Reposición en fecha','Última llamada con beneficio'],
      prompts: ['Genera 10 asuntos de reposición cosmética (45–60 caracteres, español)','Escribe 3 copy con beneficio claro y CTA','Propón timing por producto según consumo típico'],
      faq: [
        { q: '¿Cuál es el mejor timing de reposición?', a: 'Depende del producto; típicamente 21–45 días y datos de consumo.' },
        { q: '¿Qué incluir en el asunto?', a: 'Beneficio claro, referencia al producto y urgencia suave.' }
      ]
    },
    'moda': {
      steps: ['Bienvenida con beneficio','Carrito abandonado con urgencia suave','Recomendaciones estilizadas'],
      prompts: ['Genera asuntos para carrito moda femenina (45–60 caracteres, español)','Escribe bienvenida con 10% descuento y CTA claro','Redacta recomendaciones con estilo y prueba social'],
      faq: [
        { q: '¿Qué funciona en moda?', a: 'Urgencia suave, personalización por talla/producto y beneficio claro.' }
      ]
    },
    'moda-hombres': {
      steps: ['Bienvenida con oferta','Carrito abandonado con beneficio','Recomendaciones por estilo masculino'],
      prompts: ['Genera asuntos para carrito moda masculina (45–60 caracteres, español)','Escribe bienvenida con oferta y CTA','Redacta recomendaciones por estilo y ocasión'],
      faq: [ { q: '¿Qué funciona en moda masculina?', a: 'Beneficio claro, personalización por talla/producto y urgencia suave.' } ]
    },
    'saas-seguridad': {
      steps: ['Educación: riesgo y marco','Valor: caso de uso y métrica','Acción: activar módulo y soporte'],
      prompts: ['Escribe email educativo sobre riesgo (español, B2B)','Redacta caso de uso con métrica y prueba social','Genera email de activación con pasos y soporte'],
      faq: []
    },
    'ciso-secops': {
      steps: ['Riesgo operativo','Caso de uso por equipo','Activación y soporte de módulo'],
      prompts: ['Email de riesgo SecOps (español)','Caso de uso con métrica operativa','Activación de módulo con pasos'],
      faq: []
    },
    'ciso-finanzas': {
      steps: ['Riesgo regulatorio y fraude','Caso de uso financiero','Activación y soporte de módulo'],
      prompts: ['Email de riesgo para CISO en finanzas','Caso de uso con métrica (fraude/tiempo de respuesta)','Activación de módulo con pasos y contacto'],
      faq: []
    },
    'moda-accesorios': {
      steps: ['Bienvenida con oferta','Carrito abandonado accesorios','Recomendaciones por ocasión'],
      prompts: ['Asuntos carrito accesorios (45–60 caracteres, español)','Bienvenida con oferta y CTA','Recomendaciones por ocasión (trabajo/fiesta/viaje)'],
      faq: []
    },
    'ciso-healthcare': {
      steps: ['Riesgo regulatorio (HIPAA)','Caso de uso en clínica/hospital','Activación de módulo y soporte'],
      prompts: ['Email de riesgo CISO healthcare en español','Caso de uso con métrica (incidentes/tiempo de respuesta)','Activación con pasos y contacto'],
      faq: []
    },
    'moda-zapatos': {
      steps: ['Bienvenida con oferta limitada','Carrito abandonado (zapatos)','Recomendaciones por temporada'],
      prompts: ['Asuntos carrito zapatos (45–60 caracteres, español)','Bienvenida con oferta y CTA claro','Recomendaciones por temporada (invierno/verano)'],
      faq: []
    },
    'ciso-saas-fintech': {
      steps: ['Riesgo en SaaS fintech','Caso de uso con métrica financiera','Activación de módulo crítico'],
      prompts: ['Email de riesgo para CISO en SaaS fintech','Caso de uso con métrica (fraude/MTTR)','Activación de módulo con pasos y contacto de soporte'],
      faq: []
    },
    'moda-zapatos-deportivos': {
      steps: ['Bienvenida con oferta en calzado deportivo','Carrito abandonado (deportes)','Recomendaciones por actividad'],
      prompts: ['Asuntos carrito calzado deportivo (45–60 caracteres, español)','Bienvenida con oferta y CTA','Recomendaciones por actividad (running/gym/outdoor)'],
      faq: []
    },
    'ciso-saas-pagos': {
      steps: ['Riesgo en pasarelas de pago','Caso de uso con métrica (rechazos/fraude)','Activación de módulo crítico'],
      prompts: ['Email de riesgo CISO SaaS de pagos','Caso con métrica financiera (fraude/chargeback/MTTR)','Activación de módulo con pasos y contacto'],
      faq: []
    },
    'moda-zapatos-deportivos-mujer': {
      steps: ['Bienvenida con oferta en calzado deportivo mujer','Carrito abandonado (deportes mujer)','Recomendaciones por actividad/estilo'],
      prompts: ['Asuntos carrito calzado deportivo mujer (45–60 caracteres, español)','Bienvenida con oferta y CTA','Recomendaciones por actividad y estilo (running/gym/outdoor)'],
      faq: []
    },
    'ciso-saas-pagos-latam': {
      steps: ['Riesgo en pagos LATAM','Caso con métrica (fraude/chargeback/MTTR)','Activación de módulo crítico'],
      prompts: ['Email de riesgo CISO SaaS pagos LATAM','Caso de uso con métrica financiera LATAM','Activación con pasos y contacto regional'],
      faq: []
    },
    'educacion': {
      steps: ['Definir objetivos medibles','Diseñar metodología completa','Organizar revisión por temas y años'],
      prompts: ['Redacta 3 objetivos medibles para [tema]','Define metodología (diseño, muestra, instrumentos, análisis)','Organiza revisión por temas con síntesis de hallazgos'],
      faq: [
        { q: '¿Cómo definir objetivos medibles?', a: 'Usa verbos de acción, métricas y población/variable delimitada.' },
        { q: '¿Cómo organizar la revisión?', a: 'Agrupa por temas y años; resume hallazgos y vacíos.' }
      ]
    }
  }
  const preset = presets[presetName] || null
  const post = {
    id,
    title,
    excerpt,
    category,
    subcategory,
    author,
    publishedAt,
    readTime,
    tags,
    seoTitle: title,
    seoDescription: excerpt,
    image,
    keywords,
    preset
  }
  const pageDir = path.join(process.cwd(), 'app', 'blog', id)
  ensureDir(pageDir)
  const pagePath = path.join(pageDir, 'page.tsx')
  writeFile(pagePath, pageTemplate(post))
  updateBlogData(post)
  const pinsDir = path.join(process.cwd(), 'docs', 'seo', 'pins')
  const socialDir = path.join(process.cwd(), 'docs', 'seo', 'social')
  ensureDir(pinsDir)
  ensureDir(socialDir)
  const pinPath = path.join(pinsDir, `${id}.md`)
  const socialPath = path.join(socialDir, `${id}-thread.md`)
  const pinDoc = `# Pines de Pinterest — ${title}\n\n- Pin 1: Portada — "${title}"\n  - Descripción: ${excerpt}\n- Pin 2: Idea — "Beneficio"\n  - Descripción: Usa prompts del artículo\n- Pin 3: Acción — "CTA"\n  - Descripción: Publica y enlaza el recurso\n\nURL destino: https://redcreativa.pro/blog/${id}\n`
  const socialDoc = `# Hilo LinkedIn/X — ${title}\n\n1) ${excerpt}\n2) Pasos y prompts útiles.\n3) Publica y mide CTR.\n4) Guía: https://redcreativa.pro/blog/${id}\n`
  writeFile(pinPath, pinDoc)
  writeFile(socialPath, socialDoc)
  console.log('Creado:', pagePath)
  console.log('Pines:', pinPath)
  console.log('Hilo:', socialPath)
}

main()
