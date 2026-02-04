import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'
import BlogClientView from '../BlogClientView'

export const metadata: Metadata = {
  title: 'Blog | Red Creativa Pro - Artículos sobre IA y Marketing Digital',
  description: 'Descubre artículos sobre inteligencia artificial, copywriting, SEO y marketing digital. Aprende a escribir mejor con IA.',
  openGraph: {
    title: 'Blog | Red Creativa Pro',
    description: 'Artículos sobre IA, copywriting y marketing digital',
    type: 'website',
  },
}

import { headers } from 'next/headers'

async function getBlogPosts(locale: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('language', locale)
      .lte('published_at', new Date().toISOString()) // Filter out future posts
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Unexpected error in getBlogPosts:', err);
    return [];
  }
}

// Removing revalidate to avoid conflicts with dynamic headers()
// export const revalidate = 3600

export default async function BlogPage() {
  const headersList = await headers()
  const locale = headersList.get('x-language') || 'en'
  const posts = await getBlogPosts(locale)
  return <BlogClientView initialPosts={posts || []} initialLang={locale} />
}

