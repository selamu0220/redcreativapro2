import ArticleWrapper from "@/app/components/ArticleWrapper";
import { Metadata } from 'next'
import BlogPostLayout from '@/components/blog/BlogPostLayout'
import { blogPosts } from '@/lib/blog-data'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Caso de Estudio: Agencia Automatizó 50 Clientes con IA y Aumentó Ingresos 600% | Red Creativa Pro',
    description: '🤖 Descubre cómo una agencia de marketing automatizó completamente 50 clientes usando IA ★ redujo tiempo operativo 80% ✓ aumentó ingresos 600% en 12 meses.',
    keywords: 'caso estudio agencia marketing IA, automatización agencia, escalado agencia marketing, white label IA, automatización clientes',
    authors: [{ name: 'Selamu' }],
    openGraph: {
      title: 'Caso de Estudio: Agencia Automatizó 50 Clientes con IA y Aumentó Ingresos 600%',
      description: 'Descubre cómo una agencia de marketing automatizó completamente 50 clientes usando IA, redujo tiempo operativo 80% y aumentó ingresos 600% en 12 meses.',
      type: 'article',
      publishedTime: '2024-12-20',
      authors: ['Selamu'],
      tags: ['caso estudio agencia marketing IA', 'automatización agencia', 'escalado agencia marketing', 'white label IA', 'automatización clientes'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Caso de Estudio: Agencia Automatizó 50 Clientes con IA y Aumentó Ingresos 600%',
      description: 'Descubre cómo una agencia de marketing automatizó completamente 50 clientes usando IA, redujo tiempo operativo 80% y aumentó ingresos 600% en 12 meses.',
    },
    alternates: {
      canonical: 'https://redcreativapro.com/blog/caso-estudio-agencia-marketing-automatizo-clientes-ia',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export default function CasoEstudioAgenciaAutomatizacion() {
  const post = blogPosts.find(p => p.id === 'caso-estudio-agencia-marketing-automatizo-clientes-ia')
  
  if (!post) {
    throw new Error('Post not found')
  }


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": [
      "Article",
      "BlogPosting",
      "TechArticle"
    ],
    "headline": "Caso de Estudio: Agencia Automatizó 50 Clientes con IA y Aumentó Ingresos 600%",
    "description": "Descubre cómo una agencia de marketing automatizó completamente 50 clientes usando IA, redujo tiempo operativo 80% y aumentó ingresos 600% en 12 meses.",
    "keywords": "caso estudio agencia marketing IA, automatización agencia, escalado agencia marketing, white label IA, automatización clientes",
    "author": {
      "@type": "Person",
      "name": "Selamu",
      "url": "https://redcreativapro.com/autor/selamu",
      "sameAs": [
        "https://linkedin.com/in/selamu",
        "https://twitter.com/selamu"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Red Creativa Pro",
      "url": "https://redcreativapro.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://redcreativapro.com/logo.png",
        "width": 200,
        "height": 60
      },
      "sameAs": [
        "https://facebook.com/redcreativapro",
        "https://twitter.com/redcreativapro",
        "https://linkedin.com/company/redcreativapro"
      ]
    },
    "datePublished": "2024-12-20",
    "dateModified": "2024-12-20",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://redcreativapro.com/blog/caso-estudio-agencia-marketing-automatizo-clientes-ia"
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://redcreativapro.com/blog/caso-estudio-agencia-marketing-automatizo-clientes-ia/og-image.jpg",
      "width": 1200,
      "height": 630
    },
    "articleSection": "Casos de Estudio",
    "wordCount": 2500,
    "inLanguage": "es-ES",
    "copyrightYear": 2024,
    "copyrightHolder": {
      "@type": "Organization",
      "name": "Red Creativa Pro"
    },
    "isAccessibleForFree": true,
    "hasPart": [
      {
        "@type": "WebPageElement",
        "cssSelector": ".article-content"
      }
    ],
    "about": [
      {
        "@type": "Thing",
        "name": "automatización agencia marketing"
      },
      {
        "@type": "Thing",
        "name": "escalado agencia con IA"
      },
      {
        "@type": "Thing",
        "name": "white label IA"
      }
    ],
    "mentions": [
      {
        "@type": "Thing",
        "name": "automatización clientes"
      },
      {
        "@type": "Thing",
        "name": "inteligencia artificial marketing"
      },
      {
        "@type": "Thing",
        "name": "caso estudio agencia"
      }
    ]
  }

  return (
    <BlogPostLayout post={post}>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Caso de Estudio
        </h1>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Caso de Estudio
        </h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </BlogPostLayout>
  )
}

