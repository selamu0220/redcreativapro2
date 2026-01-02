import { LanguageCode, DEFAULT_LANGUAGE, TranslationNamespace } from './config';
import { TranslationData, TranslationLoadingOptions } from './types';

export class FallbackTranslationSystem {
  private static instance: FallbackTranslationSystem;
  private cache: Map<string, { data: TranslationData; timestamp: number }> = new Map();
  private persistentCache: Map<string, TranslationData> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly PERSISTENT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of cached entries

  private constructor() {
    this.initializePersistentCache();
  }

  static getInstance(): FallbackTranslationSystem {
    if (!FallbackTranslationSystem.instance) {
      FallbackTranslationSystem.instance = new FallbackTranslationSystem();
    }
    return FallbackTranslationSystem.instance;
  }

  /**
   * Initialize persistent cache from localStorage
   */
  private initializePersistentCache(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('translation-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, value]) => {
            this.persistentCache.set(key, value as TranslationData);
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load persistent translation cache:', error);
    }
  }

  /**
   * Save persistent cache to localStorage
   */
  private savePersistentCache(): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheObject = Object.fromEntries(this.persistentCache);
      localStorage.setItem('translation-cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save persistent translation cache:', error);
    }
  }

  /**
   * Get fallback translation for a specific key with enhanced fallback chain
   */
  getFallbackTranslation(key: string, namespace: string, language: string): string {
    // 1. Try to get from memory cache first
    const cachedTranslations = this.getCachedTranslations(language as LanguageCode, namespace as TranslationNamespace);
    if (cachedTranslations && cachedTranslations[key]) {
      return cachedTranslations[key];
    }

    // 2. Try persistent cache (localStorage)
    const persistentKey = language + '-' + namespace;
    const persistentTranslations = this.persistentCache.get(persistentKey);
    if (persistentTranslations && persistentTranslations[key]) {
      // Move to memory cache for faster access
      this.setCachedTranslations(language as LanguageCode, namespace as TranslationNamespace, persistentTranslations);
      return persistentTranslations[key];
    }

    // 3. If not in cache and not default language, try default language from cache
    if (language !== DEFAULT_LANGUAGE) {
      const defaultTranslations = this.getCachedTranslations(DEFAULT_LANGUAGE, namespace as TranslationNamespace);
      if (defaultTranslations && defaultTranslations[key]) {
        return defaultTranslations[key];
      }

      // Also try default language from persistent cache
      const defaultPersistentKey = DEFAULT_LANGUAGE + '-' + namespace;
      const defaultPersistentTranslations = this.persistentCache.get(defaultPersistentKey);
      if (defaultPersistentTranslations && defaultPersistentTranslations[key]) {
        return defaultPersistentTranslations[key];
      }
    }

    // 4. Try minimal fallback translations
    const minimalTranslations = this.getMinimalFallbackTranslations(namespace as TranslationNamespace);
    if (minimalTranslations[key]) {
      return minimalTranslations[key];
    }

    // 5. Return the key itself as ultimate fallback
    return key;
  }

  /**
   * Load fallback translations with cache-first strategy and network fallback
   * Overloaded method to support both with and without namespace parameter
   */
  async loadFallbackTranslations(
    language: LanguageCode, 
    namespace?: TranslationNamespace,
    options: TranslationLoadingOptions = {}
  ): Promise<TranslationData> {
    // If no namespace provided, this is the old signature - use 'common' as default
    if (typeof namespace === 'object' && namespace !== null) {
      // Second parameter is actually options
      return this.loadFallbackTranslationsInternal(language, 'common', namespace);
    }
    
    // Normal case with namespace
    return this.loadFallbackTranslationsInternal(language, namespace || 'common', options);
  }

  /**
   * Internal method for loading fallback translations with cache-first strategy and network fallback
   */
  private async loadFallbackTranslationsInternal(
    language: LanguageCode, 
    namespace: TranslationNamespace,
    options: TranslationLoadingOptions = {}
  ): Promise<TranslationData> {
    const retryCount = options.retryCount || 3;
    const timeout = options.timeout || 5000;
    const fallbackToDefault = options.fallbackToDefault !== false;
    const useCache = options.useCache !== false;

    // CACHE-FIRST STRATEGY: Check memory cache first if enabled
    if (useCache) {
      const cached = this.getCachedTranslations(language, namespace);
      if (cached) {
        console.log('Cache hit (memory) for ' + language + '/' + namespace);
        return cached;
      }

      // Check persistent cache (localStorage)
      const persistentKey = language + '-' + namespace;
      const persistentCached = this.persistentCache.get(persistentKey);
      if (persistentCached) {
        console.log('Cache hit (persistent) for ' + language + '/' + namespace);
        // Move to memory cache for faster future access
        this.setCachedTranslations(language, namespace, persistentCached);
        return persistentCached;
      }
    }

    console.log('Cache miss for ' + language + '/' + namespace + ', loading from network...');

    let lastError: Error | null = null;

    // NETWORK FALLBACK: Try to load from network with retries
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const data = await this.loadTranslationsWithTimeout(language, namespace, timeout);
        
        // Cache successful result in both memory and persistent cache
        this.setCachedTranslations(language, namespace, data);
        this.setPersistentCache(language, namespace, data);
        
        console.log('Successfully loaded ' + language + '/' + namespace + ' from network (attempt ' + (attempt + 1) + ')');
        return data;
      } catch (error) {
        lastError = error as Error;
        console.warn('Attempt ' + (attempt + 1) + '/' + retryCount + ' failed for ' + language + '/' + namespace + ':', error);
        
        // Wait before retry (exponential backoff)
        if (attempt < retryCount - 1) {
          const backoffDelay = Math.pow(2, attempt) * 1000;
          console.log('Waiting ' + backoffDelay + 'ms before retry...');
          await this.delay(backoffDelay);
        }
      }
    }

    // FALLBACK TO DEFAULT LANGUAGE: If all retries failed and fallback is enabled
    if (fallbackToDefault && language !== DEFAULT_LANGUAGE) {
      try {
        console.log('Falling back to default language (' + DEFAULT_LANGUAGE + ') for ' + namespace);
        const fallbackData = await this.loadFallbackTranslations(DEFAULT_LANGUAGE, namespace, {
          retryCount: options.retryCount,
          timeout: options.timeout,
          fallbackToDefault: false,
          useCache: options.useCache
        });
        
        // Cache the fallback data for the requested language to avoid repeated fallbacks
        this.setCachedTranslations(language, namespace, fallbackData);
        
        return fallbackData;
      } catch (fallbackError) {
        console.error('Fallback to default language also failed:', fallbackError);
      }
    }

    // GRACEFUL DEGRADATION: If everything fails, try to use stale cache
    console.log('All loading attempts failed for ' + language + '/' + namespace + ', trying stale cache...');
    const staleCache = this.getStaleCache(language, namespace);
    if (staleCache) {
      console.log('Using stale cache for ' + language + '/' + namespace);
      return staleCache;
    }

    // MINIMAL FALLBACK: Return minimal translations as last resort
    console.log('Using minimal fallback translations for ' + namespace);
    const minimalTranslations = this.getMinimalFallbackTranslations(namespace);
    
    // Cache minimal translations to avoid repeated failures
    this.setCachedTranslations(language, namespace, minimalTranslations);
    
    return minimalTranslations;
  }
  /**
   * Load translations with timeout
   */
  private async loadTranslationsWithTimeout(
    language: LanguageCode, 
    namespace: TranslationNamespace, 
    timeout: number
  ): Promise<TranslationData> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = '/api/locales/' + language + '/' + namespace;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'max-age=300' // 5 minutes cache
        }
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      }

      const data = await response.json();
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get cached translations
   */
  getCachedTranslations(language: LanguageCode, namespace: TranslationNamespace): TranslationData | null {
    const key = language + '-' + namespace;
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached translations with cache size management
   */
  setCachedTranslations(language: LanguageCode, namespace: TranslationNamespace, data: TranslationData): void {
    const key = language + '-' + namespace;
    
    // Manage cache size - remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Set persistent cache entry
   */
  setPersistentCache(language: LanguageCode, namespace: TranslationNamespace, data: TranslationData): void {
    const key = language + '-' + namespace;
    this.persistentCache.set(key, data);
    
    // Debounce localStorage writes to avoid excessive I/O
    this.debouncedSavePersistentCache();
  }

  /**
   * Debounced save to localStorage
   */
  private debouncedSavePersistentCache = this.debounce(() => {
    this.savePersistentCache();
  }, 1000);

  /**
   * Get stale cache (expired but still available)
   */
  private getStaleCache(language: LanguageCode, namespace: TranslationNamespace): TranslationData | null {
    const key = language + '-' + namespace;
    const cached = this.cache.get(key);

    if (cached) {
      // Return stale cache regardless of timestamp
      const age = Date.now() - cached.timestamp;
      console.log('Using stale cache for ' + key + ' (age: ' + age + 'ms)');
      return cached.data;
    }

    // Also check persistent cache as stale fallback
    const persistentCached = this.persistentCache.get(key);
    if (persistentCached) {
      console.log('Using stale persistent cache for ' + key);
      return persistentCached;
    }

    return null;
  }

  /**
   * Clear all cached translations
   */
  clearCache(): void {
    this.cache.clear();
    this.persistentCache.clear();
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('translation-cache');
      } catch (error) {
        console.warn('Failed to clear persistent translation cache:', error);
      }
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    
    // Clear expired memory cache
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
    
    console.log('Cleared expired cache entries. Current cache size: ' + this.cache.size);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memorySize: number;
    persistentSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;

    for (const value of this.cache.values()) {
      if (oldestTimestamp === null || value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
      }
      if (newestTimestamp === null || value.timestamp > newestTimestamp) {
        newestTimestamp = value.timestamp;
      }
    }

    return {
      memorySize: this.cache.size,
      persistentSize: this.persistentCache.size,
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp
    };
  }

  /**
   * Get minimal fallback translations for emergency situations
   */
  getMinimalFallbackTranslations(namespace: TranslationNamespace): TranslationData {
    const minimal: Record<string, TranslationData> = {
      common: {
        loading: 'Loading...',
        error: 'Error',
        retry: 'Retry',
        close: 'Close',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        refresh: 'Refresh'
      },
      auth: {
        login: 'Login',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        register: 'Register',
        'forgot-password': 'Forgot Password',
        'reset-password': 'Reset Password',
        'confirm-password': 'Confirm Password',
        'sign-in': 'Sign In',
        'sign-up': 'Sign Up',
        'sign-out': 'Sign Out'
      },
      dashboard: {
        dashboard: 'Dashboard',
        settings: 'Settings',
        profile: 'Profile',
        account: 'Account',
        preferences: 'Preferences',
        notifications: 'Notifications',
        security: 'Security',
        billing: 'Billing',
        usage: 'Usage',
        statistics: 'Statistics'
      },
      'email-generator': {
        'email-generator': 'Email Generator',
        subject: 'Subject',
        content: 'Content',
        generate: 'Generate',
        preview: 'Preview',
        send: 'Send',
        template: 'Template',
        recipient: 'Recipient',
        sender: 'Sender'
      },
      seo: {
        seo: 'SEO',
        keywords: 'Keywords',
        'meta-description': 'Meta Description',
        title: 'Title',
        'alt-text': 'Alt Text',
        'canonical-url': 'Canonical URL',
        'robots-txt': 'Robots.txt',
        sitemap: 'Sitemap'
      },
      templates: {
        templates: 'Templates',
        template: 'Template',
        category: 'Category',
        description: 'Description',
        'use-template': 'Use Template',
        'create-template': 'Create Template',
        'edit-template': 'Edit Template',
        'delete-template': 'Delete Template'
      },
      plans: {
        plans: 'Plans',
        plan: 'Plan',
        pricing: 'Pricing',
        features: 'Features',
        'choose-plan': 'Choose Plan',
        upgrade: 'Upgrade',
        downgrade: 'Downgrade',
        'current-plan': 'Current Plan',
        'billing-cycle': 'Billing Cycle'
      },
      errors: {
        'page-not-found': 'Page Not Found',
        'server-error': 'Server Error',
        'network-error': 'Network Error',
        'loading-error': 'Loading Error',
        'translation-error': 'Translation Error',
        'try-again': 'Try Again',
        'go-home': 'Go Home',
        'contact-support': 'Contact Support'
      }
    };

    return minimal[namespace] || {};
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Debounce utility function
   */
  private debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }
}