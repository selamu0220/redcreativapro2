'use client'

import { supabaseClient } from '../supabase-client'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  user_metadata?: any
  uid: string
  displayName?: string
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  session?: Session
  error?: AuthenticationError
}

export interface AuthenticationError {
  type: 'network' | 'credentials' | 'validation' | 'server' | 'configuration' | 'unknown'
  message: string
  originalError?: any
  retryable: boolean
  userMessage: string
}

export interface AuthenticationConfig {
  maxRetries: number
  baseDelay: number
  timeoutMs: number
  enableDiagnostics: boolean
}

export class AuthenticationService {
  private config: AuthenticationConfig
  private retryCount: Map<string, number> = new Map()

  constructor(config: Partial<AuthenticationConfig> = {}) {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000,
      timeoutMs: 20000,
      enableDiagnostics: true,
      ...config
    }
  }

  /**
   * Classify authentication errors into specific types
   */
  private classifyError(error: any): AuthenticationError {
    if (!error) {
      return {
        type: 'unknown',
        message: 'Unknown error occurred',
        retryable: false,
        userMessage: 'Ha ocurrido un error desconocido'
      }
    }

    // Network errors
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('Network request failed') ||
        error.name === 'AbortError' ||
        error.name === 'TimeoutError') {
      return {
        type: 'network',
        message: error.message || 'Network error',
        originalError: error,
        retryable: true,
        userMessage: 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.'
      }
    }

    // Credential errors
    if (error.message?.includes('Invalid login credentials') ||
        error.message?.includes('Email not confirmed') ||
        error.message?.includes('User not found')) {
      return {
        type: 'credentials',
        message: error.message,
        originalError: error,
        retryable: false,
        userMessage: 'Credenciales incorrectas. Verifica tu email y contraseña.'
      }
    }

    // Validation errors
    if (error.message?.includes('Password should be at least') ||
        error.message?.includes('Invalid email')) {
      return {
        type: 'validation',
        message: error.message,
        originalError: error,
        retryable: false,
        userMessage: 'Datos inválidos. Verifica que tu email y contraseña cumplan los requisitos.'
      }
    }

    // Server errors
    if (error.message?.includes('User already registered') ||
        error.message?.includes('Database error') ||
        error.status >= 500) {
      return {
        type: 'server',
        message: error.message,
        originalError: error,
        retryable: true,
        userMessage: 'Error del servidor. Inténtalo de nuevo en unos momentos.'
      }
    }

    // Configuration errors
    if (error.message?.includes('Supabase not configured') ||
        error.message?.includes('Invalid API key')) {
      return {
        type: 'configuration',
        message: error.message,
        originalError: error,
        retryable: false,
        userMessage: 'Error de configuración del servicio. Contacta al soporte técnico.'
      }
    }

    // Default to unknown
    return {
      type: 'unknown',
      message: error.message || 'Unknown error',
      originalError: error,
      retryable: false,
      userMessage: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationId: string
  ): Promise<T> {
    const currentRetries = this.retryCount.get(operationId) || 0

    try {
      const result = await operation()
      // Reset retry count on success
      this.retryCount.delete(operationId)
      return result
    } catch (error) {
      const authError = this.classifyError(error)
      
      // Don't retry non-retryable errors
      if (!authError.retryable || currentRetries >= this.config.maxRetries) {
        this.retryCount.delete(operationId)
        throw authError
      }

      // Increment retry count
      this.retryCount.set(operationId, currentRetries + 1)

      // Calculate delay with exponential backoff
      const delay = this.config.baseDelay * Math.pow(2, currentRetries)
      
      console.warn(`Authentication operation failed, retrying in ${delay}ms (attempt ${currentRetries + 1}/${this.config.maxRetries})`, {
        operationId,
        error: authError.message,
        retryCount: currentRetries + 1
      })

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay))

      // Retry the operation
      return this.withRetry(operation, operationId)
    }
  }

  /**
   * Convert Supabase user to AuthUser format
   */
  private convertUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      user_metadata: user.user_metadata || {},
      uid: user.id,
      displayName: user.email?.split('@')[0] || user.user_metadata?.name || ''
    }
  }

  /**
   * Check if Supabase is properly configured
   */
  async checkConfiguration(): Promise<{ configured: boolean; error?: string }> {
    if (!supabaseClient) {
      return {
        configured: false,
        error: 'Supabase client not initialized. Check environment variables.'
      }
    }

    try {
      // Try a simple operation to verify configuration
      await supabaseClient.auth.getSession()
      return { configured: true }
    } catch (error: any) {
      return {
        configured: false,
        error: `Supabase configuration error: ${error.message}`
      }
    }
  }

  /**
   * Get current session with error handling
   */
  async getCurrentSession(): Promise<AuthResult> {
    try {
      const result = await this.withRetry(async () => {
        if (!supabaseClient) {
          throw new Error('Supabase not configured')
        }

        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          throw error
        }

        return { session, user: session?.user }
      }, 'getCurrentSession')

      if (result.session?.user) {
        return {
          success: true,
          user: this.convertUser(result.session.user),
          session: result.session
        }
      }

      return {
        success: true,
        user: undefined,
        session: undefined
      }
    } catch (error: any) {
      const authError = error instanceof Object && 'type' in error ? error : this.classifyError(error)
      
      return {
        success: false,
        error: authError
      }
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await this.withRetry(async () => {
        if (!supabaseClient) {
          throw new Error('Supabase not configured')
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        })

        if (error) {
          throw error
        }

        return data
      }, `signIn-${email}`)

      if (result.user && result.session) {
        // Set authentication cookie for middleware
        if (typeof window !== 'undefined' && result.session.access_token) {
          document.cookie = `sb-access-token=${result.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        }

        return {
          success: true,
          user: this.convertUser(result.user),
          session: result.session
        }
      }

      return {
        success: false,
        error: {
          type: 'unknown',
          message: 'Sign in failed without error',
          retryable: false,
          userMessage: 'Error de autenticación. Inténtalo de nuevo.'
        }
      }
    } catch (error: any) {
      const authError = error instanceof Object && 'type' in error ? error : this.classifyError(error)
      
      return {
        success: false,
        error: authError
      }
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await this.withRetry(async () => {
        if (!supabaseClient) {
          throw new Error('Supabase not configured')
        }

        const { data, error } = await supabaseClient.auth.signUp({
          email: email.trim().toLowerCase(),
          password
        })

        if (error) {
          throw error
        }

        return data
      }, `signUp-${email}`)

      if (result.user) {
        return {
          success: true,
          user: this.convertUser(result.user),
          session: result.session || undefined
        }
      }

      return {
        success: false,
        error: {
          type: 'unknown',
          message: 'Sign up failed without error',
          retryable: false,
          userMessage: 'Error de registro. Inténtalo de nuevo.'
        }
      }
    } catch (error: any) {
      const authError = error instanceof Object && 'type' in error ? error : this.classifyError(error)
      
      return {
        success: false,
        error: authError
      }
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<AuthResult> {
    try {
      const result = await this.withRetry(async () => {
        if (!supabaseClient) {
          // If no Supabase client, just clear local state
          return { success: true }
        }

        const { error } = await supabaseClient.auth.signOut()
        
        if (error) {
          throw error
        }

        return { success: true }
      }, 'signOut')

      // Clear authentication cookie
      if (typeof window !== 'undefined') {
        document.cookie = 'sb-access-token=; path=/; max-age=0'
      }

      return {
        success: true
      }
    } catch (error: any) {
      const authError = error instanceof Object && 'type' in error ? error : this.classifyError(error)
      
      // Even if sign out fails, clear local state
      if (typeof window !== 'undefined') {
        document.cookie = 'sb-access-token=; path=/; max-age=0'
      }

      return {
        success: false,
        error: authError
      }
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<AuthResult> {
    try {
      const result = await this.withRetry(async () => {
        if (!supabaseClient) {
          throw new Error('Supabase not configured')
        }

        const { data, error } = await supabaseClient.auth.refreshSession()
        
        if (error) {
          throw error
        }

        return data
      }, 'refreshSession')

      if (result.session?.user) {
        return {
          success: true,
          user: this.convertUser(result.session.user),
          session: result.session
        }
      }

      return {
        success: false,
        error: {
          type: 'unknown',
          message: 'Session refresh failed',
          retryable: true,
          userMessage: 'Error al actualizar la sesión. Inténtalo de nuevo.'
        }
      }
    } catch (error: any) {
      const authError = error instanceof Object && 'type' in error ? error : this.classifyError(error)
      
      return {
        success: false,
        error: authError
      }
    }
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<{ valid: boolean; user?: AuthUser; error?: AuthenticationError }> {
    const sessionResult = await this.getCurrentSession()
    
    if (sessionResult.success && sessionResult.user) {
      return {
        valid: true,
        user: sessionResult.user
      }
    }

    return {
      valid: false,
      error: sessionResult.error
    }
  }

  /**
   * Get diagnostic information
   */
  async getDiagnostics(): Promise<{
    supabaseConfigured: boolean
    connectionHealthy: boolean
    sessionValid: boolean
    errors: string[]
  }> {
    const diagnostics = {
      supabaseConfigured: false,
      connectionHealthy: false,
      sessionValid: false,
      errors: [] as string[]
    }

    // Check configuration
    const configCheck = await this.checkConfiguration()
    diagnostics.supabaseConfigured = configCheck.configured
    if (!configCheck.configured && configCheck.error) {
      diagnostics.errors.push(configCheck.error)
    }

    // Check connection health
    if (diagnostics.supabaseConfigured) {
      try {
        const sessionResult = await this.getCurrentSession()
        diagnostics.connectionHealthy = true
        diagnostics.sessionValid = sessionResult.success && !!sessionResult.user
        
        if (!sessionResult.success && sessionResult.error) {
          diagnostics.errors.push(sessionResult.error.message)
        }
      } catch (error: any) {
        diagnostics.connectionHealthy = false
        diagnostics.errors.push(`Connection test failed: ${error.message}`)
      }
    }

    return diagnostics
  }
}

// Export singleton instance
export const authService = new AuthenticationService()