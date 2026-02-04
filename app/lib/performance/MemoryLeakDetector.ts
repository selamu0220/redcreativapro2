"use client";

export interface MemoryLeakAuditResult {
  activeOperations: number;
  pendingTimeouts: number;
  pendingIntervals: number;
  eventListeners: number;
  memoryUsage: number;
  recommendations: string[];
}

export interface MemoryLeakFixResult {
  fixed: number;
  details: string[];
  remaining: number;
}

export class MemoryLeakDetector {
  private activeOperations = new Map<string, { type: string; cleanup: () => void; timestamp: number }>();
  private timeoutIds = new Set<NodeJS.Timeout>();
  private intervalIds = new Set<NodeJS.Timeout>();
  private eventListeners = new Map<string, { element: EventTarget; event: string; handler: EventListener }>();

  // Track AI operations for memory leak detection
  trackAIOperation(operationId: string, operationType: string, cleanup: () => void): void {
    this.activeOperations.set(operationId, {
      type: operationType,
      cleanup,
      timestamp: Date.now()
    });

    // Auto-cleanup after 5 minutes to prevent memory leaks
    setTimeout(() => {
      if (this.activeOperations.has(operationId)) {
        console.warn(`Auto-cleaning up stale AI operation: ${operationId}`);
        this.cleanupAIOperation(operationId);
      }
    }, 300000); // 5 minutes
  }

  // Clean up specific AI operation
  cleanupAIOperation(operationId: string): boolean {
    const operation = this.activeOperations.get(operationId);
    if (operation) {
      try {
        operation.cleanup();
        this.activeOperations.delete(operationId);
        return true;
      } catch (error) {
        console.error(`Error cleaning up AI operation ${operationId}:`, error);
        this.activeOperations.delete(operationId); // Remove anyway to prevent accumulation
        return false;
      }
    }
    return false;
  }

  // Track timeouts
  trackTimeout(timeoutId: NodeJS.Timeout): void {
    this.timeoutIds.add(timeoutId);
  }

  // Track intervals
  trackInterval(intervalId: NodeJS.Timeout): void {
    this.intervalIds.add(intervalId);
  }

  // Track event listeners
  trackEventListener(id: string, element: EventTarget, event: string, handler: EventListener): void {
    this.eventListeners.set(id, { element, event, handler });
  }

  // Audit auto-improvement features for memory leaks
  auditAutoImprovementFeatures(): MemoryLeakAuditResult {
    const now = Date.now();
    const staleOperations = Array.from(this.activeOperations.entries())
      .filter(([_, op]) => now - op.timestamp > 300000); // 5 minutes

    const recommendations: string[] = [];

    if (staleOperations.length > 0) {
      recommendations.push(`${staleOperations.length} operaciones IA obsoletas detectadas`);
    }

    if (this.timeoutIds.size > 10) {
      recommendations.push(`${this.timeoutIds.size} timeouts activos (recomendado: <10)`);
    }

    if (this.intervalIds.size > 5) {
      recommendations.push(`${this.intervalIds.size} intervalos activos (recomendado: <5)`);
    }

    if (this.eventListeners.size > 20) {
      recommendations.push(`${this.eventListeners.size} event listeners activos (recomendado: <20)`);
    }

    const memoryUsage = this.getMemoryUsage();

    return {
      activeOperations: this.activeOperations.size,
      pendingTimeouts: this.timeoutIds.size,
      pendingIntervals: this.intervalIds.size,
      eventListeners: this.eventListeners.size,
      memoryUsage,
      recommendations
    };
  }

  // Fix auto-improvement memory leaks
  fixAutoImprovementLeaks(): MemoryLeakFixResult {
    const details: string[] = [];
    let fixed = 0;

    // Clean up stale AI operations
    const now = Date.now();
    const staleOperations = Array.from(this.activeOperations.entries())
      .filter(([_, op]) => now - op.timestamp > 300000); // 5 minutes

    staleOperations.forEach(([operationId, operation]) => {
      if (this.cleanupAIOperation(operationId)) {
        details.push(`Cleaned up stale AI operation: ${operation.type}`);
        fixed++;
      }
    });

    // Clean up excessive timeouts (keep only the most recent 10)
    if (this.timeoutIds.size > 10) {
      const timeoutsArray = Array.from(this.timeoutIds);
      const excessTimeouts = timeoutsArray.slice(0, timeoutsArray.length - 10);
      
      excessTimeouts.forEach(timeoutId => {
        try {
          clearTimeout(timeoutId);
          this.timeoutIds.delete(timeoutId);
          fixed++;
        } catch (error) {
          console.error('Error clearing timeout:', error);
        }
      });

      if (excessTimeouts.length > 0) {
        details.push(`Cleared ${excessTimeouts.length} excess timeouts`);
      }
    }

    // Clean up excessive intervals (keep only the most recent 3)
    if (this.intervalIds.size > 3) {
      const intervalsArray = Array.from(this.intervalIds);
      const excessIntervals = intervalsArray.slice(0, intervalsArray.length - 3);
      
      excessIntervals.forEach(intervalId => {
        try {
          clearInterval(intervalId);
          this.intervalIds.delete(intervalId);
          fixed++;
        } catch (error) {
          console.error('Error clearing interval:', error);
        }
      });

      if (excessIntervals.length > 0) {
        details.push(`Cleared ${excessIntervals.length} excess intervals`);
      }
    }

    return {
      fixed,
      details,
      remaining: this.activeOperations.size + this.timeoutIds.size + this.intervalIds.size
    };
  }

  // Get current memory usage
  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      return memory.usedJSHeapSize / memory.totalJSHeapSize;
    }
    return 0;
  }

  // Clear all detected leaks
  clearDetectedLeaks(): void {
    // Clean up all active operations
    this.activeOperations.forEach((operation, operationId) => {
      try {
        operation.cleanup();
      } catch (error) {
        console.error(`Error cleaning up operation ${operationId}:`, error);
      }
    });
    this.activeOperations.clear();

    // Clear all timeouts
    this.timeoutIds.forEach(timeoutId => {
      try {
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error clearing timeout:', error);
      }
    });
    this.timeoutIds.clear();

    // Clear all intervals
    this.intervalIds.forEach(intervalId => {
      try {
        clearInterval(intervalId);
      } catch (error) {
        console.error('Error clearing interval:', error);
      }
    });
    this.intervalIds.clear();

    // Remove all event listeners
    this.eventListeners.forEach((listener, id) => {
      try {
        listener.element.removeEventListener(listener.event, listener.handler);
      } catch (error) {
        console.error(`Error removing event listener ${id}:`, error);
      }
    });
    this.eventListeners.clear();
  }

  // Get memory leak statistics
  getStatistics() {
    return {
      activeOperations: this.activeOperations.size,
      pendingTimeouts: this.timeoutIds.size,
      pendingIntervals: this.intervalIds.size,
      eventListeners: this.eventListeners.size,
      memoryUsage: this.getMemoryUsage()
    };
  }
}

// Hook for using memory leak detector
export function useMemoryLeakDetector() {
  const detector = React.useMemo(() => new MemoryLeakDetector(), []);

  React.useEffect(() => {
    return () => {
      detector.clearDetectedLeaks();
    };
  }, [detector]);

  return detector;
}

// Export for React import
import React from 'react';
