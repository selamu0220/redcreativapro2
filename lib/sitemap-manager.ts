/**
 * Sitemap Manager Service
 * Manages sitemap generation with URL validation and cleaning
 */

import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/app/lib/language/config'
import { addLanguageToPath } from '@/app/lib/language/routing'
import { URLValidator, ValidationReport } from './url-validator'
import fs from 'fs'
import path from 'path'

export interface SitemapConfig {
  baseUrl: string
  excludeBrokenUrls: boolean
  validateUrls: boolean
  generateReport: boolean
  reportPath?: string
}

export class SitemapManager {
  private config: SitemapConfig
  private validator: URLValidator

  constructor(config: Partial<SitemapConfig> = {}) {
    this.config = {
      baseUrl: 'https://redcreativa.pro',
      excludeBrokenUrls: true,
      validateUrls: true,
      generateReport: true,
      ...config
    }
    this.validator = new URLValidator('app/blog', this.config.baseUrl)
  }

  /**
   * Generate clean sitemap with validated URLs
   */
  async generateCleanSitemap(): Promise<MetadataRoute.Sitemap> {
    const currentDate = new Date()
    let validationReport: ValidationReport | null = null

    // Validate URLs if enabled
    if (this.config.validateUrls) {
      validationReport = await this.validator.validateAllBlogUrls()
      
      if (this.config.generateReport) {
        await this.saveValidationReport(validationReport)
      }
    }

    // Get valid blog post IDs
    const validBlogPostIds = this.getValidBlogPostIds(validationReport)

    // Generate main page entries
    const mainPageEntries = this.generateMainPageEntries(currentDate)
    
    // Generate blog entries (only for valid posts)
    const blogEntries = this.generateBlogEntries(validBlogPostIds, currentDate)

    // Combine and sort entries
    const allEntries = [...mainPageEntries, ...blogEntries]
    return allEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * Get valid blog post IDs based on validation results
   */
  private getValidBlogPostIds(validationReport: ValidationReport | null): string[] {
    if (!validationReport || !this.config.excludeBrokenUrls) {
      return blogPosts.map(post => post.id)
    }

    const validUrls = this.validator.getValidUrls(validationReport.results)
    return validUrls.map(result => {
      const match = result.url.match(/\/blog\/([^\/]+)$/)
      return match ? match[1] : ''
    }).filter(Boolean)
  }

  /**
   * Generate main page sitemap entries
   */
  private generateMainPageEntries(currentDate: Date): MetadataRoute.Sitemap {
    const mainPagePaths = [
      { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
      { path: '/escritor-ia', priority: 0.95, changeFrequency: 'weekly' as const },
      { path: '/correos-ia', priority: 0.95, changeFrequency: 'weekly' as const },
      { path: '/seo-dashboard', priority: 0.9, changeFrequency: 'weekly' as const },
      { path: '/dashboard', priority: 0.9, changeFrequency: 'daily' as const },
      { path: '/planes', priority: 0.9, changeFrequency: 'weekly' as const },
      { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
      { path: '/contacto', priority: 0.8, changeFrequency: 'monthly' as const },
      { path: '/centro-ayuda', priority: 0.75, changeFrequency: 'weekly' as const },
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
      { path: '/aviso-legal', priority: 0.3, changeFrequency: 'yearly' as const },
      { path: '/politica-privacidad', priority: 0.3, changeFrequency: 'yearly' as const },
      { path: '/terminos-servicio', priority: 0.3, changeFrequency: 'yearly' as const },
      { path: '/politica-cookies', priority: 0.25, changeFrequency: 'yearly' as const },
    ]

    const entries: MetadataRoute.Sitemap = []

    mainPagePaths.forEach(({ path, priority, changeFrequency }) => {
      Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
        const language = langCode as LanguageCode
        const localizedPath = addLanguageToPath(path, language)
        const url = `${this.config.baseUrl}${localizedPath}`

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
          priority: Math.round(adjustedPriority * 100) / 100,
        })
      })
    })

    return entries
  }

  /**
   * Generate blog entries for valid posts only
   */
  private generateBlogEntries(validPostIds: string[], currentDate: Date): MetadataRoute.Sitemap {
    const entries: MetadataRoute.Sitemap = []
    const validPosts = blogPosts.filter(post => validPostIds.includes(post.id))

    validPosts.forEach((post) => {
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
        const url = `${this.config.baseUrl}${localizedPath}`

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
          priority: Math.round(adjustedPriority * 100) / 100,
        })
      })
    })

    return entries
  }

  /**
   * Save validation report
   */
  private async saveValidationReport(report: ValidationReport): Promise<void> {
    const reportPath = this.config.reportPath || path.join(process.cwd(), 'sitemap-validation-report.json')
    
    try {
      await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
      console.log(`Sitemap validation report saved to: ${reportPath}`)
    } catch (error) {
      console.error('Error saving sitemap validation report:', error)
    }
  }

  /**
   * Get sitemap health status
   */
  async getSitemapHealth(): Promise<{
    totalUrls: number
    validUrls: number
    brokenUrls: number
    healthScore: number
    lastChecked: Date
  }> {
    const report = await this.validator.validateAllBlogUrls()
    const healthScore = report.totalUrls > 0 ? (report.validUrls / report.totalUrls) * 100 : 100

    return {
      totalUrls: report.totalUrls,
      validUrls: report.validUrls,
      brokenUrls: report.brokenUrls,
      healthScore: Math.round(healthScore * 100) / 100,
      lastChecked: report.generatedAt
    }
  }
}

/**
 * Default sitemap generation function with validation
 */
export async function generateValidatedSitemap(): Promise<MetadataRoute.Sitemap> {
  const manager = new SitemapManager()
  return await manager.generateCleanSitemap()
}