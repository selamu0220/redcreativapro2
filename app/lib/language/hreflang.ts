import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type LanguageCode } from './config'

/**
 * Generates hreflang links for SEO
 * Returns array of { hrefLang, href } objects
 */
export function generateHreflangLinks(pathname: string, baseUrl: string): Array<{ hrefLang: string; href: string }> {
  const links: Array<{ hrefLang: string; href: string }> = []
  
  // Remove any existing language prefix
  let cleanPath = pathname
  for (const lang of Object.keys(SUPPORTED_LANGUAGES)) {
    if (cleanPath.startsWith(`/${lang}/`)) {
      cleanPath = cleanPath.replace(`/${lang}`, '') || '/'
      break
    } else if (cleanPath === `/${lang}`) {
      cleanPath = '/'
      break
    }
  }
  
  // Generate links for all supported languages
  for (const [code] of Object.entries(SUPPORTED_LANGUAGES)) {
    const langCode = code as LanguageCode
    const localizedPath = langCode === DEFAULT_LANGUAGE 
      ? cleanPath 
      : cleanPath === '/' 
        ? `/${langCode}` 
        : `/${langCode}${cleanPath}`
    
    links.push({
      hrefLang: langCode,
      href: `${baseUrl}${localizedPath}`
    })
  }
  
  // Add x-default
  links.push({
    hrefLang: 'x-default',
    href: `${baseUrl}${cleanPath}`
  })
  
  return links
}

/**
 * Generates canonical URL
 */
export function generateCanonicalUrl(pathname: string, lang: LanguageCode, baseUrl: string): string {
  // Remove any existing language prefix
  let cleanPath = pathname
  for (const code of Object.keys(SUPPORTED_LANGUAGES)) {
    if (cleanPath.startsWith(`/${code}/`)) {
      cleanPath = cleanPath.replace(`/${code}`, '') || '/'
      break
    } else if (cleanPath === `/${code}`) {
      cleanPath = '/'
      break
    }
  }
  
  // Build canonical URL
  if (lang === DEFAULT_LANGUAGE) {
    return `${baseUrl}${cleanPath}`
  }
  
  return cleanPath === '/' 
    ? `${baseUrl}/${lang}` 
    : `${baseUrl}/${lang}${cleanPath}`
}
