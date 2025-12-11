import { Metadata } from 'next'
import BlogPostLayout from '@/components/blog/BlogPostLayout'
import { blogPosts } from '@/lib/blog-data'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Caso de Estudio: Empresa B2B Generó 1,200 Leads/Mes con IA | Red Creativa Pro',
    description: '💡 Descubre cómo una empresa B2B generó 1 ★200 leads cualificados mensuales usando IA ★ automatizó su funnel de ventas ✓ aumentó conversiones 350% en 8 meses.',
    keywords: 'caso estudio B2B leads IA, generación leads automatizada, funnel ventas IA, marketing B2B automatización, leads cualificados IA',
    authors: [{ name: 'Selamu' }],
    openGraph: {
      title: 'Caso de Estudio: Empresa B2B Generó 1,200 Leads/Mes con IA',
      description: 'Descubre cómo una empresa B2B generó 1,200 leads cualificados mensuales usando IA, automatizó su funnel de ventas y aumentó conversiones 350% en 8 meses.',
      type: 'article',
      publishedTime: '2024-12-20',
      authors: ['Selamu'],
      tags: ['caso estudio B2B leads IA', 'generación leads automatizada', 'funnel ventas IA', 'marketing B2B automatización', 'leads cualificados IA'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Caso de Estudio: Empresa B2B Generó 1,200 Leads/Mes con IA',
      description: 'Descubre cómo una empresa B2B generó 1,200 leads cualificados mensuales usando IA, automatizó su funnel de ventas y aumentó conversiones 350% en 8 meses.',
    },
    alternates: {
      canonical: 'https://redcreativapro.com/blog/caso-estudio-b2b-genero-1200-leads-mes-ia',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export default function CasoEstudioB2B1200Leads() {
  const post = blogPosts.find(p => p.id === 'caso-estudio-b2b-genero-1200-leads-mes-ia')
  
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
    "headline": "Caso de Estudio: Empresa B2B Generó 1,200 Leads/Mes con IA",
    "description": "Descubre cómo una empresa B2B generó 1,200 leads cualificados mensuales usando IA, automatizó su funnel de ventas y aumentó conversiones 350% en 8 meses.",
    "keywords": "caso estudio B2B leads IA, generación leads automatizada, funnel ventas IA, marketing B2B automatización, leads cualificados IA",
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
      "@id": "https://redcreativapro.com/blog/caso-estudio-b2b-genero-1200-leads-mes-ia"
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://redcreativapro.com/blog/caso-estudio-b2b-genero-1200-leads-mes-ia/og-image.jpg",
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
        "name": "generación leads B2B"
      },
      {
        "@type": "Thing",
        "name": "automatización marketing B2B"
      },
      {
        "@type": "Thing",
        "name": "funnel ventas IA"
      }
    ],
    "mentions": [
      {
        "@type": "Thing",
        "name": "leads cualificados IA"
      },
      {
        "@type": "Thing",
        "name": "conversiones automatizadas"
      },
      {
        "@type": "Thing",
        "name": "caso estudio B2B"
      }
    ]
  }

  return (
    <BlogPostLayout post={post}>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Caso de Estudio
        </h1>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Caso de Estudio
        </h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </BlogPostLayout>
  )
}

