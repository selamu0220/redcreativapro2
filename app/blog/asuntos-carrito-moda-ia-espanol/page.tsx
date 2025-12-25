import ArticleWrapper from "@/app/components/ArticleWrapper";
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Asuntos de email para carrito abandonado (moda femenina) con IA [Español] | Red Creativa Pro',
  description: '💡 Descubre genera asuntos de alta apertura para recuperar carritos en moda femenina con ia en español. incluye ejemplos ✓ prompts listos. ✨ ¡Paso a paso!',
  keywords: 'asuntos email carrito abandonado moda, IA español, ecommerce moda femenina, recuperación carritos IA',
  openGraph: {
    title: 'Asuntos de email para carrito abandonado (moda femenina) con IA [Español] | Red Creativa Pro',
    description: 'Colección de asuntos y ejemplos para emails de carrito abandonado en moda femenina usando IA.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['carrito abandonado','moda','asuntos email','IA','ecommerce'],
    images: [{
      url: 'https://redcreativa.pro/blog/asuntos-carrito-moda-ia-espanol/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Asuntos de email para carrito abandonado moda con IA'
    }]
  },
  twitter: { card: 'summary_large_image', title: 'Asuntos de carrito (moda) con IA', images: ['https://redcreativa.pro/blog/asuntos-carrito-moda-ia-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/asuntos-carrito-moda-ia-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'Asuntos de email para carrito abandonado (moda femenina) con IA [Español]',
  description: 'Genera asuntos de alta apertura para recuperar carritos en moda femenina con IA en español. Ejemplos y prompts listos.',
  keywords: 'asuntos email carrito abandonado moda, IA español, ecommerce moda femenina, recuperación carritos IA',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/asuntos-carrito-moda-ia-espanol' },
  inLanguage: 'es-ES'
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuántos caracteres debe tener un asunto?', acceptedAnswer: { '@type': 'Answer', text: '45–60 caracteres suele maximizar apertura en ecommerce moda.' } },
    { '@type': 'Question', name: '¿Qué recursos incluir?', acceptedAnswer: { '@type': 'Answer', text: 'Urgencia suave, imagen del producto, plazo y beneficio adicional.' } }
  ]
}

export default function AsuntosCarritoModaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <ArticleWrapper>
        <article className="blog-article max-w-4xl mx-auto px-4 py-8">
          
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Carrito moda: asuntos con IA</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">Creatividad</span>
            <span>•</span>
            <span>10 min de lectura</span>
            <span>•</span>
            <span>1 de diciembre de 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">Asuntos de email para carrito abandonado (moda femenina) con IA</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Ejemplos y prompts para aumentar la apertura y recuperar carritos en ecommerce de moda femenina.</p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-pink-50 border-l-4 border-pink-500 p-6 mb-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-pink-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-pink-900 mb-2">Qué funciona en moda</h3>
                <ul className="text-pink-800 list-disc list-inside">
                  <li>Urgencia suave y exclusiva</li>
                  <li>Personalización con producto y talla</li>
                  <li>Beneficio claro (envío gratis, descuento limitado)</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-black text-foreground mb-6 flex items-center"><ShoppingBag className="w-7 h-7 text-pink-500 mr-3" />Ejemplos de asuntos</h2>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Tu outfit te espera (10% hoy) — talla disponible</li>
            <li>Reservamos tu carrito — última oportunidad</li>
            <li>Lo dejaste en tu bolsa — envío gratis 24h</li>
          </ul>

          <h2 className="text-3xl font-black text-foreground mb-6 flex items-center"><Sparkles className="w-7 h-7 text-purple-500 mr-3" />Prompts</h2>
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Genera 10 asuntos para carrito moda femenina con urgencia suave, 45–60 caracteres, en español.</li>
              <li>Propón 5 versiones con beneficio (envío gratis/10% descuento) y mención de talla.</li>
              <li>Escribe 3 asuntos con personalización por producto (vestido, zapatos).</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Recursos</h3>
            <p>
              Usa <Link href="/correos-ia" className="text-blue-700 hover:text-blue-900">Correos IA</Link>
              {' '}y <Link href="/herramientas-ia-copywriting" className="text-blue-700 hover:text-blue-900">Herramientas IA Copywriting</Link> para iterar.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Métricas</h3>
            <p>Compara apertura y recuperación por asunto; mantén la mejor variante.</p>
            <Link href="/correos-ia" className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors mt-4">
              Empezar ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
        <section className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-black mb-4">Artículos Relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">

              <div>
                <h3 className="font-black mb-2">📚 Artículos Relacionados</h3>
                <ul className="text-sm text-foreground/80 space-y-1">
                  <li>• <a href="/blog/onboarding-email-ia-saas-seguridad-espanol" className="text-primary hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/reposicion-cabello-ia-espanol" className="text-primary hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/reposicion-belleza-ia-espanol" className="text-primary hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/cold-email-ia-saas-b2b-espanol" className="text-primary hover:underline">Plantillas de cold email con IA para SaaS B2B en español</a></li>
                  <li>• <a href="/blog/plantillas-postcompra-belleza-ia-espanol" className="text-primary hover:underline">ia para email</a></li>
                </ul>
              </div>
          </div>
        </section>
      
        </article>
      </ArticleWrapper>
    </>
  )
}

