import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Target, Settings, CheckCircle, BarChart3, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cómo mejorar textos de ventas con IA: guía paso a paso | Red Creativa Pro',
  description: '💡 Aprende a mejorar copy de ventas con IA: estructura ★ tono ✓ pruebas A/B con herramientas en español ✓ flujos replicables. ✨ ¡Paso a paso!',
  keywords: 'mejorar textos ventas IA, optimizar copy ventas español, pruebas A/B copy IA, estructura copy persuasivo, tono de marca IA',
  openGraph: {
    title: 'Cómo mejorar textos de ventas con IA: guía paso a paso | Red Creativa Pro',
    description: 'Metodología práctica para pulir copy de ventas con IA usando herramientas en español.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['copy de ventas','IA','optimización','A/B testing','español'],
    images: [{
      url: 'https://redcreativa.pro/blog/mejorar-textos-ventas-ia-paso-a-paso/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Cómo mejorar textos de ventas con IA: guía paso a paso'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cómo mejorar textos de ventas con IA',
    description: 'Guía paso a paso para optimizar copy de ventas con IA en español.',
    images: ['https://redcreativa.pro/blog/mejorar-textos-ventas-ia-paso-a-paso/og-image.jpg']
  },
  alternates: { canonical: 'https://redcreativa.pro/blog/mejorar-textos-ventas-ia-paso-a-paso' },
  robots: { index: true, follow: true }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting','HowTo'],
  headline: 'Cómo mejorar textos de ventas con IA: guía paso a paso',
  description: 'Metodología para optimizar copy de ventas con IA: estructura, tono y pruebas A/B.',
  keywords: 'mejorar textos ventas IA, optimizar copy ventas español, pruebas A/B copy IA, estructura copy persuasivo, tono de marca IA',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/mejorar-textos-ventas-ia-paso-a-paso' },
  inLanguage: 'es-ES'
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué cambiar primero en un copy de ventas?',
      acceptedAnswer: { '@type': 'Answer', text: 'Headline claro y específico, bullets con resultados y un CTA accionable.' }
    },
    {
      '@type': 'Question',
      name: '¿Cómo medir mejoras con IA?',
      acceptedAnswer: { '@type': 'Answer', text: 'Compara CTR y conversión entre variantes; mantén la mejor y sigue iterando.' }
    }
  ]
}

export default function MejorarTextosVentasIAPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Mejorar textos de ventas con IA</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Creatividad</span>
            <span>•</span>
            <span>12 min de lectura</span>
            <span>•</span>
            <span>1 de diciembre de 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">Cómo mejorar textos de ventas con IA: guía paso a paso</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Optimiza headlines, argumentos y CTAs con IA. Estructura, tono y pruebas A/B para aumentar conversiones.</p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
            <div className="flex items-start">
              <Target className="h-6 w-6 text-red-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-900 mb-2">Objetivo</h3>
                <p className="text-red-800">Mejorar claridad, relevancia y persuasión del copy de ventas con procesos repetibles.</p>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6">Paso a paso</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Diagnóstico</h3>
              <p>Identifica fricción: headline poco claro, beneficios vagos, CTA débil.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Re‑escritura con IA</h3>
              <p>Solicita 3 variaciones por sección en español y elige la mejor combinación.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Pruebas A/B simples</h3>
              <p>Itera headlines y CTAs; mide clic y conversión.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Tono y confianza</h3>
              <p>Alinea voz de marca y añade prueba social con métricas y logos.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6">Prompts útiles</h2>
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Escribe 5 headlines claros y orientados a resultado para [producto] en español.</li>
              <li>Genera 7 bullets de beneficios específicos con métricas y lenguaje concreto.</li>
              <li>Propón 3 CTAs accionables con verbo + beneficio inmediato.</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
            <h3 className="text-lg font-medium text-green-900 mb-2">Métricas</h3>
            <p>Tiempo en página, clic en CTA, tasa de conversión, porcentaje de scroll.</p>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6">Integraciones</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <p>
              Usa <Link href="/escritor-ia" className="text-blue-700 hover:text-blue-900">Escritor IA</Link>,
              {' '}<Link href="/corrector-textos-ia" className="text-blue-700 hover:text-blue-900">Corrector de textos IA</Link>
              {' '}y <Link href="/herramientas-ia-copywriting" className="text-blue-700 hover:text-blue-900">Herramientas IA Copywriting</Link>.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <div className="flex items-start">
              <Settings className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">¿Listo para optimizar?</h3>
                <p className="text-yellow-800 mb-4">Re‑escribe tu página de ventas y mide mejoras esta semana.</p>
                <Link href="/escritor-ia" className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                  Empezar ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center"><BarChart3 className="w-6 h-6 text-purple-600 mr-2" />Caso rápido</h3>
            <p>Un headline claro + bullets concretos + CTA fuerte aumentó conversión 34% en una semana.</p>
          </div>
        </div>
        <section className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Artículos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">

              <div>
                <h3 className="font-semibold mb-2">📚 Artículos Relacionados</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <a href="/blog/caso-estudio-ecommerce-aumento-ventas-400-ia" className="text-blue-600 hover:underline">Caso de Estudio</a></li>
                  <li>• <a href="/blog/herramientas-ia-resumen-textos-legales-espanol" className="text-blue-600 hover:underline">ia para contenido</a></li>
                  <li>• <a href="/blog/copywriting-con-inteligencia-artificial" className="text-blue-600 hover:underline">Copywriting con inteligencia artificial</a></li>
                  <li>• <a href="/blog/ia-para-marketing-de-contenidos" className="text-blue-600 hover:underline">Ia para marketing de contenidos | Guía Completa 2025</a></li>
                  <li>• <a href="/blog/plantilla-prompts-mejorar-correos-ventas-b2b" className="text-blue-600 hover:underline">Plantilla de prompts para mejorar correos de ventas B2B</a></li>
                </ul>
              </div>
          </div>
        </section>
      </article>
    </>
  )
}
