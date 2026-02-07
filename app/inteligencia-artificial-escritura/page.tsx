import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Brain, Pen, FileText, BookOpen, TrendingUp, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Inteligencia Artificial para Escritura 2025 | Guía Completa',
  description: 'Domina la inteligencia artificial para escribir mejor y más rápido. Herramientas, técnicas y estrategias para generar contenido profesional con IA. Todo lo que necesitas saber.',
  keywords: ['inteligencia artificial escritura', 'ia para escribir', 'herramientas ia escritor', 'software escritura ia', 'escritor artificial', 'redaccion automatizada', 'contenido ia', 'chatgpt escritura'],
  alternates: { canonical: 'https://redcreativa.pro/inteligencia-artificial-escritura' },
  openGraph: {
    title: 'Inteligencia Artificial para Escritura 2025 | Guía Completa',
    description: 'Todo sobre IA para escribir mejor y más rápido.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=IA+Escritura', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'IA para Escritura 2025', description: 'Guía completa' }
}

const tiposEscritura = [
  { nombre: 'Artículos de Blog', descripcion: 'Posts SEO optimizados para posicionar', tiempo: '5-15 min', palabras: '1000-3000' },
  { nombre: 'Emails Marketing', descripcion: 'Secuencias, newsletters y campañas', tiempo: '2-5 min', palabras: '100-300' },
  { nombre: 'Copywriting', descripcion: 'Landing pages, anuncios y sales letters', tiempo: '10-20 min', palabras: '500-2000' },
  { nombre: 'Redes Sociales', descripcion: 'Posts, captions y threads', tiempo: '1-3 min', palabras: '50-500' },
  { nombre: 'Guiones Video', descripcion: 'YouTube, TikTok, Reels y shorts', tiempo: '10-30 min', palabras: '500-2000' },
  { nombre: 'Documentos', descripcion: 'Reports, propuestas y documentación', tiempo: '15-45 min', palabras: '1000-5000' },
]

const herramientas = [
  { nombre: 'Red Creativa Pro', tipo: 'Especialista Español', precio: 'Gratis', caracteristica: 'SEO automático + español nativo' },
  { nombre: 'ChatGPT', tipo: 'General', precio: 'Gratis', caracteristica: 'Versatil y popular' },
  { nombre: 'Claude', tipo: 'Análisis Profundo', precio: '$20', caracteristica: 'Contexto largo 200K tokens' },
  { nombre: 'Jasper', tipo: 'Marketing', precio: '$49', caracteristica: 'Templates especializados' },
  { nombre: 'Copy.ai', tipo: 'Copywriting', precio: '$36', caracteristica: 'Workflows automatizados' },
  { nombre: 'Writesonic', tipo: 'SEO', precio: '$19', caracteristica: 'Integración SERP' },
]

const beneficios = [
  { titulo: '3x Más Rápido', descripcion: 'Genera contenido en minutos en lugar de horas', icon: Zap },
  { titulo: 'Calidad Consistente', descripcion: 'Mantén un nivel uniforme en todo tu contenido', icon: TrendingUp },
  { titulo: 'SEO Optimizado', descripcion: 'Keywords y estructura optimizadas automáticamente', icon: Globe },
  { titulo: 'Sin Bloqueo', descripcion: 'Nunca más enfrentado a la página en blanco', icon: BookOpen },
  { titulo: 'Multilingüe', descripcion: 'Escribe en múltiples idiomas simultáneamente', icon: Brain },
  { titulo: 'Ahorro Económico', descripcion: 'Reduce costos de redacción hasta 80%', icon: Star },
]

export default function IAEscrituraPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Brain className="w-3 h-3 mr-1" /> Guía 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Inteligencia Artificial para <span className="text-primary">Escritura</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre cómo la IA está revolucionando la escritura. Aprende a usar herramientas 
            de inteligencia artificial para crear contenido profesional, SEO optimizado y persuasivo.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600"> #1 en Español </Badge>
            <h2 className="text-3xl font-bold mb-4">Escribe Mejor con IA</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Red Creativa Pro es la herramienta de IA más completa para escritores hispanohablantes. 
              Escritura nativa, SEO automático y 100% gratis.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Español nativo</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> SEO automático</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Templates 50+</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 100% gratis</div>
            </div>
            <Button size="lg" asChild><Link href="/">Probar Gratis <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Beneficios */}
        <h2 className="text-3xl font-bold mb-8 text-center">6 Beneficios de Usar IA para Escribir</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {beneficios.map((ben, i) => (
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

        {/* Tipos de Escritura */}
        <h2 className="text-3xl font-bold mb-8 text-center">Tipos de Contenido que Puedes Crear</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><Pen className="w-5 h-5" /> Con IA puedes escribir...</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiposEscritura.map ((tipo, i) => (
                <div key={i} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold">{tipo.nombre}</h3>
                    <Badge variant="secondary">{tipo.tiempo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{tipo.descripcion}</p>
                  <p className="text-xs text-primary">{tipo.palabras} palabras</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Herramientas */}
        <h2 className="text-3xl font-bold mb-8 text-center">Mejores Herramientas IA para Escritura</h2>
        <Card className="mb-16 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Herramienta</th>
                  <th className="text-left p-4">Tipo</th>
                  <th className="text-left p-4">Precio</th>
                  <th className="text-left p-4">Característica</th>
                </tr>
              </thead>
              <tbody>
                {herramientas.map ((her, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4 font-bold">{her.nombre}</td>
                    <td className="p-4">{her.tipo}</td>
                    <td className="p-4">{her.precio}</td>
                    <td className="p-4 text-muted-foreground">{her.caracteristica}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para escribir con IA?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Descubre la herramienta de IA más completa para escritores hispanohablantes. 
            Empieza gratis hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/">Empezar Gratis <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/mejores-herramientas-ia-escritura">Ver Ranking</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
