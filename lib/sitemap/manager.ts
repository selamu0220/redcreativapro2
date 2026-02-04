/**
 * Sitemap Manager Service
 * Manages sitemap generation with strictly typed validation and configuration
 */

import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/app/lib/language/config'
import { SitemapConfig, SitemapEntry, ValidationReport } from './types'
import { SITEMAP_CONFIG, PRIORITY_LEVELS } from './config'
import { addLanguageToPath, normalizeUrl } from './utils'
import { URLValidator } from './validator'
import { FirecrawlService } from './firecrawl'

export class SitemapManager {
  private static instance: SitemapManager
  private config: SitemapConfig
  private validator: URLValidator
  private firecrawl: FirecrawlService

  private constructor(config: Partial<SitemapConfig> = {}) {
    this.config = {
      ...SITEMAP_CONFIG,
      ...config
    }
    this.validator = new URLValidator('app/blog', this.config.baseUrl)
    this.firecrawl = FirecrawlService.getInstance()
  }

  public static getInstance(config?: Partial<SitemapConfig>): SitemapManager {
    if (!SitemapManager.instance) {
      SitemapManager.instance = new SitemapManager(config)
    }
    return SitemapManager.instance
  }

  /**
   * Generate clean sitemap with validated URLs
   */
  async generateCleanSitemap(): Promise<MetadataRoute.Sitemap> {
    const currentDate = new Date()

    // Validate URLs if enabled
    if (this.config.validateUrls) {
      await this.validator.validateAllBlogUrls()
    }

    if (this.config.enableFirecrawl) {
      console.log('Firecrawl enabled: Discovering URLs...')
      const discoveredUrls = await this.firecrawl.discoverUrls(this.config.baseUrl)
      console.log(`Firecrawl discovered ${discoveredUrls.length} URLs`)
      // Future logic: Compare discovered vs generated
    }

    // Generate main page entries
    const mainPageEntries = this.generateMainPageEntries(currentDate)

    // Generate blog entries
    const blogEntries = this.generateBlogEntries(currentDate)

    // Combine and sort entries
    const allEntries = [...mainPageEntries, ...blogEntries]
    return allEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * Generate main page sitemap entries
   */
  private generateMainPageEntries(currentDate: Date): MetadataRoute.Sitemap {
    const mainPagePaths = [
      { path: '/', priority: PRIORITY_LEVELS.HOME, changeFrequency: 'daily' as const },
      { path: '/escritor-ia', priority: PRIORITY_LEVELS.LANDING, changeFrequency: 'weekly' as const },
      { path: '/correos-ia', priority: PRIORITY_LEVELS.LANDING, changeFrequency: 'weekly' as const },
      { path: '/seo-dashboard', priority: PRIORITY_LEVELS.FEATURE, changeFrequency: 'weekly' as const },
      { path: '/dashboard', priority: PRIORITY_LEVELS.FEATURE, changeFrequency: 'daily' as const },
      { path: '/planes', priority: PRIORITY_LEVELS.LANDING, changeFrequency: 'weekly' as const },
      { path: '/blog', priority: PRIORITY_LEVELS.BLOG_INDEX, changeFrequency: 'daily' as const },
      { path: '/contacto', priority: 0.8, changeFrequency: 'monthly' as const },
      { path: '/centro-ayuda', priority: PRIORITY_LEVELS.DOCS, changeFrequency: 'weekly' as const },
      { path: '/preguntas-frecuentes', priority: 0.7, changeFrequency: 'monthly' as const },
      { path: '/prompts', priority: 0.7, changeFrequency: 'weekly' as const },
      { path: '/plantillas', priority: 0.65, changeFrequency: 'weekly' as const },
      { path: '/calendario', priority: 0.6, changeFrequency: 'weekly' as const },
      { path: '/documentos', priority: 0.6, changeFrequency: 'weekly' as const },
      { path: '/contactos', priority: 0.55, changeFrequency: 'weekly' as const },
      { path: '/estadisticas', priority: 0.55, changeFrequency: 'weekly' as const },
      { path: '/ajustes', priority: 0.5, changeFrequency: 'monthly' as const },
      { path: '/suscripcion', priority: 0.5, changeFrequency: 'weekly' as const },
      { path: '/historial', priority: 0.45, changeFrequency: 'weekly' as const },
      { path: '/auth', priority: 0.4, changeFrequency: 'monthly' as const },
      { path: '/aviso-legal', priority: PRIORITY_LEVELS.LEGAL, changeFrequency: 'yearly' as const },
      { path: '/politica-privacidad', priority: PRIORITY_LEVELS.LEGAL, changeFrequency: 'yearly' as const },
      { path: '/terminos-servicio', priority: PRIORITY_LEVELS.LEGAL, changeFrequency: 'yearly' as const },
      { path: '/politica-cookies', priority: PRIORITY_LEVELS.LEGAL, changeFrequency: 'yearly' as const },
    ]

    const entries: MetadataRoute.Sitemap = []

    mainPagePaths.forEach(({ path, priority, changeFrequency }) => {
      Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
        const language = langCode as LanguageCode
        const localizedPath = addLanguageToPath(path, language)
        const url = normalizeUrl(this.config.baseUrl, localizedPath)

        // Adjust priority based on language
        let adjustedPriority = priority
        if (language === 'es') {
          adjustedPriority = priority
        } else if (language === 'en') {
          adjustedPriority = Math.max(0.1, priority - 0.05)
        } else {
          adjustedPriority = Math.max(0.1, priority - 0.1)
        }

        entries.push({
          url,
          lastModified: currentDate,
          changeFrequency,
          priority: Number(adjustedPriority.toFixed(2)),
        })
      })
    })

