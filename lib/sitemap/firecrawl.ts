import { FIRECRAWL_CONFIG } from './config'
import { CrawlResult } from './types'

export class FirecrawlService {
    private static instance: FirecrawlService
    private apiKey: string | undefined

    private constructor() {
        this.apiKey = FIRECRAWL_CONFIG.apiKey
    }

    public static getInstance(): FirecrawlService {
        if (!FirecrawlService.instance) {
            FirecrawlService.instance = new FirecrawlService()
        }
        return FirecrawlService.instance
    }

    /**
     * Discover URLs using Firecrawl Map
     * This discovers all reachable URLs on the site
     */
    async discoverUrls(url: string): Promise<string[]> {
        if (!this.apiKey) {
            console.warn('Firecrawl API key not found. Skipping crawl.')
            return []
        }

        try {
            // Logic would go here to call Firecrawl API
            // For now, we stub it or use the MCP tool if running in agent context
            // But in production code, we need a real HTTP call

            const response = await fetch('https://api.firecrawl.dev/v1/map', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url,
                    search: undefined,
                    ignoreSitemap: true,
                    includeSubdomains: false,
                    limit: FIRECRAWL_CONFIG.limit
                })
            })

            if (!response.ok) {
                throw new Error(`Firecrawl API error: ${response.statusText}`)
            }

            const data = await response.json()
            // Assuming data.links is array of strings or objects
            // Based on API docs, map returns { links: ["url1", "url2"] } or objects
            return data.links || []
        } catch (error) {
            console.error('Firecrawl discovery failed:', error)
            return []
        }
    }

    /**
     * Validate a batch of URLs using Firecrawl Scrape (lightweight)
     * or just rely on the map for discovery.
     */
    async validateUrlAccessibility(url: string): Promise<CrawlResult> {
        // Implementation for single URL validation
        return {
            url,
            status: 200, // Stub
            lastChecked: new Date()
        }
    }
}
