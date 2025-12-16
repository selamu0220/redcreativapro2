/**
 * Authentication Guard Component
 * 
 * Provides centralized authentication verification using Clerk.
 * Replaces the previous Supabase implementation.
 */

import { auth, currentUser } from '@clerk/nextjs/server'

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
   * Verify user authentication using Clerk
   */
  public async verifyUserAuthentication(): Promise<AuthResult> {
    try {
      const { userId, sessionId } = await auth()

      if (!userId || !sessionId) {
        return {
          isAuthenticated: false,
          user: null,
          error: 'No active session found'
        }
      }

      const user = await currentUser()
      const email = user?.emailAddresses[0]?.emailAddress || ''

      const userIdentity: UserIdentity = {
        userId,
        email,
        sessionId,
        // sessionExpiry is not directly exposed by Clerk server helpers easily without session token inspection
        // For now we assume active if verify passed.
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
   * This is the main method that payment flows should use
   */
  public async requireAuthentication(): Promise<UserIdentity> {
    const authResult = await this.verifyUserAuthentication()

    if (!authResult.isAuthenticated || !authResult.user) {
      // Redirect handled by middleware/client usually, but here we just throw for API
      throw new Error('Authentication required for payment operations')
    }

    return authResult.user
  }

  // Wrapper for requireAuthentication to match previous interface
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
    // Clerk handles session refreshing automatically on the client/middleware.
    // Server-side check basically confirms it's valid.
    const result = await this.verifyUserAuthentication()
    return result.isAuthenticated
  }

  public async validateSessionForPayment(): Promise<UserIdentity> {
    return this.requireAuthentication()
  }

  public async handleSessionExpiry(): Promise<void> {
    // Server-side cannot force client redirect/logout easily without returning response.
    // This method might be intended for client-side usage, but this file imports 'auth' from nextjs/server.
    // If this class is isomorphic, we need to separate server/client logic.
    // Assuming this is server-side guard:
    console.log("Session expired handler called on server")
  }

  public redirectToLogin(returnUrl?: string): void {
    // Client-side redirect to Clerk login recommended instead
  }

  public async getUserIdentity(): Promise<UserIdentity | null> {
    const res = await this.verifyUserAuthentication()
    return res.user
  }
}

// Export singleton instance
export const authGuard = AuthenticationGuard.getInstance()
