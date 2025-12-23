import ArticleWrapper from "@/app/components/ArticleWrapper";
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Inbox, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Plantillas de correos con IA para ecommerce en español [Gratis] | Red Creativa Pro',
  description: '💡 Descubre descarga ✓ personaliza plantillas de emails para ecommerce con ia en español. mejora aperturas ✓ ventas con ejemplos listos ✓ flujos paso a paso.',
  keywords: 'plantillas correos ecommerce español, emails IA tienda online, asuntos email marketing IA, flujos emails ecommerce, plantillas emails español IA',
  openGraph: {
    title: 'Plantillas de correos con IA para ecommerce en español [Gratis] | Red Creativa Pro',
    description: 'Colección de plantillas de emails para ecommerce generadas y personalizadas con IA en español. Mejora aperturas y ventas con ejemplos listos.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['plantillas correos','ecommerce','IA','email marketing','español'],
    images: [{
      url: 'https://redcreativa.pro/blog/plantillas-correos-ia-ecommerce-espanol/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Plantillas de correos con IA para ecommerce en español'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plantillas de correos con IA para ecommerce en español [Gratis]',
    description: 'Descarga y personaliza plantillas de emails para ecommerce con IA en español. Mejora aperturas y ventas con ejemplos listos.',
    images: ['https://redcreativa.pro/blog/plantillas-correos-ia-ecommerce-espanol/og-image.jpg']
  },
  alternates: {
    canonical: 'https://redcreativa.pro/blog/plantillas-correos-ia-ecommerce-espanol'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'Plantillas de correos con IA para ecommerce en español [Gratis]',
  description: 'Colección de plantillas y flujos de emails para ecommerce en español, generadas con IA y listas para personalizar.',
  keywords: 'plantillas correos ecommerce español, emails IA tienda online, asuntos email marketing IA, flujos emails ecommerce, plantillas emails español IA',
  author: {
    '@type': 'Person',
    name: 'Selamu',
    url: 'https://redcreativa.pro/autor/selamu'
  },
  publisher: {
    '@type': 'Organization',
    name: 'Red Creativa Pro',
    url: 'https://redcreativa.pro'
  },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://redcreativa.pro/blog/plantillas-correos-ia-ecommerce-espanol'
  },
  image: {
    '@type': 'ImageObject',
    url: 'https://redcreativa.pro/blog/plantillas-correos-ia-ecommerce-espanol/og-image.jpg',
    width: 1200,
    height: 630
  },
  inLanguage: 'es-ES'
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipo de correos debe enviar un ecommerce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bienvenida, carrito abandonado, confirmación de pedido, post-compra, recomendación y recuperación de clientes inactivos.'
      }
    },
    {
      '@type': 'Question',
      name: '¿Cómo personalizo las plantillas con IA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Usa datos de producto y cliente, define tono de marca y pide variaciones con objetivos concretos (apertura, clic, conversión).'
      }
    },
    {
      '@type': 'Question',
      name: '¿Qué métricas debo medir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tasa de apertura, CTR, ingresos por email, recuperación de carrito y LTV de suscriptores.'
      }
    }
  ]
}

export default function PlantillasCorreosEcommercePage() {
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
          <span className="text-foreground font-medium">Plantillas de correos con IA para ecommerce</span>
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">Plantillas de correos con IA para ecommerce en español</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Colección de plantillas prácticas para bienvenida, carrito abandonado, post‑compra y recomendación, generadas con IA y listas para personalizar en español.</p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-900 mb-2">Qué incluye</h3>
                <ul className="text-green-800 list-disc list-inside">
                  <li>Plantillas para 6 correos clave en ecommerce</li>
                  <li>Prompts para personalizar tono y ofertas</li>
                  <li>Flujos y métricas recomendadas</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center"><Inbox className="w-7 h-7 text-blue-500 mr-3" />Plantillas listas</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Bienvenida</h3>
              <p>Asunto: Bienvenido a [Marca] — tu 10% te espera</p>
              <p>Cuerpo: Gracias por unirte. Aquí tienes tu descuento. Recomendaciones iniciales de productos.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Carrito abandonado</h3>
              <p>Asunto: ¿Se te olvidó algo? Reserva tu carrito</p>
              <p>Cuerpo: Recordatorio con imagen del producto, plazo y beneficio adicional.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Confirmación y envío</h3>
              <p>Resumen de pedido, seguimiento y recomendaciones complementarias.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Post‑compra</h3>
              <p>Cómo usar, reseñas y programa de fidelización.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center"><Sparkles className="w-7 h-7 text-purple-500 mr-3" />Prompts para personalizar</h2>
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <p>Copiar y usar:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Genera un asunto de alta apertura para carrito abandonado con urgencia suave, en español, 45–60 caracteres.</li>
              <li>Escribe un email de bienvenida en tono cercano para marca de moda femenina con 10% de descuento, CTA claro.</li>
              <li>Redacta un post‑compra agradeciendo y pidiendo reseña con beneficio para la siguiente compra.</li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center"><ShoppingCart className="w-7 h-7 text-red-500 mr-3" />Flujos recomendados</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Onboarding</h3>
              <p>Bienvenida → Primeras recomendaciones → Oferta temporal → Contenido útil.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Recuperación</h3>
              <p>Carrito 1h → Carrito 24h con incentivo → Último recordatorio.</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Métricas y mejora</h3>
            <p>Monitorea apertura, CTR e ingresos por email. Itera asuntos y CTAs con pruebas A/B simples.</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Recursos</h3>
            <p>
              Usa <Link href="/correos-ia" className="text-blue-700 hover:text-blue-900">Correos IA</Link>,
              <Link href="/herramientas-ia-copywriting" className="text-blue-700 hover:text-blue-900 ml-1">Herramientas IA Copywriting</Link>
              {' '}y <Link href="/prompts" className="text-blue-700 hover:text-blue-900">Prompts</Link> para acelerar.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <div className="flex items-start">
              <div className="ml-0">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">¿Listo para crear?</h3>
                <p className="text-yellow-800 mb-4">Genera y personaliza tus correos con IA en minutos.</p>
                <Link href="/correos-ia" className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
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
                  <li>• <a href="/blog/cold-email-ia-saas-b2b-espanol" className="text-blue-600 hover:underline">Plantillas de cold email con IA para SaaS B2B en español</a></li>
                  <li>• <a href="/blog/plantillas-postcompra-belleza-ia-espanol" className="text-blue-600 hover:underline">ia para email</a></li>
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

