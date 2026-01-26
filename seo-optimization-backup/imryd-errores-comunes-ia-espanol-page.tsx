import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'IMRyD con IA: errores comunes y cómo evitarlos (español) | Red Creativa Pro',
  description: 'Evita errores comunes al redactar IMRyD con IA en español. Guía práctica y prompts de corrección.',
  keywords: 'IMRyD errores comunes IA español, problemas estructura paper IA, corrección IMRyD IA español',
  openGraph: {
    title: 'IMRyD con IA: errores comunes y cómo evitarlos (español) | Red Creativa Pro',
    description: 'Errores frecuentes al redactar IMRyD con IA y soluciones prácticas en español.',
    type: 'article',
    publishedTime: '2025-12-02',
    authors: ['Selamu'],
    tags: ['IMRyD','errores','IA','universidad','papers'],
    images: [{ url: 'https://redcreativa.pro/blog/imryd-errores-comunes-ia-espanol/og-image.jpg', width: 1200, height: 630, alt: 'IMRyD errores comunes con IA' }]
  },
  twitter: { card: 'summary_large_image', title: 'IMRyD errores (español)', images: ['https://redcreativa.pro/blog/imryd-errores-comunes-ia-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/imryd-errores-comunes-ia-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'IMRyD con IA: errores comunes y cómo evitarlos (español)',
  description: 'Evita errores comunes al redactar IMRyD con IA en español. Guía práctica y prompts de corrección.',
  keywords: 'IMRyD errores comunes IA español, problemas estructura paper IA, corrección IMRyD IA español',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-02',
  dateModified: '2025-12-02',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/imryd-errores-comunes-ia-espanol' },
  inLanguage: 'es-ES'
}

export default function IMRyDErroresPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">IMRyD: errores comunes con IA</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="px-2 py-1 rounded-full text-xs font-medium">IA en Educación</span>
            <span>•</span>
            <span>10 min de lectura</span>
            <span>•</span>
            <span>2 de diciembre de 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">IMRyD con IA: errores comunes y cómo evitarlos</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Identifica problemas típicos en Introducción, Métodos, Resultados y Discusión y corrígelos con IA en español.</p>
        </header>
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="border-l-4 p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6" />
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-2">Errores típicos</h3>
                <ul className="list-disc list-inside">
                  <li>Introducción sin objetivos claros</li>
                  <li>Métodos incompletos (muestra/instrumentos)</li>
                  <li>Resultados confusos sin soporte</li>
                  <li>Discusión sin limitaciones ni futuro</li>
                </ul>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-6">Prompts de corrección</h2>
          <div className="border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Clarifica objetivos de Introducción en 2–3 frases medibles.</li>
              <li>Completa Métodos con diseño, muestra e instrumentos.</li>
              <li>Resume Resultados con claridad y soporte visual.</li>
              <li>Elabora Discusión con limitaciones y líneas futuras.</li>
            </ul>
          </div>
          <div className="border-l-4 p-6 mb-8">
            <h3 className="text-lg font-medium mb-2">Recursos</h3>
            <p>Usa <Link href="/escritor-ia">Escritor IA</Link> y <Link href="/corrector-textos-ia">Corrector de textos IA</Link>.</p>
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

