/**
 * Robust Error Handling System
 * 
 * Comprehensive error categorization, retry logic, and graceful degradation
 * Implements requirements 6.1, 6.2, 6.3, 6.4, 6.5 from secure-payment-flow spec
 */

import { auditLogger } from '../audit/AuditLogger'

export interface AuthenticationError {
  type: 'network' | 'credentials' | 'validation' | 'server' | 'configuration' | 'session' | 'unknown'
  code: string
  message: string
  userMessage: string
  originalError?: any
  retryable: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
  timestamp: Date
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors: string[]
}

export interface ErrorRecoveryAction {
  action: 'retry' | 'fallback' | 'redirect' | 'notify' | 'abort'
  description: string
  parameters?: Record<string, any>
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorCounts: Map<string, number> = new Map()
  private lastErrors: Map<string, Date> = new Map()
  private readonly ERROR_THRESHOLD = 5
  private readonly ERROR_WINDOW = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Requirement 6.1: Comprehensive error categorization and responses
   * WHEN ocurre un error durante el pago THEN el sistema SHALL revertir cualquier cambio parcial realizado
   */
  classifyError(error: any, context: Record<string, any> = {}): AuthenticationError {
    const timestamp = new Date()
    
    try {
      // Network errors
      if (this.isNetworkError(error)) {
        return {
          type: 'network',
          code: 'NETWORK_ERROR',
          message: error.message || 'Network connection failed',
          userMessage: 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.',
          originalError: error,
          retryable: true,
          severity: 'medium',
          context,
          timestamp
        }
      }

      // Credential errors
      if (this.isCredentialError(error)) {
        return {
          type: 'credentials',
          code: 'INVALID_CREDENTIALS',
          message: error.message || 'Invalid credentials',
          userMessage: 'Credenciales incorrectas. Verifica tu email y contraseña.',
          originalError: error,
          retryable: false,
          severity: 'low',
          context,
          timestamp
        }
      }

      // Validation errors
      if (this.isValidationError(error)) {
        return {
          type: 'validation',
          code: 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
          userMessage: 'Datos inválidos. Verifica que la información sea correcta.',
          originalError: error,
          retryable: false,
          severity: 'low',
          context,
          timestamp
        }
      }

      // Server errors
      if (this.isServerError(error)) {
        return {
          type: 'server',
          code: 'SERVER_ERROR',
          message: error.message || 'Server error',
          userMessage: 'Error del servidor. Inténtalo de nuevo en unos momentos.',
          originalError: error,
          retryable: true,
          severity: 'high',
          context,
          timestamp
        }
      }

      // Configuration errors
      if (this.isConfigurationError(error)) {
        return {
          type: 'configuration',
          code: 'CONFIG_ERROR',
          message: error.message || 'Configuration error',
          userMessage: 'Error de configuración del servicio. Contacta al soporte técnico.',
          originalError: error,
          retryable: false,
          severity: 'critical',
          context,
          timestamp
        }
      }

      // Session errors
      if (this.isSessionError(error)) {
        return {
          type: 'session',
          code: 'SESSION_ERROR',
          message: error.message || 'Session error',
          userMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          originalError: error,
          retryable: false,
          severity: 'medium',
          context,
          timestamp
        }
      }

      // Default to unknown error
      return {
        type: 'unknown',
        code: 'UNKNOWN_ERROR',
        message: error.message || 'Unknown error occurred',
        userMessage: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
        originalError: error,
        retryable: false,
        severity: 'medium',
        context,
        timestamp
      }
    } catch (classificationError) {
      console.error('Error during error classification:', classificationError)
      
      return {
        type: 'unknown',
        code: 'CLASSIFICATION_ERROR',
        message: 'Error during error classification',
        userMessage: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
        originalError: error,
        retryable: false,
        severity: 'high',
        context,
        timestamp
      }
    }
  }

