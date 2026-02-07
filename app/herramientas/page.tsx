import type { Metadata } from 'next'
import Link from 'next/link'
import { 
  Calculator, 
  Type, 
  Clock, 
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Herramientas SEO Gratis | Red Creativa Pro',
  description: 'Colección de herramientas SEO gratuitas: calculadora meta tags, generador de headlines, contador de palabras y más. Mejora tu SEO hoy.',
  keywords: ['herramientas seo gratis', 'tools seo free', 'calculadora seo', 'generador headlines'],
  alternates: { canonical: 'https://redcreativa.pro/herramientas' }
}

const tools = [
  {
    title: 'Calculadora de Meta Tags',
    description: 'Verifica la longitud perfecta de tus meta titles y descriptions para Google',
    icon: Calculator,
    href: '/herramientas/calculadora-meta-tags',
    badge: 'Popular'
  },
  {
    title: 'Generador de Headlines',
    description: 'Crea títulos irresistibles y optimizados para SEO con plantillas probadas',
    icon: Type,
    href: '/herramientas/generador-headlines',
    badge: 'Nuevo'
  },
  {
    title: 'Contador de Palabras',
    description: 'Cuenta palabras, caracteres y tiempo de lectura de tu contenido',
    icon: FileText,
    href: '/herramientas/contador-palabras',
    badge: 'Gratis'
  },
  {
    title: 'Calculadora de Tiempo de Lectura',
    description: 'Estima cuánto tiempo tardará tu audiencia en leer tu contenido',
    icon: Clock,
    href: '/herramientas/tiempo-lectura',
    badge: 'Útil'
  }
]

export default function HerramientasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Sparkles className="w-3 h-3 mr-1" />
            100% Gratis
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Herramientas SEO Gratis
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Colección de herramientas profesionales para mejorar tu SEO. 
            Sin registro, sin límites, completamente gratuitas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {tools.map((tool) => {
            const IconComponent = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{tool.badge}</Badge>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {tool.description}
                    </p>
                    <div className="flex items-center text-primary">
                      <span className="text-sm font-medium">Usar herramienta</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            ¿Necesitas más herramientas?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Red Creativa Pro incluye todas estas herramientas y muchas más: 
            SEO automático, generación de contenido, análisis de competencia...
          </p>
          <Button size="lg" asChild>
            <Link href="/">
              Probar Red Creativa Pro
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
