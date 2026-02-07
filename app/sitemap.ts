import { MetadataRoute } from 'next'
import { 
  getAllCategoriaSlugs, 
  getAllCompetidorSlugs,
  getAllIndustriaSlugs
} from '@/lib/programmatic-seo-data'
import { promptPages } from '@/lib/prompts-data'
import { getAllClusterSlugs } from '@/lib/content-clusters'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://redcreativa.pro'
  const currentDate = new Date()

  const mainPages: MetadataRoute.Sitemap = [
    { 
      url: baseUrl, 
      lastModified: currentDate, 
      changeFrequency: 'daily', 
      priority: 1.0 
    },
    { 
      url: `${baseUrl}/blog`, 
      lastModified: currentDate, 
      changeFrequency: 'daily', 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/prompts`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/planes`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.7 
    },
    { 
      url: `${baseUrl}/contacto`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.6 
    },
    { 
      url: `${baseUrl}/herramientas`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.85 
    },
  ]

  const sectionPages: MetadataRoute.Sitemap = [
    { 
      url: `${baseUrl}/categoria`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.75 
    },
    { 
      url: `${baseUrl}/comparativas`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.75 
    },
    { 
      url: `${baseUrl}/alternativas`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.75 
    },
    { 
      url: `${baseUrl}/industria`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.75 
    },
  ]

  const guidePages: MetadataRoute.Sitemap = [
    { 
      url: `${baseUrl}/guia/escritor-ia`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/guia/prompts-ia`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/guia/seo-ia`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/guia/copywriting-ia`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/guia/marketing-ia`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.85 
    },
  ]

  const toolPages: MetadataRoute.Sitemap = [
    { 
      url: `${baseUrl}/herramientas/calculadora-meta-tags`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/herramientas/generador-headlines`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    // Nuevas páginas SEO 2025
    { 
      url: `${baseUrl}/mejores-herramientas-ia-escritura`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/copywriting-espanol`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/seo-con-ia`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/escritor-ia-gratis`, 
      lastModified: currentDate, 
      changeFrequency: 'weekly', 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/mejores-ia-2025`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/email-marketing-ia`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/redes-sociales-ia`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/prompt-engineering`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/inteligencia-artificial-escritura`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/automatizar-contenido`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/chatgpt-vs-claude`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/guia-chatgpt-espanol`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/ia-para-blogs`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/escritura-creativa-ia`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/copywriting-ecommerce`, 
      lastModified: currentDate, 
      changeFrequency: 'monthly', 
      priority: 0.8 
    },
  ]

  const promptUrls: MetadataRoute.Sitemap = promptPages.map(prompt => ({
    url: `${baseUrl}/prompts/${prompt.slug}`,
    lastModified: new Date(prompt.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  const categorySlugs = getAllCategoriaSlugs()
  const categoryUrls: MetadataRoute.Sitemap = categorySlugs.map(slug => ({
    url: `${baseUrl}/categoria/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))

  const competitorSlugs = getAllCompetidorSlugs()
  const comparisonUrls: MetadataRoute.Sitemap = competitorSlugs.map(slug => ({
    url: `${baseUrl}/comparativas/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.65
  }))

  const alternativeUrls: MetadataRoute.Sitemap = competitorSlugs.map(slug => ({
    url: `${baseUrl}/alternativas/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.65
  }))

  const industrySlugs = getAllIndustriaSlugs()
  const industryUrls: MetadataRoute.Sitemap = industrySlugs.map(slug => ({
    url: `${baseUrl}/industria/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))

  const clusterSlugs = getAllClusterSlugs()
  const clusterUrls: MetadataRoute.Sitemap = clusterSlugs.map(slug => ({
    url: `${baseUrl}/guia/escritor-ia/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.65
  }))

  return [
    ...mainPages,
    ...sectionPages,
    ...guidePages,
    ...toolPages,
    ...promptUrls,
    ...categoryUrls,
    ...comparisonUrls,
    ...alternativeUrls,
    ...industryUrls,
    ...clusterUrls,
  ]
}
