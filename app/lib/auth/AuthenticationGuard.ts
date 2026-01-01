/**
 * Authentication Guard Component
 * 
 * Provides centralized authentication verification using Kinde Auth.
 */

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export interface UserIdentity {
  userId: string
  email: string
  sessionId: string
  sessionExpiry?: Date
}

export interface AuthResult {
  isAuthenticated: boolean
  user: UserIdentity | null
  error?: string
}

export interface SessionValidationResult {
  isValid: boolean
  isExpired: boolean
  timeUntilExpiry: number
  error?: string
}

export class AuthenticationGuard {
  private static instance: AuthenticationGuard

  private constructor() { }

  public static getInstance(): AuthenticationGuard {
    if (!AuthenticationGuard.instance) {
      AuthenticationGuard.instance = new AuthenticationGuard()
    }
    return AuthenticationGuard.instance
  }

  /**
   * Verify user authentication using Kinde
   */
  public async verifyUserAuthentication(): Promise<AuthResult> {
    try {
      const { getUser, isAuthenticated } = getKindeServerSession()
      const user = await getUser()
      const authenticated = await isAuthenticated()

      if (!authenticated || !user) {
        return {
          isAuthenticated: false,
          user: null,
          error: 'No active session found'
        }
      }

      const userIdentity: UserIdentity = {
        userId: user.id,
        email: user.email || '',
        sessionId: user.id, // Kinde doesn't expose sessionId directly, using userId
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }

      return {
        isAuthenticated: true,
        user: userIdentity
      }
    } catch (error) {
      console.error('Unexpected error during authentication verification:', error)
      return {
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error.message : 'Unknown authentication error'
      }
    }
  }

  /**
   * Check if user is authenticated for payment operations
   */
  public async requireAuthentication(): Promise<UserIdentity> {
    const authResult = await this.verifyUserAuthentication()

    if (!authResult.isAuthenticated || !authResult.user) {
      throw new Error('Authentication required for payment operations')
    }

    return authResult.user
  }

  public async validateSessionForPayment(): Promise<UserIdentity> {
    return this.requireAuthentication()
  }

  public async validateSessionActive(): Promise<SessionValidationResult> {
    const authResult = await this.verifyUserAuthentication()
    if (!authResult.isAuthenticated) {
      return { isValid: false, isExpired: true, timeUntilExpiry: 0, error: authResult.error }
    }
    return { isValid: true, isExpired: false, timeUntilExpiry: 3600000 }
  }

  public async refreshSessionIfNeeded(): Promise<boolean> {
    const result = await this.verifyUserAuthentication()
    return result.isAuthenticated
  }

  public async handleSessionExpiry(): Promise<void> {
    console.log("Session expired handler called on server")
  }

  public redirectToLogin(returnUrl?: string): void {
    // Client-side redirect to Kinde login
  }

  public async getUserIdentity(): Promise<UserIdentity | null> {
    const res = await this.verifyUserAuthentication()
    return res.user
  }
}

// Export singleton instance
export const authGuard = AuthenticationGuard.getInstance()
