import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Emails de reposición para cuidado del cabello con IA (español) | Red Creativa Pro',
  description: 'Timing y asuntos de reposición para productos capilares con IA en español. Ejemplos y prompts.',
  keywords: 'reposición cabello español IA, emails reposición haircare, asuntos reposición shampoo IA',
  openGraph: {
    title: 'Emails de reposición para cuidado del cabello con IA (español) | Red Creativa Pro',
    description: 'Secuencias y asuntos de reposición para shampoo/mascarilla/aceite con IA en español.',
    type: 'article',
    publishedTime: '2025-12-02',
    authors: ['Selamu'],
    tags: ['reposición','cabello','belleza','IA','email'],
    images: [{ url: 'https://redcreativa.pro/blog/reposicion-cabello-ia-espanol/og-image.jpg', width: 1200, height: 630, alt: 'Reposición cabello IA' }]
  },
  twitter: { card: 'summary_large_image', title: 'Reposición cabello con IA (español)', images: ['https://redcreativa.pro/blog/reposicion-cabello-ia-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/reposicion-cabello-ia-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'Emails de reposición para cuidado del cabello con IA (español)',
  description: 'Secuencias y asuntos de reposición para shampoo/mascarilla/aceite con IA en español.',
  keywords: 'reposición cabello español IA, emails reposición haircare, asuntos reposición shampoo IA',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-02',
  dateModified: '2025-12-02',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/reposicion-cabello-ia-espanol' },
  inLanguage: 'es-ES'
}

export default function ReposicionCabelloPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Reposición cabello con IA</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="px-2 py-1 rounded-full text-xs font-medium">Creatividad</span>
            <span>•</span>
            <span>10 min de lectura</span>
            <span>•</span>
            <span>2 de diciembre de 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">Emails de reposición para cuidado del cabello con IA</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Diseña secuencias para shampoo, mascarilla y aceite con timing y asuntos claros en español.</p>
        </header>
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="border-l-4 p-6 mb-8">
            <div className="flex items-start">
              <RefreshCcw className="h-6 w-6" />
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-2">Secuencia</h3>
                <ul className="list-disc list-inside">
                  <li>Recordatorio previo</li>
                  <li>Reposición en fecha</li>
                  <li>Última llamada con beneficio</li>
                </ul>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-6">Prompts</h2>
          <div className="border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Genera 10 asuntos de reposición capilar en español (45–60 caracteres).</li>
              <li>Escribe 3 copy con beneficio claro y CTA.</li>
              <li>Propón timing por producto y frecuencia de uso.</li>
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
        </div>
      </article>
    </>
  )
}

