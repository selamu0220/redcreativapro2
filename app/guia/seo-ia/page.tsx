import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Search, TrendingUp, Target, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'SEO con IA 2025 | Domina Google con Inteligencia Artificial',
  description: 'Aprende a usar IA para SEO y rankea en Google. Guía completa con técnicas avanzadas, herramientas y estrategias de optimización con IA.',
  keywords: ['seo ia', 'seo con inteligencia artificial', 'ia para seo', 'optimizacion seo ia'],
  alternates: { canonical: 'https://redcreativa.pro/guia/seo-ia' }
}

export default function SEOIAGuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline"><Search className="w-3 h-3 mr-1" />SEO Avanzado</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">SEO con IA: Domina Google 2025</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Usa inteligencia artificial para optimizar tu contenido y escalar posiciones en Google.
          </p>
          <Button size="lg" asChild><Link href="/seo-dashboard">Dashboard SEO <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl mb-8">
            <p className="text-green-800 text-lg">
              El <strong>SEO con IA</strong> permite analizar datos, identificar oportunidades y crear contenido optimizado a velocidad sin precedentes.
            </p>
          </div>

          <h2 className="text-3xl font-bold mb-6">¿Por qué usar IA para SEO?</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8 not-prose">
            <Card><CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Análisis Rápido</h3>
              <p className="text-sm text-muted-foreground">Procesa miles de keywords en minutos</p>
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <Target className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Precisión</h3>
              <p className="text-sm text-muted-foreground">Encuentra oportunidades ocultas</p>
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <BarChart3 className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Escalabilidad</h3>
              <p className="text-sm text-muted-foreground">Optimiza 100x más contenido</p>
            </CardContent></Card>
          </div>

          <h2 className="text-3xl font-bold mb-6">7 Técnicas de SEO con IA</h2>
          <h3 className="text-2xl font-semibold mb-4">1. Research de Keywords Inteligente</h3>
          <p className="text-muted-foreground mb-4">
            La IA analiza millones de búsquedas para encontrar keywords de alto volumen y baja competencia.
          </p>

          <h3 className="text-2xl font-semibold mb-4">2. Optimización On-Page Automática</h3>
          <p className="text-muted-foreground mb-4">
            Desde meta titles hasta estructura de headings. La IA asegura optimización perfecta.
          </p>

          <h2 className="text-3xl font-bold mb-6">¿Google penaliza contenido de IA?</h2>
          <div className="bg-muted p-6 rounded-xl mb-8">
            <p className="text-muted-foreground mb-4">
              <strong>NO</strong>, siempre que cumpla con criterios de calidad E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">Empieza a rankear con IA</h3>
          <Button size="lg" asChild><Link href="/seo-dashboard">Usar Dashboard SEO <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>
      </div>
    </main>
  )
}
