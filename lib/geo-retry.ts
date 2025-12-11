/**
 * Retry Mechanisms for GEO Optimization Operations
 * 
 * Provides robust retry logic for failed API calls and analysis operations
 */

import { geoLogger } from './geo-logger';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
  retryCondition: (error: Error) => {
    // Retry on network errors, timeouts, and server errors
    return error.name === 'NetworkError' ||
           error.name === 'TimeoutError' ||
           error.message.includes('fetch') ||
           error.message.includes('timeout') ||
           error.message.includes('500') ||
           error.message.includes('502') ||
           error.message.includes('503') ||
           error.message.includes('504');
  }
};

export class GEORetryManager {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute an operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const finalConfig = { ...this.config, ...config };
    const startTime = Date.now();
    let lastError: Error | null = null;

    geoLogger.info('RetryManager', 'executeWithRetry', `Starting operation: ${operationName}`, {
      maxAttempts: finalConfig.maxAttempts,
      baseDelay: finalConfig.baseDelay
    });

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        const totalDuration = Date.now() - startTime;
        geoLogger.info('RetryManager', 'executeWithRetry', `Operation succeeded: ${operationName}`, {
          attempt,
          totalDuration: `${totalDuration}ms`
        });

        return result;
      } catch (error) {
        lastError = error as Error;
        
        geoLogger.warn('RetryManager', 'executeWithRetry', `Attempt ${attempt} failed: ${operationName}`, {
          attempt,
          error: lastError.message,
          willRetry: attempt < finalConfig.maxAttempts && this.shouldRetry(lastError, finalConfig)
        });

        // Check if we should retry
        if (attempt >= finalConfig.maxAttempts || !this.shouldRetry(lastError, finalConfig)) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, finalConfig);
        
        geoLogger.debug('RetryManager', 'executeWithRetry', `Waiting ${delay}ms before retry`, {
          attempt,
          delay,
          operationName
        });

        await this.sleep(delay);
      }
    }

    const totalDuration = Date.now() - startTime;
    geoLogger.error('RetryManager', 'executeWithRetry', `Operation failed after all retries: ${operationName}`, lastError!, {
      totalAttempts: finalConfig.maxAttempts,
      totalDuration: `${totalDuration}ms`
    });

    throw lastError;
  }

  /**
   * Execute multiple operations with retry logic in parallel
   */
  async executeAllWithRetry<T>(
    operations: Array<{ fn: () => Promise<T>; name: string }>,
    config?: Partial<RetryConfig>
  ): Promise<Array<RetryResult<T>>> {
    const promises = operations.map(async ({ fn, name }) => {
      const startTime = Date.now();
      let attempts = 0;

      try {
        const result = await this.executeWithRetry(fn, name, config);
        attempts = 1; // If successful on first try
        
        return {
          success: true,
          result,
          attempts,
          totalDuration: Date.now() - startTime
        };
      } catch (error) {
        attempts = config?.maxAttempts || this.config.maxAttempts;
        
        return {
          success: false,
          error: error as Error,
          attempts,
          totalDuration: Date.now() - startTime
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * Execute operations with circuit breaker pattern
   */
  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    operationName: string,
    circuitConfig: {
      failureThreshold: number;
      resetTimeout: number;
      monitoringPeriod: number;
    } = {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitoringPeriod: 300000
    }
  ): Promise<T> {
    const circuitKey = `circuit-${operationName}`;
    const now = Date.now();
    
    // Get circuit state from storage
    const circuitState = this.getCircuitState(circuitKey);
    
    // Check if circuit is open
    if (circuitState.state === 'open') {
      if (now - circuitState.lastFailureTime < circuitConfig.resetTimeout) {
        const error = new Error(`Circuit breaker is open for ${operationName}`);
        geoLogger.warn('RetryManager', 'executeWithCircuitBreaker', 'Circuit breaker is open', {
          operationName,
          lastFailureTime: circuitState.lastFailureTime,
          resetTimeout: circuitConfig.resetTimeout
        });
        throw error;
      } else {
        // Try to close circuit (half-open state)
        circuitState.state = 'half-open';
        this.saveCircuitState(circuitKey, circuitState);
      }
    }

    try {
      const result = await this.executeWithRetry(operation, operationName);
      
      // Success - reset circuit
      this.saveCircuitState(circuitKey, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: 0,
        lastSuccessTime: now
      });

      return result;
    } catch (error) {
      // Failure - update circuit state
      circuitState.failureCount++;
      circuitState.lastFailureTime = now;
      
      if (circuitState.failureCount >= circuitConfig.failureThreshold) {
        circuitState.state = 'open';
        geoLogger.error('RetryManager', 'executeWithCircuitBreaker', 'Circuit breaker opened', error as Error, {
          operationName,
          failureCount: circuitState.failureCount,
          threshold: circuitConfig.failureThreshold
        });
      }
      
      this.saveCircuitState(circuitKey, circuitState);
      throw error;
    }
  }

  private shouldRetry(error: Error, config: RetryConfig): boolean {
    if (config.retryCondition) {
      return config.retryCondition(error);
    }
    return true;
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, config.maxDelay);
    
    if (config.jitter) {
      // Add random jitter (±25%)
      const jitterRange = delay * 0.25;
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }
    
    return Math.max(delay, 0);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getCircuitState(key: string): {
    state: 'closed' | 'open' | 'half-open';
    failureCount: number;
    lastFailureTime: number;
    lastSuccessTime: number;
  } {
    if (typeof window === 'undefined') {
      return { state: 'closed', failureCount: 0, lastFailureTime: 0, lastSuccessTime: 0 };
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      geoLogger.warn('RetryManager', 'getCircuitState', 'Failed to load circuit state', { key, error });
    }

    return { state: 'closed', failureCount: 0, lastFailureTime: 0, lastSuccessTime: 0 };
  }

  private saveCircuitState(key: string, state: any): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      geoLogger.warn('RetryManager', 'saveCircuitState', 'Failed to save circuit state', { key, error });
    }
  }
}

