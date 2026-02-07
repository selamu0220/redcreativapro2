import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { 
  getIndustriaBySlug, 
  getAllIndustriaSlugs,
  industriasData 
} from '@/lib/programmatic-seo-data'
import Link from 'next/link'
import { 
  ArrowRight, 
  CheckCircle, 
  Building2,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const industria = getIndustriaBySlug(slug)
  
  if (!industria) {
    return {
      title: 'Industria no encontrada | Red Creativa Pro',
      robots: { index: false, follow: true }
    }
  }

  const baseUrl = 'https://redcreativa.pro'

  return {
    title: industria.titulo,
    description: industria.description,
    keywords: [
      `ia para ${industria.nombre.toLowerCase()}`,
      `escritura ia ${industria.nombre.toLowerCase()}`,
      `copywriting ${industria.nombre.toLowerCase()}`,
      'inteligencia artificial negocios',
      'automatización contenido'
    ],
    alternates: {
      canonical: `${baseUrl}/industria/${slug}`
    },
    openGraph: {
      title: industria.titulo,
      description: industria.description,
      type: 'website',
      url: `${baseUrl}/industria/${slug}`,
      images: [{
        url: `${baseUrl}/api/og?title=${encodeURIComponent(industria.titulo)}`,
        width: 1200,
        height: 630,
        alt: industria.nombre
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: industria.titulo,
      description: industria.description
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

function generateWebPageSchema(industria: any, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: industria.titulo,
    description: industria.description,
    url: `${baseUrl}/industria/${industria.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Red Creativa Pro',
      url: baseUrl
    }
  }
}

function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Red Creativa Pro',
    url: baseUrl,
    logo: `${baseUrl}/icon.png`
  }
}

export function generateStaticParams() {
  return getAllIndustriaSlugs().map((slug) => ({ slug }))
}

export default async function IndustriaPage({ params }: Props) {
  const { slug } = await params
  const industria = getIndustriaBySlug(slug)

  if (!industria) {
    notFound()
  }

  const baseUrl = 'https://redcreativa.pro'
  const otrasIndustrias = industriasData
    .filter(i => i.slug !== slug)
    .slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebPageSchema(industria, baseUrl)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema(baseUrl)) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-foreground">Industrias</span>
          <span>/</span>
          <span className="text-foreground">{industria.nombre}</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Building2 className="w-3 h-3 mr-1" />
            Solución sectorial
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {industria.titulo}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            {industria.description}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">{industria.estadistica}</span>
          </div>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Casos de uso para {industria.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {industria.useCases.map((useCase, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="w-5 h-5" />
                ¿Por qué elegir Red Creativa Pro?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Especializado en español para el mercado local</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Integración con herramientas del sector</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Plantillas específicas para tu industria</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Soporte técnico en tu idioma</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Cumplimiento normativo (RGPD)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Success Stories */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Historias de éxito en {industria.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-1 gap-6">
              {industria.ejemplos.map((ejemplo, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{ejemplo}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Industry Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">5x</div>
              <p className="text-sm text-muted-foreground">
                Más contenido generado vs. escritura manual
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">-60%</div>
              <p className="text-sm text-muted-foreground">
                Reducción en costos de copywriting
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">+40%</div>
              <p className="text-sm text-muted-foreground">
                Aumento en engagement del contenido
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Other Industries */}
        {otrasIndustrias.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Otras industrias</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {otrasIndustrias.map((otra) => (
                <Card key={otra.slug} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{otra.nombre}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {otra.description.substring(0, 100)}...
                    </p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/industria/${otra.slug}`}>
                        Ver solución
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            ¿Listo para transformar {industria.nombre} con IA?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Únete a las empresas líderes en {industria.nombre.toLowerCase()} que ya usan 
            Red Creativa Pro para escalar su contenido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contacto">
                Hablar con ventas
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Demostración personalizada para empresas de {industria.nombre.toLowerCase()}
          </p>
        </div>
      </div>
    </main>
    </>
  )
}
