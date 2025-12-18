"use client";

import { useBundleOptimizer } from './BundleOptimizer';
import { useMemoryManager } from './MemoryManager';

/**
 * AI-specific bundle optimization utilities
 * Provides lazy loading and code splitting for AI components
 */

export interface AIComponentConfig {
  preload?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  fallbackComponent?: React.ComponentType;
}

class AIBundleOptimizer {
  private static instance: AIBundleOptimizer;
  private bundleOptimizer: ReturnType<typeof useBundleOptimizer>;
  private memoryManager: ReturnType<typeof useMemoryManager>;
  private preloadedComponents = new Set<string>();

  constructor() {
    // These will be initialized when used in a React component
    this.bundleOptimizer = null as any;
    this.memoryManager = null as any;
  }

  static getInstance(): AIBundleOptimizer {
    if (!AIBundleOptimizer.instance) {
      AIBundleOptimizer.instance = new AIBundleOptimizer();
    }
    return AIBundleOptimizer.instance;
  }

  /**
   * Initialize with React hooks (must be called from within a React component)
   */
  initialize(bundleOptimizer: ReturnType<typeof useBundleOptimizer>, memoryManager: ReturnType<typeof useMemoryManager>) {
    this.bundleOptimizer = bundleOptimizer;
    this.memoryManager = memoryManager;
  }

