import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Settings, TrendingUp, Clock, BarChart, Layers, RefreshCw, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Automatizar Contenido 2025 | Guía SEO para Producción en Masa',
  description: 'Aprende a automatizar la creación de contenido con IA. Estrategias, herramientas y workflows para generar contenido SEO a escala. Ahorra tiempo y recursos.',
  keywords: ['automatizar contenido', 'produccion contenido ia', 'content automation', 'automatizacion marketing', 'escala contenido seo', 'workflow contenido ia', 'bulk content generation', 'pipeline contenido'],
  alternates: { canonical: 'https://redcreativa.pro/automatizar-contenido' },
  openGraph: {
    title: 'Automatizar Contenido 2025 | Guía SEO para Producción en Masa',
    description: 'Aprende a automatizar contenido con IA.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Automatizar+Contenido', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'Automatizar Contenido 2025', description: 'Guía SEO' }
}

const pasosAutomatizacion = [
  { titulo: '1. Investigación', descripcion: 'Keywords, competencia y tendencias', herramientas: 'Ahrefs, SEMrush, Google Trends', salida: 'CSV con oportunidades' },
  { titulo: '2. Estructura', descripcion: 'Templates y outline de artículos', herramientas: 'IA + reglas de negocio', salida: 'Outline optimizado' },
  { titulo: '3. Generación', descripcion: 'Producción de contenido en masa', herramientas: 'Red Creativa Pro, ChatGPT', salida: 'Borrador optimizado' },
  { titulo: '4. Optimización', descripcion: 'SEO on-page y humanización', herramientas: 'SEO plugins, StealthWrite', salida: 'Contenido final' },
  { titulo: '5. Publicación', descripcion: 'Scheduling y distribución', herramientas: 'WordPress API, Buffer', salida: 'Publicado + distribuido' },
  { titulo: '6. Medición', descripcion: 'Trackear rankings y métricas', herramientas: 'GA4, GSC, Looker Studio', salida: 'Dashboard automático' },
]

const metricas = [
  { nombre: 'Tiempo por Artículo', tradicional: '3-4 horas', automatizado: '15-30 min', mejora: '10x más rápido' },
  { nombre: 'Costo por Artículo', tradicional: '$50-200', automatizado: '$5-20', mejora: '80% ahorro' },
  { nombre: 'Producción Mensual', tradicional: '15-30 artículos', automatizado: '100-500 artículos', mejora: '10x más' },
  { nombre: 'Consistencia', tradicional: 'Variable', automatizado: 'Estable', mejora: 'Calidad uniforme' },
]

const beneficios = [
  { titulo: 'Ahorro de Tiempo', descripcion: 'Produce 10x más contenido en el mismo tiempo', icon: Clock },
  { titulo: 'Reducción de Costos', descripcion: 'Hasta 80% menos costo por artículo', icon: BarChart },
  { titulo: 'Escalabilidad', descripcion: 'De 20 a 500 artículos sin contratar', icon: Layers },
  { titulo: 'Consistencia', descripcion: 'Mantén un ritmo de publicación constante', icon: RefreshCw },
  { titulo: 'SEO Masivo', descripcion: 'Posiciona para cientos de keywords', icon: TrendingUp },
  { titulo: 'Testing Rápido', descripcion: 'Prueba títulos y ángulos rápidamente', icon: Rocket },
]

export default function AutomatizarContenidoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Settings className="w-3 h-3 mr-1" /> Guía 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Automatizar <span className="text-primary">Contenido</span> con IA
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprende a crear sistemas automatizados para producir contenido SEO a escala. 
            Workflows completos, herramientas y estrategias para generar contenido en masa.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">Producción 10x</Badge>
            <h2 className="text-3xl font-bold mb-4">Escala tu Producción de Contenido</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Configura pipelines automatizados para generar cientos de artículos SEO 
              optimizados. Sin sacrificar calidad, ahorrando tiempo y dinero.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 10x más rápido</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 80% ahorro</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 500+ artículos/mes</div>
            </div>
            <Button size="lg" asChild><Link href="/">Configurar Pipeline <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Beneficios */}
        <h2 className="text-3xl font-bold mb-8 text-center">6 Beneficios de Automatizar Contenido</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {beneficios.map ((ben, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl"><ben.icon className="w-6 h-6 text-primary" /></div>
                <div>
                  <h3 className="font-bold mb-2">{ben.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{ben.descripcion}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline Completo */}
        <h2 className="text-3xl font-bold mb-8 text-center">Pipeline de Automatización Completo</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {pasosAutomatizacion.map ((paso, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Paso {i + 1}</Badge>
                <CardTitle className="text-lg">{paso.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{paso.descripcion}</p>
                <p className="text-xs mb-2"><strong>Herramientas:</strong> {paso.herramientas}</p>
                <p className="text-xs text-primary"><strong>Salida:</strong> {paso.salida}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparativa */}
        <h2 className="text-3xl font-bold mb-8 text-center">Tradicional vs Automatizado</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5" /> Métricas Comparativas</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricas.map ((met, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-3">{met.nombre}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tradicional:</span>
                      <span className="line-through">{met.tradicional}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Automatizado:</span>
                      <span className="font-bold text-green-600">{met.automatizado}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-primary font-medium">{met.mejora}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Herramientas Recomendadas */}
        <h2 className="text-3xl font-bold mb-8 text-center">Stack de Automatización</h2>
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <h3 className="font-bold mb-2">Investigación</h3>
                <p className="text-sm text-muted-foreground">Ahrefs, SEMrush</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <h3 className="font-bold mb-2">Generación</h3>
                <p className="text-sm text-muted-foreground">Red Creativa Pro</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <h3 className="font-bold mb-2">Publicación</h3>
                <p className="text-sm text-muted-foreground">WordPress, Buffer</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <h3 className="font-bold mb-2">Análisis</h3>
                <p className="text-sm text-muted-foreground">GA4, Looker</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para automatizar?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Configura tu pipeline de contenido automatizado y produce 
            10x más contenido sin sacrificar calidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/">Empezar Automatización <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/seo-dashboard">Ver Dashboard SEO</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
