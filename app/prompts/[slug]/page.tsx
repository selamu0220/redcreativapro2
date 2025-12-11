import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleTemplate from '@/app/components/blog/ArticleTemplate'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import Link from 'next/link'
import { getPromptBySlug } from '@/lib/prompts-data'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPromptBySlug(params.slug)
  if (!page) return {}
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.excerpt,
    alternates: { canonical: `https://redcreativa.pro/prompts/${page.slug}` },
    openGraph: {
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? page.excerpt,
      type: 'article',
      url: `https://redcreativa.pro/prompts/${page.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? page.excerpt
    },
    robots: { index: true, follow: true }
  }
}

export default function PromptDetailPage({ params }: Props) {
  const page = getPromptBySlug(params.slug)
  if (!page) return notFound()

  const faqJsonLd = page.faq
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faq.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer }
        }))
      }
    : undefined

  return (
    <ArticleTemplate
      title={page.title}
      description={page.excerpt}
      faqJsonLd={faqJsonLd}
      relatedLinks={page.relatedLinks}
      breadcrumbsItems={[{ href: '/', label: 'Inicio' }, { href: '/prompts', label: 'Prompts IA' }, { label: page.title }]}
    >
      <section className="space-y-6">
        <p>
          Usa estas plantillas para generar copys profesionales con IA. Ajusta contexto, audiencia, objetivo y tono.
        </p>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Cómo usar estos prompts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Define el objetivo del texto y la audiencia específica.</li>
            <li>Indica tono, formato y restricciones de longitud.</li>
            <li>Incluye ejemplos previos y palabras clave si aplican (SEO).</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Plantillas de prompt</h2>
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Estructura general</h3>
              <pre className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">[CONTEXTO] + [AUDIENCIA] + [OBJETIVO] + [FORMATO] + [TONO] + [RESTRICCIONES]</pre>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Variaciones sugeridas</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Incluye 3 ganchos alternativos para el titular</li>
                <li>Propón 2 CTAs distintos según el objetivo</li>
                <li>Añade prueba social (estadística, caso, testimonial)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Más recursos</h2>
          <p>
            Explora más plantillas y ejemplos en el hub de{' '}
            <Link href="/herramientas-ia-copywriting" className="text-blue-600 hover:underline">Herramientas IA</Link>.
          </p>
        </div>
      </section>
    </ArticleTemplate>
  )
}

