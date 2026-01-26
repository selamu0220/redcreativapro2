import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import BlogClientView from './BlogClientView'

export const metadata: Metadata = {
  title: 'Blog | Red Creativa Pro - Artículos sobre IA y Marketing Digital',
  description: 'Descubre artículos sobre inteligencia artificial, copywriting, SEO y marketing digital. Aprende a escribir mejor con IA.',
  openGraph: {
    title: 'Blog | Red Creativa Pro',
    description: 'Artículos sobre IA, copywriting y marketing digital',
    type: 'website',
  },
}

async function getBlogPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return data || []
}

export const revalidate = 3600

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <BlogClientView initialPosts={posts} />
}

