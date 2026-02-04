import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleWrapper from '@/app/components/ArticleWrapper'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import Link from 'next/link'
import { getPromptBySlug, getAllPromptSlugs } from '@/lib/prompts-data'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const page = getPromptBySlug(resolvedParams.slug)
  if (!page) return {}
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'

  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.excerpt,
    alternates: {
      canonical: `${baseUrl}/prompts/${page.slug}`,
      languages: {
        'es': `${baseUrl}/prompts/${page.slug}`,
        // 'en': `${baseUrl}/en/prompts/${page.slug}`,
      }
    },
    openGraph: {
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? page.excerpt,
      type: 'article',
      url: `${baseUrl}/prompts/${page.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? page.excerpt
    },
    robots: { index: true, follow: true }
  }
}

export async function generateStaticParams() {
  const slugs = getAllPromptSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function PromptDetailPage({ params }: Props) {
  const resolvedParams = await params
  const page = getPromptBySlug(resolvedParams.slug)
  if (!page) return notFound()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'

  // Primary Schema: CreativeWork (The Prompt Template)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork', // Or 'SoftwareSourceCode' if it's very code-heavy, but CreativeWork is safer for prompts
    name: page.title,
    description: page.excerpt,
    url: `${baseUrl}/prompts/${page.slug}`,
    datePublished: '2024-01-01', // Ideally from DB
    author: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      url: baseUrl
    },
    about: {
      '@type': 'Thing',
      name: 'Artificial Intelligence Prompt'
    },
    // If it's a specific format:
    genre: 'AI Prompt Template'
  }

  // Secondary Schema: FAQ
  const faqSchema = page.faq
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

  // Combine schemas into a graph to avoid multiple script tags if possible, or just render both
  const schemas = [productSchema, faqSchema].filter(Boolean)

  return (
    <ArticleWrapper
      title={page.title}
      showFooter={true}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <Breadcrumbs items={[{ href: '/', label: 'Inicio' }, { href: '/prompts', label: 'Prompts IA' }, { label: page.title }]} />
      </div>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
        {page.excerpt && <p className="text-xl text-muted-foreground">{page.excerpt}</p>}
      </header>

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
            <Link href="/dashboard" className="text-blue-600 hover:underline">Herramientas IA</Link>.
          </p>
        </div>
      </section>

      {/* Safe Render JSON-LD Schemas */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </ArticleWrapper>
  )
}

