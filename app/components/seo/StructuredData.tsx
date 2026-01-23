interface PostData {
  title: string
  excerpt: string
  image?: string
  publishedAt: string
  category?: string
  tags?: string[]
  content?: string
  readTime?: string
}

interface StructuredDataProps {
  post: PostData
  url: string
  authorName?: string
}

export default function StructuredData({ post, url, authorName = 'Red Creativa Pro' }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image || `https://redcreativa.pro/og-image.jpg`,
    author: {
      '@type': authorName === 'Red Creativa Pro' ? 'Organization' : 'Person',
      name: authorName,
      url: authorName === 'Red Creativa Pro' ? 'https://www.redcreativa.pro' : undefined,
      logo: authorName === 'Red Creativa Pro' ? {
        '@type': 'ImageObject',
        url: 'https://redcreativa.pro/logo.png',
        width: 512,
        height: 512
      } : undefined
    },
    publisher: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      url: 'https://www.redcreativa.pro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://redcreativa.pro/logo.png',
        width: 512,
        height: 512
      }
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    articleSection: post.category || 'Blog',
    keywords: post.tags?.join(', ') || '',
    wordCount: post.content?.length || 1500,
    timeRequired: post.readTime ? `PT${post.readTime.replace(/\D/g, '')}M` : 'PT5M',
    inLanguage: 'es-ES',
    isAccessibleForFree: true,
    genre: 'Marketing Digital',
    about: {
      '@type': 'Thing',
      name: 'Marketing Digital con IA',
      description: 'Estrategias y herramientas de marketing digital potenciadas por inteligencia artificial'
    }
  }

  // Add breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://www.redcreativa.pro'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://redcreativa.pro/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: url
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData)
        }}
      />
    </>
  )
}