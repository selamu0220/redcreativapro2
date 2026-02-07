import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, BookOpen, MessageCircle, FileText, Send, Globe, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Guía ChatGPT en Español 2025 | Tutorial Completo para Principiantes',
  description: 'Aprende a usar ChatGPT desde cero en español. Tutorial completo con ejemplos, prompts efectivos y consejos avanzados para dominar la IA.',
  keywords: ['chatgpt en español', 'tutorial chatgpt', 'como usar chatgpt', 'chatgpt para principiantes', 'guía chatgpt', 'prompts chatgpt español', 'chatgpt avanzado'],
  alternates: { canonical: 'https://redcreativa.pro/guia-chatgpt-espanol' },
  openGraph: {
    title: 'Guía ChatGPT en Español 2025 | Tutorial Completo',
    description: 'Aprende a usar ChatGPT desde cero.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=ChatGPT+Español', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'Guía ChatGPT en Español 2025', description: 'Tutorial completo' }
}

const pasos = [
  { titulo: '1. Crea tu Cuenta', descripcion: 'Regístrate en openai.com con email o Google', tiempo: '5 minutos', nivel: 'Fácil' },
  { titulo: '2. Conoce la Interfaz', descripcion: 'Barra lateral, chat principal, ajustes', tiempo: '10 minutos', nivel: 'Fácil' },
  { titulo: '3. Escribe tu Primer Prompt', descripcion: 'Hola ChatGPT, ayúdame con...', tiempo: '2 minutos', nivel: 'Fácil' },
  { titulo: '4. Aprende a Iterar', descripcion: 'Refina respuestas con follow-up', tiempo: '15 minutos', nivel: 'Medio' },
  { titulo: '5. Usa Contextos', descripcion: 'Comparte archivos, links y contexto', tiempo: '20 minutos', nivel: 'Medio' },
  { titulo: '6. Explora GPTs', descripcion: 'Usa asistentes especializados', tiempo: '30 minutos', nivel: 'Avanzado' },
]

const prompts = [
  { tipo: 'Resumen', prompt: 'Resume este texto en 3 puntos clave:', uso: 'Libros, artículos, emails' },
  { tipo: 'Traducción', prompt: 'Traduce al español manteniendo el tono:', uso: 'Documentos internacionales' },
  { tipo: 'Ideas', prompt: 'Dame 10 ideas para:', uso: 'Blogs, videos, productos' },
  { tipo: 'Corrección', prompt: 'Corrige y mejora este texto:', uso: 'Emails, cartas, artículos' },
  { tipo: 'Traducción', prompt: 'Explica como si tuviera 5 años:', uso: 'Conceptos complejos' },
  { tipo: 'Formato', prompt: 'Convierte en tabla/markdown/JSON:', uso: 'Datos y listas' },
]

const tips = [
  { titulo: 'Sé Específico', descripcion: 'En lugar de "ayúdame con marketing", di "dame 5 ideas para aumentar ventas en mi tienda online"', icon: Globe },
  { titulo: 'Da Contexto', descripcion: 'Explica quién eres, a quién te diriges y cuál es el objetivo', icon: MessageCircle },
  { titulo: 'Itera', descripcion: 'La primera respuesta rara vez es la mejor. Sigue preguntando', icon: RefreshCw },
  { titulo: 'Usa Roles', descripcion: 'Eres un experto en marketing con 20 años de experiencia', icon: BookOpen },
  { titulo: 'Pide Formato', descripcion: 'Quiero la respuesta en tabla con 3 columnas', icon: FileText },
  { titulo: 'Limita Longitud', descripcion: 'Respuesta de máximo 200 palabras', icon: Send },
]

export default function GuiaChatGPTPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <MessageCircle className="w-3 h-3 mr-1" /> Tutorial 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Guía <span className="text-primary">ChatGPT</span> en Español
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprende a usar ChatGPT desde cero. Tutorial completo paso a paso, 
            prompts efectivos y consejos avanzados para aprovechar al máximo la IA.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">Incluye Prompts</Badge>
            <h2 className="text-3xl font-bold mb-4">Domina ChatGPT en 1 Hora</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Descarga nuestra guía completa con prompts listos para usar, 
              ejemplos prácticos y estrategias avanzadas.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Principiantes</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 50+ Prompts</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Ejemplos</div>
            </div>
            <Button size="lg" asChild><Link href="/">Empezar Tutorial <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Pasos para Empezar */}
        <h2 className="text-3xl font-bold mb-8 text-center">Cómo Empezar con ChatGPT</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {pasos.map ((paso, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">{paso.nivel}</Badge>
                <CardTitle className="text-lg">{paso.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{paso.descripcion}</p>
                <p className="text-xs text-primary"><strong>Tiempo:</strong> {paso.tiempo}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Prompts Esenciales */}
        <h2 className="text-3xl font-bold mb-8 text-center">Prompts Esenciales en Español</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Prompts para Empezar</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {prompts.map ((prompt, i) => (
                <div key={i} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <Badge variant="outline" className="mb-2">{prompt.tipo}</Badge>
                  <p className="text-sm font-mono mb-3 bg-muted p-2 rounded">"{prompt.prompt}"</p>
                  <p className="text-xs text-muted-foreground"><strong>Uso:</strong> {prompt.uso}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips Avanzados */}
        <h2 className="text-3xl font-bold mb-8 text-center">6 Tips para Mejores Resultados</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tips.map ((tip, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl"><tip.icon className="w-6 h-6 text-primary" /></div>
                <div>
                  <h3 className="font-bold mb-2">{tip.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{tip.descripcion}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Diferencias Free vs Plus */}
        <h2 className="text-3xl font-bold mb-8 text-center">ChatGPT Free vs Plus</h2>
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="font-bold mb-4 text-lg">Versión Gratuita (GPT-3.5)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Acceso web básico</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Análisis de archivos</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Granito de conversaciones</li>
                  <li className="flex items-start gap-2"><span className="text-red-500">✗</span> GPT-4 limitado</li>
                  <li className="flex items-start gap-2"><span className="text-red-500">✗</span> GPTs personalizados</li>
                </ul>
              </div>
              <div className="p-6 bg-primary/10 rounded-lg border border-primary/30">
                <h3 className="font-bold mb-4 text-lg">ChatGPT Plus ($20/mes)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Todo lo gratuito</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> GPT-4 sin límite</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> GPTs personalizados</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> DALL-E integrado</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Acceso prioritario</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿ChatGPT no es suficiente?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Para español nativo, SEO automático y especializado en marketing, 
            prueba Red Creativa Pro. La alternativa perfecta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/">Probar Red Creativa Pro <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/chatgpt-vs-claude">ChatGPT vs Claude</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
