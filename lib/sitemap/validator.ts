import { normalizeUrl } from './utils'
import { ValidationDetail, ValidationReport } from './types'
import fs from 'fs'
import path from 'path'

export class URLValidator {
    private baseUrl: string
    private checkPath: string

    constructor(checkPath: string, baseUrl: string) {
        this.checkPath = checkPath
        this.baseUrl = baseUrl
    }

    async validateUrl(url: string): Promise<ValidationDetail> {
        try {
            const response = await fetch(url, { method: 'HEAD' })
            return {
                url,
                status: response.status,
                isValid: response.ok,
            }
        } catch (error) {
            return {
                url,
                status: 0,
                isValid: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }

    /**
   * Check if a blog post file exists
   */
    private checkBlogPostExists(postId: string): boolean {
        try {
            const postPath = path.join(process.cwd(), this.checkPath, postId, 'page.tsx')
            return fs.existsSync(postPath)
        } catch (error) {
            console.error(`Error checking blog post ${postId}:`, error)
            return false
        }
    }
    async validateAllBlogUrls(): Promise<ValidationReport> {
        const results: ValidationDetail[] = []

        // We need to import blogPosts here or pass them in. 
        // Since this is a class, let's assume we import them or they are global?
        // Better to import them at the top.
        const { blogPosts } = await import('@/lib/blog-data')

        for (const post of blogPosts) {
            const exists = this.checkBlogPostExists(post.id)
            const url = `${this.baseUrl}/blog/${post.id}`
            results.push({
                url,
                status: exists ? 200 : 404,
                isValid: exists,
                error: exists ? undefined : 'File not found'
            })
        }

        const validUrls = results.filter(r => r.isValid).length
        const brokenUrls = results.filter(r => !r.isValid).length

        return {
            totalUrls: results.length,
            validUrls,
            brokenUrls,
            details: results,
            timestamp: new Date()
        }
    }

    // Method referenced in original manager
    getValidUrls(results: ValidationDetail[]): ValidationDetail[] {
        return results.filter(r => r.isValid)
    }
}
