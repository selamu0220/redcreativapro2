"use client";

/**
 * Memory Management Utilities for AI Writer
 * Provides memory leak detection, cleanup, and optimization
 */

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsagePercentage: number;
  isHighMemoryUsage: boolean;
}

export interface PerformanceAlert {
  type: 'memory' | 'timeout' | 'listener' | 'storage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  context?: any;
}

class MemoryManager {
  private static instance: MemoryManager;
  private timeoutRegistry = new Set<NodeJS.Timeout>();
  private intervalRegistry = new Set<NodeJS.Timeout>();
  private listenerRegistry = new Map<string, () => void>();
  private performanceAlerts: PerformanceAlert[] = [];
  private memoryThresholds = {
    warning: 0.7,  // 70%
    critical: 0.9  // 90%
  };

  private constructor() {
    this.startMemoryMonitoring();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Register a timeout for automatic cleanup
   */
  registerTimeout(timeout: NodeJS.Timeout, context?: string): NodeJS.Timeout {
    this.timeoutRegistry.add(timeout);
    
    // Auto-cleanup when timeout completes
    const originalTimeout = timeout;
    const wrappedTimeout = setTimeout(() => {
      this.timeoutRegistry.delete(originalTimeout);
    }, 0);
    
    return timeout;
  }

  /**
   * Register an interval for automatic cleanup
   */
  registerInterval(interval: NodeJS.Timeout, context?: string): NodeJS.Timeout {
    this.intervalRegistry.add(interval);
    return interval;
  }

  /**
   * Register an event listener for automatic cleanup
   */
  registerListener(key: string, cleanup: () => void): void {
    // Clean up existing listener if it exists
    if (this.listenerRegistry.has(key)) {
      const existingCleanup = this.listenerRegistry.get(key);
      existingCleanup?.();
    }
    
    this.listenerRegistry.set(key, cleanup);
  }

  /**
   * Clean up all registered timeouts
   */
  clearAllTimeouts(): void {
    this.timeoutRegistry.forEach(timeout => {
      try {
        clearTimeout(timeout);
      } catch (error) {
        console.warn('Failed to clear timeout:', error);
      }
    });
    this.timeoutRegistry.clear();
  }

  /**
   * Clean up all registered intervals
   */
  clearAllIntervals(): void {
    this.intervalRegistry.forEach(interval => {
      try {
        clearInterval(interval);
      } catch (error) {
        console.warn('Failed to clear interval:', error);
      }
    });
    this.intervalRegistry.clear();
  }

  /**
   * Clean up all registered listeners
   */
  clearAllListeners(): void {
    this.listenerRegistry.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Failed to cleanup listener:', error);
      }
    });
    this.listenerRegistry.clear();
  }

  /**
   * Perform complete cleanup
   */
  cleanup(): void {
    this.clearAllTimeouts();
    this.clearAllIntervals();
    this.clearAllListeners();
    this.performanceAlerts = [];
  }

  /**
   * Get current memory metrics
   */
  getMemoryMetrics(): MemoryMetrics | null {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const memory = (performance as any).memory;
    if (!memory) {
      return null;
    }

    const usedJSHeapSize = memory.usedJSHeapSize;
    const totalJSHeapSize = memory.totalJSHeapSize;
    const jsHeapSizeLimit = memory.jsHeapSizeLimit;
    const memoryUsagePercentage = usedJSHeapSize / totalJSHeapSize;

    return {
      usedJSHeapSize,
      totalJSHeapSize,
      jsHeapSizeLimit,
      memoryUsagePercentage,
      isHighMemoryUsage: memoryUsagePercentage > this.memoryThresholds.warning
    };
  }

  /**
   * Check for memory leaks and performance issues
   */
  performMemoryAudit(): {
    activeTimeouts: number;
    activeIntervals: number;
    activeListeners: number;
    memoryMetrics: MemoryMetrics | null;
    alerts: PerformanceAlert[];
  } {
    const memoryMetrics = this.getMemoryMetrics();
    const alerts: PerformanceAlert[] = [];

    // Check for excessive timeouts
    if (this.timeoutRegistry.size > 10) {
      alerts.push({
        type: 'timeout',
        severity: 'medium',
        message: `High number of active timeouts: ${this.timeoutRegistry.size}`,
        timestamp: Date.now(),
        context: { count: this.timeoutRegistry.size }
      });
    }

    // Check for excessive intervals
    if (this.intervalRegistry.size > 5) {
      alerts.push({
        type: 'timeout',
        severity: 'high',
        message: `High number of active intervals: ${this.intervalRegistry.size}`,
        timestamp: Date.now(),
        context: { count: this.intervalRegistry.size }
      });
    }

    // Check for excessive listeners
    if (this.listenerRegistry.size > 20) {
      alerts.push({
        type: 'listener',
        severity: 'medium',
        message: `High number of active listeners: ${this.listenerRegistry.size}`,
        timestamp: Date.now(),
        context: { count: this.listenerRegistry.size }
      });
    }

    // Check memory usage
    if (memoryMetrics) {
      if (memoryMetrics.memoryUsagePercentage > this.memoryThresholds.critical) {
        alerts.push({
          type: 'memory',
          severity: 'critical',
          message: `Critical memory usage: ${Math.round(memoryMetrics.memoryUsagePercentage * 100)}%`,
          timestamp: Date.now(),
          context: memoryMetrics
        });
      } else if (memoryMetrics.memoryUsagePercentage > this.memoryThresholds.warning) {
        alerts.push({
          type: 'memory',
          severity: 'medium',
          message: `High memory usage: ${Math.round(memoryMetrics.memoryUsagePercentage * 100)}%`,
          timestamp: Date.now(),
          context: memoryMetrics
        });
      }
    }

    return {
      activeTimeouts: this.timeoutRegistry.size,
      activeIntervals: this.intervalRegistry.size,
      activeListeners: this.listenerRegistry.size,
      memoryMetrics,
      alerts
    };
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): boolean {
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
        return true;
      } catch (error) {
        console.warn('Failed to force garbage collection:', error);
      }
    }
    return false;
  }

  /**
   * Clean up localStorage to free memory
   */
  cleanupLocalStorage(): void {
    try {
      const keysToRemove: string[] = [];
      
      // Find old backup entries (older than 24 hours)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('document_backup_')) {
          const timestamp = parseInt(key.replace('document_backup_', ''));
          const age = Date.now() - timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (age > maxAge) {
            keysToRemove.push(key);
          }
        }
      }

      // Remove old entries
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove localStorage key: ${key}`, error);
        }
      });

      if (keysToRemove.length > 0) {
        this.addAlert({
          type: 'storage',
          severity: 'low',
          message: `Cleaned up ${keysToRemove.length} old localStorage entries`,
          timestamp: Date.now(),
          context: { removedKeys: keysToRemove.length }
        });
      }
    } catch (error) {
      console.warn('Failed to cleanup localStorage:', error);
    }
  }

  /**
   * Start automatic memory monitoring
   */
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor memory every 30 seconds
    const monitoringInterval = setInterval(() => {
      const audit = this.performMemoryAudit();
      
      // Add new alerts
      audit.alerts.forEach(alert => this.addAlert(alert));
      
      // Auto-cleanup if memory usage is critical
      if (audit.memoryMetrics?.memoryUsagePercentage && 
          audit.memoryMetrics.memoryUsagePercentage > this.memoryThresholds.critical) {
        this.performEmergencyCleanup();
      }
      
      // Cleanup localStorage periodically
      this.cleanupLocalStorage();
      
    }, 30000);

    this.registerInterval(monitoringInterval, 'memory-monitoring');

    // Cleanup on page unload
    const cleanup = () => this.cleanup();
    window.addEventListener('beforeunload', cleanup);
    this.registerListener('beforeunload', () => {
      window.removeEventListener('beforeunload', cleanup);
    });
  }

  /**
   * Perform emergency cleanup when memory is critical
   */
  private performEmergencyCleanup(): void {
    console.warn('Performing emergency memory cleanup...');
    
    // Clear old timeouts and intervals
    this.clearAllTimeouts();
    
    // Force garbage collection if available
    this.forceGarbageCollection();
    
    // Clean up localStorage
    this.cleanupLocalStorage();
    
    this.addAlert({
      type: 'memory',
      severity: 'critical',
      message: 'Emergency memory cleanup performed',
      timestamp: Date.now()
    });
  }

  /**
   * Add a performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.performanceAlerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.performanceAlerts.length > 50) {
      this.performanceAlerts = this.performanceAlerts.slice(-50);
    }
  }

  /**
   * Get performance alerts
   */
  getPerformanceAlerts(): PerformanceAlert[] {
    return [...this.performanceAlerts];
  }

  /**
   * Clear performance alerts
   */
  clearPerformanceAlerts(): void {
    this.performanceAlerts = [];
  }
}

export default MemoryManager;

/**
 * React hook for memory management
 */
export function useMemoryManager() {
  const memoryManager = MemoryManager.getInstance();

  return {
    registerTimeout: (timeout: NodeJS.Timeout, context?: string) => 
      memoryManager.registerTimeout(timeout, context),
    registerInterval: (interval: NodeJS.Timeout, context?: string) => 
      memoryManager.registerInterval(interval, context),
    registerListener: (key: string, cleanup: () => void) => 
      memoryManager.registerListener(key, cleanup),
    getMemoryMetrics: () => memoryManager.getMemoryMetrics(),
    performMemoryAudit: () => memoryManager.performMemoryAudit(),
    forceGarbageCollection: () => memoryManager.forceGarbageCollection(),
    cleanupLocalStorage: () => memoryManager.cleanupLocalStorage(),
    getPerformanceAlerts: () => memoryManager.getPerformanceAlerts(),
    clearPerformanceAlerts: () => memoryManager.clearPerformanceAlerts(),
    cleanup: () => memoryManager.cleanup()
  };
}
