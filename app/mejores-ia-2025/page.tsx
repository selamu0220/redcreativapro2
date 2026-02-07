import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Brain, Cpu, Globe, Sparkles, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Mejores IA de 2025 | Top 30 Herramientas Inteligentes Ranking',
  description: 'Descubre el ranking de las mejores inteligencias artificiales de 2025. ChatGPT, Claude, Gemini, Midjourney y más. Comparativa completa con precios, pros, contras y cuál elegir.',
  keywords: ['mejores ia 2025', 'top inteligencias artificiales', 'ranking ia', 'mejores chat ai', 'herramientas ia 2025', 'inteligencia artificial comparativa', 'chatgpt alternativas', 'mejores ai tools'],
  alternates: { canonical: 'https://redcreativa.pro/mejores-ia-2025' },
  openGraph: {
    title: 'Mejores IA de 2025 | Top 30 Herramientas Inteligentes Ranking',
    description: 'Ranking completo con comparativas.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Mejores+IA+2025', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'Mejores IA de 2025', description: 'Top 30 Ranking' }
}

const categoriasIA = [
  { nombre: 'Chatbots & Asistentes', ejemplos: 'ChatGPT, Claude, Gemini', volumen: '100M+' },
  { nombre: 'Imágenes', ejemplos: 'Midjourney, DALL-E, Stable Diffusion', volumen: '50M+' },
  { nombre: 'Video', ejemplos: 'Runway, Pika, Synthesia', volumen: '20M+' },
  { nombre: 'Audio & Voz', ejemplos: 'ElevenLabs, Murf, Whisper', volumen: '15M+' },
  { nombre: 'Escritura & Copy', ejemplos: 'Jasper, Copy.ai, Red Creativa Pro', volumen: '30M+' },
  { nombre: 'Código', ejemplos: 'GitHub Copilot, Claude Code', volumen: '25M+' },
]

const rankingTop = [
  { posicion: 1, nombre: 'ChatGPT', categoria: 'Asistente General', pros: 'Versatil, popular, gratuito', precio: '$0-20', url: 'alternativas/chatgpt' },
  { posicion: 2, nombre: 'Claude', categoria: 'Análisis & Escritura', pros: 'Contexto largo, análisis profundo', precio: '$20', url: 'alternativas/claude' },
  { posicion: 3, nombre: 'Gemini', categoria: 'Multimodal Google', pros: 'Integración Google, multimodal', precio: '$20', url: 'alternativas/gemini' },
  { posicion: 4, nombre: 'Midjourney', categoria: 'Imágenes IA', pros: 'Calidad artística superior', precio: '$10', url: '' },
  { posicion: 5, nombre: 'Red Creativa Pro', categoria: 'Escritura Español', pros: 'Español nativo, SEO automático', precio: 'Gratis', url: '' },
  { posicion: 6, nombre: 'Jasper', categoria: 'Marketing Copy', pros: 'Plantillas, Brand voice', precio: '$49', url: 'alternativas/jasper' },
  { posicion: 7, nombre: 'GitHub Copilot', categoria: 'Código IA', pros: 'Integración VS Code', precio: '$10', url: '' },
  { posicion: 8, nombre: 'Runway', categoria: 'Video IA', pros: 'Edición automática', precio: '$12', url: '' },
  { posicion: 9, nombre: 'ElevenLabs', categoria: 'Voz IA', pros: 'Voz natural realista', precio: '$5', url: '' },
  { posicion: 10, nombre: 'Notion AI', categoria: 'Productividad', pros: 'Todo-en-uno Notion', precio: '$10', url: 'alternativas/notion-ai' },
]

export default function MejoresIA2025Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Award className="w-3 h-3 mr-1" /> Ranking 2025 Actualizado </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Las Mejores <span className="text-primary">IA de 2025</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre cuáles son las inteligencias artificiales más poderosas, cuáles vale la pena pagar 
            y cuáles son gratuitas. Ranking completo con más de 30 herramientas.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600"> #1 en Español </Badge>
            <h2 className="text-3xl font-bold mb-4">Red Creativa Pro</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              La mejor IA para escribir en español. SEO automático, templates optimizados 
              y 100% nativa. Gratis para siempre.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> #1 en español</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> SEO incluido</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 100% gratis</div>
            </div>
            <Button size="lg" asChild><Link href="/">Probar Gratis <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Top 10 */}
        <h2 className="text-3xl font-bold mb-8 text-center">Top 10 Mejores IA</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
          {rankingTop.map((ia, i) => (
            <Card key={i} className={`hover:border-primary/30 transition-colors ${i === 4 ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${i < 3 ? 'bg-yellow-500/20 text-yellow-600' : i < 6 ? 'bg-gray-500/20 text-gray-400' : 'bg-primary/20 text-primary'}`}>
                      #{ia.posicion}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{ia.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{ia.categoria}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{ia.precio}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{ia.pros}</p>
                {ia.url && (
                  <Button size="sm" variant="outline" asChild><Link href={`/${ia.url}`}>Ver Alternativas</Link></Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Categorías */}
        <h2 className="text-3xl font-bold mb-8 text-center">IA por Categoría</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categoriasIA.map((cat, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-6 h-6 text-primary" />
                  <h3 className="font-bold">{cat.nombre}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{cat.ejemplos}</p>
                <p className="text-xs text-primary font-medium">{cat.volumen} usuarios</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabla Comparativa */}
        <h2 className="text-3xl font-bold mb-8 text-center">Comparativa Rápida</h2>
        <Card className="mb-16 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">IA</th>
                  <th className="text-center p-4">Mejor Para</th>
                  <th className="text-center p-4">Precio</th>
                  <th className="text-center p-4">Español</th>
                  <th className="text-center p-4">Gratis</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="p-4 font-bold">ChatGPT</td><td className="text-center">General</td><td className="text-center">$0-20</td><td className="text-center">✓</td><td className="text-center">✓</td></tr>
                <tr className="border-b"><td className="p-4 font-bold">Claude</td><td className="text-center">Análisis</td><td className="text-center">$20</td><td className="text-center">✓</td><td className="text-center">Limitado</td></tr>
                <tr className="border-b"><td className="p-4 font-bold">Gemini</td><td className="text-center">Multimodal</td><td className="text-center">$20</td><td className="text-center">✓</td><td className="text-center">✓</td></tr>
                <tr className="border-b"><td className="p-4 font-bold text-primary">Red Creativa Pro</td><td className="text-center">Español SEO</td><td className="text-center">Gratis</td><td className="text-center text-green-600">Nativo</td><td className="text-center text-green-600">✓</td></tr>
                <tr className="border-b"><td className="p-4 font-bold">Jasper</td><td className="text-center">Marketing</td><td className="text-center">$49</td><td className="text-center">Limitado</td><td className="text-center">✗</td></tr>
                <tr><td className="p-4 font-bold">Midjourney</td><td className="text-center">Imágenes</td><td className="text-center">$10</td><td className="text-center">-</td><td className="text-center">✗</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Cuál IA es la mejor para ti?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Si escribes en español y necesitas resultados profesionales, 
            Red Creativa Pro es tu mejor opción. Pruébala gratis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/">Probar Red Creativa Pro <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/mejores-herramientas-ia-escritura">Ver Ranking Completo</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
