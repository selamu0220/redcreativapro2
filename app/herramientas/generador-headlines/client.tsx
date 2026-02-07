'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Sparkles } from 'lucide-react'
import Link from 'next/link'

const headlineTemplates = [
  { template: "Cómo [tema] en [tiempo]: Guía Completa 2025", type: "How-to" },
  { template: "[Número] Formas de [tema] que [beneficio]", type: "Lista" },
  { template: "La Guía Definitiva de [tema] para [audiencia]", type: "Guía" },
  { template: "[tema]: Todo lo que Necesitas Saber", type: "Comprehensive" },
  { template: "Por qué [tema] es el Futuro de [industria]", type: "Trend" },
  { template: "[Número] Errores de [tema] que te Cuestan [consecuencia]", type: "Mistakes" },
  { template: "Cómo [tema] Aumentó [métrica] un [porcentaje]%", type: "Case Study" },
  { template: "[tema] vs [alternativa]: Cuál es Mejor en 2025", type: "Comparison" },
  { template: "El Secreto de [tema] que los Expertos no Cuéntan", type: "Secret" },
  { template: "[Número] Herramientas de [tema] que Cambiarán tu [resultado]", type: "Tools" },
]

export function HeadlineGeneratorClient() {
  const [topic, setTopic] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateHeadlines = () => {
    if (!topic) return []
    
    return headlineTemplates.map(h => ({
      ...h,
      headline: h.template
        .replace('[tema]', topic)
        .replace('[Tema]', topic.charAt(0).toUpperCase() + topic.slice(1))
        .replace('[tiempo]', '30 días')
        .replace('[Número]', '10')
        .replace('[número]', '10')
        .replace('[beneficio]', 'ahorran tiempo')
        .replace('[audiencia]', 'principiantes')
        .replace('[industria]', 'marketing')
        .replace('[consecuencia]', 'dinero')
        .replace('[métrica]', 'ventas')
        .replace('[porcentaje]', '300')
        .replace('[alternativa]', 'la competencia')
        .replace('[resultado]', 'negocio')
    }))
  }

  const headlines = generateHeadlines()

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Generador de Headlines SEO</h1>
          <p className="text-xl text-muted-foreground">
            Crea títulos irresistibles que mejoran tu CTR
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Escribe tu tema (ej: email marketing, redes sociales, seo)..."
              className="text-lg"
            />
          </CardContent>
        </Card>

        {topic && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Headlines Generados:</h2>
            {headlines.map((item, index) => (
              <Card key={index} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">{item.type}</Badge>
                    <p className="text-lg font-medium">{item.headline}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(item.headline, index)}
                    className="ml-4"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Quieres generar contenido completo?</h2>
          <p className="text-muted-foreground mb-6">
            Red Creativa Pro genera artículos completos con headlines optimizados
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Crear Contenido con IA
          </Link>
        </div>
      </div>
    </main>
  )
}
