import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-static'
export const revalidate = 3600

// Cliente Supabase para build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://redcreativa.pro'
  const currentDate = new Date()

  // URLs base importantes (sin duplicar por idioma)
  const baseUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/escritor-ia`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/prompts`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/planes`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/herramientas`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contacto`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/preguntas-frecuentes`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/politica-privacidad`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terminos-servicio`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/aviso-legal`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Fetch blog posts from database con sus idiomas reales
  let blogPostsUrls: MetadataRoute.Sitemap = []
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, language, updated_at, published_at')
      .eq('status', 'published')
    
    if (posts) {
      for (const post of posts) {
        const lastMod = new Date(post.updated_at || post.published_at)
        const langPrefix = post.language === 'es' ? '' : `/${post.language}`
        
        blogPostsUrls.push({
          url: `${baseUrl}${langPrefix}/blog/${post.slug}`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.8
        })
      }
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
  }

  // Combinar todas las URLs
  return [...baseUrls, ...blogPostsUrls]
}
