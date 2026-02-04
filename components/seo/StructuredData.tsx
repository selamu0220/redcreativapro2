import { BlogPost } from '@/lib/blog-data'

interface StructuredDataProps {
  post: BlogPost
  url: string
}

export default function StructuredData({ post, url }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image || `https://redcreativa.pro/og-image.jpg`,
    author: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      url: 'https://redcreativa.pro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://redcreativa.pro/icon.png',
        width: 512,
        height: 512
      },
      sameAs: [
        "https://twitter.com/redcreativapro",
        "https://www.linkedin.com/company/redcreativapro",
        "https://www.instagram.com/redcreativapro"
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      url: 'https://redcreativa.pro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://redcreativa.pro/icon.png',
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
    articleSection: post.category,
    keywords: post.tags.join(', '),
    wordCount: post.content?.length || 1500,
    timeRequired: `PT${post.readTime.replace(' min', 'M')}`,
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
        item: 'https://redcreativa.pro'
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
        name: post.category ? post.category.charAt(0).toUpperCase() + post.category.slice(1).replace('-', ' ') : 'General',
        item: `https://redcreativa.pro/blog?category=${post.category}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
        item: url
      }
    ]
  }

  // Add FAQ structured data if the post has FAQ content
  const faqData = post.tags.includes('faq') ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `¿Cómo ${post.title.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: post.excerpt
        }
      }
    ]
  } : null

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
      {faqData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqData)
          }}
        />
      )}
    </>
  )
}