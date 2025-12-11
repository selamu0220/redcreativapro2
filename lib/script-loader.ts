/**
 * Async Script Loader
 * Handles asynchronous loading of analytics scripts with error handling and CSP compatibility
 */

export interface ScriptLoadOptions {
  src: string;
  id?: string;
  defer?: boolean;
  async?: boolean;
  attributes?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ScriptLoadResult {
  success: boolean;
  error?: string;
  loadTime?: number;
  retryCount?: number;
}

/**
 * Script loading error types
 */
export class ScriptLoadError extends Error {
  constructor(message: string, public code?: string, public src?: string) {
    super(message);
    this.name = 'ScriptLoadError';
  }
}

/**
 * Async Script Loader Class
 */
export class AsyncScriptLoader {
  private loadedScripts = new Set<string>();
  private loadingPromises = new Map<string, Promise<ScriptLoadResult>>();
  private defaultTimeout = 10000; // 10 seconds
  private defaultRetries = 3;
  private defaultRetryDelay = 1000; // 1 second

  /**
   * Load a script asynchronously
   */
  async loadScript(options: ScriptLoadOptions): Promise<ScriptLoadResult> {
    const { src, timeout = this.defaultTimeout, retries = this.defaultRetries } = options;
    
    // Check if script is already loaded
    if (this.loadedScripts.has(src)) {
      return { success: true, loadTime: 0 };
    }

    // Check if script is currently loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // Start loading process
    const loadPromise = this.performLoad(options, retries);
    this.loadingPromises.set(src, loadPromise);

    try {
      const result = await loadPromise;
      if (result.success) {
        this.loadedScripts.add(src);
      }
      return result;
    } finally {
      this.loadingPromises.delete(src);
    }
  }

  /**
   * Load multiple scripts in parallel
   */
  async loadScripts(scripts: ScriptLoadOptions[]): Promise<ScriptLoadResult[]> {
    const promises = scripts.map(script => this.loadScript(script));
    return Promise.all(promises);
  }

  /**
   * Check if a script is loaded
   */
  isScriptLoaded(src: string): boolean {
    return this.loadedScripts.has(src);
  }

  /**
   * Remove a script from the DOM and tracking
   */
  removeScript(src: string): boolean {
    const script = document.querySelector(`script[src="${src}"]`);
    if (script) {
      script.remove();
      this.loadedScripts.delete(src);
      return true;
    }
    return false;
  }

  /**
   * Get loading status for all scripts
   */
  getLoadingStatus(): { loaded: string[]; loading: string[] } {
    return {
      loaded: Array.from(this.loadedScripts),
      loading: Array.from(this.loadingPromises.keys()),
    };
  }

  /**
   * Perform the actual script loading with retries
   */
  private async performLoad(options: ScriptLoadOptions, retriesLeft: number): Promise<ScriptLoadResult> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retriesLeft; attempt++) {
      try {
        await this.loadSingleScript(options);
        const loadTime = Date.now() - startTime;
        return {
          success: true,
          loadTime,
          retryCount: attempt,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If this is not the last attempt, wait before retrying
        if (attempt < retriesLeft) {
          const delay = options.retryDelay || this.defaultRetryDelay;
          await this.sleep(delay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    // All retries failed
    const loadTime = Date.now() - startTime;
    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      loadTime,
      retryCount: retriesLeft + 1,
    };
  }

  /**
   * Load a single script attempt
   */
  private async loadSingleScript(options: ScriptLoadOptions): Promise<void> {
    const { src, id, defer = true, async: asyncAttr = false, attributes = {}, timeout = this.defaultTimeout } = options;

    return new Promise((resolve, reject) => {
      // Check if script already exists in DOM
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = src;
      
      if (id) {
        script.id = id;
      }
      
      if (defer) {
        script.defer = true;
      }
      
      if (asyncAttr) {
        script.async = true;
      }

      // Add custom attributes
      Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });

      // Set up timeout
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new ScriptLoadError(`Script load timeout after ${timeout}ms`, 'TIMEOUT', src));
      }, timeout);

      // Set up event handlers
      const cleanup = () => {
        clearTimeout(timeoutId);
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
      };

      const onLoad = () => {
        cleanup();
        resolve();
      };

      const onError = (event: Event | string) => {
        cleanup();
        script.remove(); // Clean up failed script
        const errorMessage = typeof event === 'string' ? event : 'Script failed to load';
        reject(new ScriptLoadError(errorMessage, 'LOAD_FAILED', src));
      };

      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);

      // Add script to document
      try {
        document.head.appendChild(script);
      } catch (error) {
        cleanup();
        reject(new ScriptLoadError('Failed to append script to document', 'DOM_ERROR', src));
      }
    });
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global script loader instance
 */
