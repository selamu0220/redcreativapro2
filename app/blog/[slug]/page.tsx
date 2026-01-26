import { use } from 'react'
import type { Metadata } from 'next'
import BlogPostClientView from './BlogPostClientView'
import { createClient } from '@/utils/supabase/client'

// Generate Metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = createClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('title, excerpt, image')
    .eq('slug', resolvedParams.slug)
    .single()

  if (!data) return { title: 'Artículo no encontrado | Red Creativa Pro' }

  return {
    title: `${data.title} | Red Creativa Pro Blog`,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt,
      images: [data.image],
      type: 'article',
    }
  }
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  // We pass the slug to the client component which will handle fetching and animation states
  // This allows for a smooth, app-like transition and data loading experience.
  return <BlogPostClientView slug={resolvedParams.slug} />
}
