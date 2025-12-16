import { LanguageCode, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './config';

/**
 * Extracts language from URL pathname
 */
export function getLanguageFromPath(pathname: string): LanguageCode | null {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0];
    if (SUPPORTED_LANGUAGES[firstSegment as LanguageCode]) {
      return firstSegment as LanguageCode;
    }
  }
  
  return null;
}

/**
 * Removes language prefix from pathname
 */
export function removeLanguageFromPath(pathname: string): string {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length > 0 && SUPPORTED_LANGUAGES[pathSegments[0] as LanguageCode]) {
    const remainingPath = pathSegments.slice(1).join('/');
    return remainingPath ? `/${remainingPath}` : '/';
  }
  
  return pathname;
}

/**
 * Adds language prefix to pathname
 */
export function addLanguageToPath(pathname: string, language: LanguageCode): string {
  const targetLanguage = language || DEFAULT_LANGUAGE;
  const cleanPath = removeLanguageFromPath(pathname);
  
  // If cleanPath is just "/", return "/language"
  if (cleanPath === '/') {
    return `/${targetLanguage}`;
  }
  
  // Ensure we don't double-slash
  return `/${targetLanguage}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
}

/**
 * Gets the current language from browser URL
 */
export function getCurrentLanguageFromURL(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const language = getLanguageFromPath(window.location.pathname);
  return language || DEFAULT_LANGUAGE;
}

/**
 * Navigates to a new path with the current language
 */
export function navigateWithLanguage(path: string, language?: LanguageCode): string {
  const currentLanguage = language || getCurrentLanguageFromURL();
  const cleanPath = removeLanguageFromPath(path);
  return addLanguageToPath(cleanPath, currentLanguage);
}

/**
 * Changes the current URL to a different language
 */
export function changeURLLanguage(newLanguage: LanguageCode): void {
  if (typeof window === 'undefined') return;
  
  const currentPath = removeLanguageFromPath(window.location.pathname);
  const newPath = addLanguageToPath(currentPath, newLanguage);
  const newURL = `${window.location.origin}${newPath}${window.location.search}${window.location.hash}`;
  
  window.location.href = newURL;
}

/**
 * Gets all language alternatives for the current page
 */
export function getLanguageAlternatives(pathname?: string): Array<{ language: LanguageCode; url: string }> {
  if (typeof window === 'undefined') return [];
  
  const currentPath = pathname || window.location.pathname;
  const cleanPath = removeLanguageFromPath(currentPath);
  const baseURL = window.location.origin;
  
  return Object.keys(SUPPORTED_LANGUAGES).map(lang => ({
    language: lang as LanguageCode,
    url: `${baseURL}${addLanguageToPath(cleanPath, lang as LanguageCode)}`
  }));
}

/**
 * Checks if a pathname has a language prefix
 */
export function hasLanguagePrefix(pathname: string): boolean {
  return getLanguageFromPath(pathname) !== null;
}

/**
 * Gets the language from server headers (for SSR)
 */
export function getLanguageFromHeaders(headers: Headers): LanguageCode {
  const language = headers.get('x-language');
  
  if (language && SUPPORTED_LANGUAGES[language as LanguageCode]) {
    return language as LanguageCode;
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Gets the pathname without language from server headers (for SSR)
 */
export function getPathnameFromHeaders(headers: Headers): string {
  return headers.get('x-pathname') || '/';
}