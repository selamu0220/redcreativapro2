import ArticleWrapper from "@/app/components/ArticleWrapper";
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, NotebookPen, CheckCircle, Briefcase, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: '50 prompts de IA para copywriters freelance B2B en español | Red Creativa Pro',
  description: '💡 Mejora colección curada de 50 prompts de ia para propuestas ★ emails ✓ landing b2b en español. copia ✓ usa con workflows listos. ✨ ¡Paso a paso!',
  keywords: 'prompts IA copywriters B2B español, prompts propuestas B2B, prompts emails seguimiento B2B, prompts landing B2B español, prompts venta consultiva IA',
  openGraph: {
    title: '50 prompts de IA para copywriters freelance B2B en español | Red Creativa Pro',
    description: 'Prompts listos para propuestas, emails y landing B2B en español con IA. Mejora velocidad y calidad del copy.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['prompts','copywriters','B2B','IA','español'],
    images: [{
      url: 'https://redcreativa.pro/blog/prompts-copywriters-freelance-b2b-espanol/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Prompts de IA para copywriters freelance B2B en español'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '50 prompts de IA para copywriters freelance B2B en español',
    description: 'Colección curada de prompts para propuestas, emails y landing B2B en español. Copia y usa.',
    images: ['https://redcreativa.pro/blog/prompts-copywriters-freelance-b2b-espanol/og-image.jpg']
  },
  alternates: { canonical: 'https://redcreativa.pro/blog/prompts-copywriters-freelance-b2b-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: '50 prompts de IA para copywriters freelance B2B en español',
  description: 'Colección curada de prompts y workflows para copy B2B en español.',
  keywords: 'prompts IA copywriters B2B español, prompts propuestas B2B, prompts emails seguimiento B2B, prompts landing B2B español, prompts venta consultiva IA',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/prompts-copywriters-freelance-b2b-espanol' },
  inLanguage: 'es-ES'
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo adaptar prompts a una industria específica?',
      acceptedAnswer: { '@type': 'Answer', text: 'Incluye sector, audiencia, objetivo y tono; añade métricas y casos del sector.' }
    },
    {
      '@type': 'Question',
      name: '¿Qué prompts sirven para follow‑up B2B?',
      acceptedAnswer: { '@type': 'Answer', text: 'Asuntos de alta apertura, resumen de valor, CTA claro a próxima acción y caso de éxito breve.' }
    }
  ]
}

export default function PromptsCopywritersB2BPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <ArticleWrapper>
        <article className="max-w-4xl mx-auto px-4 py-8">
          
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Prompts para copywriters B2B</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Creatividad</span>
            <span>•</span>
            <span>11 min de lectura</span>
            <span>•</span>
            <span>1 de diciembre de 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">50 prompts de IA para copywriters freelance B2B (español)</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Prompts listos para propuestas, emails de seguimiento y landing pages B2B. Copia, ajusta el contexto y publica más rápido con mejor calidad.</p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-8">
            <div className="flex items-start">
              <NotebookPen className="h-6 w-6 text-purple-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-purple-900 mb-2">Cómo usar los prompts</h3>
                <p className="text-purple-800">Añade industria, audiencia, objetivo y tono. Pide 3 variaciones y selecciona la mejor.</p>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6">Propuestas y descubrimiento</h2>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Escribe una propuesta de copy B2B para [industria] enfocada en ROI, en tono consultivo.</li>
            <li>Genera 5 preguntas de discovery para entender el problema del cliente B2B.</li>
            <li>Redacta una justificación de inversión en copy orientado a conversión.</li>
          </ul>

          <h2 className="text-3xl font-bold text-foreground mb-6">Emails y seguimiento</h2>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Escribe un email de seguimiento cordial para reunión B2B con CTA claro.</li>
            <li>Genera asuntos de alta apertura para propuesta enviada, 45–60 caracteres.</li>
            <li>Redacta un email de recordatorio con resumen de valor y caso de éxito.</li>
          </ul>

          <h2 className="text-3xl font-bold text-foreground mb-6">Landing y páginas de servicio</h2>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Crea una estructura de landing B2B con hero, beneficios, prueba social y CTA.</li>
            <li>Escribe 5 bullets de valor para página de servicio orientada a leads cualificados.</li>
            <li>Redacta una sección de casos con métricas reales y breve narrativa.</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Recursos</h3>
            <p>
              Usa <Link href="/prompts" className="text-blue-700 hover:text-blue-900">Prompts</Link>,
              {' '}<Link href="/escritor-ia" className="text-blue-700 hover:text-blue-900">Escritor IA</Link>
              {' '}y <Link href="/corrector-textos-ia" className="text-blue-700 hover:text-blue-900">Corrector de textos IA</Link>.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <div className="flex items-start">
              <Briefcase className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">¿Listo para vender B2B?</h3>
                <p className="text-yellow-800 mb-4">Aplica estos prompts y acelera entregables con calidad profesional.</p>
                <Link href="/escritor-ia" className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                  Empezar ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <section className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Artículos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">

              <div>
                <h3 className="font-semibold mb-2">📚 Artículos Relacionados</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <a href="/blog/plantilla-prompts-mejorar-correos-ventas-b2b" className="text-blue-600 hover:underline">Plantilla de prompts para mejorar correos de ventas B2B</a></li>
                  <li>• <a href="/blog/prompts-ia-tesis-espanol" className="text-blue-600 hover:underline">Prompts de IA para tesis en español</a></li>
                  <li>• <a href="/blog/cold-email-ia-saas-b2b-espanol" className="text-blue-600 hover:underline">Plantillas de cold email con IA para SaaS B2B en español</a></li>
                  <li>• <a href="/blog/plantillas-postcompra-belleza-ia-espanol" className="text-blue-600 hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/caso-estudio-ecommerce-aumento-ventas-400-ia" className="text-blue-600 hover:underline">Caso de Estudio</a></li>
                </ul>
              </div>
          </div>
        </section>
      
        </article>
      </ArticleWrapper>
    </>
  )
}
