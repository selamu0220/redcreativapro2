import { use } from 'react'
import type { Metadata } from 'next'
import BlogPostClientView from './BlogPostClientView'
import { createClient } from '@/utils/supabase/server'
import { SchemaJSONLD } from '@/lib/seo/SchemaJSONLD'
import { WithContext, Article, BreadcrumbList, FAQPage } from 'schema-dts'

// Generate Metadata dynamically with enhanced SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select('title, excerpt, image, category, tags, published_at, author')
      .eq('slug', resolvedParams.slug)
      .maybeSingle()

    if (error) {
      console.error("Metadata fetch error:", error)
      return { title: 'Error de Servidor | Red Creativa Pro' }
    }

    if (!data) return { title: 'Artículo no encontrado | Red Creativa Pro' }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'
    const ogTitle = encodeURIComponent(data.title)
    const ogImage = `${baseUrl}/api/og?title=${ogTitle}`
    
    // Generate SEO-optimized keywords from tags and category
    const keywords = [
      ...(data.tags || []),
      data.category,
      'ia escritura',
      'copywriting',
      'marketing digital',
      'red creativa pro'
    ].filter(Boolean)

    return {
      title: `${data.title} | Guía ${data.category || 'IA'} 2025 | Red Creativa Pro`,
      description: data.excerpt || `Guía completa sobre ${data.title}. Aprende con Red Creativa Pro a escribir mejor con IA.`,
      keywords: keywords,
      authors: [{ name: data.author || 'Red Creativa Pro Team' }],
      alternates: {
        canonical: `${baseUrl}/blog/${resolvedParams.slug}`
      },
      openGraph: {
        title: data.title,
        description: data.excerpt,
        url: `${baseUrl}/blog/${resolvedParams.slug}`,
        type: 'article',
        publishedTime: data.published_at,
        authors: [data.author || 'Red Creativa Pro Team'],
        section: data.category,
        tags: data.tags,
        images: [{ 
          url: ogImage,
          width: 1200,
          height: 630,
          alt: data.title 
        }]
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title,
        description: data.excerpt,
        images: [ogImage]
      },
      robots: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        googleBot: {
          index: true,
          follow: true,
          'max-snippet': -1,
          'max-image-preview': 'large',
          'max-video-preview': -1
        }
      }
    }
  } catch (e) {
    console.error("Metadata CRITICAL error:", e)
    return { title: 'Error | Red Creativa Pro' }
  }
}


// ... (metadata function ends above)

// Timestamp: Forced update
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params
    const supabase = await createClient()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'

    // Re-fetch basic data for Schema
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .maybeSingle()

    if (error) {
      console.error("BlogPostPage Server Error:", error)
      // Fallback to client view which handles fetching internally if no data passed?
      // Actually BlogPostClientView fetches its own data if we pass just slug.
      // But we want to show the error if possible or let client try.
      return (
        <div className="p-10 text-center">
          <h1 className="text-2xl font-bold text-red-500">Error cargando artículo</h1>
          <p className="text-gray-400">Detalles: {error.message}</p>
          <BlogPostClientView slug={resolvedParams.slug} />
        </div>
      )
    }

    // If no data found (404), maybe return Client View to let it handle 404 UI?
    if (!data) return <BlogPostClientView slug={resolvedParams.slug} />

    // Enhanced Article Schema with more SEO properties
    const articleSchema: WithContext<Article> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      description: data.excerpt,
      image: {
        '@type': 'ImageObject',
        url: `${baseUrl}/api/og?title=${encodeURIComponent(data.title)}`,
        width: 1200,
        height: 630
      },
      datePublished: data.published_at || new Date().toISOString(),
      dateModified: data.updated_at || data.published_at || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: data.author || 'Red Creativa Pro Team',
        url: `${baseUrl}/creador`
      },
      publisher: {
        '@type': 'Organization',
        name: 'Red Creativa Pro',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/icon.png`,
          width: 192,
          height: 192
        }
      },
      articleSection: data.category,
      keywords: data.tags?.join(', ') || 'ia, escritura, copywriting',
      articleBody: data.content?.substring(0, 5000) || data.excerpt,
      wordCount: data.content?.split(/\s+/).length || 0,
      inLanguage: data.language || 'es',
      isAccessibleForFree: true,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blog/${resolvedParams.slug}`
      }
    }

    // FAQ Schema - Extract from structured content if available
    let faqSchema: WithContext<FAQPage> | null = null
    if (data.structuredContent && data.structuredContent.length > 0) {
      const faqSections = data.structuredContent.filter(
        (section: any) => section.type === 'faq' || section.title?.toLowerCase().includes('pregunt')
      )
      
      if (faqSections.length > 0) {
        const mainEntity = faqSections.flatMap((section: any) => 
          section.content?.map((item: any) => ({
            '@type': 'Question' as const,
            name: item.question || item.title,
            acceptedAnswer: {
              '@type': 'Answer' as const,
              text: item.answer || item.content
            }
          })) || []
        ).filter((item: any) => item.name && item.acceptedAnswer?.text)

        if (mainEntity.length > 0) {
          faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity
          }
        }
      }
    }

    // Breadcrumb Schema
    const breadcrumbSchema: WithContext<BreadcrumbList> = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${baseUrl}/blog`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: data.title,
          item: `${baseUrl}/blog/${resolvedParams.slug}`
        }
      ]
    }

    // Fetch Siblings (Translations)
    let alternates: Record<string, string> = {}
    if (data.translation_group_id) {
      const { data: siblings } = await supabase
        .from('blog_posts')
        .select('language, slug')
        .eq('translation_group_id', data.translation_group_id)

      if (siblings) {
        alternates = siblings.reduce((acc, curr) => {
          acc[curr.language] = curr.slug
          return acc
        }, {} as Record<string, string>)
      }
    }

    return (
      <>
        <SchemaJSONLD json={articleSchema} />
        <SchemaJSONLD json={breadcrumbSchema} />
        {faqSchema && <SchemaJSONLD json={faqSchema} />}
        <BlogPostClientView slug={resolvedParams.slug} alternates={alternates} />
      </>
    )
  } catch (e: any) {
    console.error("CRITICAL CHECK: BlogPostPage Crashed", e)
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-3xl font-bold text-red-500">Error Crítico del Sistema</h1>
        <p className="max-w-md text-center text-gray-300">{e?.message || 'Error desconocido'}</p>
        <pre className="bg-gray-900 p-4 rounded text-xs overflow-auto max-w-2xl">
          {JSON.stringify(e, null, 2)}
        </pre>
      </div>
    )
  }
}