  /**
   * Create lazy AI configuration panel
   */
  createLazyAIConfigPanel(config: AIComponentConfig = {}) {
    return this.bundleOptimizer.createLazyComponent(
      () => import('../../components/AIConfigurationPanel'),
      'AIConfigurationPanel',
      {
        retryAttempts: config.retryAttempts || 3,
        retryDelay: config.retryDelay || 1000,
        fallback: config.fallbackComponent || (() => (
          <div className="p-4 bg-gray-100 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))
      }
    );
  }

  /**
   * Create lazy AI model selector
   */
  createLazyAIModelSelector(config: AIComponentConfig = {}) {
    return this.bundleOptimizer.createLazyComponent(
      () => import('../../components/AIModelSelector'),
      'AIModelSelector',
      {
        retryAttempts: config.retryAttempts || 3,
        retryDelay: config.retryDelay || 1000,
        fallback: config.fallbackComponent || (() => (
          <div className="p-2 bg-gray-100 rounded animate-pulse">
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
        ))
      }
    );
  }

  /**
   * Create lazy AI progress indicator
   */
  createLazyAIProgressIndicator(config: AIComponentConfig = {}) {
    return this.bundleOptimizer.createLazyComponent(
      () => import('../../components/AIProgressIndicator'),
      'AIProgressIndicator',
      {
        retryAttempts: config.retryAttempts || 3,
        retryDelay: config.retryDelay || 1000,
        fallback: config.fallbackComponent || (() => (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="h-2 bg-gray-300 rounded w-24 animate-pulse"></div>
          </div>
        ))
      }
    );
  }

  /**
   * Create lazy error notification system
   */
  createLazyErrorNotificationSystem(config: AIComponentConfig = {}) {
    return this.bundleOptimizer.createLazyComponent(
      () => import('../../components/error-display/ErrorNotificationSystem'),
      'ErrorNotificationSystem',
      {
        retryAttempts: config.retryAttempts || 2,
        retryDelay: config.retryDelay || 500,
        fallback: config.fallbackComponent || (() => (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="text-red-800 text-sm">Cargando sistema de notificaciones...</div>
          </div>
        ))
      }
    );
  }

  /**
   * Preload AI components based on user interaction patterns
   */
  async preloadAIComponents(priority: 'high' | 'medium' | 'low' = 'medium') {
    const componentsToPreload = this.getPreloadComponents(priority);
    
    for (const component of componentsToPreload) {
      if (!this.preloadedComponents.has(component.name)) {
        try {
          const success = await this.bundleOptimizer.preloadModule(
            component.importFn,
            component.name
          );
          
          if (success) {
            this.preloadedComponents.add(component.name);
            console.log(`✅ Preloaded AI component: ${component.name}`);
          }
        } catch (error) {
          console.warn(`Failed to preload AI component ${component.name}:`, error);
        }
      }
    }
  }

  /**
   * Get components to preload based on priority
   */
  private getPreloadComponents(priority: 'high' | 'medium' | 'low') {
    const allComponents = [
      {
        name: 'AIConfigurationPanel',
        importFn: () => import('../../components/AIConfigurationPanel'),
        priority: 'medium'
      },
      {
        name: 'AIModelSelector',
        importFn: () => import('../../components/AIModelSelector'),
        priority: 'high'
      },
      {
        name: 'AIProgressIndicator',
        importFn: () => import('../../components/AIProgressIndicator'),
        priority: 'high'
      },
      {
        name: 'ErrorNotificationSystem',
        importFn: () => import('../../components/error-display/ErrorNotificationSystem'),
        priority: 'low'
      },
      {
        name: 'PerformanceMonitor',
        importFn: () => import('../../components/PerformanceMonitor'),
        priority: 'low'
      }
    ];

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const minPriority = priorityOrder[priority];

    return allComponents.filter(component => 
      priorityOrder[component.priority as keyof typeof priorityOrder] >= minPriority
    );
  }

  /**
   * Optimize bundle based on usage patterns
   */
  optimizeBundleForUsage(usagePatterns: {
    aiConfigUsage: number;
    modelSelectorUsage: number;
    progressIndicatorUsage: number;
    errorSystemUsage: number;
  }) {
    // Determine preload priority based on usage
    let priority: 'high' | 'medium' | 'low' = 'low';
    
    const totalUsage = Object.values(usagePatterns).reduce((sum, usage) => sum + usage, 0);
    const avgUsage = totalUsage / Object.keys(usagePatterns).length;
    
    if (avgUsage > 10) {
      priority = 'high';
    } else if (avgUsage > 5) {
      priority = 'medium';
    }
    
    // Preload components based on calculated priority
    this.preloadAIComponents(priority);
    
    // Clean up unused components if memory usage is high
    const memoryMetrics = this.memoryManager.getMemoryMetrics();
    if (memoryMetrics && memoryMetrics.memoryUsagePercentage > 0.7) {
      this.memoryManager.cleanupLocalStorage();
      this.memoryManager.forceGarbageCollection();
    }
  }

  /**
   * Get bundle optimization metrics
   */
  getBundleMetrics() {
    const bundleMetrics = this.bundleOptimizer.getBundleMetrics();
    const performanceSummary = this.bundleOptimizer.getPerformanceSummary();
    
    return {
      ...bundleMetrics,
      ...performanceSummary,
      preloadedComponents: Array.from(this.preloadedComponents),
      aiSpecificMetrics: {
        totalAIComponents: this.preloadedComponents.size,
        memoryOptimized: bundleMetrics.totalBundleSize < 5 * 1024 * 1024, // 5MB threshold
        loadTimeOptimized: performanceSummary.averageLoadTime < 1000 // 1 second threshold
      }
    };
  }

  /**
   * Clear optimization cache
   */
  clearOptimizationCache() {
    this.preloadedComponents.clear();
    this.bundleOptimizer.clearMetrics();
  }
}

export default AIBundleOptimizer;

/**
 * React hook for AI bundle optimization
 */
export function useAIBundleOptimizer() {
  const bundleOptimizer = useBundleOptimizer();
  const memoryManager = useMemoryManager();
  
  const aiBundleOptimizer = AIBundleOptimizer.getInstance();
  aiBundleOptimizer.initialize(bundleOptimizer, memoryManager);

  return {
    createLazyAIConfigPanel: (config?: AIComponentConfig) => 
      aiBundleOptimizer.createLazyAIConfigPanel(config),
    createLazyAIModelSelector: (config?: AIComponentConfig) => 
      aiBundleOptimizer.createLazyAIModelSelector(config),
    createLazyAIProgressIndicator: (config?: AIComponentConfig) => 
      aiBundleOptimizer.createLazyAIProgressIndicator(config),
    createLazyErrorNotificationSystem: (config?: AIComponentConfig) => 
      aiBundleOptimizer.createLazyErrorNotificationSystem(config),
    preloadAIComponents: (priority?: 'high' | 'medium' | 'low') => 
      aiBundleOptimizer.preloadAIComponents(priority),
    optimizeBundleForUsage: (usagePatterns: any) => 
      aiBundleOptimizer.optimizeBundleForUsage(usagePatterns),
    getBundleMetrics: () => aiBundleOptimizer.getBundleMetrics(),
    clearOptimizationCache: () => aiBundleOptimizer.clearOptimizationCache()
  };
}