"use client";

import React from 'react';

/**
 * Bundle Optimization Utilities
 * Provides dynamic imports, code splitting, and bundle size monitoring
 */

export interface BundleMetrics {
  loadedChunks: string[];
  chunkSizes: Record<string, number>;
  totalBundleSize: number;
  unusedModules: string[];
  loadTimes: Record<string, number>;
}

export interface LazyLoadConfig {
  threshold?: number; // Intersection observer threshold
  rootMargin?: string;
  fallback?: React.ComponentType;
  retryAttempts?: number;
  retryDelay?: number;
}

class BundleOptimizer {
  private static instance: BundleOptimizer;
  private loadedModules = new Set<string>();
  private loadTimes = new Map<string, number>();
  private chunkSizes = new Map<string, number>();
  private failedLoads = new Map<string, number>();

  private constructor() {
    this.initializePerformanceObserver();
  }

  static getInstance(): BundleOptimizer {
    if (!BundleOptimizer.instance) {
      BundleOptimizer.instance = new BundleOptimizer();
    }
    return BundleOptimizer.instance;
  }

  /**
   * Initialize performance observer to track resource loading
   */
  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('chunk')) {
            const chunkName = this.extractChunkName(entry.name);
            this.loadTimes.set(chunkName, entry.duration);

            // Estimate chunk size from transfer size
            if ('transferSize' in entry) {
              this.chunkSizes.set(chunkName, (entry as any).transferSize);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Failed to initialize performance observer:', error);
    }
  }

  /**
   * Extract chunk name from resource URL
   */
  private extractChunkName(url: string): string {
    const match = url.match(/\/([^\/]+)\.js$/);
    return match ? match[1] : url;
  }

  /**
   * Create a lazy-loaded component with error handling and retry logic
   */
  createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    componentName: string,
    config: LazyLoadConfig = {}
  ): React.LazyExoticComponent<T> {
    const {
      retryAttempts = 3,
      retryDelay = 1000
    } = config;

    const lazyImport = async (): Promise<{ default: T }> => {
      const startTime = performance.now();
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
          const module = await importFn();

          // Track successful load
          const loadTime = performance.now() - startTime;
          this.loadTimes.set(componentName, loadTime);
          this.loadedModules.add(componentName);

          // Reset failed load count on success
          this.failedLoads.delete(componentName);

          return module;
        } catch (error) {
          lastError = error as Error;
          const failCount = this.failedLoads.get(componentName) || 0;
          this.failedLoads.set(componentName, failCount + 1);

          console.warn(`Failed to load ${componentName} (attempt ${attempt}/${retryAttempts}):`, error);

          // Wait before retry (except on last attempt)
          if (attempt < retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          }
        }
      }

      // All attempts failed
      throw new Error(`Failed to load ${componentName} after ${retryAttempts} attempts: ${lastError?.message}`);
    };

    return React.lazy(lazyImport);
  }

  /**
   * Preload a module without rendering it
   */
  async preloadModule(
    importFn: () => Promise<any>,
    moduleName: string
  ): Promise<boolean> {
    try {
      const startTime = performance.now();
      await importFn();

      const loadTime = performance.now() - startTime;
      this.loadTimes.set(moduleName, loadTime);
      this.loadedModules.add(moduleName);

      return true;
    } catch (error) {
      console.warn(`Failed to preload ${moduleName}:`, error);
      const failCount = this.failedLoads.get(moduleName) || 0;
      this.failedLoads.set(moduleName, failCount + 1);
      return false;
    }
  }

  /**
   * Create intersection observer for lazy loading
   */
  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    config: LazyLoadConfig = {}
  ): IntersectionObserver | null {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null;
    }

    const {
      threshold = 0.1,
      rootMargin = '50px'
    } = config;

    return new IntersectionObserver(callback, {
      threshold,
      rootMargin
    });
  }

  /**
   * Get bundle metrics
   */
  getBundleMetrics(): BundleMetrics {
    const totalBundleSize = Array.from(this.chunkSizes.values()).reduce((sum, size) => sum + size, 0);

    return {
      loadedChunks: Array.from(this.loadedModules),
      chunkSizes: Object.fromEntries(this.chunkSizes),
      totalBundleSize,
      unusedModules: this.getUnusedModules(),
      loadTimes: Object.fromEntries(this.loadTimes)
    };
  }

  /**
   * Identify potentially unused modules
   */
  private getUnusedModules(): string[] {
    // This is a simplified implementation
    // In a real scenario, you'd analyze the dependency graph
    const unusedModules: string[] = [];

    // Check for modules that failed to load multiple times
    for (const [moduleName, failCount] of this.failedLoads) {
      if (failCount > 2) {
        unusedModules.push(moduleName);
      }
    }

    return unusedModules;
  }

  /**
   * Clear metrics and reset state
   */
  clearMetrics(): void {
    this.loadedModules.clear();
    this.loadTimes.clear();
    this.chunkSizes.clear();
    this.failedLoads.clear();
  }

  /**
   * Get load performance summary
   */
  getPerformanceSummary(): {
    averageLoadTime: number;
    slowestModule: string | null;
    fastestModule: string | null;
    failureRate: number;
    totalModules: number;
  } {
    const loadTimes = Array.from(this.loadTimes.values());
    const averageLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
      : 0;

    let slowestModule: string | null = null;
    let fastestModule: string | null = null;
    let maxTime = 0;
    let minTime = Infinity;

    for (const [module, time] of this.loadTimes) {
      if (time > maxTime) {
        maxTime = time;
        slowestModule = module;
      }
      if (time < minTime) {
        minTime = time;
        fastestModule = module;
      }
    }

    const totalAttempts = this.loadedModules.size + Array.from(this.failedLoads.values()).reduce((sum, count) => sum + count, 0);
    const failureRate = totalAttempts > 0
      ? Array.from(this.failedLoads.values()).reduce((sum, count) => sum + count, 0) / totalAttempts
      : 0;

    return {
      averageLoadTime,
      slowestModule,
      fastestModule,
      failureRate,
      totalModules: this.loadedModules.size
    };
  }
}