    return entries
  }

  /**
   * Generate blog entries
   */
  private generateBlogEntries(currentDate: Date): MetadataRoute.Sitemap {
    const entries: MetadataRoute.Sitemap = []

    blogPosts.forEach((post) => {
      // Calculate base priority
      let basePriority = 0.6

      if (post.category === 'creatividad' || post.category === 'productividad') {
        basePriority += 0.1
      }
      if (post.category === 'ia-educacion') {
        basePriority += 0.05
      }
      if (post.featured) {
        basePriority += 0.15
      }
      if (post.trending) {
        basePriority += 0.1
      }
      if (post.views > 4000) {
        basePriority += 0.1
      } else if (post.views > 2500) {
        basePriority += 0.05
      }

      basePriority = Math.min(basePriority, 0.85)

      // Determine change frequency
      let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'monthly'
      if (post.featured || post.trending || post.views > 3500) {
        changeFrequency = 'weekly'
      }
      if (post.featured && post.trending && post.views > 4500) {
        changeFrequency = 'daily'
      }

      const lastModified = new Date(post.publishedAt)

      // Generate entries for each language
      Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
        const language = langCode as LanguageCode
        const blogPath = `/blog/${post.id}`
        const localizedPath = addLanguageToPath(blogPath, language)
        const url = normalizeUrl(this.config.baseUrl, localizedPath)

        let adjustedPriority = basePriority
        if (language === 'es') {
          adjustedPriority = basePriority
        } else if (language === 'en') {
          adjustedPriority = Math.max(0.1, basePriority - 0.05)
        } else {
          adjustedPriority = Math.max(0.1, basePriority - 0.1)
        }

        entries.push({
          url,
          lastModified,
          changeFrequency,
          priority: Number(adjustedPriority.toFixed(2)),
        })
      })
    })

    return entries
  }
}

/**
 * Default sitemap generation function
 */
export async function generateValidatedSitemap(): Promise<MetadataRoute.Sitemap> {
  const manager = SitemapManager.getInstance()
  return await manager.generateCleanSitemap()
}