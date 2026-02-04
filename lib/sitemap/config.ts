import { SitemapConfig } from './types'

export const SITEMAP_CONFIG: SitemapConfig = {
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro',
    excludeBrokenUrls: true,
    validateUrls: true,
    generateReport: true,
    enableFirecrawl: false, // Default to false until fully tested
    maxEntriesPerFile: 50000,
}

export const EXCLUDED_PATHS = [
    '/admin',
    '/auth',
    '/debug',
    '/api',
    '/test',
    '/success',
    '/cancel',
    '/studio-ia/playground', // Often private/dynamic
]

export const PRIORITY_LEVELS = {
    HOME: 1.0,
    LANDING: 0.9,
    FEATURE: 0.9,
    BLOG_POST: 0.8,
    BLOG_INDEX: 0.9,
    DOCS: 0.7,
    LEGAL: 0.3,
}

export const FIRECRAWL_CONFIG = {
    apiKey: process.env.FIRECRAWL_API_KEY,
    maxDepth: 3,
    limit: 1000,
}
