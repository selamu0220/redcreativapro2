import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'

import { getBlogPost, getBlogPosts } from '@/app/lib/blog-service'
import { getServerLanguage } from "@/app/lib/language/server"
import UnifiedBlogTemplate from '@/components/blog/UnifiedBlogTemplate'
import BlogContent from '@/components/blog/BlogContent'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getBlogPost(slug)

    if (!post) {
      return {
        title: 'Artículo no encontrado | Red Creativa Pro',
        description: 'El artículo que buscas no existe o ha sido movido.'
      }
    }

    return {
      title: post.seoTitle || `${post.title} | Red Creativa Pro`,
      description: post.seoDescription || post.excerpt,
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        type: 'article',
        publishedTime: post.publishedAt,
        images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        images: post.image ? [post.image] : [],
      },
      alternates: {
        canonical: `https://redcreativa.pro/blog/${slug}`,
      },
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      title: 'Blog | Red Creativa Pro',
      description: 'Artículos sobre inteligencia artificial y escritura profesional.',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const lang = await getServerLanguage()

  // Fetch from Appwrite Service
  let post = await getBlogPost(slug)

  // If not found, show 404
  if (!post) {
    console.warn(`Post not found for slug: ${slug}`);
    notFound()
  }

  // Render using the UnifiedBlogTemplate - GUARANTEED PERFECT STYLING
  return (
    <UnifiedBlogTemplate post={post}>
      <BlogContent content={post.content || 'Contenido no disponible.'} />
    </UnifiedBlogTemplate>
  )
}

// Generate static params for latest posts to improve build performance
export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts(20);
    return posts.map((post) => ({
      slug: post.slug, // Use slug for routing
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