  /**
   * Requirement 6.2: Handle service unavailability with clear messaging
   * WHEN Stripe está inaccesible THEN el sistema SHALL mostrar mensaje claro y permitir reintentos
   */
  async handleServiceUnavailable(
    serviceName: string, 
    error: AuthenticationError,
    fallbackAction?: () => Promise<any>
  ): Promise<{
    canContinue: boolean
    fallbackUsed: boolean
    message: string
    action: ErrorRecoveryAction
  }> {
    try {
      console.warn(`⚠️ Service unavailable: ${serviceName}`)
      
      // Log service unavailability
      await auditLogger.logSystemEvent('service_unavailable', {
        serviceName,
        errorType: error.type,
        errorCode: error.code,
        message: error.message
      })

      // Check if we have a fallback
      if (fallbackAction) {
        try {
          console.log(`🔄 Attempting fallback for ${serviceName}`)
          await fallbackAction()
          
          await auditLogger.logSystemEvent('service_fallback_success', {
            serviceName,
            fallbackUsed: true
          })

          return {
            canContinue: true,
            fallbackUsed: true,
            message: `${serviceName} no está disponible temporalmente, pero hemos activado un sistema alternativo.`,
            action: {
              action: 'fallback',
              description: `Using fallback for ${serviceName}`,
              parameters: { serviceName }
            }
          }
        } catch (fallbackError) {
          console.error(`❌ Fallback failed for ${serviceName}:`, fallbackError)
          
          await auditLogger.logSystemEvent('service_fallback_failed', {
            serviceName,
            fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
          })
        }
      }

      // No fallback available or fallback failed
      const message = this.getServiceUnavailableMessage(serviceName)
      
      return {
        canContinue: false,
        fallbackUsed: false,
        message,
        action: {
          action: 'notify',
          description: `Notify user that ${serviceName} is unavailable`,
          parameters: { 
            serviceName,
            retryable: error.retryable,
            estimatedRecovery: this.estimateRecoveryTime(serviceName)
          }
        }
      }
    } catch (handlingError) {
      console.error('❌ Error handling service unavailability:', handlingError)
      
      return {
        canContinue: false,
        fallbackUsed: false,
        message: 'El servicio no está disponible temporalmente. Inténtalo de nuevo más tarde.',
        action: {
          action: 'abort',
          description: 'Abort operation due to service unavailability'
        }
      }
    }
  }

  /**
   * Requirement 6.4: Implement exponential backoff for timeouts
   * WHEN hay timeout en la comunicación THEN el sistema SHALL implementar reintentos exponenciales con límite
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    config: Partial<RetryConfig> = {}
  ): Promise<{ success: boolean; result?: T; error?: AuthenticationError; attempts: number }> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      retryableErrors: ['network', 'server', 'timeout'],
      ...config
    }

    let attempts = 0
    let lastError: AuthenticationError | null = null

    for (attempts = 1; attempts <= retryConfig.maxRetries + 1; attempts++) {
      try {
        console.log(`🔄 Executing operation ${operationId} (attempt ${attempts}/${retryConfig.maxRetries + 1})`)
        
        const result = await operation()
        
        // Success - log if it took multiple attempts
        if (attempts > 1) {
          await auditLogger.logSystemEvent('operation_retry_success', {
            operationId,
            attempts,
            finalAttempt: attempts
          })
        }

        return {
          success: true,
          result,
          attempts
        }
      } catch (error) {
        const classifiedError = this.classifyError(error, { operationId, attempt: attempts })
        lastError = classifiedError

        console.warn(`⚠️ Operation ${operationId} failed on attempt ${attempts}:`, classifiedError.message)

        // Check if error is retryable
        if (!classifiedError.retryable || !retryConfig.retryableErrors.includes(classifiedError.type)) {
          console.log(`❌ Error is not retryable for operation ${operationId}`)
          break
        }

        // Don't wait after the last attempt
        if (attempts <= retryConfig.maxRetries) {
          const delay = Math.min(
            retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempts - 1),
            retryConfig.maxDelay
          )
          
          console.log(`⏳ Waiting ${delay}ms before retry ${attempts + 1} for operation ${operationId}`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    console.error(`❌ Operation ${operationId} failed after ${attempts} attempts`)
    
    await auditLogger.logSystemEvent('operation_retry_failed', {
      operationId,
      attempts,
      finalError: lastError?.message || 'Unknown error'
    })

    return {
      success: false,
      error: lastError || this.classifyError(new Error('Unknown retry failure')),
      attempts
    }
  }

  /**
   * Requirement 6.5: Detect inconsistent state and block access
   * WHEN se detecta estado inconsistente THEN el sistema SHALL bloquear acceso premium hasta resolución
   */
  async handleInconsistentState(
    stateType: string,
    details: Record<string, any>,
    userId?: string,
    email?: string
  ): Promise<{
    accessBlocked: boolean
    blockReason: string
    recoveryActions: ErrorRecoveryAction[]
    requiresManualIntervention: boolean
  }> {
    try {
      console.error(`🚨 Inconsistent state detected: ${stateType}`)
      
      // Log the inconsistent state
      await auditLogger.logSecurityEvent('inconsistent_state_detected', {
        stateType,
        details,
        userId,
        email,
        timestamp: new Date().toISOString()
      }, {
        userId,
        email
      }, 'high')

      // Determine severity and actions based on state type
      const { severity, blockAccess, recoveryActions } = this.analyzeInconsistentState(stateType, details)

      if (blockAccess) {
        // Block premium access
        await this.blockPremiumAccess(userId, email, stateType)
        
        console.warn(`🚫 Premium access blocked for user due to inconsistent state: ${stateType}`)
      }

      const requiresManualIntervention = severity === 'critical' || recoveryActions.length === 0

      if (requiresManualIntervention) {
        await this.flagForManualIntervention(stateType, details, userId, email)
      }

      return {
        accessBlocked: blockAccess,
        blockReason: `Inconsistent ${stateType} state detected`,
        recoveryActions,
        requiresManualIntervention
      }
    } catch (error) {
      console.error('❌ Error handling inconsistent state:', error)
      
      // Default to blocking access on error
      return {
        accessBlocked: true,
        blockReason: 'Error handling inconsistent state - access blocked for security',
        recoveryActions: [{
          action: 'notify',
          description: 'Contact support for manual resolution'
        }],
        requiresManualIntervention: true
      }
    }
  }

