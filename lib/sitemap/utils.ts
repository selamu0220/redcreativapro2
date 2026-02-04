import { SUPPORTED_LANGUAGES, LanguageCode } from '@/app/lib/language/config'

/**
 * Adds language prefix to path
 */
export function addLanguageToPath(path: string, lang: LanguageCode): string {
    // If path already starts with /lang, return as is
    if (path.startsWith(`/${lang}`)) return path

    // If path is root '/', return '/lang'
    if (path === '/') return `/${lang}`

    // Clean path preventing double slashes
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `/${lang}${cleanPath}`
}

/**
 * Normalizes URL to ensure valid format
 */
export function normalizeUrl(baseUrl: string, path: string): string {
    const cleanBase = baseUrl.replace(/\/$/, '')
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${cleanBase}${cleanPath}`
}

/**
 * Calculates priority based on basic rules
 * This will be enhanced with GSC data later
 */
export function calculatePriority(path: string, basePriority: number = 0.5): number {
    if (path === '/') return 1.0
    if (path.startsWith('/planes')) return 0.9
    if (path.startsWith('/blog')) return 0.8
    return basePriority
}
