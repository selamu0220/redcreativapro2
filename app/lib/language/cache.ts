/**
 * Translation cache system for improved performance
 */

import { SupportedLocale } from './constants';

interface CacheEntry {
  data: Record<string, any>;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class TranslationCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached translation data
   */
  get(locale: SupportedLocale, namespace: string): Record<string, any> | null {
    const key = `${locale}:${namespace}`;
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set translation data in cache
   */
  set(
    locale: SupportedLocale, 
    namespace: string, 
    data: Record<string, any>,
    ttl: number = this.DEFAULT_TTL
  ): void {
    const key = `${locale}:${namespace}`;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear cache for specific locale
   */
  clearLocale(locale: SupportedLocale): void {
    for (const [key] of this.cache) {
      if (key.startsWith(`${locale}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: validEntries / (validEntries + expiredEntries) || 0
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const translationCache = new TranslationCache();

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    translationCache.cleanup();
  }, 5 * 60 * 1000);
}