/**
 * Retry Manager
 * 
 * Handles retry logic with exponential backoff and circuit breaker pattern
 * Implements requirements 6.2, 6.4 from secure-payment-flow spec
 */

import { errorHandler, type AuthenticationError } from './ErrorHandler'
import { auditLogger } from '../audit/AuditLogger'

export interface RetryResult<T> {
  success: boolean
  result?: T
  error?: AuthenticationError
  attempts: number
  totalTime: number
  circuitBreakerTripped?: boolean
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open'
  failureCount: number
  lastFailureTime: Date | null
  nextAttemptTime: Date | null
}

export class RetryManager {
  private static instance: RetryManager
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map()
  private readonly FAILURE_THRESHOLD = 5
  private readonly RECOVERY_TIMEOUT = 60000 // 1 minute
  private readonly HALF_OPEN_MAX_CALLS = 3

  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager()
    }
    return RetryManager.instance
  }

  /**
   * Execute operation with retry logic and circuit breaker
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    config: {
      maxRetries?: number
      baseDelay?: number
      maxDelay?: number
      backoffMultiplier?: number
      retryableErrors?: string[]
      useCircuitBreaker?: boolean
    } = {}
  ): Promise<RetryResult<T>> {
    const startTime = Date.now()
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
      retryableErrors = ['network', 'server', 'timeout'],
      useCircuitBreaker = true
    } = config

    // Check circuit breaker
    if (useCircuitBreaker && this.isCircuitBreakerOpen(operationId)) {
      const circuitState = this.circuitBreakers.get(operationId)!
      
      await auditLogger.logSystemEvent('circuit_breaker_blocked', {
        operationId,
        state: circuitState.state,
        failureCount: circuitState.failureCount
      })

      return {
        success: false,
        error: errorHandler.classifyError(new Error('Circuit breaker is open')),
        attempts: 0,
        totalTime: Date.now() - startTime,
        circuitBreakerTripped: true
      }
    }

    let attempts = 0
    let lastError: AuthenticationError | null = null

    for (attempts = 1; attempts <= maxRetries + 1; attempts++) {
      try {
        console.log(`🔄 Executing ${operationId} (attempt ${attempts}/${maxRetries + 1})`)
        
        const result = await operation()
        
        // Success - reset circuit breaker
        if (useCircuitBreaker) {
          this.recordSuccess(operationId)
        }

        // Log successful retry if it took multiple attempts
        if (attempts > 1) {
          await auditLogger.logSystemEvent('retry_success', {
            operationId,
            attempts,
            totalTimeMs: Date.now() - startTime
          })
        }

        return {
          success: true,
          result,
          attempts,
          totalTime: Date.now() - startTime
        }
      } catch (error) {
        const classifiedError = errorHandler.classifyError(error, { 
          operationId, 
          attempt: attempts 
        })
        lastError = classifiedError

        console.warn(`⚠️ ${operationId} failed on attempt ${attempts}:`, classifiedError.message)

        // Record failure for circuit breaker
        if (useCircuitBreaker) {
          this.recordFailure(operationId)
        }

        // Check if error is retryable
        if (!classifiedError.retryable || !retryableErrors.includes(classifiedError.type)) {
          console.log(`❌ Error is not retryable for ${operationId}`)
          break
        }

        // Check if circuit breaker opened during this attempt
        if (useCircuitBreaker && this.isCircuitBreakerOpen(operationId)) {
          console.log(`🔌 Circuit breaker opened for ${operationId}`)
          break
        }

        // Don't wait after the last attempt
        if (attempts <= maxRetries) {
          const delay = Math.min(
            baseDelay * Math.pow(backoffMultiplier, attempts - 1),
            maxDelay
          )
          
          console.log(`⏳ Waiting ${delay}ms before retry ${attempts + 1} for ${operationId}`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    const totalTime = Date.now() - startTime
    console.error(`❌ ${operationId} failed after ${attempts} attempts (${totalTime}ms)`)
    
    await auditLogger.logSystemEvent('retry_exhausted', {
      operationId,
      attempts,
      totalTimeMs: totalTime,
      finalError: lastError?.message || 'Unknown error',
      circuitBreakerOpen: useCircuitBreaker && this.isCircuitBreakerOpen(operationId)
    })

    return {
      success: false,
      error: lastError || errorHandler.classifyError(new Error('Unknown retry failure')),
      attempts,
      totalTime,
      circuitBreakerTripped: useCircuitBreaker && this.isCircuitBreakerOpen(operationId)
    }
  }

  /**
   * Execute with timeout
   */
  async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    operationId: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        const timeoutError = new Error(`Operation ${operationId} timed out after ${timeoutMs}ms`)
        timeoutError.name = 'TimeoutError'
        reject(timeoutError)
      }, timeoutMs)

      operation()
        .then(result => {
          clearTimeout(timeoutHandle)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeoutHandle)
          reject(error)
        })
    })
  }

  /**
   * Execute with both retry and timeout
   */
  async executeWithRetryAndTimeout<T>(
    operation: () => Promise<T>,
    operationId: string,
    config: {
      timeoutMs?: number
      maxRetries?: number
      baseDelay?: number
      maxDelay?: number
      backoffMultiplier?: number
      retryableErrors?: string[]
      useCircuitBreaker?: boolean
    } = {}
  ): Promise<RetryResult<T>> {
    const { timeoutMs = 30000, ...retryConfig } = config

    const wrappedOperation = () => this.executeWithTimeout(operation, timeoutMs, operationId)
    
    return this.executeWithRetry(wrappedOperation, operationId, retryConfig)
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(operationId: string): CircuitBreakerState {
    return this.circuitBreakers.get(operationId) || {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null
    }
  }

  /**
   * Manually reset circuit breaker
   */
  resetCircuitBreaker(operationId: string): void {
    console.log(`🔄 Manually resetting circuit breaker for: ${operationId}`)
    
    this.circuitBreakers.set(operationId, {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null
    })

    auditLogger.logSystemEvent('circuit_breaker_reset', {
      operationId,
      resetType: 'manual'
    })
  }

  /**
   * Get retry statistics
   */
  getRetryStats(): {
    totalOperations: number
    circuitBreakersOpen: number
    circuitBreakersHalfOpen: number
    circuitBreakersClosed: number
    activeRetries: number
  } {
    const states = Array.from(this.circuitBreakers.values())
    
    const openCount = states.filter(s => s.state === 'open').length
    const halfOpenCount = states.filter(s => s.state === 'half-open').length
    return {
      totalOperations: this.circuitBreakers.size,
      circuitBreakersOpen: openCount,
      circuitBreakersHalfOpen: halfOpenCount,
      circuitBreakersClosed: states.filter(s => s.state === 'closed').length,
      activeRetries: openCount + halfOpenCount
    }
  }

  // Private helper methods

  private isCircuitBreakerOpen(operationId: string): boolean {
    const state = this.circuitBreakers.get(operationId)
    
    if (!state) {
      return false
    }

    const now = new Date()

    switch (state.state) {
      case 'closed':
        return false
      
      case 'open':
        // Check if recovery timeout has passed
        if (state.nextAttemptTime && now >= state.nextAttemptTime) {
          // Transition to half-open
          state.state = 'half-open'
          state.nextAttemptTime = null
          console.log(`🔌 Circuit breaker transitioning to half-open: ${operationId}`)
          return false
        }
        return true
      
      case 'half-open':
        return false
      
      default:
        return false
    }
  }

  private recordSuccess(operationId: string): void {
    const state = this.circuitBreakers.get(operationId)
    
    if (!state) {
      // Initialize with closed state
      this.circuitBreakers.set(operationId, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null
      })
      return
    }

    // Reset failure count and close circuit breaker
    state.failureCount = 0
    state.lastFailureTime = null
    state.nextAttemptTime = null
    
    if (state.state !== 'closed') {
      console.log(`✅ Circuit breaker closed due to success: ${operationId}`)
      state.state = 'closed'
      
      auditLogger.logSystemEvent('circuit_breaker_closed', {
        operationId,
        reason: 'success'
      })
    }
  }

  private recordFailure(operationId: string): void {
    const now = new Date()
    let state = this.circuitBreakers.get(operationId)
    
    if (!state) {
      state = {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null
      }
      this.circuitBreakers.set(operationId, state)
    }

    state.failureCount++
    state.lastFailureTime = now

    // Check if we should open the circuit breaker
    if (state.state === 'closed' && state.failureCount >= this.FAILURE_THRESHOLD) {
      state.state = 'open'
      state.nextAttemptTime = new Date(now.getTime() + this.RECOVERY_TIMEOUT)
      
      console.warn(`🔌 Circuit breaker opened due to failures: ${operationId} (${state.failureCount} failures)`)
      
      auditLogger.logSystemEvent('circuit_breaker_opened', {
        operationId,
        failureCount: state.failureCount,
        recoveryTimeoutMs: this.RECOVERY_TIMEOUT
      })
    } else if (state.state === 'half-open') {
      // Failed in half-open state, go back to open
      state.state = 'open'
      state.nextAttemptTime = new Date(now.getTime() + this.RECOVERY_TIMEOUT)
      
      console.warn(`🔌 Circuit breaker reopened from half-open: ${operationId}`)
      
      auditLogger.logSystemEvent('circuit_breaker_reopened', {
        operationId,
        previousState: 'half-open'
      })
    }
  }

  /**
   * Cleanup expired circuit breaker states
   */
  cleanupExpiredStates(): void {
    const now = new Date()
    let cleanedCount = 0

    for (const [operationId, state] of this.circuitBreakers.entries()) {
      // Clean up old closed states with no recent activity
      if (state.state === 'closed' && 
          state.lastFailureTime && 
          now.getTime() - state.lastFailureTime.getTime() > 24 * 60 * 60 * 1000) { // 24 hours
        this.circuitBreakers.delete(operationId)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🗑️ Cleaned up ${cleanedCount} expired circuit breaker states`)
    }
  }

  /**
   * Cleanup method
   */
  cleanup(): void {
    this.circuitBreakers.clear()
    console.log('✅ Retry manager cleanup completed')
  }
}

// Export singleton instance
export const retryManager = RetryManager.getInstance()
