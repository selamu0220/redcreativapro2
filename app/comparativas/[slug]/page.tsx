import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { 
  getCompetidorBySlug, 
  getAllCompetidorSlugs,
  competidoresData 
} from '@/lib/programmatic-seo-data'
import Link from 'next/link'
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Trophy,
  DollarSign,
  Users,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const competidor = getCompetidorBySlug(slug)
  
  if (!competidor) {
    return {
      title: 'Comparativa no encontrada | Red Creativa Pro',
      robots: { index: false, follow: true }
    }
  }

  const title = `${competidor.nombre} vs Red Creativa Pro | Comparativa 2025`
  const description = `¿${competidor.nombre} o Red Creativa Pro? Descubre por qué miles eligen Red Creativa Pro: ${competidor.nuestraVentaja}. Comparativa honesta de precios, features y resultados.`

  return {
    title,
    description,
    keywords: [
      `${competidor.nombre.toLowerCase()} vs red creativa`,
      `${competidor.nombre.toLowerCase()} alternativa`,
      'mejor escritor ia',
      'comparativa ia escritura',
      `${competidor.nombre.toLowerCase()} precio`
    ],
    alternates: {
      canonical: `https://redcreativa.pro/comparativas/${slug}`
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://redcreativa.pro/comparativas/${slug}`
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

export function generateStaticParams() {
  return getAllCompetidorSlugs().map((slug) => ({ slug }))
}

function generateComparisonSchema(competidor: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: `${competidor.nombre} vs Red Creativa Pro`,
    reviewBody: `Comparativa detallada entre ${competidor.nombre} y Red Creativa Pro`,
    author: {
      '@type': 'Organization',
      name: 'Red Creativa Pro'
    },
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: competidor.nombre,
      description: competidor.descripcion,
      offers: {
        '@type': 'Offer',
        price: competidor.precio,
        priceCurrency: 'USD'
      }
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '4.5',
      bestRating: '5'
    }
  }
}

export default async function ComparativaPage({ params }: Props) {
  const { slug } = await params
  const competidor = getCompetidorBySlug(slug)

  if (!competidor) {
    notFound()
  }

  const otrosCompetidores = competidoresData
    .filter(c => c.slug !== slug)
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateComparisonSchema(competidor)) }}
      />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-foreground">Comparativas</span>
          <span>/</span>
          <span className="text-foreground">{competidor.nombre}</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            Comparativa 2025
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {competidor.nombre} vs Red Creativa Pro
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {competidor.descripcion}. Descubre cuál es la mejor opción para tu negocio 
            con esta comparativa honesta.
          </p>
        </div>

        {/* Quick Verdict */}
        <Card className="mb-12 bg-gradient-to-r from-green-500/10 to-primary/10 border-green-500/20">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-full">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Veredicto rápido</h2>
                <p className="text-lg text-muted-foreground">
                  {competidor.nuestraVentaja}
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/">
                    Probar Red Creativa Pro gratis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="mb-12 overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-center">Comparativa detallada</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b">
                    <th className="w-1/3 text-left p-4 font-medium">Característica</th>
                    <th className="text-center p-4 font-medium">{competidor.nombre}</th>
                    <th className="text-center p-4 font-medium bg-primary/5">Red Creativa Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="font-medium p-4">Precio</td>
                    <td className="text-center p-4">{competidor.precio}</td>
                    <td className="text-center p-4 bg-primary/5 font-semibold text-green-600">
                      Gratis - $19/mes
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-medium p-4">Idioma español nativo</td>
                    <td className="text-center p-4">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-primary/5">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-medium p-4">SEO automático</td>
                    <td className="text-center p-4">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-primary/5">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-medium p-4">Detección de IA indetectable</td>
                    <td className="text-center p-4">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-primary/5">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-medium p-4">Prompts pre-optimizados</td>
                    <td className="text-center p-4">Limitados</td>
                    <td className="text-center p-4 bg-primary/5 font-semibold">
                      50+ prompts
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium p-4">Dashboard SEO completo</td>
                    <td className="text-center p-4">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-primary/5">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pros & Cons Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Competidor Pros/Cons */}
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <span>{competidor.nombre}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Pros
                </h3>
                <ul className="space-y-2">
                  {competidor.pros.map((pro, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Contras
                </h3>
                <ul className="space-y-2">
                  {competidor.contras.map((contra, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {contra}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm">
                  <span className="font-medium">Mejor para:</span>{' '}
                  <span className="text-muted-foreground">{competidor.mejorPara}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Red Creativa Pro */}
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Trophy className="w-5 h-5" />
                Red Creativa Pro
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Pros
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    5x más económico que {competidor.nombre}
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    Optimizado 100% para español
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    SEO automático integrado
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    StealthWrite™ indetectable
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    50+ prompts pre-optimizados
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    Dashboard SEO completo
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Ideal para
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Marketers hispanohablantes
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Agencias con presupuesto limitado
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Startups que necesitan escalar contenido
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Other Comparisons */}
        {otrosCompetidores.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Otras comparativas</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {otrosCompetidores.map((otro) => (
                <Card key={otro.slug} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{otro.nombre}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {otro.descripcion.substring(0, 80)}...
                    </p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/comparativas/${otro.slug}`}>
                        Ver comparativa
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
            ¿Convencido? Prueba Red Creativa Pro gratis
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Miles de profesionales ya eligieron Red Creativa Pro sobre {competidor.nombre}. 
            Únete y empieza a crear contenido que convierte hoy mismo.
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
          <p className="text-sm text-muted-foreground mt-4">
            Sin tarjeta de crédito • 5 artículos gratis • Cancela cuando quieras
          </p>
        </div>
      </div>
    </main>
  )
}
