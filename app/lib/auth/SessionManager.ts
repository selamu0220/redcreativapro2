'use client'

import { supabaseClient } from '../supabase-client'
import { errorHandler } from './ErrorHandler'
import { retryManager } from './RetryManager'
import type { Session, User } from '@supabase/supabase-js'
import type { AuthenticationError } from './ErrorHandler'
import type { AuthUser } from './AuthenticationService'

export interface SessionState {
  session: Session | null
  user: AuthUser | null
  isValid: boolean
  lastValidated: Date | null
  expiresAt: Date | null
}

export interface SessionValidationResult {
  valid: boolean
  session?: Session
  user?: AuthUser
  error?: AuthenticationError
  refreshed?: boolean
}

export class SessionManager {
  private static instance: SessionManager
  private currentState: SessionState = {
    session: null,
    user: null,
    isValid: false,
    lastValidated: null,
    expiresAt: null
  }
  
  private validationInterval: NodeJS.Timeout | null = null
  private refreshThreshold = 5 * 60 * 1000 // 5 minutes before expiry
  private validationFrequency = 30 * 1000 // Check every 30 seconds
  private listeners: Array<(state: SessionState) => void> = []

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  private constructor() {
    this.startPeriodicValidation()
    this.setupStorageListener()
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
   * Initialize session from Supabase
   */
  async initialize(): Promise<SessionValidationResult> {
    try {
      const result = await retryManager.executeWithRetry(
        async () => {
          if (!supabaseClient) {
            throw errorHandler.classifyError(
              new Error('Supabase not configured'),
              { operation: 'session-initialize' }
            )
          }

          const { data: { session }, error } = await supabaseClient.auth.getSession()
          
          if (error) {
            throw errorHandler.classifyError(error, { operation: 'session-initialize' })
          }

          return { session }
        },
        'session-initialize'
      )

      if (result.success && result.result?.session) {
        const session = result.result.session
        await this.updateSessionState(session)
        
        return {
          valid: true,
          session,
          user: this.currentState.user || undefined
        }
      }

      // No session found
      this.clearSessionState()
      return { valid: false }

    } catch (error: any) {
      const authError = error as AuthenticationError
      this.clearSessionState()
      
      return {
        valid: false,
        error: authError
      }
    }
  }

  /**
   * Validate current session
   */
  async validateSession(forceRefresh = false): Promise<SessionValidationResult> {
    // If we have a valid session and it's not expired, return it
    if (!forceRefresh && this.isSessionValid()) {
      return {
        valid: true,
        session: this.currentState.session || undefined,
        user: this.currentState.user || undefined
      }
    }

    // Check if session needs refresh
    if (this.shouldRefreshSession()) {
      const refreshResult = await this.refreshSession()
      if (refreshResult.valid) {
        return refreshResult
      }
    }

    // Validate session with Supabase
    return this.initialize()
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<SessionValidationResult> {
    try {
      const result = await retryManager.executeWithRetry(
        async () => {
          if (!supabaseClient) {
            throw errorHandler.classifyError(
              new Error('Supabase not configured'),
              { operation: 'session-refresh' }
            )
          }

          const { data, error } = await supabaseClient.auth.refreshSession()
          
          if (error) {
            throw errorHandler.classifyError(error, { operation: 'session-refresh' })
          }

          return data
        },
        'session-refresh'
      )

      if (result.success && result.result?.session) {
        const session = result.result.session
        await this.updateSessionState(session)
        
        return {
          valid: true,
          session,
          user: this.currentState.user || undefined,
          refreshed: true
        }
      }

      // Refresh failed, clear session
      this.clearSessionState()
      return { valid: false }

    } catch (error: any) {
      const authError = error as AuthenticationError
      
      // If refresh fails, clear the session
      this.clearSessionState()
      
      return {
        valid: false,
        error: authError
      }
    }
  }

  /**
   * Update session state
   */
  private async updateSessionState(session: Session): Promise<void> {
    const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null
    
    this.currentState = {
      session,
      user: session.user ? this.convertUser(session.user) : null,
      isValid: true,
      lastValidated: new Date(),
      expiresAt
    }

    // Update authentication cookie
    if (typeof window !== 'undefined' && session.access_token) {
      const maxAge = expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 1000) : 60 * 60 * 24 * 7
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`
    }

    // Notify listeners
    this.notifyListeners()
  }

  /**
   * Clear session state
   */
  private async clearSessionState(): Promise<void> {
    this.currentState = {
      session: null,
      user: null,
      isValid: false,
      lastValidated: new Date(),
      expiresAt: null
    }

    // Use TokenCleanup utility for comprehensive cleanup
    if (typeof window !== 'undefined') {
      try {
        const { TokenCleanup } = await import('./TokenCleanup')
        TokenCleanup.clearAllTokens()
      } catch (error) {
        console.warn('Failed to import TokenCleanup, falling back to manual cleanup:', error)
        
        // Fallback manual cleanup
        document.cookie = 'sb-access-token=; path=/; max-age=0'
        
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes('supabase') && key.includes('auth')) {
            localStorage.removeItem(key)
          }
        })
      }
    }

    // Notify listeners
    this.notifyListeners()
  }

  /**
   * Check if current session is valid
   */
  private isSessionValid(): boolean {
    if (!this.currentState.session || !this.currentState.isValid) {
      return false
    }

    // Check if session is expired
    if (this.currentState.expiresAt && this.currentState.expiresAt <= new Date()) {
      return false
    }

    return true
  }

  /**
   * Check if session should be refreshed
   */
  private shouldRefreshSession(): boolean {
    if (!this.currentState.session || !this.currentState.expiresAt) {
      return false
    }

    // Refresh if we're within the threshold of expiry
    const timeUntilExpiry = this.currentState.expiresAt.getTime() - Date.now()
    return timeUntilExpiry <= this.refreshThreshold
  }

  /**
   * Start periodic session validation
   */
  private startPeriodicValidation(): void {
    if (typeof window === 'undefined') return

    this.validationInterval = setInterval(async () => {
      try {
        await this.validateSession()
      } catch (error) {
        console.warn('Periodic session validation failed:', error)
      }
    }, this.validationFrequency)
  }

  /**
   * Setup storage event listener for cross-tab synchronization
   */
  private setupStorageListener(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('storage', (event) => {
      // Listen for auth token changes in other tabs
      if (event.key && event.key.includes('supabase') && event.key.includes('auth')) {
        // Re-initialize session when auth state changes in another tab
        setTimeout(() => {
          this.initialize()
        }, 100)
      }
    })
  }

  /**
   * Add session state listener
   */
  addListener(listener: (state: SessionState) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.currentState })
      } catch (error) {
        console.warn('Session state listener error:', error)
      }
    })
  }

  /**
   * Get current session state
   */
  getCurrentState(): SessionState {
    return { ...this.currentState }
  }

  /**
   * Force session cleanup
   */
  async cleanup(): Promise<void> {
    // Stop periodic validation
    if (this.validationInterval) {
      clearInterval(this.validationInterval)
      this.validationInterval = null
    }

    // Sign out from Supabase
    try {
      if (supabaseClient) {
        await supabaseClient.auth.signOut()
      }
    } catch (error) {
      console.warn('Error during Supabase signout:', error)
    }

    // Clear local state
    this.clearSessionState()
  }

  /**
   * Get session diagnostics
   */
  getDiagnostics(): {
    hasSession: boolean
    isValid: boolean
    expiresAt: string | null
    lastValidated: string | null
    timeUntilExpiry: number | null
    shouldRefresh: boolean
  } {
    const timeUntilExpiry = this.currentState.expiresAt 
      ? this.currentState.expiresAt.getTime() - Date.now()
      : null

    return {
      hasSession: !!this.currentState.session,
      isValid: this.currentState.isValid,
      expiresAt: this.currentState.expiresAt?.toISOString() || null,
      lastValidated: this.currentState.lastValidated?.toISOString() || null,
      timeUntilExpiry,
      shouldRefresh: this.shouldRefreshSession()
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()