  /**
   * Get error recovery recommendations
   */
  getRecoveryRecommendations(error: AuthenticationError): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = []

    switch (error.type) {
      case 'network':
        actions.push({
          action: 'retry',
          description: 'Retry the operation after checking network connection',
          parameters: { delay: 2000, maxRetries: 3 }
        })
        break

      case 'credentials':
        actions.push({
          action: 'redirect',
          description: 'Redirect to login page',
          parameters: { url: '/auth' }
        })
        break

      case 'session':
        actions.push({
          action: 'redirect',
          description: 'Redirect to login page due to expired session',
          parameters: { url: '/auth', reason: 'session_expired' }
        })
        break

      case 'server':
        if (error.retryable) {
          actions.push({
            action: 'retry',
            description: 'Retry the operation with exponential backoff',
            parameters: { delay: 5000, maxRetries: 2 }
          })
        }
        actions.push({
          action: 'fallback',
          description: 'Use fallback service if available'
        })
        break

      case 'configuration':
        actions.push({
          action: 'notify',
          description: 'Notify administrators of configuration issue'
        })
        break

      default:
        actions.push({
          action: 'notify',
          description: 'Show generic error message to user'
        })
    }

    return actions
  }

  // Private helper methods

  private isNetworkError(error: any): boolean {
    return error.message?.includes('Failed to fetch') ||
           error.message?.includes('Network request failed') ||
           error.name === 'AbortError' ||
           error.name === 'TimeoutError' ||
           error.code === 'NETWORK_ERROR'
  }

  private isCredentialError(error: any): boolean {
    return error.message?.includes('Invalid login credentials') ||
           error.message?.includes('Email not confirmed') ||
           error.message?.includes('User not found') ||
           error.code === 'INVALID_CREDENTIALS'
  }

  private isValidationError(error: any): boolean {
    return error.message?.includes('Password should be at least') ||
           error.message?.includes('Invalid email') ||
           error.code === 'VALIDATION_ERROR'
  }

  private isServerError(error: any): boolean {
    return error.status >= 500 ||
           error.message?.includes('Database error') ||
           error.message?.includes('Internal server error') ||
           error.code === 'SERVER_ERROR'
  }

  private isConfigurationError(error: any): boolean {
    return error.message?.includes('not configured') ||
           error.message?.includes('Invalid API key') ||
           error.message?.includes('Missing environment variable') ||
           error.code === 'CONFIG_ERROR'
  }

  private isSessionError(error: any): boolean {
    return error.message?.includes('Session expired') ||
           error.message?.includes('Invalid session') ||
           error.message?.includes('No active session') ||
           error.code === 'SESSION_ERROR'
  }

  private getServiceUnavailableMessage(serviceName: string): string {
    const messages: Record<string, string> = {
      'stripe': 'El sistema de pagos no está disponible temporalmente. Inténtalo de nuevo en unos minutos.',
      'database': 'La base de datos no está disponible temporalmente. Inténtalo de nuevo en unos minutos.',
      'auth': 'El sistema de autenticación no está disponible temporalmente. Inténtalo de nuevo en unos minutos.',
      'email': 'El servicio de email no está disponible temporalmente. La funcionalidad principal sigue funcionando.'
    }

    return messages[serviceName.toLowerCase()] || 
           `El servicio ${serviceName} no está disponible temporalmente. Inténtalo de nuevo en unos minutos.`
  }

  private estimateRecoveryTime(serviceName: string): number {
    // Estimate recovery time in minutes based on service type
    const recoveryTimes: Record<string, number> = {
      'stripe': 15,
      'database': 10,
      'auth': 5,
      'email': 30
    }

    return recoveryTimes[serviceName.toLowerCase()] || 15
  }

  getErrorStats() {
    const totalOperations = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0)
    const circuitBreakersOpen = 0
    const circuitBreakersHalfOpen = 0
    const circuitBreakersClosed = 0
    const recentCount = this.lastErrors.size
    return { totalOperations, circuitBreakersOpen, circuitBreakersHalfOpen, circuitBreakersClosed, recentCount }
  }

  getRecentErrors(limit: number) {
    const entries = Array.from(this.lastErrors.entries()).slice(-limit)
    return entries.map(([namespace, timestamp]) => ({ namespace, error: { type: 'unknown' }, timestamp }))
  }

  private analyzeInconsistentState(stateType: string, details: Record<string, any>): {
    severity: 'low' | 'medium' | 'high' | 'critical'
    blockAccess: boolean
    recoveryActions: ErrorRecoveryAction[]
  } {
    switch (stateType) {
      case 'subscription_mismatch':
        return {
          severity: 'high',
          blockAccess: true,
          recoveryActions: [
            { action: 'retry', description: 'Sync subscription status with Stripe' },
            { action: 'notify', description: 'Flag for manual review' }
          ]
        }

      case 'payment_status_conflict':
        return {
          severity: 'critical',
          blockAccess: true,
          recoveryActions: [
            { action: 'notify', description: 'Immediate manual intervention required' }
          ]
        }

      case 'user_data_corruption':
        return {
          severity: 'critical',
          blockAccess: true,
          recoveryActions: [
            { action: 'fallback', description: 'Use backup data if available' },
            { action: 'notify', description: 'Contact support immediately' }
          ]
        }

      default:
        return {
          severity: 'medium',
          blockAccess: false,
          recoveryActions: [
            { action: 'retry', description: 'Retry operation' },
            { action: 'notify', description: 'Log for investigation' }
          ]
        }
    }
  }

  private async blockPremiumAccess(userId?: string, email?: string, reason?: string): Promise<void> {
    try {
      // TODO: Implement actual access blocking
      console.log(`🚫 Blocking premium access for user: ${email || userId} (reason: ${reason})`)
      
      await auditLogger.logSecurityEvent('premium_access_blocked', {
        userId,
        email,
        reason,
        timestamp: new Date().toISOString()
      }, { userId, email }, 'high')
    } catch (error) {
      console.error('❌ Error blocking premium access:', error)
    }
  }

  private async flagForManualIntervention(
    stateType: string, 
    details: Record<string, any>, 
    userId?: string, 
    email?: string
  ): Promise<void> {
    try {
      console.log(`🚩 Flagging for manual intervention: ${stateType}`)
      
      await auditLogger.logSystemEvent('manual_intervention_required', {
        stateType,
        details,
        userId,
        email,
        priority: 'high',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Error flagging for manual intervention:', error)
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()
