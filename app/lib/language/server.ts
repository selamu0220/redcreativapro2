import { headers } from 'next/headers';
import { LanguageCode, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './config';

/**
 * Gets the current language from server-side headers (for SSR)
 */
export async function getServerLanguage(): Promise<LanguageCode> {
  const headersList = await headers();
  const language = headersList.get('x-language');

  if (language && SUPPORTED_LANGUAGES[language as LanguageCode]) {
    return language as LanguageCode;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Gets the pathname without language prefix from server-side headers (for SSR)
 * Note: Requires middleware to set x-pathname or x-url
 */
export async function getServerPathname(): Promise<string> {
  const headersList = await headers();
  // In Next.js middleware, we can pass the pathname as a header
  // or we can try to parse it from the referer/url if available, 
  // but usually x-pathname or proper middleware setup is best.

  // Try x-pathname first (standard convention)
  const xPathname = headersList.get('x-pathname');
  if (xPathname) return xPathname;

  // Fallback: try referer
  const referer = headersList.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      return url.pathname;
    } catch (e) {
      // ignore error
    }
  }

  // Fallback to root
  return '/';
}

/**
 * Generates canonical URL for the current language and path
 */
export function generateCanonicalUrl(pathname: string, lang: string, baseUrl: string): string {
  const cleanPath = pathname.replace(`/${lang}`, '') || '/';
  // If EN (default), no prefix.
  if (lang === 'en') {
    return `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`;
  }
  return `${baseUrl}/${lang}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Generates hreflang links for SEO
 */
export function generateHreflangLinks(pathname: string, baseUrl: string): Array<{ hrefLang: string; href: string }> {
  // We need to strip the current language prefix to get the "base" path
  // This is a naive implementation; strictly speaking we should know the current lang to strip it correctly.
  // However, usually pathname comes in full. 
  // Let's assume we remove any supported lang prefix.

  let dbPath = pathname;
  for (const l of Object.keys(SUPPORTED_LANGUAGES)) {
    if (dbPath === `/${l}` || dbPath.startsWith(`/${l}/`)) {
      dbPath = dbPath.replace(`/${l}`, '') || '/';
      break;
    }
  }

  const links = [];

  // Add x-default (usually English)
  links.push({
    hrefLang: 'x-default',
    href: `${baseUrl}${dbPath === '/' ? '' : dbPath}`
  });

  for (const lang of Object.keys(SUPPORTED_LANGUAGES)) {
    if (lang === 'en') {
      links.push({
        hrefLang: 'en',
        href: `${baseUrl}${dbPath === '/' ? '' : dbPath}`
      });
    } else {
      links.push({
        hrefLang: lang,
        href: `${baseUrl}/${lang}${dbPath === '/' ? '' : dbPath}`
      });
    }
  }

  return links;
}

/**
 * Server-side language detection from request headers
 */
export function detectServerLanguage(acceptLanguage?: string): LanguageCode {
  if (!acceptLanguage) return DEFAULT_LANGUAGE;

  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim())
    .map(lang => lang.toLowerCase());

  const BROWSER_LANGUAGE_MAP: Record<string, LanguageCode> = {
    'es': 'es', 'es-ES': 'es', 'es-MX': 'es', 'es-AR': 'es',
    'en': 'en', 'en-US': 'en', 'en-GB': 'en',
    'de': 'de', 'de-DE': 'de', 'de-AT': 'de',
    'fr': 'fr', 'fr-FR': 'fr', 'fr-CA': 'fr',
    'zh': 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh'
  };

  for (const browserLang of languages) {
    const mappedLang = BROWSER_LANGUAGE_MAP[browserLang];
    if (mappedLang) {
      return mappedLang;
    }

    // Try short code (e.g., 'en' from 'en-US')
    const shortLang = browserLang.split('-')[0];
    const mappedShortLang = BROWSER_LANGUAGE_MAP[shortLang];
    if (mappedShortLang) {
      return mappedShortLang;
    }
  }

  return DEFAULT_LANGUAGE;
}
