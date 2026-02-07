import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleWrapper from '@/app/components/ArticleWrapper'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import Link from 'next/link'
import { getPromptBySlug, getAllPromptSlugs } from '@/lib/prompts-data'
import { ArrowRight, Copy, CheckCircle, BookOpen, Sparkles, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const page = getPromptBySlug(resolvedParams.slug)
  if (!page) {
    return {
      title: 'Prompt no encontrado | Red Creativa Pro',
      robots: { index: false, follow: true }
    }
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'

  return {
    title: page.seoTitle ?? `${page.title} | Red Creativa Pro`,
    description: page.seoDescription ?? page.excerpt,
    keywords: [...page.tags, 'prompts ia', 'chatgpt', 'inteligencia artificial', 'plantillas ia'],
    alternates: {
      canonical: `${baseUrl}/prompts/${page.slug}`,
      languages: {
        'es': `${baseUrl}/prompts/${page.slug}`,
      }
    },
    openGraph: {
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? page.excerpt,
      type: 'article',
      url: `${baseUrl}/prompts/${page.slug}`,
      images: [{ 
        url: `${baseUrl}/og-prompts.jpg`, 
        width: 1200, 
        height: 630,
        alt: page.title 
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? page.excerpt
    },
    robots: { 
      index: true, 
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  }
}

export async function generateStaticParams() {
  const slugs = getAllPromptSlugs()
  return slugs.map((slug) => ({ slug }))
}

function generateHowToSchema(page: any, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: page.title,
    description: page.excerpt,
    totalTime: 'PT5M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Copiar el prompt',
        text: 'Copia la plantilla de prompt proporcionada a tu portapapeles',
        url: `${baseUrl}/prompts/${page.slug}#step-1`
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Personalizar variables',
        text: 'Adapta las variables entre corchetes a tu caso específico y audiencia',
        url: `${baseUrl}/prompts/${page.slug}#step-2`
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Ejecutar en IA',
        text: 'Pega el prompt en ChatGPT, Claude, Gemini o Red Creativa Pro',
        url: `${baseUrl}/prompts/${page.slug}#step-3`
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Refinar resultados',
        text: 'Ajusta y mejora la respuesta según tus necesidades específicas',
        url: `${baseUrl}/prompts/${page.slug}#step-4`
      }
    ]
  }
}

function generateFAQSchema(page: any) {
  if (!page.faq || page.faq.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((f: any) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer
      }
    }))
  }
}

