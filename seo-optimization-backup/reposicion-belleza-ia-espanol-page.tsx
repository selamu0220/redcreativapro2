import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Emails de reposición para belleza/cosmética con IA (español) | Red Creativa Pro',
  description: 'Diseña secuencias de reposición para belleza con IA en español. Timing, asuntos y copy listos.',
  keywords: 'reposición belleza español IA, emails reposición cosmética, timing reposición IA, asuntos reposición belleza',
  openGraph: {
    title: 'Emails de reposición para belleza/cosmética con IA (español) | Red Creativa Pro',
    description: 'Secuencias de reposición para productos de belleza con IA en español: timing, asunto y copy.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['reposición','belleza','email marketing','IA','ecommerce'],
    images: [{ url: 'https://redcreativa.pro/blog/reposicion-belleza-ia-espanol/og-image.jpg', width: 1200, height: 630, alt: 'Reposición belleza IA' }]
  },
  twitter: { card: 'summary_large_image', title: 'Reposición belleza con IA (español)', images: ['https://redcreativa.pro/blog/reposicion-belleza-ia-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/reposicion-belleza-ia-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'Emails de reposición para belleza/cosmética con IA (español)',
  description: 'Secuencias de reposición para productos de belleza generadas con IA en español: timing, asunto y copy.',
  keywords: 'reposición belleza español IA, emails reposición cosmética, timing reposición IA, asuntos reposición belleza',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/reposicion-belleza-ia-espanol' },
  inLanguage: 'es-ES'
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuál es el mejor timing de reposición?', acceptedAnswer: { '@type': 'Answer', text: 'Depende del producto. Usualmente 21–45 días; usa datos de consumo real.' } },
    { '@type': 'Question', name: '¿Qué incluir en el asunto?', acceptedAnswer: { '@type': 'Answer', text: 'Beneficio claro, referencia al producto y urgencia suave (p. ej., “tu rutina a tiempo”).' } }
  ]
}

export default function ReposicionBellezaPage() {
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
          <span className="text-foreground font-medium">Reposición belleza con IA</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="px-2 py-1 rounded-full text-xs font-medium">Creatividad</span>
            <span>•</span>
            <span>11 min de lectura</span>
            <span>•</span>
            <span>1 de diciembre de 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">Emails de reposición para belleza/cosmética con IA</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Timing, asuntos y copy listos en español para mantener rutinas y aumentar repetición de compra.</p>
        </header>
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="border-l-4 p-6 mb-8">
            <div className="flex items-start">
              <RefreshCcw className="h-6 w-6" />
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-2">Secuencia</h3>
                <ul className="list-disc list-inside">
                  <li>Recordatorio 7 días antes</li>
                  <li>Reposición en fecha</li>
                  <li>Última llamada con beneficio</li>
                </ul>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-6">Asuntos y copy</h2>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Tu rutina a tiempo — repón hoy</li>
            <li>Se acaba tu [producto] — repuesto en 1 clic</li>
            <li>Repite tu brillo — envío gratis 24h</li>
          </ul>
          <h2 className="text-3xl font-bold mb-6">Prompts</h2>
          <div className="border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Genera 10 asuntos de reposición para cosmética en español (45–60 caracteres).</li>
              <li>Escribe 3 copy de reposición con beneficio claro y CTA.</li>
              <li>Propón timing por producto según consumo típico.</li>
            </ul>
          </div>
          <div className="border-l-4 p-6 mb-8">
            <h3 className="text-lg font-medium mb-2">Recursos</h3>
            <p>Usa <Link href="/correos-ia">Correos IA</Link> y <Link href="/herramientas-ia-copywriting">Herramientas IA Copywriting</Link>.</p>
            <Link href="/correos-ia" className="inline-flex items-center px-4 py-2 rounded-lg mt-4">
              Empezar ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <div className="border-l-4 p-6 mb-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6" />
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-2">Métricas</h3>
                <p>Apertura, CTR, ingresos por email y repetición de compra.</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}

