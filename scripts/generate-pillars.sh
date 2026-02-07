#!/bin/bash

# Script para generar los 4 pilares de contenido restantes de forma masiva
# Ejecutar: bash scripts/generate-pillars.sh

echo "Generando Pilares de Contenido..."

# Pilar 2: Prompts IA
cat > app/guia/prompts-ia/page.tsx << 'PILAR2'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, Terminal, Lightbulb, Code, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Prompts IA: Guía Completa 2025 | Domina la IA con Prompts Efectivos',
  description: 'La guía definitiva sobre prompts para IA en 2025. Aprende a crear instrucciones efectivas para ChatGPT, Claude y otras IAs. 3000+ palabras con ejemplos prácticos.',
  keywords: ['prompts ia', 'como hacer prompts', 'prompts efectivos', 'prompt engineering', 'chatgpt prompts'],
  alternates: { canonical: 'https://redcreativa.pro/guia/prompts-ia' }
}

const clusterLinks = [
  { href: '/guia/prompts-ia/que-es-un-prompt', title: '¿Qué es un Prompt?' },
  { href: '/guia/prompts-ia/como-escribir-prompts', title: 'Cómo Escribir Prompts' },
  { href: '/guia/prompts-ia/prompts-chatgpt', title: 'Prompts para ChatGPT' },
  { href: '/guia/prompts-ia/prompts-marketing', title: 'Prompts para Marketing' },
  { href: '/guia/prompts-ia/prompts-seo', title: 'Prompts para SEO' },
  { href: '/guia/prompts-ia/prompts-copywriting', title: 'Prompts Copywriting' },
  { href: '/guia/prompts-ia/prompts-redes-sociales', title: 'Prompts Redes Sociales' },
  { href: '/guia/prompts-ia/prompts-email', title: 'Prompts Email Marketing' },
]

export default function PromptsIAGuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline"><Terminal className="w-3 h-3 mr-1" />Guía Completa</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Prompts IA: Guía Completa 2025</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Domina el arte de crear prompts efectivos para cualquier IA. Desde conceptos básicos hasta técnicas avanzadas de prompt engineering.
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8">
            <p className="text-blue-800 text-lg">
              Un <strong>prompt bien diseñado</strong> es la diferencia entre obtener resultados mediocres y extraordinarios de la IA. 
              En esta guía aprenderás las técnicas que usan los expertos.
            </p>
          </div>

          <h2 className="text-3xl font-bold mb-6">¿Qué es un Prompt?</h2>
          <p className="text-muted-foreground mb-6">
            Un prompt es la instrucción o entrada que le das a un modelo de inteligencia artificial para que genere una respuesta. 
            Es el punto de partida de toda interacción con IA y su calidad determina directamente la calidad del output.
          </p>

          <h2 className="text-3xl font-bold mb-6">Los 5 Elementos de un Prompt Perfecto</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8 not-prose">
            <Card><CardContent className="p-6">
              <Lightbulb className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="font-bold mb-2">1. Contexto</h3>
              <p className="text-sm text-muted-foreground">Proporciona información de fondo relevante para que la IA entienda el escenario.</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <Code className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-bold mb-2">2. Instrucción Específica</h3>
              <p className="text-sm text-muted-foreground">Sé claro y específico sobre qué quieres que haga la IA.</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <Sparkles className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-bold mb-2">3. Formato de Salida</h3>
              <p className="text-sm text-muted-foreground">Define cómo quieres que se presente la información.</p>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <BookOpen className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-bold mb-2">4. Ejemplos (Few-Shot)</h3>
              <p className="text-sm text-muted-foreground">Muestra ejemplos del estilo o formato deseado.</p>
            </CardContent></Card>
          </div>

          <h2 className="text-3xl font-bold mb-6">Técnicas Avanzadas de Prompt Engineering</h2>
          
          <h3 className="text-2xl font-semibold mb-4">Chain of Thought (CoT)</h3>
          <p className="text-muted-foreground mb-4">
            Pide a la IA que piense paso a paso antes de dar la respuesta final. Esto mejora drásticamente 
            la calidad en tareas complejas de razonamiento.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm font-mono">"Piensa paso a paso: primero analiza el problema, luego considera las opciones, finalmente da tu recomendación."</p>
          </div>

          <h3 className="text-2xl font-semibold mb-4">Role Prompting</h3>
          <p className="text-muted-foreground mb-4">
            Asigna un rol específico a la IA para obtener respuestas más especializadas y contextualizadas.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm font-mono">"Actúa como un experto en marketing digital con 10 años de experiencia en eCommerce..."</p>
          </div>

          <h2 className="text-3xl font-bold mb-6">Errores Comunes al Crear Prompts</h2>
          <ul className="space-y-3 text-muted-foreground mb-8">
            <li>❌ <strong>Ser demasiado vago:</strong> "Escribe algo sobre marketing"</li>
            <li>✅ <strong>Ser específico:</strong> "Escribe un post de LinkedIn de 300 palabras sobre estrategias de email marketing para B2B"</li>
            <li>❌ <strong>No definir el formato:</strong> Sin especificar si quieres lista, párrafos, tabla...</li>
            <li>✅ <strong>Definir output:</strong> "Dame una lista numerada de 5 puntos..."</li>
            <li>❌ <strong>Pedir todo de una vez:</strong> Solicitudes complejas sin dividir</li>
            <li>✅ <strong>Dividir en pasos:</strong> Prompts separados para cada fase del proceso</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6">Continúa Aprendiendo</h2>
          <div className="grid md:grid-cols-2 gap-4 not-prose">
            {clusterLinks.map((link, idx) => (
              <Link key={idx} href={link.href}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium">{link.title}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">¿Listo para crear prompts profesionales?</h3>
          <Button size="lg" asChild><Link href="/prompts">Ver 50+ prompts pre-optimizados <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </div>
      </div>
    </main>
  )
}
PILAR2

# Pilar 3: SEO con IA
cat > app/guia/seo-ia/page.tsx << 'PILAR3'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Search, TrendingUp, Target, BarChart3, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, Ca
