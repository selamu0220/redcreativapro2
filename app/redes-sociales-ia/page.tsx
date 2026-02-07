import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Share2, MessageCircle, Heart, Users, TrendingUp, Camera, Video, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'IA para Redes Sociales 2025 | Posts que Viralizan + Plantillas',
  description: 'Crea contenido para redes sociales con IA. LinkedIn, Instagram, Twitter, Facebook y TikTok. Aprende a escribir posts que generan engagement, leads y ventas. 100+ plantillas.',
  keywords: ['ia para redes sociales', 'posts linkedin ia', 'instagram captions ia', 'twitter threads ia', 'facebook ads ia', 'tiktok script ia', 'redes sociales marketing', 'engagement redes ia'],
  alternates: { canonical: 'https://redcreativa.pro/redes-sociales-ia' },
  openGraph: {
    title: 'IA para Redes Sociales 2025 | Posts que Viralizan + Plantillas',
    description: 'Crea contenido viral para redes sociales con IA.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Redes+Sociales+IA', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'IA para Redes Sociales 2025', description: 'Posts que viralizan' }
}

const plataformas = [
  { nombre: 'LinkedIn', icon: Users, color: 'blue', caracteres: '3000', mejor: 'B2B, thought leadership', estadistica: '80% de leads B2B' },
  { nombre: 'Instagram', icon: Camera, color: 'pink', caracteres: '2200', mejor: 'Marca personal, lifestyle', estadistica: '2B+ usuarios activos' },
  { nombre: 'Twitter/X', icon: MessageCircle, color: 'black', caracteres: '280', mejor: 'Noticias, threads', estadistica: '500M+ usuarios' },
  { nombre: 'Facebook', icon: Share2, color: 'blue', caracteres: '63206', mejor: 'Comunidad, anuncios', estadistica: '3B+ usuarios' },
  { nombre: 'TikTok', icon: Video, color: 'black', caracteres: '2200', mejor: 'Jóvenes, viral', estadistica: '1B+ usuarios' },
]

const tiposContenido = [
  { tipo: 'Posts Educativos', linkedin: '✓ Excelente', instagram: '✓ Bueno', twitter: '✓ Muy bueno' },
  { tipo: 'Historias Personales', linkedin: '✓ Bueno', instagram: '✓ Excelente', twitter: '✓ Regular' },
  { tipo: 'Threads Explicativos', linkedin: '✓ Regular', instagram: '✗', twitter: '✓ Excelente' },
  { tipo: 'Antes/Después', linkedin: '✓ Bueno', instagram: '✓ Excelente', twitter: '✓ Regular' },
  { tipo: 'Tips Rápidos', linkedin: '✓ Bueno', instagram: '✓ Excelente', twitter: '✓ Excelente' },
  { tipo: 'Case Studies', linkedin: '✓ Excelente', instagram: 'Regular', twitter: '✓ Bueno' },
]

const templates = [
  { plataforma: 'LinkedIn', nombre: 'Post de价值观', estructura: 'Contexto → Problema → Solución → CTA', engagement: 'Alto' },
  { plataforma: 'Instagram', nombre: 'Caption Viral', estructura: 'Gancho → Historia → Hashtags', engagement: 'Alto' },
  { plataforma: 'Twitter', nombre: 'Thread Explicativo', estructura: 'Hook → Puntos 1-7 → CTA', engagement: 'Muy alto' },
  { plataforma: 'TikTok', nombre: 'Script de Formato', estructura: 'Hook (3s) → Contenido → CTA', engagement: 'Muy alto' },
]

export default function RedesSocialesIAPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Share2 className="w-3 h-3 mr-1" /> Guía 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            IA para <span className="text-primary">Redes Sociales</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Crea contenido viral para LinkedIn, Instagram, Twitter, Facebook y TikTok. 
            Aprende a escribir posts que generan engagement, leads y ventas. 100+ plantillas.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">100+ Plantillas</Badge>
            <h2 className="text-3xl font-bold mb-4">Genera Posts que Viralizan</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nuestras templates están optimizadas para cada red social. 
              Solo elige tu plataforma, completa los espacios y publica.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> LinkedIn B2B</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Instagram</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Twitter Threads</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> TikTok Scripts</div>
            </div>
            <Button size="lg" asChild><Link href="/prompts/redes-sociales">Acceder a Plantillas <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Plataformas */}
        <h2 className="text-3xl font-bold mb-8 text-center">Redes Sociales Principales</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {plataformas.map((plat, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-${plat.color}-500/20`}>
                  <plat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{plat.nombre}</h3>
                <p className="text-xs text-muted-foreground mb-2">{plat.caracteres} caracteres</p>
                <p className="text-xs text-primary">{plat.mejor}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tipo de Contenido por Plataforma */}
        <h2 className="text-3xl font-bold mb-8 text-center">Tipo de Contenido por Plataforma</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> ¿Qué funciona mejor?</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Tipo de Contenido</th>
                  <th className="text-center p-4">LinkedIn</th>
                  <th className="text-center p-4">Instagram</th>
                  <th className="text-center p-4">Twitter</th>
                </tr>
              </thead>
              <tbody>
                {tiposContenido.map((tipo, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4">{tipo.tipo}</td>
                    <td className="text-center">{tipo.linkedin}</td>
                    <td className="text-center">{tipo.instagram}</td>
                    <td className="text-center">{tipo.twitter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Templates */}
        <h2 className="text-3xl font-bold mb-8 text-center">Templates Populares</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {templates.map((temp, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary">{temp.plataforma}</Badge>
                  <span className="text-xs text-green-600 font-medium">{temp.engagement} engagement</span>
                </div>
                <h3 className="font-bold mb-2">{temp.nombre}</h3>
                <p className="text-sm text-muted-foreground mb-3">{temp.estructura}</p>
                <Button size="sm" variant="outline">Ver Template</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para viralizar en redes?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Accede a 100+ templates de redes sociales optimizadas 
            y genera posts profesionales en segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/prompts/redes-sociales">Ver Todas las Plantillas <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/">Probar Gratis</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
