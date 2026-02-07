import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Pen, FileText, BookOpen, MessageCircle, Video, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Escritor IA Gratis | Crea Contenido en Español Sin Pagar 2025',
  description: 'Usa el mejor escritor de inteligencia artificial gratis. Genera artículos, emails, blogs y copy con IA en español. Sin límites, sin registro obligatorio. Empieza ahora.',
  keywords: ['escritor ia gratis', 'escritor inteligencia artificial', 'ia para escribir', 'generador texto ia', 'redactor ia gratuito', 'chatgpt español', 'escritor automatico', 'crear contenido ia'],
  alternates: { canonical: 'https://redcreativa.pro/escritor-ia-gratis' },
  openGraph: {
    title: 'Escritor IA Gratis | Crea Contenido en Español Sin Pagar 2025',
    description: 'Genera contenido con IA sin pagar nada.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Escritor+IA+Gratis', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'Escritor IA Gratis 2025', description: 'Crea contenido sin pagar' }
}

const caracteristicas = [
  { titulo: '100% Español Nativo', descripcion: 'Escribe como un hispanohablante natural, no una traducción robótica', icon: MessageCircle },
  { titulo: 'SEO Automático', descripcion: 'Cada texto se optimiza automáticamente para Google', icon: FileText },
  { titulo: '50+ Plantillas', descripcion: 'Emails, blogs, redes sociales, landing pages... todo incluido', icon: BookOpen },
  { titulo: 'StealthWrite™', descripcion: 'Contenido indetectable por detectores de IA', icon: Zap },
  { titulo: 'Corrector Integrado', descripcion: 'Gramática, ortografía y estilo en tiempo real', icon: Pen },
  { titulo: 'Sin Límites', descripcion: 'Genera todo el contenido que necesites', icon: Star },
]

const usos = [
  { categoria: 'Artículos de Blog', ejemplo: 'Escribe posts SEO optimizados en minutos', keywords: 'blog ia gratis' },
  { categoria: 'Emails Marketing', ejemplo: 'Secuencias completas con copy que convierte', keywords: 'email ia gratis' },
  { categoria: 'Redes Sociales', ejemplo: 'Posts para LinkedIn, Instagram, Twitter', keywords: 'posts ia gratis' },
  { categoria: 'Copywriting', ejemplo: 'Landing pages, anuncios, sales letters', keywords: 'copywriting ia gratis' },
  { categoria: 'Videos', ejemplo: 'Guiones para YouTube, TikTok, Reels', keywords: 'guion ia gratis' },
  { categoria: 'Descripciones', ejemplo: 'Productos, servicios, carteras', keywords: 'descripciones ia gratis' },
]

export default function EscritorIAGratisPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-500/10 text-green-600" variant="outline"> <Zap className="w-3 h-3 mr-1" /> 100% Gratis </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-primary">Escritor IA</span> Gratis en Español
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Genera contenido profesional en segundos. Artículos, emails, blogs, copy... 
            Todo lo que necesitas para escribir mejor y más rápido, sin pagar nada.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Empieza a Escribir con IA Ahora</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Sin registro obligatorio, sin tarjeta de crédito, sin límites. 
              El mejor escritor IA completamente gratis para hispanohablantes.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Sin registro</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Ilimitado</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Español nativo</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> SEO incluido</div>
            </div>
            <Button size="lg" className="px-8" asChild><Link href="/">Usar Escritor IA Gratis <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
            <p className="text-xs text-muted-foreground mt-4">No requiere registro • Sin tarjeta • Sin límites</p>
          </CardContent>
        </Card>

        {/* Características */}
        <h2 className="text-3xl font-bold mb-8 text-center">¿Qué Puede Hacer Este Escritor IA?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {caracteristicas.map((carac, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl"><carac.icon className="w-6 h-6 text-primary" /></div>
                <div>
                  <h3 className="font-bold mb-2">{carac.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{carac.descripcion}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Usos */}
        <h2 className="text-3xl font-bold mb-8 text-center">Genera Cualquier Tipo de Contenido</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle>Plantillas Incluidas</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usos.map((uso, i) => (
                <div key={i} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <Badge variant="outline" className="mb-2">{uso.categoria}</Badge>
                  <p className="text-sm mb-2">{uso.ejemplo}</p>
                  <p className="text-xs text-primary">{uso.keywords}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparativa */}
        <h2 className="text-3xl font-bold mb-8 text-center">Gratis vs Otras Herramientas</h2>
        <Card className="mb-16 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Característica</th>
                  <th className="text-center p-4 text-primary">Nuestro Escritor IA</th>
                  <th className="text-center p-4">ChatGPT Free</th>
                  <th className="text-center p-4"> Jasper</th>
                  <th className="text-center p-4"> Copy.ai</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="p-4">Español nativo</td><td className="text-center text-green-600 font-bold">✓ Sí</td><td className="text-center">Traducción</td><td className="text-center">Limitado</td><td className="text-center">Limitado</td></tr>
                <tr className="border-b"><td className="p-4">SEO automático</td><td className="text-center text-green-600 font-bold">✓ Sí</td><td className="text-center">✗ No</td><td className="text-center">✓ Sí</td><td className="text-center">✓ Sí</td></tr>
                <tr className="border-b"><td className="p-4">Plantillas</td><td className="text-center text-green-600 font-bold">50+</td><td className="text-center">0</td><td className="text-center">50+</td><td className="text-center">90+</td></tr>
                <tr className="border-b"><td className="p-4">Precio</td><td className="text-center text-green-600 font-bold">Gratis</td><td className="text-center">Gratis</td><td className="text-center">$49/mes</td><td className="text-center">$36/mes</td></tr>
                <tr><td className="p-4">Registro</td><td className="text-center text-green-600 font-bold">Opcional</td><td className="text-center">Requerido</td><td className="text-center">Requerido</td><td className="text-center">Requerido</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">El Mejor Escritor IA... y es Gratis</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            ¿Para qué pagar si puedes escribir mejor y más rápido gratis? 
            Empieza ahora, sin registros, sin compromisos.
          </p>
          <Button size="lg" className="px-8" asChild><Link href="/">Ir al Escritor IA Gratis <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
        </div>
      </div>
    </main>
  )
}
