'use client'

import { supabaseClient } from '../supabase-client'
import { errorHandler } from './ErrorHandler'
import { sessionManager } from './SessionManager'
import { retryManager } from './RetryManager'

export interface DiagnosticResult {
  component: string
  status: 'healthy' | 'warning' | 'error'
  message: string
  details?: any
  timestamp: Date
}

export interface SystemDiagnostics {
  overall: 'healthy' | 'warning' | 'error'
  results: DiagnosticResult[]
  summary: {
    healthy: number
    warnings: number
    errors: number
  }
  timestamp: Date
}

export interface HealthCheckOptions {
  includeNetworkTest: boolean
  includeSessionValidation: boolean
  includeConfigurationCheck: boolean
  timeoutMs: number
}

export class DiagnosticService {
  private static instance: DiagnosticService
  private lastDiagnostics: SystemDiagnostics | null = null
  private healthCheckInterval: NodeJS.Timeout | null = null

  static getInstance(): DiagnosticService {
    if (!DiagnosticService.instance) {
      DiagnosticService.instance = new DiagnosticService()
    }
    return DiagnosticService.instance
  }

  /**
   * Run comprehensive system diagnostics
   */
  async runDiagnostics(options: Partial<HealthCheckOptions> = {}): Promise<SystemDiagnostics> {
    const fullOptions: HealthCheckOptions = {
      includeNetworkTest: true,
      includeSessionValidation: true,
      includeConfigurationCheck: true,
      timeoutMs: 10000,
      ...options
    }

    const results: DiagnosticResult[] = []
    const timestamp = new Date()

    // Check Supabase configuration
    if (fullOptions.includeConfigurationCheck) {
      results.push(await this.checkSupabaseConfiguration())
    }

    // Check network connectivity
    if (fullOptions.includeNetworkTest) {
      results.push(await this.checkNetworkConnectivity(fullOptions.timeoutMs))
    }

    // Check session state
    if (fullOptions.includeSessionValidation) {
      results.push(await this.checkSessionState())
    }

    // Check error handler state
    results.push(this.checkErrorHandlerState())

    // Check retry manager state
    results.push(this.checkRetryManagerState())

    // Check browser environment
    results.push(this.checkBrowserEnvironment())

    // Calculate summary
    const summary = {
      healthy: results.filter(r => r.status === 'healthy').length,
      warnings: results.filter(r => r.status === 'warning').length,
      errors: results.filter(r => r.status === 'error').length
    }

    // Determine overall status
    let overall: 'healthy' | 'warning' | 'error' = 'healthy'
    if (summary.errors > 0) {
      overall = 'error'
    } else if (summary.warnings > 0) {
      overall = 'warning'
    }

    const diagnostics: SystemDiagnostics = {
      overall,
      results,
      summary,
      timestamp
    }

    this.lastDiagnostics = diagnostics
    return diagnostics
  }