export default async function PromptDetailPage({ params }: Props) {
  const resolvedParams = await params
  const page = getPromptBySlug(resolvedParams.slug)
  if (!page) return notFound()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'

  // Enhanced Schema: CreativeWork + HowTo + FAQ
  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: page.title,
    description: page.excerpt,
    url: `${baseUrl}/prompts/${page.slug}`,
    datePublished: page.publishedAt || '2024-01-01',
    dateModified: page.publishedAt || '2024-01-01',
    author: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      url: baseUrl
    },
    about: {
      '@type': 'Thing',
      name: 'Artificial Intelligence Prompt'
    },
    genre: 'AI Prompt Template',
    keywords: page.tags.join(', ')
  }

  const howToSchema = generateHowToSchema(page, baseUrl)
  const faqSchema = generateFAQSchema(page)

  const schemas = [creativeWorkSchema, howToSchema, faqSchema].filter(Boolean)

  return (
    <ArticleWrapper
      title={page.title}
      showFooter={true}
      className="max-w-5xl mx-auto"
    >
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs items={[
          { href: '/', label: 'Inicio' }, 
          { href: '/prompts', label: 'Prompts IA' }, 
          { label: page.title }
        ]} />
      </div>

      {/* Header with Tags */}
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {page.category}
          </span>
          {page.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          {page.title}
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed">
          {page.excerpt}
        </p>
      </header>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* How to Use Section */}
          <Card className="border-2 border-primary/20" id="how-to-use">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Cómo usar este prompt en 4 pasos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ol className="space-y-4">
                <li className="flex items-start gap-3" id="step-1">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">1</span>
                  <div>
                    <strong className="block mb-1">Copia el prompt</strong>
                    <p className="text-sm text-muted-foreground">Haz clic en el botón de copiar para guardar la plantilla en tu portapapeles</p>
                  </div>
                </li>
                <li className="flex items-start gap-3" id="step-2">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">2</span>
                  <div>
                    <strong className="block mb-1">Personaliza las variables</strong>
                    <p className="text-sm text-muted-foreground">Adapta los campos entre corchetes [así] a tu caso específico y audiencia</p>
                  </div>
                </li>
                <li className="flex items-start gap-3" id="step-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">3</span>
                  <div>
                    <strong className="block mb-1">Ejecuta en tu IA favorita</strong>
                    <p className="text-sm text-muted-foreground">Pega el prompt en ChatGPT, Claude, Gemini o directamente en Red Creativa Pro</p>
                  </div>
                </li>
                <li className="flex items-start gap-3" id="step-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">4</span>
                  <div>
                    <strong className="block mb-1">Refina los resultados</strong>
                    <p className="text-sm text-muted-foreground">Ajusta y mejora la respuesta según tus necesidades específicas y estilo de marca</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* The Prompt Template */}
          <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Plantilla de Prompt
                </span>
                <Button variant="outline" size="sm" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copiar prompt
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 border-2 border-dashed border-primary/20 p-4 rounded-lg font-mono text-sm leading-relaxed">
                {`Eres un experto en ${page.category}. Tu tarea es [DESCRIPCIÓN ESPECÍFICA].

CONTEXTO:
- Audiencia: [DESCRIBE TU AUDIENCIA OBJETIVO]
- Objetivo: [DEFINE EL OBJETIVO DEL CONTENIDO]
- Tono: [PROFESIONAL/CASUAL/TÉCNICO/ENTUSIASTA]

REQUISITOS:
${page.tags.map((tag, i) => `${i + 1}. Incluir consideraciones sobre ${tag}`).join('\n')}

FORMATO DE SALIDA:
[Especifica el formato deseado: lista, párrafos, tabla, etc.]

RESTRICCIONES:
- Longitud: [X palabras/caracteres]
- Evita: [términos o enfoques a evitar]
- Incluye: [elementos obligatorios]`}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <Lightbulb className="h-3 w-3 inline mr-1" />
                Tip: Personaliza todo lo que está entre [corchetes] antes de enviar el prompt
              </p>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Casos de uso ideales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Ahorra tiempo valioso</strong>
                    <span className="text-sm text-muted-foreground">Automatiza tareas repetitivas de copywriting en minutos, no horas</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Mantén consistencia de marca</strong>
                    <span className="text-sm text-muted-foreground">Usa el mismo tono y estilo en todo tu contenido</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Optimiza para resultados</strong>
                    <span className="text-sm text-muted-foreground">Mejora el rendimiento de tus textos con estructuras probadas</span>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Lightbulb className="h-5 w-5" />
                Consejos Pro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Itera: La primera respuesta rara vez es perfecta. Pide ajustes específicos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Sé específico: Cuanto más contexto des, mejores resultados obtendrás.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>Guarda tus mejores prompts: Crea tu propia biblioteca personalizada.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          {page.faq && page.faq.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preguntas frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {page.faq.map((item, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold mb-2 text-base">{item.question}</h3>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* CTA Card */}
          <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary-foreground text-lg">
                ¿Cansado de copiar y pegar?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-primary-foreground/90 text-sm">
                Genera este contenido automáticamente con Red Creativa Pro. Sin prompts, sin configuración compleja.
              </p>
              <Button 
                variant="secondary" 
                className="w-full gap-2 font-semibold"
                asChild
              >
                <Link href="/">
                  Probar gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-primary-foreground/70 mt-3 text-center">
                Sin tarjeta de crédito • 5 artículos gratis
              </p>
            </CardContent>
          </Card>

          {/* Related Links */}
          {page.relatedLinks && page.relatedLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Herramientas relacionadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {page.relatedLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className="text-sm text-primary hover:underline flex items-center gap-2 group"
                      >
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Meta Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Categoría:</span>{' '}
                  <span className="font-medium">{page.category}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Publicado:</span>{' '}
                  <span className="font-medium">
                    {new Date(page.publishedAt).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Etiquetas:</span>{' '}
                  <span className="font-medium">{page.tags.slice(0, 5).join(', ')}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* More Prompts CTA */}
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-base">¿Necesitas más prompts?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Explora nuestra colección completa de plantillas IA para diferentes casos de uso.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/prompts">
                  Ver todos los prompts
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Lleva tu escritura al siguiente nivel
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Red Creativa Pro combina los mejores prompts pre-optimizados con tecnología avanzada de IA. 
          Genera contenido de calidad profesional en segundos, sin necesidad de ser experto en prompts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/">
              Empezar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/planes">
              Ver planes y precios
            </Link>
          </Button>
        </div>
      </div>

      {/* JSON-LD Schemas */}
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
