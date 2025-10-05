import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { blogPosts, categories } from '@/lib/blog-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://redcreativa.pro'
  
  // Static pages with SEO optimization
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/escritor-ia`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/correos-ia`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/seo-dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/planes`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/preguntas-frecuentes`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calendario`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contactos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/documentos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/prompts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/plantillas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/estadisticas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/centro-ayuda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos-servicio`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/success`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cancel`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/ajustes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/suscripcion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/unsubscribe`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Blog posts with enhanced SEO optimization including images
  const blogSitemapEntries: MetadataRoute.Sitemap = blogPosts.map((post) => {
    // Calculate priority based on multiple factors for better SEO
    let priority = 0.7 // Base priority for blog posts
    
    if (post.featured) priority += 0.2 // Featured posts get higher priority
    if (post.trending) priority += 0.1 // Trending posts get boost
    if (post.views && post.views > 10000) priority += 0.1 // High-traffic posts
    if (new Date(post.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) priority += 0.1 // Recent posts
    
    // Cap priority at 1.0
    priority = Math.min(priority, 1.0)
    
    // Determine change frequency based on post characteristics
    let changeFreq: 'daily' | 'weekly' | 'monthly' = 'monthly'
    if (post.trending || (post.views && post.views > 5000)) changeFreq = 'weekly'
    if (post.featured && new Date(post.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) changeFreq = 'daily'
    
    // Create sitemap entry with image metadata for better SEO
    const sitemapEntry: any = {
      url: `${baseUrl}/blog/${post.id}`,
      lastModified: new Date(post.date),
      changeFrequency: changeFreq,
      priority: priority,
    }
    
    // Add image metadata if available for enhanced SEO
    if (post.image) {
      sitemapEntry.images = [{
        url: post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`,
        title: post.title,
        caption: post.excerpt,
      }]
    } else {
      // Add default OG image for posts without specific images
      sitemapEntry.images = [{
        url: `${baseUrl}/og-image.jpg`,
        title: post.title,
        caption: post.excerpt,
      }]
    }
    
    return sitemapEntry
  })

  // Blog categories with enhanced SEO
  const categorySitemapEntries: MetadataRoute.Sitemap = categories.map((category) => {
    // Calculate posts count in category for priority adjustment
    const postsInCategory = blogPosts.filter(post => post.category === category.id).length
    const basePriority = 0.7
    const priorityBoost = Math.min(postsInCategory * 0.01, 0.2) // Up to 0.2 boost based on content volume
    
    return {
      url: `${baseUrl}/blog?category=${category.id}`,
      lastModified: new Date(),
      changeFrequency: postsInCategory > 10 ? 'weekly' as const : 'monthly' as const,
      priority: Math.min(basePriority + priorityBoost, 0.9),
    }
  })

  // Blog subcategories with dynamic priorities
  const subcategorySitemapEntries: MetadataRoute.Sitemap = []
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      // Count posts in this subcategory
      const postsInSubcategory = blogPosts.filter(post => 
        post.category === category.id && post.subcategory === subcategory.id
      ).length
      
      const basePriority = 0.6
      const priorityBoost = Math.min(postsInSubcategory * 0.02, 0.2)
      
      subcategorySitemapEntries.push({
        url: `${baseUrl}/blog?category=${category.id}&subcategory=${subcategory.id}`,
        lastModified: new Date(),
        changeFrequency: postsInSubcategory > 5 ? 'weekly' as const : 'monthly' as const,
        priority: Math.min(basePriority + priorityBoost, 0.8),
      })
    })
  })

  // Dynamic SEO project pages
  let dynamicPages: MetadataRoute.Sitemap = []
  
  try {
    // Fetch SEO projects for dynamic sitemap generation
    const { data: projects } = await supabase
      .from('seo_projects')
      .select('id, domain, updated_at')
      .eq('status', 'active')
      .limit(1000) // Limit to prevent excessive sitemap size

    if (projects) {
      dynamicPages = projects.map(project => ({
        url: `${baseUrl}/seo-project/${project.id}`,
        lastModified: new Date(project.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }

    // Fetch generated content for SEO-optimized URLs
    const { data: content } = await supabase
      .from('seo_generated_content')
      .select('id, title, updated_at')
      .eq('status', 'published')
      .limit(500)

    if (content) {
      const contentPages = content.map(item => ({
        url: `${baseUrl}/seo-content/${item.id}`,
        lastModified: new Date(item.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
      
      dynamicPages = [...dynamicPages, ...contentPages]
    }

    // Add keyword-specific landing pages
    const { data: keywords } = await supabase
      .from('seo_keywords')
      .select('keyword, updated_at')
      .gte('search_volume', 1000) // Only high-volume keywords
      .limit(200)

    if (keywords) {
      const keywordPages = keywords.map(kw => ({
        url: `${baseUrl}/keyword/${encodeURIComponent(kw.keyword.toLowerCase().replace(/\s+/g, '-'))}`,
        lastModified: new Date(kw.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))
      
      dynamicPages = [...dynamicPages, ...keywordPages]
    }

  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error)
    // Continue with static pages only if dynamic generation fails
  }

  return [
    ...staticPages, 
    ...blogSitemapEntries, 
    ...categorySitemapEntries, 
    ...subcategorySitemapEntries, 
    ...dynamicPages
  ]
}