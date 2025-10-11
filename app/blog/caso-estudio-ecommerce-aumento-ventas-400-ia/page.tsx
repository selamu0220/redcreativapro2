import { Metadata } from 'next'
import BlogPostLayout from '@/components/blog/BlogPostLayout'
import { blogPosts } from '@/lib/blog-data'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Caso de Estudio: E-commerce Aumentó Ventas 400% con IA en 8 Meses | Red Creativa Pro',
    description: 'Descubre cómo un e-commerce aumentó sus ventas 400% en 8 meses usando IA para personalización, recomendaciones y automatización del customer journey.',
    keywords: 'caso estudio ecommerce IA, aumento ventas ecommerce IA, personalización ecommerce IA, recomendaciones productos IA, automatización customer journey',
    authors: [{ name: 'Selamu' }],
    openGraph: {
      title: 'Caso de Estudio: E-commerce Aumentó Ventas 400% con IA en 8 Meses',
      description: 'Descubre cómo un e-commerce aumentó sus ventas 400% en 8 meses usando IA para personalización, recomendaciones y automatización del customer journey.',
      type: 'article',
      publishedTime: '2024-12-20',
      authors: ['Selamu'],
      tags: ['caso estudio ecommerce IA', 'aumento ventas ecommerce IA', 'personalización ecommerce IA', 'recomendaciones productos IA', 'automatización customer journey'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Caso de Estudio: E-commerce Aumentó Ventas 400% con IA en 8 Meses',
      description: 'Descubre cómo un e-commerce aumentó sus ventas 400% en 8 meses usando IA para personalización, recomendaciones y automatización del customer journey.',
    },
    alternates: {
      canonical: 'https://redcreativapro.com/blog/caso-estudio-ecommerce-aumento-ventas-400-ia',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export default function CasoEstudioEcommerceVentas400() {
  const post = blogPosts.find(p => p.id === 'caso-estudio-ecommerce-aumento-ventas-400-ia')
  
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
    "headline": "Caso de Estudio: E-commerce Aumentó Ventas 400% con IA en 8 Meses",
    "description": "Descubre cómo un e-commerce aumentó sus ventas 400% en 8 meses usando IA para personalización, recomendaciones y automatización del customer journey.",
    "keywords": "caso estudio ecommerce IA, aumento ventas ecommerce IA, personalización ecommerce IA, recomendaciones productos IA, automatización customer journey",
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
      "@id": "https://redcreativapro.com/blog/caso-estudio-ecommerce-aumento-ventas-400-ia"
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://redcreativapro.com/blog/caso-estudio-ecommerce-aumento-ventas-400-ia/og-image.jpg",
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
        "name": "aumento ventas ecommerce IA"
      },
      {
        "@type": "Thing",
        "name": "personalización ecommerce IA"
      },
      {
        "@type": "Thing",
        "name": "recomendaciones productos IA"
      }
    ],
    "mentions": [
      {
        "@type": "Thing",
        "name": "automatización customer journey"
      },
      {
        "@type": "Thing",
        "name": "optimización conversiones IA"
      },
      {
        "@type": "Thing",
        "name": "caso estudio ecommerce"
      }
    ]
  }

  return (
    <BlogPostLayout post={post}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </BlogPostLayout>
  )
}