  /**
   * Check Supabase configuration
   */
  private async checkSupabaseConfiguration(): Promise<DiagnosticResult> {
    try {
      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        return {
          component: 'Supabase Configuration',
          status: 'error',
          message: 'Missing Supabase environment variables',
          details: {
            hasUrl: !!supabaseUrl,
            hasAnonKey: !!supabaseAnonKey
          },
          timestamp: new Date()
        }
      }

      // Validate URL format
      try {
        const url = new URL(supabaseUrl)
        if (!url.hostname.includes('supabase')) {
          return {
            component: 'Supabase Configuration',
            status: 'warning',
            message: 'Supabase URL format may be incorrect',
            details: { url: supabaseUrl },
            timestamp: new Date()
          }
        }
      } catch (error) {
        return {
          component: 'Supabase Configuration',
          status: 'error',
          message: 'Invalid Supabase URL format',
          details: { url: supabaseUrl },
          timestamp: new Date()
        }
      }

      // Check client initialization
      if (!supabaseClient) {
        return {
          component: 'Supabase Configuration',
          status: 'error',
          message: 'Supabase client not initialized',
          timestamp: new Date()
        }
      }

      return {
        component: 'Supabase Configuration',
        status: 'healthy',
        message: 'Supabase properly configured',
        details: {
          hasClient: !!supabaseClient,
          url: supabaseUrl.substring(0, 20) + '...'
        },
        timestamp: new Date()
      }
    } catch (error: any) {
      return {
        component: 'Supabase Configuration',
        status: 'error',
        message: `Configuration check failed: ${error.message}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Check network connectivity to Supabase
   */
  private async checkNetworkConnectivity(timeoutMs: number): Promise<DiagnosticResult> {
    try {
      if (!supabaseClient) {
        return {
          component: 'Network Connectivity',
          status: 'error',
          message: 'Cannot test connectivity - Supabase client not available',
          timestamp: new Date()
        }
      }

      const startTime = Date.now()
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
      })

      // Test basic connectivity with getSession
      const connectivityPromise = supabaseClient.auth.getSession()

      const { error } = await Promise.race([connectivityPromise, timeoutPromise]) as any

      const responseTime = Date.now() - startTime

      if (error) {
        // Some errors are expected (like no session), focus on connectivity
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('Network request failed')) {
          return {
            component: 'Network Connectivity',
            status: 'error',
            message: 'Network connectivity failed',
            details: {
              error: error.message,
              responseTime
            },
            timestamp: new Date()
          }
        }
      }

      // Connection successful
      let status: 'healthy' | 'warning' = 'healthy'
      let message = 'Network connectivity healthy'

      if (responseTime > 5000) {
        status = 'warning'
        message = 'Network connectivity slow'
      }

      return {
        component: 'Network Connectivity',
        status,
        message,
        details: {
          responseTime,
          threshold: timeoutMs
        },
        timestamp: new Date()
      }
    } catch (error: any) {
      return {
        component: 'Network Connectivity',
        status: 'error',
        message: `Connectivity test failed: ${error.message}`,
        details: {
          error: error.message
        },
        timestamp: new Date()
      }
    }
  }

  /**
   * Check current session state
   */
  private async checkSessionState(): Promise<DiagnosticResult> {
    try {
      const sessionDiagnostics = sessionManager.getDiagnostics()
      const currentState = sessionManager.getCurrentState()

      let status: 'healthy' | 'warning' | 'error' = 'healthy'
      let message = 'Session state healthy'

      if (!sessionDiagnostics.hasSession) {
        status = 'warning'
        message = 'No active session'
      } else if (!sessionDiagnostics.isValid) {
        status = 'error'
        message = 'Session invalid'
      } else if (sessionDiagnostics.shouldRefresh) {
        status = 'warning'
        message = 'Session needs refresh'
      }

      return {
        component: 'Session State',
        status,
        message,
        details: {
          ...sessionDiagnostics,
          userEmail: currentState.user?.email || null
        },
        timestamp: new Date()
      }
    } catch (error: any) {
      return {
        component: 'Session State',
        status: 'error',
        message: `Session check failed: ${error.message}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Check error handler state
   */
  private checkErrorHandlerState(): DiagnosticResult {
    try {
      const errorStats = errorHandler.getErrorStats()
      const recentErrors = errorHandler.getRecentErrors(5)

      let status: 'healthy' | 'warning' | 'error' = 'healthy'
      let message = 'Error handler healthy'

      if (errorStats.recentCount > 10) {
        status = 'error'
        message = `High error rate: ${errorStats.recentCount} errors in last hour`
      } else if (errorStats.recentCount > 3) {
        status = 'warning'
        message = `Moderate error rate: ${errorStats.recentCount} errors in last hour`
      }

      return {
        component: 'Error Handler',
        status,
        message,
        details: {
          ...errorStats,
          recentErrorTypes: recentErrors.map(e => e.error.type)
        },
        timestamp: new Date()
      }
    } catch (error: any) {
      return {
        component: 'Error Handler',
        status: 'error',
        message: `Error handler check failed: ${error.message}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Check retry manager state
   */
  private checkRetryManagerState(): DiagnosticResult {
    try {
      const retryStats = retryManager.getRetryStats()

      let status: 'healthy' | 'warning' | 'error' = 'healthy'
      let message = 'Retry manager healthy'

      if (retryStats.activeRetries > 5) {
        status = 'warning'
        message = `High retry activity: ${retryStats.activeRetries} active retries`
      }

      return {
        component: 'Retry Manager',
        status,
        message,
        details: retryStats,
        timestamp: new Date()
      }
    } catch (error: any) {
      return {
        component: 'Retry Manager',
        status: 'error',
        message: `Retry manager check failed: ${error.message}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Check browser environment
   */
  private checkBrowserEnvironment(): DiagnosticResult {
    try {
      const details: any = {}

      if (typeof window !== 'undefined') {
        details.localStorage = typeof localStorage !== 'undefined'
        details.sessionStorage = typeof sessionStorage !== 'undefined'
        details.cookies = navigator.cookieEnabled
        details.online = navigator.onLine
        details.userAgent = navigator.userAgent.substring(0, 50) + '...'
      } else {
        details.environment = 'server-side'
      }

      let status: 'healthy' | 'warning' | 'error' = 'healthy'
      let message = 'Browser environment healthy'

      if (typeof window !== 'undefined') {
        if (!navigator.cookieEnabled) {
          status = 'warning'
          message = 'Cookies disabled - may affect authentication'
        } else if (!navigator.onLine) {
          status = 'warning'
          message = 'Browser reports offline status'
        }
      }

      return {
        component: 'Browser Environment',
        status,
        message,
        details,
        timestamp: new Date()
      }
    } catch (error: any) {
      return {
        component: 'Browser Environment',
        status: 'error',
        message: `Environment check failed: ${error.message}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Start periodic health checks
   */
  startPeriodicHealthChecks(intervalMs = 60000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.runDiagnostics({
          includeNetworkTest: false, // Skip network test in periodic checks
          includeSessionValidation: true,
          includeConfigurationCheck: false
        })
      } catch (error) {
        console.warn('Periodic health check failed:', error)
      }
    }, intervalMs)
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  /**
   * Get last diagnostics result
   */
  getLastDiagnostics(): SystemDiagnostics | null {
    return this.lastDiagnostics
  }

  /**
   * Quick health check (minimal tests)
   */
  async quickHealthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = []

    // Check basic configuration
    if (!supabaseClient) {
      issues.push('Supabase client not configured')
    }

    // Check session
    const sessionState = sessionManager.getCurrentState()
    if (sessionState.isValid && sessionState.expiresAt && sessionState.expiresAt <= new Date()) {
      issues.push('Session expired')
    }

    // Check recent errors
    const errorStats = errorHandler.getErrorStats()
    if (errorStats.recentCount > 5) {
      issues.push(`High error rate: ${errorStats.recentCount} recent errors`)
    }

    return {
      healthy: issues.length === 0,
      issues
    }
  }

  /**
   * Export diagnostics for support
   */
  exportDiagnostics(): string {
    const diagnostics = this.lastDiagnostics || { message: 'No diagnostics available' }
    const errorStats = errorHandler.getErrorStats()
    const retryStats = retryManager.getRetryStats()
    const sessionDiagnostics = sessionManager.getDiagnostics()

    const exportData = {
      timestamp: new Date().toISOString(),
      diagnostics,
      errorStats,
      retryStats,
      sessionDiagnostics,
      environment: {
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server-side',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        online: typeof window !== 'undefined' ? navigator.onLine : 'unknown'
      }
    }

    return JSON.stringify(exportData, null, 2)
  }
}

// Export singleton instance
export const diagnosticService = DiagnosticService.getInstance()