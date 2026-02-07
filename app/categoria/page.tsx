import type { Metadata } from 'next'
import Link from 'next/link'
import { 
  ArrowRight, 
  FolderOpen,
  Mail,
  Share2,
  Search,
  ShoppingCart,
  Video,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { categoriasData, programmaticSeoStats } from '@/lib/programmatic-seo-data'

export const metadata: Metadata = {
  title: 'Categorías de Prompts IA | Red Creativa Pro',
  description: `Explora ${programmaticSeoStats.totalCategorias} categorías de prompts IA especializados. Desde email marketing hasta SEO, encuentra plantillas para cada necesidad.`,
  alternates: {
    canonical: 'https://redcreativa.pro/categoria'
  }
}

const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
  Mail,
  Share2,
  Search,
  ShoppingCart,
  Video,
  FileText
}

export default function CategoriasIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <FolderOpen className="w-3 h-3 mr-1" />
            {programmaticSeoStats.totalCategorias} categorías
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Categorías de Prompts IA
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encuentra prompts especializados por categoría. Desde email marketing 
            hasta landing pages, todo lo que necesitas para automatizar tu escritura.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriasData.map((categoria) => {
            const IconComponent = iconMap[categoria.icono] || FolderOpen
            
            return (
              <Link key={categoria.slug} href={`/categoria/${categoria.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-${categoria.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 text-${categoria.color}-600`} />
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {categoria.nombre}
                    </h2>
                    
                    <p className="text-muted-foreground text-sm mb-4">
                      {categoria.description.substring(0, 120)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {categoria.promptsCount} prompts
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link href="/prompts">
              Ver todos los prompts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
