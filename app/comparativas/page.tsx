import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Scale, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { competidoresData, programmaticSeoStats } from '@/lib/programmatic-seo-data'

export const metadata: Metadata = {
  title: 'Comparativas de Herramientas IA | Red Creativa Pro vs Competencia',
  description: `Comparativas honestas: Red Creativa Pro vs ${competidoresData.map(c => c.nombre).join(', ')}. Descubre por qué miles eligen nuestra plataforma.`,
  alternates: {
    canonical: 'https://redcreativa.pro/comparativas'
  }
}

export default function ComparativasIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Scale className="w-3 h-3 mr-1" />
            Comparativas honestas
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Comparativas: Red Creativa Pro vs Competencia
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comparativas detalladas y objetivas. Descubre por qué miles de usuarios 
            eligen Red Creativa Pro sobre otras herramientas de IA.
          </p>
        </div>

        {/* Comparisons Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {competidoresData.map((competidor) => (
            <Card key={competidor.slug} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {competidor.nombre} vs Red Creativa Pro
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {competidor.descripcion}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Precio {competidor.nombre}:</span>
                    <span className="font-medium">{competidor.precio}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Precio Red Creativa Pro:</span>
                    <span className="font-medium text-green-600">Gratis - $19/mes</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/comparativas/${competidor.slug}`}>
                      Ver comparativa
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/alternativas/${competidor.slug}`}>
                      <Star className="w-4 h-4 mr-2" />
                      Alternativas
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            ¿Todavía indeciso?
          </h2>
          <p className="text-muted-foreground mb-6">
            Prueba Red Creativa Pro gratis y compara por ti mismo.
          </p>
          <Button size="lg" asChild>
            <Link href="/">
              Empezar gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
