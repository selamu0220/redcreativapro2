import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, BookOpen, Target, TrendingUp, Pen, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Copywriting en Español 2025 | Guía Completa + 50 Plantillas IA',
  description: 'Aprende copywriting en español desde cero. Técnicas AIDA, PAS, copywriting emocional y 50 plantillas con IA para escribir textos que venden. Guía actualizada con ejemplos prácticos.',
  keywords: ['copywriting en español', 'copywriting espanol', 'copywriting técnicas', 'copywriting emotional', 'copywriting ia', 'copywriting ventas', 'redaccion persuasiva', 'texto que vende'],
  alternates: { canonical: 'https://redcreativa.pro/copywriting-espanol' },
  openGraph: {
    title: 'Copywriting en Español 2025 | Guía Completa + 50 Plantillas IA',
    description: 'Aprende copywriting desde cero con técnicas probadas.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Copywriting+Español', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'Copywriting en Español 2025', description: 'Guía completa + 50 plantillas' }
}

const tecnicas = [
  { nombre: 'AIDA', descripcion: 'Atención, Interés, Deseo, Acción', ejemplo: '¿Cansado de perder clientes?', uso: 'Emails, anuncios, landing pages' },
  { nombre: 'PAS', descripcion: 'Problema, Agitación, Solución', ejemplo: 'El problema es X, sin embargo Y...', uso: 'Sales letters, videos' },
  { nombre: 'Before-After-Bridge', descripcion: 'Antes, Después, Puente', ejemplo: 'Antes X, ahora Y gracias a Z', uso: 'Testimonials, case studies' },
  { nombre: 'Copywriting Emocional', descripcion: 'Apela a emociones y sentimientos', ejemplo: 'La historia de transformation', uso: 'Storytelling, brand voice' },
  { nombre: 'Features-Benefits', descripcion: 'Características a Beneficios', ejemplo: 'X característica significa Y beneficio', uso: 'Descripciones producto' },
  { nombre: 'Star-Story-Solution', descripcion: 'Estrella-Historia-Solución', ejemplo: 'Cliente X tenía Y problema, ahora Z', uso: 'Case studies, landing' },
]

const plantillas = [
  { nombre: 'Headline Principal', categoria: 'Landing Page', palabras: 8, ejemplo: 'Como [beneficio principal] sin [problema común]' },
  { nombre: 'Gancho para Email', categoria: 'Email', palabras: 15, ejemplo: '3 razones por las que [audiencia]' },
  { nombre: 'Descripción Producto', categoria: 'eCommerce', palabras: 50, ejemplo: 'Transforma [estado actual] en [estado deseado]' },
  { nombre: 'Post LinkedIn', categoria: 'Redes', palabras: 100, ejemplo: 'La mayoría creen que [mito]...' },
  { nombre: 'Anuncio Facebook', categoria: 'Ads', palabras: 25, ejemplo: 'Obtén [beneficio] por solo [precio]' },
  { nombre: 'Sales Letter', categoria: 'Venta', palabras: 200, ejemplo: '¿Qué pasarías si pudieras [beneficio]?' },
]

export default function CopywritingEspanolPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <BookOpen className="w-3 h-3 mr-1" /> Guía Completa 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Copywriting en <span className="text-primary">Español</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Domina el arte de escribir textos que venden. Aprende las técnicas más efectivas, 
            accede a 50+ plantillas con IA y convierte más visitantes en clientes.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">Plantillas Incluidas</Badge>
            <h2 className="text-3xl font-bold mb-4">Escribe Copy que Convierte con IA</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nuestras plantillas de copywriting están optimizadas para español y funcionan 
              con cualquier IA. Solo completa los espacios y listo.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Técnicas AIDA, PAS, BAB</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 50+ Plantillas listas</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Ejemplos en español</div>
            </div>
            <Button size="lg" asChild><Link href="/">Acceder a Plantillas <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Técnicas de Copywriting */}
        <h2 className="text-3xl font-bold mb-8 text-center">Las 6 Técnicas de Copywriting Más Efectivas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tecnicas.map((tec, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">{tec.nombre}</Badge>
                <CardTitle className="text-lg">{tec.descripcion}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 italic">"{tec.ejemplo}"</p>
                <p className="text-sm"><strong>Mejor para:</strong> {tec.uso}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plantillas con IA */}
        <h2 className="text-3xl font-bold mb-8 text-center">50+ Plantillas de Copywriting para IA</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle>Plantillas Populares con IA</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantillas.map((plant, i) => (
                <div key={i} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{plant.categoria}</Badge>
                    <span className="text-xs text-muted-foreground">{plant.palabras} palabras</span>
                  </div>
                  <p className="text-sm mb-2">{plant.nombre}</p>
                  <p className="text-xs text-muted-foreground italic">"{plant.ejemplo}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Elementos del Copy */}
        <h2 className="text-3xl font-bold mb-8 text-center">Elementos de un Copy Persuasivo</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Elementos de Atracción</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span><strong>Headline:</strong> El gancho principal que captura atención</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span><strong>Subheadline:</strong> Refuerza el beneficio principal</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span><strong>Foto/Grafico:</strong> Visual que ilustra el beneficio</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span><strong>Bullets:</strong> Beneficios en lista fácil de leer</span></li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Elementos de Conversión</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span><strong>CTA:</strong> Llamada a la acción clara</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span><strong>Urgencia:</strong> Plazo o escasez</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span><strong>Garantía:</strong> Reducción de riesgo</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span><strong>Prueba social:</strong> Testimonials, números</span></li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para escribir copy que vende?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Accede a todas nuestras plantillas de copywriting optimizadas para español 
            y genera textos persuasivos en segundos con IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/">Probar Gratis <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/prompts/copywriting-ventas">Ver Todas las Plantillas</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
