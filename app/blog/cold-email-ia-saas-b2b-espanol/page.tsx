import ArticleWrapper from "@/app/components/ArticleWrapper";
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle, Briefcase, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Plantillas de cold email con IA para SaaS B2B en español | Red Creativa Pro',
  description: '💡 Mejora modelos ✓ prompts de cold email b2b en español con ia. mejora apertura e interés ✓ consigue reuniones. ✨ ¡Paso a paso!',
  keywords: 'cold email IA español, SaaS B2B email plantillas, outreach IA español, consecución de reuniones B2B',
  openGraph: {
    title: 'Plantillas de cold email con IA para SaaS B2B en español | Red Creativa Pro',
    description: 'Plantillas de cold email en español con IA para SaaS B2B: apertura, interés y reunión.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['cold email','SaaS','B2B','IA','ventas'],
    images: [{
      url: 'https://redcreativa.pro/blog/cold-email-ia-saas-b2b-espanol/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Plantillas de cold email con IA para SaaS B2B'
    }]
  },
  twitter: { card: 'summary_large_image', title: 'Cold email IA (SaaS B2B) en español', images: ['https://redcreativa.pro/blog/cold-email-ia-saas-b2b-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/cold-email-ia-saas-b2b-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'Plantillas de cold email con IA para SaaS B2B en español',
  description: 'Modelos de cold email en español con IA para SaaS B2B: apertura, interés y reunión.',
  keywords: 'cold email IA español, SaaS B2B email plantillas, outreach IA español, consecución de reuniones B2B',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/cold-email-ia-saas-b2b-espanol' },
  inLanguage: 'es-ES'
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué longitud ideal debe tener un cold email?', acceptedAnswer: { '@type': 'Answer', text: 'Entre 80–120 palabras con CTA claro y un solo objetivo.' } },
    { '@type': 'Question', name: '¿Cómo aumentar la tasa de respuesta?', acceptedAnswer: { '@type': 'Answer', text: 'Personaliza por industria y rol, aporta valor específico y evita genéricos.' } }
  ]
}

export default function ColdEmailSaaSB2BPage() {
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
          <span className="text-foreground font-medium">Cold email SaaS B2B</span>
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">Plantillas de cold email con IA para SaaS B2B (español)</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Modelos de apertura, interés y reunión. Personaliza por industria y rol decisor con IA.</p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <div className="flex items-start">
              <Mail className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Estructura efectiva</h3>
                <ul className="text-blue-800 list-disc list-inside">
                  <li>Línea de asunto específica</li>
                  <li>Valor claro con métrica relevante</li>
                  <li>CTA a próxima acción (15 min)</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6">Plantillas</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Apertura</h3>
              <p>Asunto: Reduce tu time‑to‑value en [industria] (caso real)</p>
              <p>Cuerpo: Valor, métrica, prueba social y CTA a 15 min.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Interés</h3>
              <p>Resumen del problema, solución y resultado esperable con ejemplo del sector.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6">Prompts</h2>
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Genera 5 asuntos específicos por industria y rol (español, 45–60 caracteres).</li>
              <li>Escribe 3 variaciones de cold email de 100 palabras con métrica y CTA.</li>
              <li>Redacta un follow‑up cordial con resumen de valor y caso de éxito.
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <div className="flex items-start">
              <Briefcase className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">Recursos</h3>
                <p>Usa <Link href="/escritor-ia" className="text-blue-700 hover:text-blue-900">Escritor IA</Link> y <Link href="/prompts" className="text-blue-700 hover:text-blue-900">Prompts</Link> para iterar rápido.</p>
                <Link href="/escritor-ia" className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors mt-4">
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
                  <li>• <a href="/blog/plantillas-postcompra-belleza-ia-espanol" className="text-blue-600 hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/plantillas-correos-ia-ecommerce-espanol" className="text-blue-600 hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/plantilla-prompts-mejorar-correos-ventas-b2b" className="text-blue-600 hover:underline">Plantilla de prompts para mejorar correos de ventas B2B</a></li>
                  <li>• <a href="/blog/onboarding-email-ia-saas-seguridad-espanol" className="text-blue-600 hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/reposicion-cabello-ia-espanol" className="text-blue-600 hover:underline">ia para email</a></li>
                </ul>
              </div>
          </div>
        </section>
      
        </article>
      </ArticleWrapper>
    </>
  )
}

