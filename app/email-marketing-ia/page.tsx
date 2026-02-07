import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Mail, Send, Users, TrendingUp, MousePointer, Inbox, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Email Marketing con IA 2025 | Guía + 50 Templates que Convierten',
  description: 'Domina el email marketing con inteligencia artificial. Aprende a crear secuencias, newsletters y campañas que abren, leen y convierten. 50+ templates con IA para automatizar.',
  keywords: ['email marketing ia', 'automatizar emails ia', 'secuencias email ia', 'newsletter ia', 'copywriting email', 'cold outreach ia', 'email automation', 'plantillas email marketing'],
  alternates: { canonical: 'https://redcreativa.pro/email-marketing-ia' },
  openGraph: {
    title: 'Email Marketing con IA 2025 | Guía + 50 Templates que Convierten',
    description: 'Domina email marketing con inteligencia artificial.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Email+Marketing+IA', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'Email Marketing con IA 2025', description: 'Guía + 50 templates' }
}

const tiposEmail = [
  { nombre: 'Cold Outreach', descripcion: 'Emails a prospectos fríos que nunca te conocieron', apertura: '20-30%', conversion: '1-3%', plantilla: 'cold-prospect' },
  { nombre: 'Lead Nurturing', descripcion: 'Secuencias para educar y enamorar leads', apertura: '35-45%', conversion: '3-8%', plantilla: 'lead-nurture' },
  { nombre: 'Welcome Series', descripcion: 'Bienvenida a nuevos suscriptores', apertura: '50-60%', conversion: '10-15%', plantilla: 'welcome' },
  { nombre: 'Carrito Abandonado', descripcion: 'Recuperación de ventas perdidas', apertura: '40-50%', conversion: '5-10%', plantilla: 'abandoned-cart' },
  { nombre: 'Newsletter', descripcion: 'Contenido regular para tu audiencia', apertura: '25-35%', conversion: '2-5%', plantilla: 'newsletter' },
  { nombre: 'Re-engagement', descripcion: 'Ganar de vuelta suscriptores inactivos', apertura: '15-25%', conversion: '1-3%', plantilla: 're-engage' },
]

const metricas = [
  { nombre: 'Tasa de Apertura', descripcion: 'Porcentaje que abre el email', benchmark: '21.5%', ia: '40%+' },
  { nombre: 'Tasa de Clicks', descripcion: 'CTR del email', benchmark: '2.6%', ia: '5%+' },
  { nombre: 'Tasa de Conversión', descripcion: 'Acciones completadas', benchmark: '1-3%', ia: '5-8%' },
  { nombre: 'Unsubscribe Rate', descripcion: 'Personas que se dan de baja', benchmark: '0.5%', ia: '0.2%' },
]

export default function EmailMarketingIAPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Mail className="w-3 h-3 mr-1" /> Guía Completa 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Email Marketing con <span className="text-primary">Inteligencia Artificial</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprende a crear emails que abren, leen y convierten usando IA. 
            50+ templates listos para usar, secuencias automáticas y estrategias comprovadas.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">50+ Templates IA</Badge>
            <h2 className="text-3xl font-bold mb-4">Crea Emails que Convierten Automáticamente</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nuestras templates de email marketing están optimizadas para español y 
              funcionan con cualquier plataforma: Mailchimp, Sendinblue, HubSpot...
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> cold outreach</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> lead nurturing</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> carrito abandonado</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> newsletters</div>
            </div>
            <Button size="lg" asChild><Link href="/correos-ia">Acceder a Templates <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Tipos de Email */}
        <h2 className="text-3xl font-bold mb-8 text-center">Tipos de Email con IA</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tiposEmail.map((tipo, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Send className="w-5 h-5 text-primary" />{tipo.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{tipo.descripcion}</p>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Apertura:</span>
                  <span className="font-medium text-green-600">{tipo.apertura}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conversión:</span>
                  <span className="font-medium">{tipo.conversion}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Métricas */}
        <h2 className="text-3xl font-bold mb-8 text-center">Métricas: Benchmark vs Con IA</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Mejora tus Números</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricas.map((met, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">{met.nombre}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{met.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Benchmark</p>
                      <p className="font-bold">{met.benchmark}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <div className="text-center">
                      <p className="text-xs text-green-600">Con IA</p>
                      <p className="font-bold text-green-600">{met.ia}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estructura Email */}
        <h2 className="text-3xl font-bold mb-8 text-center">Estructura de un Email Perfecto</h2>
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Inbox className="w-5 h-5" /> Asunto (Subject Line)</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>6-10 palabras máximo</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Evita spam words (gratis, urgentemente)</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Personaliza con nombre si es posible</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Usa números o preguntas</span></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Archive className="w-5 h-5" /> Cuerpo del Email</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>3-4 oraciones máximo</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Un solo call-to-action</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Firma personalizada</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Versión texto plano como backup</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para emails que convierten?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Accede a 50+ templates de email marketing optimizadas para español 
            y genera secuencias completas en minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/correos-ia">Ver Templates de Email <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/">Probar Gratis</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
