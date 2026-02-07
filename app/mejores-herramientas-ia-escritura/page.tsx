import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, TrendingUp, BookOpen, Search, FileText, MessageCircle, Video, Mail, ShoppingCart, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: '30+ Mejores Herramientas de IA para Escritura 2025 | Red Creativa Pro',
  description: 'Descubre las mejores herramientas de IA para escribir mejor y más rápido. Comparativa completa: Jasper, Copy.ai, Writesonic, ChatGPT y más. Ranking actualizado con precios, pros y contras.',
  keywords: ['mejores herramientas ia escritura', 'ia para escribir', 'escritor ia', 'herramientas copywriting ia', 'redaccion ia', 'software ia escritor', 'inteligencia artificial escritura'],
  alternates: { canonical: 'https://redcreativa.pro/mejores-herramientas-ia-escritura' },
  openGraph: {
    title: '30+ Mejores Herramientas de IA para Escritura 2025',
    description: 'Ranking completo con comparativas, precios y recomendaciones.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Mejores+Herramientas+IA+Escritura', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: '30+ Mejores Herramientas de IA para Escritura 2025', description: 'Ranking completo con comparativas, precios y recomendaciones.' }
}

const tools = [
  { nombre: 'Red Creativa Pro', precio: 'Gratis', rating: 4.9, descripcion: 'Especialista en español con SEO automático', keywords: ['escritor ia español', 'seo automatico'] },
  { nombre: 'ChatGPT', precio: '$0-20', rating: 4.7, descripcion: 'El más versátil y popular', keywords: ['chatgpt escritura', 'chatgpt espanol'] },
  { nombre: 'Claude', precio: '$20', rating: 4.8, descripcion: 'Análisis profundo y escritura académica', keywords: ['claude ai', 'anthropic claude'] },
  { nombre: 'Jasper AI', precio: '$49', rating: 4.5, descripcion: 'El favorito de los marketers', keywords: ['jasper ai', 'jasper ai espanol'] },
  { nombre: 'Copy.ai', precio: '$36', rating: 4.4, descripcion: 'Fácil de usar para principiantes', keywords: ['copy ai', 'copyai'] },
  { nombre: 'Writesonic', precio: '$19', rating: 4.3, descripcion: 'SEO integrado y generación de imágenes', keywords: ['writesonic', 'writesonic espanol'] },
  { nombre: 'Rytr', precio: '$9', rating: 4.2, descripcion: 'La opción más económica', keywords: ['rytr', 'rytr espanol'] },
  { nombre: 'QuillBot', precio: '$20', rating: 4.1, descripcion: 'Excelente para parafrasear', keywords: ['quillbot', 'paraphrasing tool'] },
  { nombre: 'Grammarly AI', precio: '$12', rating: 4.4, descripcion: 'El rey de la corrección', keywords: ['grammarly ai', 'gramatica ia'] },
  { nombre: 'Notion AI', precio: '$10', rating: 4.3, descripcion: 'Productividad todo-en-uno', keywords: ['notion ai', 'notion inteligencia artificial'] },
]

const categories = [
  { icon: FileText, name: 'Copywriting', count: 150, keywords: 'copywriting herramientas ia' },
  { icon: Search, name: 'SEO', count: 120, keywords: 'seo herramientas ia' },
  { icon: Video, name: 'Video Scripts', count: 80, keywords: 'guion video ia' },
  { icon: Mail, name: 'Email Marketing', count: 200, keywords: 'email marketing ia' },
  { icon: ShoppingCart, name: 'eCommerce', count: 180, keywords: 'ecommerce escritura ia' },
  { icon: MessageCircle, name: 'Redes Sociales', count: 250, keywords: 'redes sociales ia' },
]

export default function HerramientasIAPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Star className="w-3 h-3 mr-1" /> Ranking Actualizado 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Las Mejores Herramientas de <span className="text-primary">IA para Escribir</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre cuáles son las herramientas de inteligencia artificial más efectivas para copywriting, 
            contenido SEO, emails y más. Comparativas detalladas, precios y nuestra recomendación #1.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">#1 Recomendación 2025</Badge>
            <h2 className="text-3xl font-bold mb-4">Red Creativa Pro</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              La herramienta de IA más completa para hispanohablantes. Escritura nativa en español, 
              SEO automático en cada texto y 5x más económica que la competencia.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Desde $0/mes</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 100% Español nativo</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> SEO integrado</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> StealthWrite™</div>
            </div>
            <Button size="lg" asChild><Link href="/">Probar Gratis <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Ranking de Herramientas */}
        <h2 className="text-3xl font-bold mb-8 text-center">Ranking Completo de Herramientas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tools.map((tool, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{tool.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{tool.precio}</p>
                  </div>
                  <Badge variant="secondary">★ {tool.rating}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{tool.descripcion}</p>
                <div className="flex flex-wrap gap-1">
                  {tool.keywords.map((kw, j) => (
                    <Badge key={j} variant="outline" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Categorías */}
        <h2 className="text-3xl font-bold mb-8 text-center">Herramientas por Categoría</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((cat, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl"><cat.icon className="w-6 h-6 text-primary" /></div>
                <div>
                  <h3 className="font-bold">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count}+ prompts</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabla Comparativa */}
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle>Comparativa Rápida: Precio vs Funcionalidades</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Herramienta</th>
                    <th className="text-left p-3">Precio</th>
                    <th className="text-left p-3">Español</th>
                    <th className="text-left p-3">SEO</th>
                    <th className="text-left p-3">Plantillas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-3 font-medium">Red Creativa Pro</td><td>Gratis</td><td className="text-green-600">✓ Nativo</td><td className="text-green-600">✓ Automático</td><td>50+</td></tr>
                  <tr className="border-b"><td className="p-3 font-medium">ChatGPT</td><td>Gratis</td><td>✓</td><td>✗</td><td>Limitado</td></tr>
                  <tr className="border-b"><td className="p-3 font-medium">Jasper</td><td>$49</td><td>Limitado</td><td>✓</td><td>50+</td></tr>
                  <tr className="border-b"><td className="p-3 font-medium">Copy.ai</td><td>$36</td><td>Limitado</td><td>✓</td><td>90+</td></tr>
                  <tr><td className="p-3 font-medium">Writesonic</td><td>$19</td><td>Limitado</td><td>✓</td><td>100+</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Cuál es la mejor herramienta para ti?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Si escribes en español y necesitas SEO automático, Red Creativa Pro es tu mejor opción. 
            Pruébala gratis y descubre la diferencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/">Empezar Gratis <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/alternativas/chatgpt">Ver Comparativa ChatGPT</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