export default BundleOptimizer;

/**
 * React hook for bundle optimization
 */
export function useBundleOptimizer() {
  const optimizer = BundleOptimizer.getInstance();

  return {
    createLazyComponent: <T extends React.ComponentType<any>>(
      importFn: () => Promise<{ default: T }>,
      componentName: string,
      config?: LazyLoadConfig
    ) => optimizer.createLazyComponent(importFn, componentName, config),

    preloadModule: (importFn: () => Promise<any>, moduleName: string) =>
      optimizer.preloadModule(importFn, moduleName),

    createIntersectionObserver: (
      callback: (entries: IntersectionObserverEntry[]) => void,
      config?: LazyLoadConfig
    ) => optimizer.createIntersectionObserver(callback, config),

    getBundleMetrics: () => optimizer.getBundleMetrics(),
    getPerformanceSummary: () => optimizer.getPerformanceSummary(),
    clearMetrics: () => optimizer.clearMetrics()
  };
}

/**
 * Higher-order component for lazy loading with intersection observer
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  config: LazyLoadConfig = {}
) {
  return React.forwardRef<any, P & { lazyLoad?: boolean }>((props, ref) => {
    const { lazyLoad = true, ...componentProps } = props;
    const [isVisible, setIsVisible] = React.useState(!lazyLoad);
    const elementRef = React.useRef<HTMLDivElement>(null);
    const optimizer = BundleOptimizer.getInstance();

    React.useEffect(() => {
      if (!lazyLoad || isVisible) return;

      const observer = optimizer.createIntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer?.unobserve(entry.target);
            }
          });
        },
        config
      );

      if (observer && elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => {
        if (observer && elementRef.current) {
          observer.unobserve(elementRef.current);
        }
      };
    }, [lazyLoad, isVisible, optimizer]);

    if (!isVisible) {
      const Fallback = config.fallback || (() => (
        <div
          ref={elementRef}
          className="w-full h-32 bg-gray-100 animate-pulse rounded"
          aria-label="Cargando componente..."
        />
      ));
      return <Fallback />;
    }

    return <Component {...(componentProps as P)} ref={ref} />;
  });
}
