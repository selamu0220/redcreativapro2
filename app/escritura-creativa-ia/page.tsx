import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Pen, BookOpen, Sparkles, Heart, Lightbulb, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Escritura Creativa con IA 2025 | Técnicas y Herramientas',
  description: 'Domina la escritura creativa con inteligencia artificial. Aprende técnicas narrativas, storytelling, creación de personajes y plot twist usando IA. Guía completa para escritores.',
  keywords: ['escritura creativa ia', 'ia para escritores', 'storytelling ia', 'crear personajes ia', 'narrativa artificial', 'creatividad ia', 'escritura ficcion ia', 'novelas ia'],
  alternates: { canonical: 'https://redcreativa.pro/escritura-creativa-ia' },
  openGraph: {
    title: 'Escritura Creativa con IA 2025 | Técnicas y Herramientas',
    description: 'Aprende escritura creativa con IA.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Escritura+Creativa+IA', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'Escritura Creativa con IA 2025', description: 'Técnicas y herramientas' }
}

const tecnicas = [
  { titulo: 'Brainstorming', descripcion: 'Genera ideas, conceptos y premisas originales', uso: 'Cuando necesitas un punto de partida', ia: 'Claude, ChatGPT' },
  { titulo: 'Desarrollo de Personajes', descripcion: 'Crea backstories, motivaciones y personalidades', uso: 'Novelas, guiones, juegos narrativos', ia: 'Claude' },
  { titulo: 'Worldbuilding', descripcion: 'Construye mundos consistentes con reglas', uso: 'Fantasía, ciencia ficción', ia: 'Claude, ChatGPT' },
  { titulo: 'Outline de Historia', descripcion: 'Estructura actos, arcos y plot points', uso: 'Planificación de narrativas', ia: 'Claude' },
  { titulo: 'Diálogos', descripcion: 'Escribe conversaciones naturales y memorables', uso: 'Escenas de diálogo', ia: 'ChatGPT' },
  { titulo: 'Descripciones', descripcion: 'Crea escenas vívidas y envolventes', uso: 'Setting, atmósfera', ia: 'Claude' },
]

const generos = [
  { nombre: 'Novela Romántica', descripcion: 'Historias de amor con tensión emocional', claves: 'Química, conflicto, final feliz' },
  { nombre: 'Thriller/Misterio', descripcion: 'Suspenso con giros inesperados', claves: 'Clues, red herrings, revelación' },
  { nombre: 'Ciencia Ficción', descripcion: 'Futuro especulativo y tecnológico', claves: ' worldbuilding, tecnología, sociedad' },
  { nombre: 'Fantasía', descripcion: 'Mundos mágicos y heroicos', claves: 'Magia, mitología, aventura' },
  { nombre: 'Literaturall', descripcion: 'Narrativa introspectiva', claves: 'Profundidad psicológica' },
  { nombre: 'Guion/ Cómic', descripcion: 'Formato visual narrativo', claves: 'Visual storytelling, diálogos cortos' },
]

const herramientas = [
  { nombre: 'Sudowrite', tipo: 'Especializado ficción', pros: 'Excelente para novelas, muy fácil', precio: '$10-35/mes' },
  { nombre: 'NovelAI', tipo: 'Narrativa IA', pros: 'Genera imágenes + texto', precio: '$10-25/mes' },
  { nombre: 'ChatGPT', tipo: 'General', pros: 'Versatil, económico', precio: '$0-20/mes' },
  { nombre: 'Claude', tipo: 'Análisis profundo', pros: 'Excelente worldbuilding', precio: '$20/mes' },
  { nombre: 'Rytr', tipo: 'Presupuesto', pros: 'Barato y funcional', precio: '$9/mes' },
]

export default function EscrituraCreativaIAPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Sparkles className="w-3 h-3 mr-1" /> Guía 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Escritura Creativa con <span className="text-primary">IA</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprende a usar inteligencia artificial para potenciar tu creatividad. 
            Técnicas narrativas, storytelling y herramientas especializadas para escritores.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">Incluye Técnicas</Badge>
            <h2 className="text-3xl font-bold mb-4">Potencia Tu Creatividad con IA</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Descubre cómo usar ChatGPT, Claude y herramientas especializadas 
              para escribir mejores historias, personajes y diálogos memorables.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Storytelling</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Personajes</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Worldbuilding</div>
            </div>
            <Button size="lg" asChild><Link href="/">Empezar a Escribir <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Técnicas */}
        <h2 className="text-3xl font-bold mb-8 text-center">6 Técnicas de Escritura Creativa con IA</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tecnicas.map ((tec, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" />{tec.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{tec.descripcion}</p>
                <p className="text-xs mb-2"><strong>Uso:</strong> {tec.uso}</p>
                <p className="text-xs text-primary"><strong>Mejor IA:</strong> {tec.ia}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Géneros */}
        <h2 className="text-3xl font-bold mb-8 text-center">IA para Cada Género</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Géneros y Sus Claves</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generos.map ((gen, i) => (
                <div key={i} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <h3 className="font-bold mb-2">{gen.nombre}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{gen.descripcion}</p>
                  <p className="text-xs"><strong>Claves:</strong> {gen.claves}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Herramientas */}
        <h2 className="text-3xl font-bold mb-8 text-center">Herramientas Recomendadas</h2>
        <Card className="mb-16 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Herramienta</th>
                  <th className="text-left p-4">Tipo</th>
                  <th className="text-left p-4">Pros</th>
                  <th className="text-left p-4">Precio</th>
                </tr>
              </thead>
              <tbody>
                {herramientas.map ((herr, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4 font-bold">{herr.nombre}</td>
                    <td className="p-4">{herr.tipo}</td>
                    <td className="p-4 text-muted-foreground">{herr.pros}</td>
                    <td className="p-4">{herr.precio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Tips */}
        <h2 className="text-3xl font-bold mb-8 text-center">5 Tips para IA en Escritura Creativa</h2>
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold text-sm">Sé Específico</h3>
                <p className="text-xs text-muted-foreground">Dale contexto a la IA</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold text-sm">Itera</h3>
                <p className="text-xs text-muted-foreground">Mejora el primer borrador</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <Pen className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold text-sm">Edita</h3>
                <p className="text-xs text-muted-foreground">Tu voz es única</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold text-sm">Mezcla</h3>
                <p className="text-xs text-muted-foreground">Combina ideas de IA</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold text-sm">Experimenta</h3>
                <p className="text-xs text-muted-foreground">Prueba diferentes IAs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para escribir tu historia?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Usa IA como tu asistente creativo. Desarrolla personajes, 
            construye mundos y escribe historias memorables.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/">Empezar a Escribir <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/prompt-engineering">Aprender Prompts</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
