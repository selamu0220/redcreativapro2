"use client";

/**
 * Memory Leak Detection and Prevention for AI Writer
 * Specifically targets auto-improvement features and AI operations
 */

export interface MemoryLeakReport {
  leakType: 'timeout' | 'interval' | 'listener' | 'closure' | 'dom' | 'ai_operation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  recommendations: string[];
  detectedAt: number;
  context?: any;
}

export interface AutoImprovementMemoryMetrics {
  activeOperations: number;
  pendingTimeouts: number;
  retainedClosures: number;
  aiModelInstances: number;
  documentVersions: number;
  memoryFootprint: number;
}

class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private detectedLeaks: MemoryLeakReport[] = [];
  private operationRegistry = new Map<string, any>();
  private closureRegistry = new WeakMap();
  private aiOperationTracker = new Map<string, {
    startTime: number;
    operation: string;
    memoryBefore: number;
    cleanup?: () => void;
  }>();

  private constructor() {
    this.startLeakDetection();
  }

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  /**
   * Track AI operation for memory leak detection
   */
  trackAIOperation(operationId: string, operation: string, cleanup?: () => void): void {
    const memoryBefore = this.getCurrentMemoryUsage();
    
    this.aiOperationTracker.set(operationId, {
      startTime: Date.now(),
      operation,
      memoryBefore,
      cleanup
    });

    // Auto-cleanup after 5 minutes if not manually cleaned
    setTimeout(() => {
      if (this.aiOperationTracker.has(operationId)) {
        this.reportLeak({
          leakType: 'ai_operation',
          severity: 'high',
          description: `AI operation "${operation}" was not properly cleaned up`,
          location: 'AI Operation Tracker',
          recommendations: [
            'Ensure AI operations are properly cleaned up after completion',
            'Check for uncaught errors in AI operation handlers',
            'Verify timeout and interval cleanup in AI workflows'
          ],
          detectedAt: Date.now(),
          context: { operationId, operation, duration: Date.now() - this.aiOperationTracker.get(operationId)!.startTime }
        });
        
        // Force cleanup
        this.cleanupAIOperation(operationId);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Clean up AI operation
   */
  cleanupAIOperation(operationId: string): boolean {
    const operation = this.aiOperationTracker.get(operationId);
    if (!operation) return false;

    try {
      // Execute cleanup function if provided
      if (operation.cleanup) {
        operation.cleanup();
      }

      // Check for memory increase
      const memoryAfter = this.getCurrentMemoryUsage();
      const memoryIncrease = memoryAfter - operation.memoryBefore;
      
      if (memoryIncrease > 10 * 1024 * 1024) { // 10MB increase
        this.reportLeak({
          leakType: 'ai_operation',
          severity: 'medium',
          description: `AI operation "${operation.operation}" caused significant memory increase`,
          location: 'AI Operation Memory Check',
          recommendations: [
            'Review AI operation for memory-intensive operations',
            'Consider implementing memory-efficient algorithms',
            'Add explicit garbage collection hints'
          ],
          detectedAt: Date.now(),
          context: { 
            operationId, 
            operation: operation.operation, 
            memoryIncrease: memoryIncrease / (1024 * 1024) // MB
          }
        });
      }

      this.aiOperationTracker.delete(operationId);
      return true;
    } catch (error) {
      console.error(`Failed to cleanup AI operation ${operationId}:`, error);
      return false;
    }
  }

  /**
   * Audit auto-improvement features for memory leaks
   */
  auditAutoImprovementFeatures(): AutoImprovementMemoryMetrics {
    const metrics: AutoImprovementMemoryMetrics = {
      activeOperations: this.aiOperationTracker.size,
      pendingTimeouts: this.countPendingTimeouts(),
      retainedClosures: this.countRetainedClosures(),
      aiModelInstances: this.countAIModelInstances(),
      documentVersions: this.countDocumentVersions(),
      memoryFootprint: this.getCurrentMemoryUsage()
    };

    // Check for potential leaks
    if (metrics.activeOperations > 5) {
      this.reportLeak({
        leakType: 'ai_operation',
        severity: 'high',
        description: `High number of active AI operations: ${metrics.activeOperations}`,
        location: 'Auto-improvement Audit',
        recommendations: [
          'Check for operations that are not completing properly',
          'Implement operation timeout and cleanup',
          'Review auto-improvement configuration'
        ],
        detectedAt: Date.now(),
        context: metrics
      });
    }

    if (metrics.pendingTimeouts > 10) {
      this.reportLeak({
        leakType: 'timeout',
        severity: 'medium',
        description: `High number of pending timeouts: ${metrics.pendingTimeouts}`,
        location: 'Auto-improvement Audit',
        recommendations: [
          'Review timeout cleanup in auto-improvement features',
          'Implement proper timeout cancellation',
          'Check for rapid timeout creation without cleanup'
        ],
        detectedAt: Date.now(),
        context: metrics
      });
    }

    if (metrics.documentVersions > 50) {
      this.reportLeak({
        leakType: 'closure',
        severity: 'medium',
        description: `High number of document versions retained: ${metrics.documentVersions}`,
        location: 'Document Version Management',
        recommendations: [
          'Implement version history cleanup',
          'Limit maximum number of retained versions',
          'Clear old versions periodically'
        ],
        detectedAt: Date.now(),
        context: metrics
      });
    }

    return metrics;
  }

  /**
   * Fix detected memory leaks in auto-improvement features
   */
  fixAutoImprovementLeaks(): {
    fixed: number;
    failed: number;
    details: string[];
  } {
    let fixed = 0;
    let failed = 0;
    const details: string[] = [];

    // Clean up stale AI operations
    const staleOperations = Array.from(this.aiOperationTracker.entries())
      .filter(([_, op]) => Date.now() - op.startTime > 2 * 60 * 1000); // 2 minutes

    for (const [operationId, operation] of staleOperations) {
      try {
        this.cleanupAIOperation(operationId);
        fixed++;
        details.push(`Cleaned up stale AI operation: ${operation.operation}`);
      } catch (error) {
        failed++;
        details.push(`Failed to cleanup AI operation ${operationId}: ${error}`);
      }
    }

    // Clear excessive document versions from localStorage
    try {
      const versionKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('document_version_'))
        .sort()
        .slice(0, -20); // Keep only last 20 versions

      for (const key of versionKeys) {
        localStorage.removeItem(key);
        fixed++;
      }
      
      if (versionKeys.length > 0) {
        details.push(`Cleaned up ${versionKeys.length} old document versions`);
      }
    } catch (error) {
      failed++;
      details.push(`Failed to cleanup document versions: ${error}`);
    }

    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
        details.push('Forced garbage collection');
      } catch (error) {
        details.push('Failed to force garbage collection');
      }
    }

    return { fixed, failed, details };
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return 0;
    }

    const memory = (performance as any).memory;
    return memory ? memory.usedJSHeapSize : 0;
  }

  /**
   * Count pending timeouts (approximation)
   */
  private countPendingTimeouts(): number {
    // This is an approximation since we can't directly count all timeouts
    // We track timeouts through our memory manager
    return this.operationRegistry.size;
  }

  /**
   * Count retained closures (approximation)
   */
  private countRetainedClosures(): number {
    // This is a simplified approximation
    // In practice, this would require more sophisticated memory profiling
    return Math.floor(this.getCurrentMemoryUsage() / (1024 * 1024)); // Rough estimate
  }

  /**
   * Count AI model instances
   */
  private countAIModelInstances(): number {
    // Count active AI operations as proxy for model instances
    return this.aiOperationTracker.size;
  }

  /**
   * Count document versions in storage
   */
  private countDocumentVersions(): number {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith('document_version_') || key.startsWith('document_backup_'))
        .length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Report a memory leak
   */
  private reportLeak(leak: MemoryLeakReport): void {
    this.detectedLeaks.push(leak);
    
    // Keep only last 100 leaks
    if (this.detectedLeaks.length > 100) {
      this.detectedLeaks = this.detectedLeaks.slice(-100);
    }

    // Log critical leaks immediately
    if (leak.severity === 'critical') {
      console.error('Critical memory leak detected:', leak);
    } else if (leak.severity === 'high') {
      console.warn('High severity memory leak detected:', leak);
    }
  }

  /**
   * Start automatic leak detection
   */
  private startLeakDetection(): void {
    if (typeof window === 'undefined') return;

    // Run leak detection every 30 seconds
    setInterval(() => {
      this.auditAutoImprovementFeatures();
    }, 30000);

    // Run comprehensive audit every 5 minutes
    setInterval(() => {
      const fixResult = this.fixAutoImprovementLeaks();
      if (fixResult.fixed > 0 || fixResult.failed > 0) {
        console.log('Memory leak fix results:', fixResult);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Get all detected leaks
   */
  getDetectedLeaks(): MemoryLeakReport[] {
    return [...this.detectedLeaks];
  }

  /**
   * Clear detected leaks
   */
  clearDetectedLeaks(): void {
    this.detectedLeaks = [];
  }

  /**
   * Get memory leak summary
   */
  getLeakSummary(): {
    totalLeaks: number;
    criticalLeaks: number;
    highSeverityLeaks: number;
    recentLeaks: number;
    mostCommonLeakType: string;
  } {
    const now = Date.now();
    const recentThreshold = 10 * 60 * 1000; // 10 minutes

    const criticalLeaks = this.detectedLeaks.filter(leak => leak.severity === 'critical').length;
    const highSeverityLeaks = this.detectedLeaks.filter(leak => leak.severity === 'high').length;
    const recentLeaks = this.detectedLeaks.filter(leak => now - leak.detectedAt < recentThreshold).length;

    // Find most common leak type
    const leakTypeCounts = this.detectedLeaks.reduce((counts, leak) => {
      counts[leak.leakType] = (counts[leak.leakType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostCommonLeakType = Object.entries(leakTypeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

    return {
      totalLeaks: this.detectedLeaks.length,
      criticalLeaks,
      highSeverityLeaks,
      recentLeaks,
      mostCommonLeakType
    };
  }
}

export default MemoryLeakDetector;

/**
 * React hook for memory leak detection
 */
export function useMemoryLeakDetector() {
  const detector = MemoryLeakDetector.getInstance();

  return {
    trackAIOperation: (operationId: string, operation: string, cleanup?: () => void) =>
      detector.trackAIOperation(operationId, operation, cleanup),
    cleanupAIOperation: (operationId: string) => detector.cleanupAIOperation(operationId),
    auditAutoImprovementFeatures: () => detector.auditAutoImprovementFeatures(),
    fixAutoImprovementLeaks: () => detector.fixAutoImprovementLeaks(),
    getDetectedLeaks: () => detector.getDetectedLeaks(),
    clearDetectedLeaks: () => detector.clearDetectedLeaks(),
    getLeakSummary: () => detector.getLeakSummary()
  };
}