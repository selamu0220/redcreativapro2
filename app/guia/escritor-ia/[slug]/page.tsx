import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { 
  getClusterPageBySlug, 
  getAllClusterSlugs,
  escritorIACluster 
} from '@/lib/content-clusters'
import { 
  ArrowRight, 
  BookOpen,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = getClusterPageBySlug(slug)
  
  if (!page) {
    return {
      title: 'Página no encontrada | Red Creativa Pro',
      robots: { index: false, follow: true }
    }
  }

  const baseUrl = 'https://redcreativa.pro'

  return {
    title: page.titulo,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: `${baseUrl}/guia/escritor-ia/${slug}`
    },
    openGraph: {
      title: page.titulo,
      description: page.description,
      type: 'article',
      url: `${baseUrl}/guia/escritor-ia/${slug}`,
      images: [{
        url: `${baseUrl}/api/og?title=${encodeURIComponent(page.titulo)}`,
        width: 1200,
        height: 630,
        alt: page.titulo.split('|')[0]
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: page.titulo,
      description: page.description
    },
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  }
}

function generateArticleSchema(page: any, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.titulo,
    description: page.description,
    url: `${baseUrl}/guia/escritor-ia/${page.slug}`,
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Red Creativa Pro'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.png`
      }
    },
    about: {
      '@type': 'Thing',
      name: page.titulo.split('|')[0]
    },
    keywords: page.keywords.join(', '),
    inLanguage: 'es'
  }
}

export function generateStaticParams() {
  return getAllClusterSlugs().map((slug) => ({ slug }))
}

export default async function ClusterPage({ params }: Props) {
  const { slug } = await params
  const page = getClusterPageBySlug(slug)

  if (!page) {
    notFound()
  }

  const baseUrl = 'https://redcreativa.pro'
  const relatedPages = escritorIACluster
    .filter(p => p.slug !== slug)
    .slice(0, 6)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateArticleSchema(page, baseUrl)) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/guia/escritor-ia" className="hover:text-foreground transition-colors">Guía Escritor IA</Link>
          <span>/</span>
          <span className="text-foreground">{page.titulo.split('|')[0]}</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <Badge className="mb-4" variant="outline">
            <BookOpen className="w-3 h-3 mr-1" />
            Guía Especializada
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {page.titulo}
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            {page.description}
          </p>
        </div>

        {/* Content Placeholder - In production, this would be full content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl">
            <p className="text-amber-800">
              <strong>Contenido en desarrollo:</strong> Esta página forma parte de nuestro cluster 
              de contenido sobre Escritores IA. El contenido completo estará disponible próximamente.
            </p>
            <p className="text-amber-700 mt-2">
              Keywords objetivo: {page.keywords.join(', ')}
            </p>
          </div>

          <h2>¿Qué encontrarás en esta guía?</h2>
          <p>
            En esta guía especializada sobre <strong>{page.titulo.split('|')[0]}</strong>, 
            cubriremos todo lo que necesitas saber para dominar este aspecto de los escritores IA.
          </p>

          <ul>
            <li>Conceptos fundamentales explicados paso a paso</li>
            <li>Mejores prácticas y técnicas avanzadas</li>
            <li>Herramientas recomendadas comparadas</li>
            <li>Ejemplos prácticos y casos de estudio</li>
            <li>Errores comunes y cómo evitarlos</li>
          </ul>

          <h2>Guía Principal Relacionada</h2>
          <p>
            Esta página forma parte de nuestro cluster de contenido sobre escritores IA. 
            Para una visión completa, no te pierdas nuestra guía principal:
          </p>
        </div>

        {/* Link to Pilar */}
        <Card className="mb-12 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Guía Definitiva del Escritor IA 2025</h3>
                <p className="text-muted-foreground">
                  La guía más completa: qué son, cómo funcionan, mejores herramientas y técnicas avanzadas.
                </p>
              </div>
              <Button asChild>
                <Link href={page.parentPilar}>
                  Leer guía completa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Cluster Pages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Temas relacionados</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {relatedPages.map((relatedPage) => (
              <Link key={relatedPage.slug} href={`/guia/escritor-ia/${relatedPage.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {relatedPage.titulo.split('|')[0]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {relatedPage.description.substring(0, 100)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guia/escritor-ia">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la guía principal
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              Probar Red Creativa Pro
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
    </>
  )
}
