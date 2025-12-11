/**
 * URL Validator Service
 * Validates blog URLs and checks for broken links
 */

import { blogPosts } from '@/lib/blog-data'
import fs from 'fs'
import path from 'path'

export interface URLValidationResult {
  url: string
  exists: boolean
  status: 'valid' | 'missing' | 'error'
  error?: string
  lastChecked: Date
}

export interface ValidationReport {
  totalUrls: number
  validUrls: number
  brokenUrls: number
  results: URLValidationResult[]
  generatedAt: Date
}

export class URLValidator {
  private blogDirectory: string
  private baseUrl: string

  constructor(blogDirectory = 'app/blog', baseUrl = 'https://redcreativa.pro') {
    this.blogDirectory = blogDirectory
    this.baseUrl = baseUrl
  }

  /**
   * Check if a blog post file exists
   */
  private checkBlogPostExists(postId: string): boolean {
    try {
      const postPath = path.join(process.cwd(), this.blogDirectory, postId, 'page.tsx')
      return fs.existsSync(postPath)
    } catch (error) {
      console.error(`Error checking blog post ${postId}:`, error)
      return false
    }
  }

  /**
   * Validate a single blog URL
   */
  async validateBlogUrl(postId: string): Promise<URLValidationResult> {
    const url = `${this.baseUrl}/blog/${postId}`
    const exists = this.checkBlogPostExists(postId)
    
    return {
      url,
      exists,
      status: exists ? 'valid' : 'missing',
      error: exists ? undefined : 'Blog post file not found',
      lastChecked: new Date()
    }
  }

  /**
   * Validate all blog URLs from blog data
   */
  async validateAllBlogUrls(): Promise<ValidationReport> {
    const results: URLValidationResult[] = []
    
    for (const post of blogPosts) {
      try {
        const result = await this.validateBlogUrl(post.id)
        results.push(result)
      } catch (error) {
        results.push({
          url: `${this.baseUrl}/blog/${post.id}`,
          exists: false,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastChecked: new Date()
        })
      }
    }

    const validUrls = results.filter(r => r.status === 'valid').length
    const brokenUrls = results.filter(r => r.status !== 'valid').length

    return {
      totalUrls: results.length,
      validUrls,
      brokenUrls,
      results,
      generatedAt: new Date()
    }
  }

  /**
   * Get broken URLs from validation results
   */
  getBrokenUrls(results: URLValidationResult[]): URLValidationResult[] {
    return results.filter(result => result.status !== 'valid')
  }

  /**
   * Get valid URLs from validation results
   */
  getValidUrls(results: URLValidationResult[]): URLValidationResult[] {
    return results.filter(result => result.status === 'valid')
  }

  /**
   * Generate a clean sitemap with only valid URLs
   */
  async generateCleanSitemap(): Promise<string[]> {
    const report = await this.validateAllBlogUrls()
    const validUrls = this.getValidUrls(report.results)
    return validUrls.map(result => result.url)
  }

  /**
   * Save validation report to file
   */
  async saveValidationReport(report: ValidationReport, filePath?: string): Promise<void> {
    const defaultPath = path.join(process.cwd(), 'url-validation-report.json')
    const savePath = filePath || defaultPath
    
    try {
      await fs.promises.writeFile(savePath, JSON.stringify(report, null, 2))
      console.log(`Validation report saved to: ${savePath}`)
    } catch (error) {
      console.error('Error saving validation report:', error)
      throw error
    }
  }

  /**
   * Load validation report from file
   */
  async loadValidationReport(filePath?: string): Promise<ValidationReport | null> {
    const defaultPath = path.join(process.cwd(), 'url-validation-report.json')
    const loadPath = filePath || defaultPath
    
    try {
      const data = await fs.promises.readFile(loadPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error loading validation report:', error)
      return null
    }
  }
}

/**
 * Utility function to run URL validation
 */
export async function validateBlogUrls(): Promise<ValidationReport> {
  const validator = new URLValidator()
  return await validator.validateAllBlogUrls()
}

/**
 * Utility function to get broken URLs
 */
export async function getBrokenBlogUrls(): Promise<URLValidationResult[]> {
  const validator = new URLValidator()
  const report = await validator.validateAllBlogUrls()
  return validator.getBrokenUrls(report.results)
}