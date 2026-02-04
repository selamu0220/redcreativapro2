export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export interface SitemapEntry {
    url: string
    lastModified?: Date | string
    changeFrequency?: ChangeFrequency
    priority?: number
    alternates?: {
        languages: Record<string, string>
    }
}

export interface ValidationReport {
    totalUrls: number
    validUrls: number
    brokenUrls: number
    details: ValidationDetail[]
    timestamp: Date
}

export interface ValidationDetail {
    url: string
    status: number
    isValid: boolean
    error?: string
}

export interface SitemapConfig {
    baseUrl: string
    excludeBrokenUrls: boolean
    validateUrls: boolean
    generateReport: boolean
    reportPath?: string
    enableFirecrawl: boolean
    maxEntriesPerFile?: number
}

export interface SitemapDataSource {
    getEntries(): Promise<SitemapEntry[]>
    getName(): string
}

export interface CrawlResult {
    url: string
    title?: string
    status?: number
    lastChecked: Date
}