// Global retry manager instance
export const geoRetryManager = new GEORetryManager();

/**
 * Decorator for adding retry logic to methods
 */
export function withRetry(config?: Partial<RetryConfig>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const operationName = `${target.constructor.name}.${propertyKey}`;
      return geoRetryManager.executeWithRetry(
        () => originalMethod.apply(this, args),
        operationName,
        config
      );
    };

    return descriptor;
  };
}

/**
 * Utility functions for common retry scenarios
 */
export const retryUtils = {
  /**
   * Retry for API calls
   */
  async apiCall<T>(
    apiFunction: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return geoRetryManager.executeWithRetry(
      apiFunction,
      operationName,
      {
        maxAttempts: 3,
        baseDelay: 1000,
        retryCondition: (error) => {
          // Retry on network errors and 5xx status codes
          return error.message.includes('fetch') ||
                 error.message.includes('network') ||
                 error.message.includes('5');
        }
      }
    );
  },

  /**
   * Retry for analysis operations
   */
  async analysisOperation<T>(
    analysisFunction: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return geoRetryManager.executeWithRetry(
      analysisFunction,
      operationName,
      {
        maxAttempts: 2,
        baseDelay: 500,
        retryCondition: (error) => {
          // Retry on temporary analysis failures
          return !error.message.includes('invalid input') &&
                 !error.message.includes('malformed');
        }
      }
    );
  },

  /**
   * Retry for storage operations
   */
  async storageOperation<T>(
    storageFunction: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return geoRetryManager.executeWithRetry(
      storageFunction,
      operationName,
      {
        maxAttempts: 2,
        baseDelay: 200,
        retryCondition: (error) => {
          // Retry on storage quota or temporary failures
          return error.message.includes('quota') ||
                 error.message.includes('storage') ||
                 error.message.includes('temporary');
        }
      }
    );
  }
};