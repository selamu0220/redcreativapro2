import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { industriasData, programmaticSeoStats } from '@/lib/programmatic-seo-data'

export const metadata: Metadata = {
  title: 'Soluciones IA por Industria | Red Creativa Pro',
  description: `Soluciones de IA escritura especializadas para ${programmaticSeoStats.totalIndustrias} industrias. Desde agencias hasta eCommerce, encuentra la solución perfecta para tu sector.`,
  alternates: {
    canonical: 'https://redcreativa.pro/industria'
  }
}

export default function IndustriasIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Building2 className="w-3 h-3 mr-1" />
            {programmaticSeoStats.totalIndustrias} sectores
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Soluciones IA por Industria
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cada industria tiene necesidades únicas. Descubre cómo Red Creativa Pro 
            ayuda a empresas como la tuya a escalar su contenido.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {industriasData.map((industria) => (
            <Link key={industria.slug} href={`/industria/${industria.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                      {industria.nombre}
                    </h2>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {industria.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span>{industria.estadistica}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {programmaticSeoStats.totalIndustrias}
              </div>
              <p className="text-sm text-muted-foreground">Industrias servidas</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <p className="text-sm text-muted-foreground">Empresas confían en nosotros</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">40%</div>
              <p className="text-sm text-muted-foreground">Ahorro promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            ¿No encuentras tu industria?
          </h2>
          <p className="text-muted-foreground mb-6">
            Contáctanos y te mostraremos cómo Red Creativa Pro puede ayudar a tu sector específico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contacto">
                Contactar ventas
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">
                Probar gratis
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
