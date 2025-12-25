import ArticleWrapper from "@/app/components/ArticleWrapper";
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, HeartHandshake, CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Plantillas de email post‑compra para belleza/cosmética con IA (español) | Red Creativa Pro',
  description: '💡 Domina emails de agradecimiento ★ uso ✓ reseñas para belleza/cosmética con ia en español. plantillas ✓ prompts. ✨ ¡Paso a paso!',
  keywords: 'post compra belleza español, reseñas cosmética IA, email agradecimiento español IA, postpurchase beauty IA',
  openGraph: {
    title: 'Plantillas de email post‑compra para belleza/cosmética con IA (español) | Red Creativa Pro',
    description: 'Mensajes de agradecimiento, uso y reseñas para belleza/cosmética generados con IA en español.',
    type: 'article',
    publishedTime: '2025-12-01',
    authors: ['Selamu'],
    tags: ['post‑compra','belleza','reseñas','IA','ecommerce'],
    images: [{
      url: 'https://redcreativa.pro/blog/plantillas-postcompra-belleza-ia-espanol/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Plantillas post‑compra belleza IA'
    }]
  },
  twitter: { card: 'summary_large_image', title: 'Post‑compra belleza con IA (español)', images: ['https://redcreativa.pro/blog/plantillas-postcompra-belleza-ia-espanol/og-image.jpg'] },
  alternates: { canonical: 'https://redcreativa.pro/blog/plantillas-postcompra-belleza-ia-espanol' },
  robots: { index: true, follow: true }
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article','BlogPosting'],
  headline: 'Plantillas de email post‑compra para belleza/cosmética con IA (español)',
  description: 'Emails de agradecimiento, uso y reseñas para belleza/cosmética con IA en español.',
  keywords: 'post compra belleza español, reseñas cosmética IA, email agradecimiento español IA, postpurchase beauty IA',
  author: { '@type': 'Person', name: 'Selamu' },
  publisher: { '@type': 'Organization', name: 'Red Creativa Pro' },
  datePublished: '2025-12-01',
  dateModified: '2025-12-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://redcreativa.pro/blog/plantillas-postcompra-belleza-ia-espanol' },
  inLanguage: 'es-ES'
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué emails post‑compra son clave?', acceptedAnswer: { '@type': 'Answer', text: 'Agradecimiento, instrucciones de uso, reseñas y programa de fidelización.' } },
    { '@type': 'Question', name: '¿Cómo pedir reseñas?', acceptedAnswer: { '@type': 'Answer', text: 'Agradece, facilita el enlace, ofrece beneficio y muestra ejemplos reales.' } }
  ]
}

export default function PostCompraBellezaPage() {
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
          <span className="text-foreground font-medium">Post‑compra belleza con IA</span>
        </nav>
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-4">
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
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">Plantillas de email post‑compra belleza/cosmética con IA</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">Agradecimiento, instrucciones de uso y reseñas con IA en español. Mejora fidelización y prueba social.</p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="border-l-4 p-6 mb-8">
            <div className="flex items-start">
              <HeartHandshake className="h-6 w-6" />
              <div className="ml-3">
                <h3 className="text-lg font-medium mb-2">Flujo recomendado</h3>
                <ul className="list-disc list-inside">
                  <li>Agradecimiento + resumen</li>
                  <li>Uso/Consejos + enlaces útiles</li>
                  <li>Solicitud de reseña + beneficio</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-black mb-6">Plantillas</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-black mb-3">Agradecimiento</h3>
              <p>Gracias por tu compra. Consejos iniciales y próximos pasos.</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-black mb-3">Reseñas</h3>
              <p>Solicita reseña con enlace, ejemplos y beneficio.</p>
            </div>
          </div>

          <h2 className="text-3xl font-black mb-6">Prompts</h2>
          <div className="border rounded-lg p-6 mb-8">
            <ul className="list-disc list-inside space-y-2">
              <li>Escribe un email de agradecimiento post‑compra para cosmética, tono cercano, español.</li>
              <li>Redacta solicitud de reseña con beneficio y prueba social.</li>
              <li>Genera instrucciones de uso con recomendaciones personalizadas.</li>
            </ul>
          </div>

          <div className="border-l-4 p-6 mb-8">
            <h3 className="text-lg font-medium mb-2">Recursos</h3>
            <p>
              Usa <Link href="/correos-ia">Correos IA</Link>, <Link href="/herramientas-ia-copywriting">Herramientas IA Copywriting</Link> y <Link href="/prompts">Prompts</Link>.
            </p>
          </div>

          <div className="border-l-4 p-6 mb-8">
            <h3 className="text-lg font-medium mb-2">¿Listo para fidelizar?</h3>
            <p>Implementa la secuencia post‑compra y mide reseñas y repetición de compra.</p>
            <Link href="/correos-ia" className="inline-flex items-center px-4 py-2 rounded-lg mt-4">
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
                <ul className="text-sm text-foreground space-y-1">
                  <li>• <a href="/blog/cold-email-ia-saas-b2b-espanol" className="text-primary hover:underline">Plantillas de cold email con IA para SaaS B2B en español</a></li>
                  <li>• <a href="/blog/plantillas-correos-ia-ecommerce-espanol" className="text-primary hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/plantilla-prompts-mejorar-correos-ventas-b2b" className="text-primary hover:underline">Plantilla de prompts para mejorar correos de ventas B2B</a></li>
                  <li>• <a href="/blog/onboarding-email-ia-saas-seguridad-espanol" className="text-primary hover:underline">ia para email</a></li>
                  <li>• <a href="/blog/reposicion-cabello-ia-espanol" className="text-primary hover:underline">ia para email</a></li>
                </ul>
              </div>
          </div>
        </section>
      
        </div>
</article>
      </ArticleWrapper>
    </>
  )
}

