import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Mail, Share2, Target, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Marketing Digital con IA 2025 | Estrategias que Escalan',
  description: 'Transforma tu marketing digital con inteligencia artificial. Estrategias, herramientas y tácticas avanzadas para escalar resultados con IA.',
  keywords: ['marketing digital ia', 'marketing ia', 'ia para marketing', 'automatizacion marketing ia'],
  alternates: { canonical: 'https://redcreativa.pro/guia/marketing-ia' }
}

export default function MarketingIAGuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline"><Megaphone className="w-3 h-3 mr-1" />Marketing</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Marketing Digital con IA 2025</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Estrategias avanzadas de marketing digital potenciadas por inteligencia artificial. 
            Automatiza, escala y mejora resultados.
          </p>
          <Button size="lg" asChild><Link href="/dashboard">Empezar Ahora <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8">
            <p className="text-orange-800 text-lg">
              El <strong>marketing digital con IA</strong> está revolucionando cómo las empresas 
              llegan a sus clientes. Desde personalización masiva hasta predicción de comportamiento.
            </p>
          </div>

          <h2 className="text-3xl font-bold mb-6">Áreas del Marketing Transformadas por IA</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8 not-prose">
            <Card><CardContent className="p-6">
              <Mail className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-bold mb-2">Email Marketing</h3>
              <p className="text-sm text-muted-foreground">Personalización 1:1 a escala masiva. Emails que abren y convierten.</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <Share2 className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-bold mb-2">Redes Sociales</h3>
              <p className="text-sm text-muted-foreground">Contenido optimizado para cada plataforma y audiencia.</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <Target className="w-8 h-8 text-red-500 mb-3" />
              <h3 className="font-bold mb-2">Publicidad Digital</h3>
              <p className="text-sm text-muted-foreground">Optimización automática de campañas y presupuestos.</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-bold mb-2">Analítica Predictiva</h3>
              <p className="text-sm text-muted-foreground">Predice tendencias y comportamiento del cliente.</p>
            </CardContent></Card>
          </div>

          <h2 className="text-3xl font-bold mb-6">Estrategias de Marketing con IA</h2>
          <h3 className="text-2xl font-semibold mb-4">1. Personalización a Escala</h3>
          <p className="text-muted-foreground mb-4">
            La IA permite crear experiencias personalizadas para miles de usuarios simultáneamente. 
            Desde emails dinámicos hasta landing pages adaptativas.
          </p>

          <h3 className="text-2xl font-semibold mb-4">2. Automatización de Contenido</h3>
          <p className="text-muted-foreground mb-4">
            Genera semanas de contenido en horas. Blog posts, social media, newsletters y más, 
            todo manteniendo la voz de tu marca.
          </p>

          <h3 className="text-2xl font-semibold mb-4">3. Optimización Continua</h3>
          <p className="text-muted-foreground mb-4">
            La IA analiza resultados en tiempo real y ajusta estrategias automáticamente para 
            maximizar ROI.
          </p>
        </div>

        <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">Transforma tu marketing hoy</h3>
          <Button size="lg" asChild><Link href="/dashboard">Empezar Gratis <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>
      </div>
    </main>
  )
}
