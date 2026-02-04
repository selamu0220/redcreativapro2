/**
 * Lazy loading system for translation files
 */

import { SupportedLocale, DEFAULT_LOCALE } from './constants';
import { translationCache } from './cache';

interface LoaderOptions {
  useCache?: boolean;
  fallbackToDefault?: boolean;
  timeout?: number;
}

class TranslationLoader {
  private loadingPromises = new Map<string, Promise<Record<string, any>>>();

  /**
   * Load translation namespace with lazy loading and caching
   */
  async loadNamespace(
    locale: SupportedLocale,
    namespace: string,
    options: LoaderOptions = {}
  ): Promise<Record<string, any>> {
    const {
      useCache = true,
      fallbackToDefault = true,
      timeout = 5000
    } = options;

    // Check cache first
    if (useCache) {
      const cached = translationCache.get(locale, namespace);
      if (cached) {
        return cached;
      }
    }

    // Check if already loading
    const loadingKey = `${locale}:${namespace}`;
    if (this.loadingPromises.has(loadingKey)) {
      return this.loadingPromises.get(loadingKey)!;
    }

    // Create loading promise
    const loadingPromise = this.loadWithTimeout(locale, namespace, timeout, fallbackToDefault);
    this.loadingPromises.set(loadingKey, loadingPromise);

    try {
      const result = await loadingPromise;

      // Cache the result
      if (useCache) {
        translationCache.set(locale, namespace, result);
      }

      return result;
    } finally {
      // Clean up loading promise
      this.loadingPromises.delete(loadingKey);
    }
  }

  /**
   * Load multiple namespaces in parallel
   */
  async loadNamespaces(
    locale: SupportedLocale,
    namespaces: string[],
    options: LoaderOptions = {}
  ): Promise<Record<string, Record<string, any>>> {
    const promises = namespaces.map(async (namespace) => {
      const data = await this.loadNamespace(locale, namespace, options);
      return { namespace, data };
    });

    const results = await Promise.allSettled(promises);
    const loaded: Record<string, Record<string, any>> = {};

    results.forEach((result, index) => {
      const namespace = namespaces[index];
      if (result.status === 'fulfilled') {
        loaded[namespace] = result.value.data;
      } else {
        console.warn(`Failed to load namespace ${namespace} for locale ${locale}:`, result.reason);
        loaded[namespace] = {};
      }
    });

    return loaded;
  }

  /**
   * Preload translations for better performance
   */
  async preloadLocale(locale: SupportedLocale, namespaces: string[] = ['common', 'slider']): Promise<void> {
    try {
      await this.loadNamespaces(locale, namespaces, { useCache: true });
    } catch (error) {
      console.warn(`Failed to preload locale ${locale}:`, error);
    }
  }

  /**
   * Load with timeout and fallback
   */
  private async loadWithTimeout(
    locale: SupportedLocale,
    namespace: string,
    timeout: number,
    fallbackToDefault: boolean
  ): Promise<Record<string, any>> {
    const loadPromise = this.loadTranslationFile(locale, namespace);

    try {
      // Race between loading and timeout
      const result = await Promise.race([
        loadPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);

      return result;
    } catch (error) {
      console.warn(`Failed to load ${namespace} for ${locale}:`, error);

      // Try fallback to default locale
      if (fallbackToDefault && locale !== DEFAULT_LOCALE) {
        try {
          return await this.loadTranslationFile(DEFAULT_LOCALE, namespace);
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${namespace}:`, fallbackError);
        }
      }

      // Return empty object as last resort
      return {};
    }
  }

  /**
   * Load actual translation file
   */
  private async loadTranslationFile(locale: SupportedLocale, namespace: string): Promise<Record<string, any>> {
    try {
      const module = await import(`../../../public/locales/${locale}/${namespace}.json`);
      return module.default || {};
    } catch (error) {
      throw new Error(`Failed to load translation file: ${locale}/${namespace}.json`);
    }
  }

  /**
   * Clear all loading promises (useful for testing)
   */
  clearLoadingPromises(): void {
    this.loadingPromises.clear();
  }
}

// Singleton instance
export const translationLoader = new TranslationLoader();

// Note: Translation preloading is now handled by:
// 1. Home page client component on mount
// 2. Language context on language changes
// 3. Individual components when needed
// Removed window.addEventListener('load') to prevent re-renders that could cause flickering
