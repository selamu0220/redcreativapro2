import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { 
  getCategoriaBySlug, 
  getAllCategoriaSlugs,
  categoriasData,
  type CategoriaData 
} from '@/lib/programmatic-seo-data'
import { promptPages } from '@/lib/prompts-data'
import Link from 'next/link'
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  CheckCircle,
  Mail,
  Share2,
  Search,
  ShoppingCart,
  Video,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
  Mail,
  Share2,
  Search,
  ShoppingCart,
  Video,
  FileText
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categoria = getCategoriaBySlug(slug)
  
  if (!categoria) {
    return {
      title: 'Categoría no encontrada | Red Creativa Pro',
      robots: { index: false, follow: true }
    }
  }

  const baseUrl = 'https://redcreativa.pro'

  return {
    title: categoria.titulo,
    description: categoria.description,
    keywords: categoria.keywords,
    alternates: {
      canonical: `${baseUrl}/categoria/${slug}`
    },
    openGraph: {
      title: categoria.titulo,
      description: categoria.description,
      type: 'website',
      url: `${baseUrl}/categoria/${slug}`,
      images: [{ 
        url: `${baseUrl}/api/og?title=${encodeURIComponent(categoria.titulo)}`, 
        width: 1200, 
        height: 630,
        alt: categoria.nombre
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: categoria.titulo,
      description: categoria.description
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

export function generateStaticParams() {
  return getAllCategoriaSlugs().map((slug) => ({ slug }))
}

function generateCategorySchema(categoria: CategoriaData, prompts: typeof promptPages) {
  const baseUrl = 'https://redcreativa.pro'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoria.nombre,
    description: categoria.description,
    url: `${baseUrl}/categoria/${categoria.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: prompts.map((prompt, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: prompt.title,
        url: `${baseUrl}/prompts/${prompt.slug}`
      }))
    },
    about: {
      '@type': 'Thing',
      name: categoria.nombre,
      description: categoria.description
    }
  }
}

function generateFAQSchema(categoria: CategoriaData) {
  if (!categoria.faqs || categoria.faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: categoria.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.respuesta
      }
    }))
  }
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params
  const categoria = getCategoriaBySlug(slug)

  if (!categoria) {
    notFound()
  }

  // Filter prompts by category
  const promptsEnCategoria = promptPages.filter(
    p => p.category?.toLowerCase().includes(categoria.nombre.toLowerCase()) ||
         categoria.slug.includes(p.category?.toLowerCase().replace(/\s+/g, '-') || '')
  )

  // Get related categories
  const categoriasRelacionadas = categoriasData
    .filter(c => c.slug !== slug)
    .slice(0, 3)

  const IconComponent = iconMap[categoria.icono] || Sparkles
  const categorySchema = generateCategorySchema(categoria, promptsEnCategoria)
  const faqSchema = generateFAQSchema(categoria)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/prompts" className="hover:text-foreground transition-colors">Prompts</Link>
          <span>/</span>
          <span className="text-foreground">{categoria.nombre}</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge 
            className={`mb-4 bg-${categoria.color}-500/10 text-${categoria.color}-600 hover:bg-${categoria.color}-500/20`}
          >
            <IconComponent className="w-3 h-3 mr-1" />
            {categoria.promptsCount} prompts disponibles
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {categoria.titulo}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            {categoria.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>{categoria.beneficioPrincipal}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{categoria.estadistica}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Prompts */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold mb-6">
              Prompts de {categoria.nombre} ({promptsEnCategoria.length})
            </h2>

            {promptsEnCategoria.length > 0 ? (
              <div className="grid gap-4">
                {promptsEnCategoria.map((prompt) => (
                  <Card key={prompt.slug} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            <Link 
                              href={`/prompts/${prompt.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {prompt.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3">
                            {prompt.excerpt}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {prompt.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button asChild size="sm" className="shrink-0">
                          <Link href={`/prompts/${prompt.slug}`}>
                            Ver prompt
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Pronto agregaremos más prompts para esta categoría.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/prompts">
                    Explorar todos los prompts
                  </Link>
                </Button>
              </Card>
            )}

            {/* Casos de Uso */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Casos de uso en {categoria.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {categoria.casosUso.map((caso, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{caso}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            {categoria.faqs && categoria.faqs.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Preguntas frecuentes sobre {categoria.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoria.faqs.map((faq, index) => (
                    <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                      <h3 className="font-semibold mb-2">{faq.pregunta}</h3>
                      <p className="text-muted-foreground text-sm">{faq.respuesta}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card className="bg-primary text-primary-foreground border-0">
              <CardHeader>
                <CardTitle className="text-primary-foreground text-lg">
                  Automatiza tu {categoria.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-primary-foreground/90 text-sm">
                  Usa Red Creativa Pro para generar todo tu copy de {categoria.nombre.toLowerCase()} sin prompts complejos.
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full gap-2"
                  asChild
                >
                  <Link href="/">
                    Probar gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Herramientas Relacionadas */}
            {categoria.herramientasRelacionadas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Herramientas relacionadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {categoria.herramientasRelacionadas.map((href, index) => {
                      const label = href.split('/').pop()?.replace(/-/g, ' ') || href
                      return (
                        <li key={index}>
                          <Link 
                            href={href}
                            className="text-sm text-primary hover:underline flex items-center gap-2"
                          >
                            <ArrowRight className="h-3 w-3" />
                            {label.charAt(0).toUpperCase() + label.slice(1)}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Categorías Relacionadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Otras categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {categoriasRelacionadas.map((cat) => (
                    <li key={cat.slug}>
                      <Link 
                        href={`/categoria/${cat.slug}`}
                        className="text-sm text-primary hover:underline flex items-center gap-2"
                      >
                        <ArrowRight className="h-3 w-3" />
                        {cat.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Prompts:</span>{' '}
                    <span className="font-medium">{categoria.promptsCount}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Categoría:</span>{' '}
                    <span className="font-medium">{categoria.nombre}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            ¿Listo para dominar {categoria.nombre} con IA?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Únete a miles de profesionales que usan Red Creativa Pro para crear copy 
            de {categoria.nombre.toLowerCase()} que convierte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/prompts">
                Ver todos los prompts
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
