import ArticleWrapper from "@/app/components/ArticleWrapper";
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ListOrdered, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Estructura IMRyD con IA para papers universitarios (español) | Red Creativa Pro',
  description: '💡 Descubre redacta introducción ★ métodos ★ resultados ✓ discusión con ia en español siguiendo imryd. ✨ ¡Paso a paso!',
  keywords: 'IMRyD IA español, estructura paper universitario IA, redactar métodos IA español',
  openGraph: {
    title: 'Estructura IMRyD con IA para papers universitarios (español) | Red Creativa Pro',
    description: 'Cómo redactar Introducción, Métodos, Resultados y Discusión con IA en español siguiendo IMRyD.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['IMRyD','papers','IA','universidad','metodología'],
    images: [{ url: 'https://redcreativa.pro/blog/estructura-imryd-ia-papers-espanol/og-image.jpg', width: 1200, height: 630, alt: 'Estructura IMRyD con IA' }]
  },
  twitter: { card: 'summary_large_image', title: 'IMRyD con IA (español)', images: ['https://redcreativa.pro/blog/estructura-imryd-ia-papers-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/estructura-imryd-ia-papers-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'Estructura IMRyD con IA para papers universitarios (español)',
  description: 'Cómo redactar Introducción, Métodos, Resultados y Discusión con IA en español siguiendo IMRyD.',
  keywords: 'IMRyD IA español, estructura paper universitario IA, redactar métodos IA español',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/estructura-imryd-ia-papers-espanol' },
  inLanguage: 'es-ES'
}

export default function EstructuraIMRyDPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <ArticleWrapper>
        <article className="max-w-4xl mx-auto px-4 py-8">
          
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">IMRyD con IA</span>
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">Estructura IMRyD con IA para papers universitarios</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Redacta Introducción, Métodos, Resultados y Discusión con IA en español, manteniendo rigor y claridad.</p>
        </header>
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="border-l-4 p-6 mb-8">
            <div className="flex items-start">
              <ListOrdered className="h-6 w-6" />
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-2">Secciones IMRyD</h3>
                <ul className="list-disc list-inside">
                  <li>Introducción: contexto y objetivos</li>
                  <li>Métodos: diseño, muestra, instrumentos y análisis</li>
                  <li>Resultados: hallazgos y tablas/figuras</li>
                  <li>Discusión: interpretación, limitaciones y futuro</li>
                </ul>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-6">Prompts</h2>
          <div className="border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Redacta una Introducción con contexto y objetivos claros.</li>
              <li>Escribe Métodos con diseño, muestra, instrumentos y análisis.</li>
              <li>Resume Resultados con claridad y soporte visual.</li>
              <li>Elabora Discusión con interpretación, limitaciones y líneas futuras.</li>
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
        <section className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Artículos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">

              <div>
                <h3 className="font-semibold mb-2">📚 Artículos Relacionados</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <a href="/blog/automatizar-resumenes-reuniones-ia-notion" className="text-blue-600 hover:underline">ia para escritura</a></li>
                  <li>• <a href="/blog/desarrollo-apis-creativas-ia" className="text-blue-600 hover:underline">Desarrollo de APIs para proyectos creativos con IA</a></li>
                  <li>• <a href="/blog/herramientas-ia-resumen-textos-legales-espanol" className="text-blue-600 hover:underline">ia para contenido</a></li>
                  <li>• <a href="/blog/imryd-errores-comunes-ia-espanol" className="text-blue-600 hover:underline">IMRyD con IA</a></li>
                  <li>• <a href="/blog/nurturing-email-ia-saas-seguridad-espanol" className="text-blue-600 hover:underline">ia para escritura</a></li>
                </ul>
              </div>
          </div>
        </section>
      
        </article>
      </ArticleWrapper>
    </>
  )
}

