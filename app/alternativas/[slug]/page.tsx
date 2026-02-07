import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { 
  getCompetidorBySlug, 
  getAllCompetidorSlugs 
} from '@/lib/programmatic-seo-data'
import Link from 'next/link'
import { 
  ArrowRight, 
  CheckCircle, 
  Zap,
  Star,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tool = getCompetidorBySlug(slug)
  
  if (!tool) {
    return {
      title: 'Alternativa no encontrada | Red Creativa Pro',
      robots: { index: false, follow: true }
    }
  }

  const title = `Mejores Alternativas a ${tool.nombre} en 2025 | Red Creativa Pro #1`
  const description = `¿Buscas alternativas a ${tool.nombre}? Descubre por qué Red Creativa Pro es la mejor opción: más económico, mejor en español, SEO integrado. Comparativa completa.`
  const baseUrl = 'https://redcreativa.pro'

  return {
    title,
    description,
    keywords: [
      `alternativas a ${tool.nombre.toLowerCase()}`,
      `${tool.nombre.toLowerCase()} vs`,
      'mejor alternativa escritor ia',
      'alternativas copywriting ia',
      `${tool.nombre.toLowerCase()} español alternativa`
    ],
    alternates: {
      canonical: `${baseUrl}/alternativas/${slug}`
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/alternativas/${slug}`,
      images: [{
        url: `${baseUrl}/api/og?title=${encodeURIComponent(title)}`,
        width: 1200,
        height: 630,
        alt: `Alternativas a ${tool.nombre}`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
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

function generateWebPageSchema(tool: any, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Alternativas a ${tool.nombre}`,
    description: `¿Buscas alternativas a ${tool.nombre}? Descubre opciones más económicas y con mejor soporte en español.`,
    url: `${baseUrl}/alternativas/${tool.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Red Creativa Pro',
      url: baseUrl
    }
  }
}

export function generateStaticParams() {
  return getAllCompetidorSlugs().map((slug) => ({ slug }))
}

export default async function AlternativasPage({ params }: Props) {
  const { slug } = await params
  const tool = getCompetidorBySlug(slug)

  if (!tool) {
    notFound()
  }

  const baseUrl = 'https://redcreativa.pro'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebPageSchema(tool, baseUrl)) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-foreground">Alternativas</span>
          <span>/</span>
          <span className="text-foreground">{tool.nombre}</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Star className="w-3 h-3 mr-1" />
            Top Alternativa 2025
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Mejores Alternativas a {tool.nombre}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ¿Buscas algo mejor que {tool.nombre}? Descubre opciones más económicas, 
            con mejor soporte en español y características superiores.
          </p>
        </div>

        {/* Featured Alternative - Red Creativa Pro */}
        <Card className="mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Zap className="w-12 h-12 text-primary" />
              </div>
              <div className="flex-1">
                <Badge className="mb-2 bg-green-500/10 text-green-600">
                  #1 Mejor Alternativa
                </Badge>
                <h2 className="text-3xl font-bold mb-2">Red Creativa Pro</h2>
                <p className="text-muted-foreground text-lg mb-4">
                  La alternativa más completa a {tool.nombre}. Escritura con IA optimizada 
                  para español, SEO automático y 5x más económico.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Desde $0/mes</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>100% Español nativo</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>SEO integrado</span>
                  </div>
                </div>
              </div>
              <Button size="lg" className="shrink-0" asChild>
                <Link href="/">
                  Probar gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>¿Por qué buscar alternativas a {tool.nombre}?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tool.contras.map((contra, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">×</span>
                    <span className="text-muted-foreground">{contra}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">¿Qué ofrece Red Creativa Pro?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Precio accesible desde gratis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Optimizado para español nativo</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>SEO automático en cada texto</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>StealthWrite™ indetectable</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>50+ prompts pre-optimizados</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Dashboard SEO completo</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Casos de éxito migrando de {tool.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-primary mb-2">+40%</div>
                <p className="text-sm text-muted-foreground">
                  Ahorro promedio en costos de copywriting
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-primary mb-2">3x</div>
                <p className="text-sm text-muted-foreground">
                  Más contenido generado en el mismo tiempo
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-primary mb-2">25%</div>
                <p className="text-sm text-muted-foreground">
                  Mejor posicionamiento SEO en 3 meses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Migration CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            Migra de {tool.nombre} a Red Creativa Pro hoy
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            El cambio es fácil. Importa tus proyectos, prueba la plataforma gratis 
            y descubre por qué miles ya hicieron el switch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/comparativas/${slug}`}>
                Ver comparativa detallada
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
