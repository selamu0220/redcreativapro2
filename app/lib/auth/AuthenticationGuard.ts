/**
 * Authentication Guard Component
 * 
 * Provides centralized authentication verification for payment flows
 * Implements requirements 1.1, 1.2, 1.3, 1.4, 1.5 from secure-payment-flow spec
 */

import { supabaseClient } from '../supabase-client'
import type { User } from '@supabase/supabase-js'

export interface UserIdentity {
  userId: string
  email: string
  sessionId: string
  sessionExpiry: Date
}

export interface AuthResult {
  isAuthenticated: boolean
  user: UserIdentity | null
  sessionExpiry: Date | null
  error?: string
}

export interface SessionValidationResult {
  isValid: boolean
  isExpired: boolean
  timeUntilExpiry?: number
  error?: string
}

export class AuthenticationGuard {
  private static instance: AuthenticationGuard
  private currentUser: UserIdentity | null = null
  private sessionCheckInterval: NodeJS.Timeout | null = null
  private readonly SESSION_CHECK_INTERVAL = 60000 // Check every minute
  private readonly SESSION_WARNING_THRESHOLD = 300000 // Warn 5 minutes before expiry

  private constructor() {
    this.initializeSessionMonitoring()
  }

  public static getInstance(): AuthenticationGuard {
    if (!AuthenticationGuard.instance) {
      AuthenticationGuard.instance = new AuthenticationGuard()
    }
    return AuthenticationGuard.instance
  }

  /**
   * Requirement 1.1: Verify user authentication before payment operations
   * WHEN un usuario intenta acceder a la página de planes THEN el sistema SHALL verificar que el usuario esté autenticado
   */
  public async verifyUserAuthentication(): Promise<AuthResult> {
    try {
      if (!supabaseClient) {
        return {
          isAuthenticated: false,
          user: null,
          sessionExpiry: null,
          error: 'Authentication service not available'
        }
      }

      const { data: { session }, error } = await supabaseClient.auth.getSession()

      if (error) {
        console.error('Authentication verification error:', error)
        return {
          isAuthenticated: false,
          user: null,
          sessionExpiry: null,
          error: error.message
        }
      }

      if (!session || !session.user || !session.access_token) {
        return {
          isAuthenticated: false,
          user: null,
          sessionExpiry: null,
          error: 'No valid session found'
        }
      }

      // Validate session expiry
      const sessionExpiry = new Date(session.expires_at! * 1000)
      const now = new Date()

      if (sessionExpiry <= now) {
        return {
          isAuthenticated: false,
          user: null,
          sessionExpiry: sessionExpiry,
          error: 'Session has expired'
        }
      }

      const userIdentity: UserIdentity = {
        userId: session.user.id,
        email: session.user.email || '',
        sessionId: session.access_token.substring(0, 16), // Use first 16 chars as session identifier
        sessionExpiry: sessionExpiry
      }

      this.currentUser = userIdentity

      return {
        isAuthenticated: true,
        user: userIdentity,
        sessionExpiry: sessionExpiry
      }
    } catch (error) {
      console.error('Unexpected error during authentication verification:', error)
      return {
        isAuthenticated: false,
        user: null,
        sessionExpiry: null,
        error: error instanceof Error ? error.message : 'Unknown authentication error'
      }
    }
  }

  /**
   * Requirement 1.4: Validate session remains active during payment process
   * WHEN se inicia un proceso de pago THEN el sistema SHALL validar que la sesión del usuario siga activa
   */
  public async validateSessionActive(): Promise<SessionValidationResult> {
    try {
      if (!supabaseClient) {
        return {
          isValid: false,
          isExpired: false,
          error: 'Authentication service not available'
        }
      }

      const { data: { session }, error } = await supabaseClient.auth.getSession()

      if (error) {
        console.error('Session validation error:', error)
        return {
          isValid: false,
          isExpired: false,
          error: error.message
        }
      }

      if (!session || !session.access_token) {
        return {
          isValid: false,
          isExpired: true,
          error: 'No active session found'
        }
      }

      const sessionExpiry = new Date(session.expires_at! * 1000)
      const now = new Date()
      const timeUntilExpiry = sessionExpiry.getTime() - now.getTime()

      if (timeUntilExpiry <= 0) {
        return {
          isValid: false,
          isExpired: true,
          error: 'Session has expired'
        }
      }

      return {
        isValid: true,
        isExpired: false,
        timeUntilExpiry: timeUntilExpiry
      }
    } catch (error) {
      console.error('Unexpected error during session validation:', error)
      return {
        isValid: false,
        isExpired: false,
        error: error instanceof Error ? error.message : 'Unknown session validation error'
      }
    }
  }

  /**
   * Requirement 1.2: Redirect to login for unauthenticated users
   * IF el usuario no está autenticado THEN el sistema SHALL redirigir al login antes de mostrar opciones de pago
   */
  public redirectToLogin(returnUrl?: string): void {
    if (typeof window === 'undefined') {
      return // Server-side, cannot redirect
    }

    const currentPath = returnUrl || window.location.pathname + window.location.search
    const loginUrl = `/auth?redirect=${encodeURIComponent(currentPath)}`
    
    console.log('Redirecting unauthenticated user to login:', loginUrl)
    window.location.href = loginUrl
  }

