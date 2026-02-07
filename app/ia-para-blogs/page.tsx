import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, FileText, Search, TrendingUp, Globe, Pen, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'IA para Blogs 2025 | Escribe Posts que Posicionan +50 Plantillas',
  description: 'Aprende a usar IA para escribir blogs que posicionan en Google. Templates SEO, keyword research, estructura de artículo y optimización. Genera posts profesionales en minutos.',
  keywords: ['ia para blogs', 'escribir blogs con ia', 'posts seo ia', 'blogging ia', 'articulos blog ia', 'redaccion blog', 'contenido blog seo', 'plantillas blog ia'],
  alternates: { canonical: 'https://redcreativa.pro/ia-para-blogs' },
  openGraph: {
    title: 'IA para Blogs 2025 | Escribe Posts que Posicionan',
    description: 'Aprende a escribir blogs con IA.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=IA+Blogs', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'IA para Blogs 2025', description: 'Posts que posicionan' }
}

const estructura = [
  { parte: 'Título SEO', descripcion: 'Include keyword principal, 60 caracteres', ejemplo: '10 Herramientas IA para Marketing 2025' },
  { parte: 'Introducción', descripcion: 'Gancho + problema + solución, 150 palabras', ejemplo: '¿Cansado de crear contenido manualmente?' },
  { parte: 'H2 Principal', descripcion: 'Keywords secundarias, estructura lógica', ejemplo: '1. Herramientas de Escritura IA' },
  { parte: 'Subsecciones H3', descripcion: 'Profundizar cada punto, 300-500 palabras', ejemplo: '1.1 Red Creativa Pro' },
  { parte: 'Conclusión', descripcion: 'Resumen + CTA, 100 palabras', ejemplo: 'En resumen, estas herramientas son...' },
]

const tiposPost = [
  { nombre: 'Tutorial Paso a Paso', descripcion: 'Guía detallada con instrucciones', palabras: '2000-3000', seo: 'Alto' },
  { nombre: 'Listicle', descripcion: 'Lista de herramientas o consejos', palabras: '1500-2500', seo: 'Muy alto' },
  { nombre: 'Comparativa', descripcion: 'Análisis A vs B vs C', palabras: '2000-3000', seo: 'Alto' },
  { nombre: ' case Study', descripcion: 'Historia de éxito con datos', palabras: '1500-2500', seo: 'Medio' },
  { nombre: 'Opinión/Editorial', descripcion: 'Pers sobre tema actual', palabras: '1000-1500', seo: 'Medio' },
  { nombre: 'Glosario/Definición', descripcion: 'Explicación de términos', palabras: '1000-2000', seo: 'Alto' },
]

const plantillas = [
  { titulo: 'Post Listicle', estructura: 'Introducción → Lista de 10 puntos → Conclusión', uso: 'Mejores herramientas, consejos' },
  { titulo: 'Tutorial Completo', estructura: 'Intro → Prerequisites → Paso 1-10 → Conclusión', uso: 'Guias detalladas' },
  { titulo: 'Comparativa A vs B', estructura: 'Intro → Criterios → Análisis A → Análisis B → Veredicto', uso: 'Productos servicios' },
  { titulo: 'Post SEO Básico', estructura: 'Intro → H2s → Conclusión', uso: 'Posts informativos' },
]

export default function IAParaBlogsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <FileText className="w-3 h-3 mr-1" /> Guía 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            IA para <span className="text-primary">Blogs</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprende a escribir posts de blog que posicionan en Google usando inteligencia artificial. 
            Templates SEO, estructura óptima y +50 plantillas listas para usar.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">50+ Plantillas</Badge>
            <h2 className="text-3xl font-bold mb-4">Escribe Posts que Posicionan</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nuestras plantillas de blog están optimizadas para SEO. 
              Keywords, estructura, longitud... todo incluido.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> SEO optimizado</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Estructura completa</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Keywords incluidas</div>
            </div>
            <Button size="lg" asChild><Link href="/prompts/articulos-blog">Ver Plantillas <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Estructura SEO */}
        <h2 className="text-3xl font-bold mb-8 text-center">Estructura de un Post SEO</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><Search className="w-5 h-5" /> Estructura Optimizada</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {estructura.map ((item, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2 text-primary">{item.parte}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{item.descripcion}</p>
                  <p className="text-xs italic">"{item.ejemplo}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Post */}
        <h2 className="text-3xl font-bold mb-8 text-center">Tipos de Post para Blog</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tiposPost.map ((tipo, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold">{tipo.nombre}</h3>
                  <Badge variant={tipo.seo === 'Muy alto' ? 'default' : 'secondary'}>{tipo.seo} SEO</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{tipo.descripcion}</p>
                <p className="text-xs text-primary"><strong>Longitud:</strong> {tipo.palabras} palabras</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plantillas */}
        <h2 className="text-3xl font-bold mb-8 text-center">Plantillas de Blog</h2>
        <Card className="mb-16 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Plantilla</th>
                  <th className="text-left p-4">Estructura</th>
                  <th className="text-left p-4">Mejor Para</th>
                </tr>
              </thead>
              <tbody>
                {plantillas.map ((plantilla, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4 font-bold">{plantilla.titulo}</td>
                    <td className="p-4 text-muted-foreground">{plantilla.estructura}</td>
                    <td className="p-4">{plantilla.uso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Checklist SEO */}
        <h2 className="text-3xl font-bold mb-8 text-center">Checklist SEO para Cada Post</h2>
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Pen className="w-5 h-5" /> Contenido</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Keyword principal en título H1</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>1500+ palabras para posts largos</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>3-5 H2 con keywords secundarias</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Imágenes con alt text keywords</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Internal linking a otros posts</span></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Globe className="w-5 h-5" /> Técnico</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Meta description con CTA (155 car)</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>URL corta con keyword</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Schema Article markup</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Imágenes comprimidas (WebP)</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Links externos a fuentes权威</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para blogs que posicionan?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Accede a 50+ plantillas de blog optimizadas para SEO 
            y genera posts profesionales en minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/prompts/articulos-blog">Ver Plantillas <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/">Probar Gratis</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