let globalScriptLoader: AsyncScriptLoader | null = null;

/**
 * Get or create global script loader instance
 */
export function getScriptLoader(): AsyncScriptLoader {
  if (!globalScriptLoader) {
    globalScriptLoader = new AsyncScriptLoader();
  }
  return globalScriptLoader;
}

/**
 * Convenience function to load Umami script
 */
export async function loadUmamiScript(websiteId: string, scriptUrl: string, domains?: string[]): Promise<ScriptLoadResult> {
  const loader = getScriptLoader();
  
  const attributes: Record<string, string> = {
    'data-website-id': websiteId,
  };
  
  if (domains && domains.length > 0) {
    attributes['data-domains'] = domains.join(',');
  }

  return loader.loadScript({
    src: scriptUrl,
    id: 'umami-script',
    defer: true,
    attributes,
    timeout: 15000, // Longer timeout for analytics scripts
    retries: 2,
  });
}

/**
 * Convenience function to load Google Analytics script
 */
export async function loadGoogleAnalyticsScript(measurementId: string): Promise<ScriptLoadResult[]> {
  const loader = getScriptLoader();
  
  // Load both the gtag library and initialize it
  const scripts: ScriptLoadOptions[] = [
    {
      src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
      id: 'gtag-script',
      async: true,
      timeout: 15000,
      retries: 2,
    }
  ];

  const results = await loader.loadScripts(scripts);
  
  // Initialize gtag if script loaded successfully
  if (results[0].success && typeof window !== 'undefined') {
    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // Define gtag function using proper typing
    const gtag = (command: any, targetIdOrEventName: any, config?: any) => {
      (window as any).dataLayer.push([command, targetIdOrEventName, config]);
    };
    
    // Make gtag globally available
    (window as any).gtag = gtag;
    
    // Initialize gtag
    gtag('js', new Date());
    gtag('config', measurementId);
  }
  
  return results;
}

/**
 * Convenience function to load Google Ads script
 */
export async function loadGoogleAdsScript(adsId: string): Promise<ScriptLoadResult[]> {
  const loader = getScriptLoader();
  
  const scripts: ScriptLoadOptions[] = [
    {
      src: `https://www.googletagmanager.com/gtag/js?id=${adsId}`,
      id: 'google-ads-script',
      async: true,
      timeout: 15000,
      retries: 2,
    }
  ];

  const results = await loader.loadScripts(scripts);
  
  // Initialize gtag for Google Ads if script loaded successfully
  if (results[0].success && typeof window !== 'undefined') {
    // Initialize dataLayer if not already done
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // Define gtag function if not already done using proper typing
    if (!(window as any).gtag) {
      const gtag = (command: any, targetIdOrEventName: any, config?: any) => {
        (window as any).dataLayer.push([command, targetIdOrEventName, config]);
      };
      (window as any).gtag = gtag;
      gtag('js', new Date());
    }
    
    // Configure Google Ads
    (window as any).gtag('config', adsId);
  }
  
  return results;
}

/**
 * Load all analytics scripts (Umami, GA4, Google Ads)
 */
export async function loadAllAnalyticsScripts(): Promise<{
  umami?: ScriptLoadResult;
  ga4?: ScriptLoadResult[];
  googleAds?: ScriptLoadResult[];
  errors: string[];
}> {
  const results: any = { errors: [] };
  
  // Get environment variables
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const umamDomains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS?.split(',').map(d => d.trim());
  const ga4MeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  // Load Umami if configured
  if (umamiWebsiteId && umamiScriptUrl) {
    try {
      results.umami = await loadUmamiScript(umamiWebsiteId, umamiScriptUrl, umamDomains);
      if (!results.umami.success) {
        results.errors.push(`Umami: ${results.umami.error}`);
      }
    } catch (error) {
      results.errors.push(`Umami: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Load Google Analytics if configured
  if (ga4MeasurementId) {
    try {
      results.ga4 = await loadGoogleAnalyticsScript(ga4MeasurementId);
      const failed = results.ga4.filter((r: ScriptLoadResult) => !r.success);
      if (failed.length > 0) {
        results.errors.push(`GA4: ${failed.map((r: ScriptLoadResult) => r.error).join(', ')}`);
      }
    } catch (error) {
      results.errors.push(`GA4: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Load Google Ads if configured
  if (googleAdsId) {
    try {
      results.googleAds = await loadGoogleAdsScript(googleAdsId);
      const failed = results.googleAds.filter((r: ScriptLoadResult) => !r.success);
      if (failed.length > 0) {
        results.errors.push(`Google Ads: ${failed.map((r: ScriptLoadResult) => r.error).join(', ')}`);
      }
    } catch (error) {
      results.errors.push(`Google Ads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return results;
}
