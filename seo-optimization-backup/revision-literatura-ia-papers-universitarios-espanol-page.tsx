import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, BookOpenCheck, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Revisión de literatura con IA para papers universitarios (español) | Red Creativa Pro',
  description: 'Organiza y sintetiza la revisión de literatura con IA en español para artículos universitarios.',
  keywords: 'revisión literatura IA español, papers universitarios IA, síntesis bibliográfica IA',
  openGraph: {
    title: 'Revisión de literatura con IA para papers universitarios (español) | Red Creativa Pro',
    description: 'Cómo organizar y sintetizar la revisión de literatura con IA para artículos universitarios en español.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['revisión literatura','papers','IA','universidad','metodología'],
    images: [{
      url: 'https://redcreativa.pro/blog/revision-literatura-ia-papers-universitarios-espanol/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Revisión de literatura con IA (universitario)'
    }]
  },
  twitter: { card: 'summary_large_image', title: 'Revisión de literatura IA (universitario)', images: ['https://redcreativa.pro/blog/revision-literatura-ia-papers-universitarios-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/revision-literatura-ia-papers-universitarios-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'Revisión de literatura con IA para papers universitarios (español)',
  description: 'Organiza y sintetiza la revisión de literatura con IA en español para artículos universitarios.',
  keywords: 'revisión literatura IA español, papers universitarios IA, síntesis bibliográfica IA',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/revision-literatura-ia-papers-universitarios-espanol' },
  inLanguage: 'es-ES'
}

export default function RevisionLiteraturaUniversitarioPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Revisión de literatura con IA</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="px-2 py-1 rounded-full text-xs font-medium">IA en Educación</span>
            <span>•</span>
            <span>12 min de lectura</span>
            <span>•</span>
            <span>1 de diciembre de 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">Revisión de literatura con IA para papers universitarios</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Organiza por temas y años, sintetiza hallazgos y vacíos con IA en español.</p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="border-l-4 p-6 mb-8">
            <div className="flex items-start">
              <BookOpenCheck className="h-6 w-6" />
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-2">Proceso</h3>
                <ul className="list-disc list-inside">
                  <li>Búsqueda y selección</li>
                  <li>Agrupación temática y cronológica</li>
                  <li>Síntesis y vacíos</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6">Prompts</h2>
          <div className="border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Organiza esta bibliografía por temas y años con síntesis por bloque.</li>
              <li>Resume hallazgos clave y señaliza vacíos de investigación por tema.</li>
              <li>Propón líneas futuras de investigación basadas en vacíos detectados.</li>
            </ul>
          </div>

          <div className="border-l-4 p-6 mb-8">
            <h3 className="text-lg font-medium mb-2">Recursos</h3>
            <p>Usa <Link href="/escritor-ia">Escritor IA</Link> y <Link href="/corrector-textos-ia">Corrector de textos IA</Link> para edición fina.</p>
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