  /**
   * Requirement 1.3: Extract user identity for payment operations
   * WHEN el usuario está autenticado THEN el sistema SHALL mostrar claramente su email/identidad en la página de pago
   */
  public async getUserIdentity(): Promise<UserIdentity | null> {
    const authResult = await this.verifyUserAuthentication()
    
    if (!authResult.isAuthenticated || !authResult.user) {
      return null
    }

    return authResult.user
  }

  /**
   * Get current cached user identity (faster, but may be stale)
   */
  public getCurrentUserIdentity(): UserIdentity | null {
    return this.currentUser
  }

  /**
   * Requirement 1.5: Handle session expiry during payment process
   * IF la sesión ha expirado durante el proceso de pago THEN el sistema SHALL cancelar el proceso y requerir nueva autenticación
   */
  public async handleSessionExpiry(): Promise<void> {
    try {
      // Clear current user
      this.currentUser = null

      // Clear any stored session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-auth-token')
        sessionStorage.removeItem('sb-auth-token')
      }

      // Sign out from Supabase
      if (supabaseClient) {
        await supabaseClient.auth.signOut()
      }

      // Redirect to login
      this.redirectToLogin()
    } catch (error) {
      console.error('Error handling session expiry:', error)
      // Still redirect to login even if cleanup fails
      this.redirectToLogin()
    }
  }

  /**
   * Check if user is authenticated for payment operations
   * This is the main method that payment flows should use
   */
  public async requireAuthentication(): Promise<UserIdentity> {
    const authResult = await this.verifyUserAuthentication()

    if (!authResult.isAuthenticated || !authResult.user) {
      // Redirect to login if not authenticated
      this.redirectToLogin()
      throw new Error('Authentication required for payment operations')
    }

    return authResult.user
  }

  /**
   * Validate session before critical payment operations
   */
  public async validateSessionForPayment(): Promise<UserIdentity> {
    const sessionResult = await this.validateSessionActive()

    if (!sessionResult.isValid) {
      if (sessionResult.isExpired) {
        await this.handleSessionExpiry()
        throw new Error('Session expired during payment process')
      } else {
        throw new Error('Invalid session for payment operations')
      }
    }

    const userIdentity = await this.getUserIdentity()
    if (!userIdentity) {
      throw new Error('Unable to extract user identity for payment')
    }

    return userIdentity
  }

  /**
   * Initialize session monitoring for proactive expiry handling
   */
  private initializeSessionMonitoring(): void {
    if (typeof window === 'undefined') {
      return // Server-side, no monitoring needed
    }

    this.sessionCheckInterval = setInterval(async () => {
      try {
        const sessionResult = await this.validateSessionActive()
        
        if (!sessionResult.isValid) {
          if (sessionResult.isExpired) {
            console.warn('Session expired, handling expiry')
            await this.handleSessionExpiry()
          }
          return
        }

        // Warn user if session is about to expire
        if (sessionResult.timeUntilExpiry && sessionResult.timeUntilExpiry <= this.SESSION_WARNING_THRESHOLD) {
          this.notifySessionExpiringSoon(sessionResult.timeUntilExpiry)
        }
      } catch (error) {
        console.error('Error during session monitoring:', error)
      }
    }, this.SESSION_CHECK_INTERVAL)
  }

  /**
   * Notify user that session is expiring soon
   */
  private notifySessionExpiringSoon(timeUntilExpiry: number): void {
    const minutesLeft = Math.ceil(timeUntilExpiry / 60000)
    
    // Only show warning once per session
    const warningKey = `session-warning-${this.currentUser?.sessionId}`
    if (typeof window !== 'undefined' && !sessionStorage.getItem(warningKey)) {
      sessionStorage.setItem(warningKey, 'shown')
      
      console.warn(`Session expires in ${minutesLeft} minutes`)
      
      // You could show a toast notification here
      // For now, just log the warning
    }
  }

  /**
   * Cleanup method to clear intervals and reset state
   */
  public cleanup(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
    this.currentUser = null
  }

  /**
   * Refresh session if it's about to expire
   */
  public async refreshSessionIfNeeded(): Promise<boolean> {
    try {
      if (!supabaseClient) {
        return false
      }

      const sessionResult = await this.validateSessionActive()
      
      // Refresh if session expires in less than 10 minutes
      if (sessionResult.isValid && sessionResult.timeUntilExpiry && sessionResult.timeUntilExpiry < 600000) {
        const { data, error } = await supabaseClient.auth.refreshSession()
        
        if (error) {
          console.error('Failed to refresh session:', error)
          return false
        }

        if (data.session) {
          console.log('Session refreshed successfully')
          return true
        }
      }

      return sessionResult.isValid
    } catch (error) {
      console.error('Error refreshing session:', error)
      return false
    }
  }
}

// Export singleton instance
export const authGuard = AuthenticationGuard.getInstance()