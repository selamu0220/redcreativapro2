import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, PenTool, Target, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Copywriting con IA 2025 | Textos que Venden y Convencen',
  description: 'Domina el copywriting con inteligencia artificial. Crea headlines persuasivos, CTAs irresistibles y copy que convierte visitantes en clientes.',
  keywords: ['copywriting ia', 'copy ia', 'escribir copy con ia', 'textos persuasivos ia', 'copywriting inteligencia artificial'],
  alternates: { canonical: 'https://redcreativa.pro/guia/copywriting-ia' }
}

export default function CopywritingIAGuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline"><PenTool className="w-3 h-3 mr-1" />Copywriting</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Copywriting con IA</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Crea textos persuasivos que venden. Headlines que captan, copy que convierte y CTAs irresistibles con ayuda de IA.
          </p>
          <Button size="lg" asChild><Link href="/escritor-ia">Probar Escritor IA <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-xl mb-8">
            <p className="text-purple-800 text-lg">
              El <strong>copywriting con IA</strong> combina la psicología de la persuasión con la velocidad de la inteligencia artificial 
              para crear mensajes que conectan y convierten.
            </p>
          </div>

          <h2 className="text-3xl font-bold mb-6">¿Qué es el Copywriting con IA?</h2>
          <p className="text-muted-foreground mb-6">
            Es el uso de herramientas de inteligencia artificial para crear textos persuasivos orientados a la venta. 
            No reemplaza al copywriter, sino que lo potencia.
          </p>

          <h2 className="text-3xl font-bold mb-6">Elementos de Copy que Puedes Crear con IA</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8 not-prose">
            <Card><CardContent className="p-6">
              <Target className="w-8 h-8 text-red-500 mb-3" />
              <h3 className="font-bold mb-2">Headlines Impactantes</h3>
              <p className="text-sm text-muted-foreground">Títulos que captan atención inmediatamente</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <Zap className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="font-bold mb-2">CTAs Persuasivos</h3>
              <p className="text-sm text-muted-foreground">Llamadas a la acción irresistibles</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-bold mb-2">Beneficios Claros</h3>
              <p className="text-sm text-muted-foreground">Texto que comunica valor efectivamente</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <PenTool className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-bold mb-2">Objeciones</h3>
              <p className="text-sm text-muted-foreground">Respuestas que eliminan dudas</p>
            </CardContent></Card>
          </div>

          <h2 className="text-3xl font-bold mb-6">Fórmulas de Copywriting con IA</h2>
          <h3 className="text-2xl font-semibold mb-4">AIDA (Atención, Interés, Deseo, Acción)</h3>
          <p className="text-muted-foreground mb-4">
            La fórmula clásica adaptada para IA. Crea copy que guía al lector paso a paso hacia la conversión.
          </p>

          <h3 className="text-2xl font-semibold mb-4">PAS (Problema, Agitación, Solución)</h3>
          <p className="text-muted-foreground mb-4">
            Identifica el problema del cliente, agita el dolor y presenta tu solución como el remedio perfecto.
          </p>
        </div>

        <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">Crea copy que convierte</h3>
          <Button size="lg" asChild><Link href="/escritor-ia">Probar Escritor IA <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>
      </div>
    </main>
  )
}
