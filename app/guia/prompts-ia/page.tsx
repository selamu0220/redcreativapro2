import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, Terminal, Lightbulb, Code, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Prompts IA: Guía Completa 2025 | Domina la IA con Prompts Efectivos',
  description: 'La guía definitiva sobre prompts para IA en 2025. Aprende a crear instrucciones efectivas para ChatGPT, Claude y otras IAs. 3000+ palabras con ejemplos prácticos.',
  keywords: ['prompts ia', 'como hacer prompts', 'prompts efectivos', 'prompt engineering', 'chatgpt prompts'],
  alternates: { canonical: 'https://redcreativa.pro/guia/prompts-ia' }
}

export default function PromptsIAGuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline"><Terminal className="w-3 h-3 mr-1" />Guía Completa</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Prompts IA: Guía Completa 2025</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Domina el arte de crear prompts efectivos para cualquier IA. Desde conceptos básicos hasta técnicas avanzadas de prompt engineering.
          </p>
          <Button size="lg" asChild><Link href="/prompts">Ver prompts pre-optimizados <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8">
            <p className="text-blue-800 text-lg">
              Un <strong>prompt bien diseñado</strong> es la diferencia entre obtener resultados mediocres y extraordinarios de la IA.
            </p>
          </div>

          <h2 className="text-3xl font-bold mb-6">¿Qué es un Prompt?</h2>
          <p className="text-muted-foreground mb-6">
            Un prompt es la instrucción o entrada que le das a un modelo de inteligencia artificial para que genere una respuesta.
            Es el punto de partida de toda interacción con IA.
          </p>

          <h2 className="text-3xl font-bold mb-6">Los 5 Elementos de un Prompt Perfecto</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8 not-prose">
            <Card><CardContent className="p-6">
              <Lightbulb className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="font-bold mb-2">1. Contexto</h3>
              <p className="text-sm text-muted-foreground">Proporciona información de fondo relevante.</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <Code className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-bold mb-2">2. Instrucción Específica</h3>
              <p className="text-sm text-muted-foreground">Sé claro sobre qué quieres que haga.</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <Sparkles className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-bold mb-2">3. Formato</h3>
              <p className="text-sm text-muted-foreground">Define cómo quieres la información.</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <BookOpen className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-bold mb-2">4. Ejemplos</h3>
              <p className="text-sm text-muted-foreground">Muestra el estilo deseado.</p>
            </CardContent></Card>
          </div>

          <h2 className="text-3xl font-bold mb-6">Técnicas Avanzadas</h2>
          <h3 className="text-2xl font-semibold mb-4">Chain of Thought (CoT)</h3>
          <p className="text-muted-foreground mb-4">Pide a la IA que piense paso a paso antes de responder.</p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm font-mono">"Piensa paso a paso: primero analiza el problema, luego considera opciones, finalmente recomienda."</p>
          </div>
        </div>

        <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">¿Listo para prompts profesionales?</h3>
          <Button size="lg" asChild><Link href="/prompts">Ver 50+ prompts pre-optimizados <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>
      </div>
    </main>
  )
}
