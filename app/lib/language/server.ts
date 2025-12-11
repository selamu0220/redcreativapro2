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
 */
export async function getServerPathname(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-pathname') || '/';
}

/**
 * Generates hreflang links for SEO
 */
export function generateHreflangLinks(pathname: string, baseUrl: string): Array<{ hrefLang: string; href: string }> {
  const links: Array<{ hrefLang: string; href: string }> = [];
  
  // Add links for each supported language
  Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
    const languageCode = lang as LanguageCode;
    const href = `${baseUrl}/${languageCode}${pathname === '/' ? '' : pathname}`;
    
    links.push({
      hrefLang: languageCode,
      href
    });
  });
  
  // Add x-default pointing to default language
  const defaultHref = `${baseUrl}/${DEFAULT_LANGUAGE}${pathname === '/' ? '' : pathname}`;
  links.push({
    hrefLang: 'x-default',
    href: defaultHref
  });
  
  return links;
}

/**
 * Generates canonical URL for the current language and path
 */
export function generateCanonicalUrl(pathname: string, language: LanguageCode, baseUrl: string): string {
  return `${baseUrl}/${language}${pathname === '/' ? '' : pathname}`;
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