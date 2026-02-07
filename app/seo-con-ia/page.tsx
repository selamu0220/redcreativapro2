import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Search, TrendingUp, Target, FileText, Globe, BarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'SEO con IA 2025 | Guía Completa para Posicionar en Google',
  description: 'Aprende a usar inteligencia artificial para SEO. Keyword research, meta descriptions, artículos optimizados y auditoría SEO con IA. Guía actualizada con herramientas y estrategias.',
  keywords: ['seo con ia', 'seo inteligencia artificial', 'posicionar google ia', 'keyword research ia', 'meta description ia', 'seo automatico', 'posicionamiento web ia', 'auditoria seo ia'],
  alternates: { canonical: 'https://redcreativa.pro/seo-con-ia' },
  openGraph: {
    title: 'SEO con IA 2025 | Guía Completa para Posicionar en Google',
    description: 'Domina SEO usando inteligencia artificial.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=SEO+con+IA', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'SEO con IA 2025', description: 'Guía completa para posicionar en Google' }
}

const pasosSEO = [
  { titulo: 'Investigación de Keywords', descripcion: 'Encuentra palabras clave con alto volumen y baja competencia usando IA', herramientas: 'Cluster de keywords, long-tail, preguntas', tiempo: '30-60 min' },
  { titulo: 'Análisis de Competencia', descripcion: 'Estudia qué posicionan tus competidores y encuentra gaps', herramientas: 'SERP analysis, content gaps', tiempo: '45 min' },
  { titulo: 'Optimización On-Page', descripcion: 'Mejora titles, meta descriptions, headings y contenido', herramientas: 'SEO checklist, rewrite tools', tiempo: '1-2 horas' },
  { titulo: 'Creación de Contenido', descripcion: 'Escribe artículos optimizados que posicionen y conviertan', herramientas: 'AI writers, SEO templates', tiempo: '2-4 horas' },
  { titulo: 'Link Building', descripcion: 'Genera backlinks automáticos y outreach personalizado', herramientas: 'Email templates, outreach IA', tiempo: 'Variable' },
  { titulo: 'Auditoría y Mejora', descripcion: 'Monitorea rankings y optimiza continuamente', herramientas: 'SEO dashboard, rank tracking', tiempo: 'Semanal' },
]

const herramientasSEO = [
  { nombre: 'Research de Keywords', descripcion: 'Encuentra miles de keywords en minutos', ejemplo: '"mejores herramientas ia escritura"' },
  { nombre: 'Meta Descriptions', descripcion: 'Genera meta descriptions optimizadas', ejemplo: '155 caracteres con CTA' },
  { nombre: 'Artículos SEO', descripcion: 'Escribe posts que posicionan', ejemplo: '1500+ palabras E-E-A-T' },
  { nombre: 'Auditorías', descripcion: 'Analiza tu sitio automáticamente', ejemplo: '100+ puntos de verificación' },
  { nombre: 'Outreach Emails', descripcion: 'Crea emails de link building personalizados', ejemplo: '50+ templates' },
  { nombre: 'Schema Markup', descripcion: 'Genera JSON-LD automáticamente', ejemplo: 'Article, FAQ, Product' },
]

export default function SEOConIAPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Search className="w-3 h-3 mr-1" /> Guía SEO 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            SEO con <span className="text-primary">Inteligencia Artificial</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprende a posicionar tu web en Google usando IA. Desde keyword research 
            hasta contenido optimizado. Estrategias comprovadas para 2025.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">SEO Automático</Badge>
            <h2 className="text-3xl font-bold mb-4">Posiciona 3x Más Rápido con IA</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nuestra tecnología analiza tu contenido y lo optimiza automáticamente 
              para Google. Keywords, meta tags, headings... todo optimizado.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Keyword research automático</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Meta descriptions optimizadas</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Contenido E-E-A-T compliant</div>
            </div>
            <Button size="lg" asChild><Link href="/">Probar SEO Automático <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Pasos del SEO */}
        <h2 className="text-3xl font-bold mb-8 text-center">Los 6 Pasos del SEO con IA</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {pasosSEO.map((paso, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Paso {i + 1}</Badge>
                <CardTitle className="text-lg">{paso.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{paso.descripcion}</p>
                <div className="flex justify-between text-sm">
                  <span><strong>Tools:</strong> {paso.herramientas.split(',')[0]}</span>
                  <span className="text-muted-foreground">{paso.tiempo}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Herramientas SEO */}
        <h2 className="text-3xl font-bold mb-8 text-center">Herramientas SEO con IA</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5" /> Suite SEO Completa</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {herramientasSEO.map((tool, i) => (
                <div key={i} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <h3 className="font-bold mb-2">{tool.nombre}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{tool.descripcion}</p>
                  <p className="text-xs text-primary italic">"{tool.ejemplo}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checklist SEO */}
        <h2 className="text-3xl font-bold mb-8 text-center">Checklist SEO para Cada Artículo</h2>
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> On-Page</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Title tag con keyword principal (60 car)</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Meta description atractiva (155 car)</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>H1 único con keyword</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>H2, H3 con keywords secundarias</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Contenido 1500+ palabras</span></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Globe className="w-5 h-5" /> Técnico</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>URL limpia con keyword</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Imágenes con alt text</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Internal linking estructurado</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Schema markup JSON-LD</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Velocidad de carga rápida</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para posicionar en Google?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Optimiza todo tu contenido para SEO con inteligencia artificial. 
            Keywords, meta tags, headings... todo automáticamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/">Empezar Gratis <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/seo-dashboard">Ver Dashboard SEO</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
