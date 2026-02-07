import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { competidoresData } from '@/lib/programmatic-seo-data'

export const metadata: Metadata = {
  title: 'Mejores Alternativas a Herramientas IA | Red Creativa Pro #1',
  description: 'Busca alternativas a herramientas IA populares. Descubre por qué Red Creativa Pro es la mejor alternativa: más económico, mejor en español, SEO integrado.',
  alternates: {
    canonical: 'https://redcreativa.pro/alternativas'
  }
}

export default function AlternativasIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Lightbulb className="w-3 h-3 mr-1" />
            Alternativas inteligentes
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Mejores Alternativas a Herramientas IA
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ¿Buscas algo mejor? Descubre alternativas más económicas y potentes 
            a las herramientas de IA más populares del mercado.
          </p>
        </div>

        {/* Alternatives Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {competidoresData.map((tool) => (
            <Card key={tool.slug} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  Alternativas a {tool.nombre}
                </h2>
                
                <p className="text-muted-foreground mb-4">
                  {tool.descripcion}
                </p>

                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-green-600">
                    ✓ {tool.nuestraVentaja}
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/alternativas/${tool.slug}`}>
                    Ver alternativas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/comparativas">
              Ver comparativas completas
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
