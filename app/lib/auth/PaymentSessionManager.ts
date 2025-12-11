/**
 * Payment Session Manager
 * 
 * Manages session state specifically for payment operations
 * Implements requirements 1.1, 1.2, 1.3, 1.4, 1.5 from secure-payment-flow spec
 */

import { authGuard, type UserIdentity } from './AuthenticationGuard'

export interface PaymentSessionData {
  userId: string
  email: string
  sessionId: string
  paymentIntentId?: string
  planId?: string
  amount?: number
  currency?: string
  createdAt: Date
  expiresAt: Date
}

export interface PaymentSessionValidation {
  isValid: boolean
  session: PaymentSessionData | null
  error?: string
}

export class PaymentSessionManager {
  private static instance: PaymentSessionManager
  private activeSessions: Map<string, PaymentSessionData> = new Map()
  private readonly SESSION_DURATION = 30 * 60 * 1000 // 30 minutes
  private cleanupInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.initializeCleanup()
  }

  public static getInstance(): PaymentSessionManager {
    if (!PaymentSessionManager.instance) {
      PaymentSessionManager.instance = new PaymentSessionManager()
    }
    return PaymentSessionManager.instance
  }

  /**
   * Create a new payment session with user validation
   * Requirement 1.3: Show user identity clearly in payment process
   */
  public async createPaymentSession(
    planId: string,
    amount: number,
    currency: string = 'EUR'
  ): Promise<PaymentSessionData> {
    // Validate user authentication first
    const userIdentity = await authGuard.requireAuthentication()
    
    // Validate session is active for payment
    await authGuard.validateSessionForPayment()

    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.SESSION_DURATION)

    const paymentSession: PaymentSessionData = {
      userId: userIdentity.userId,
      email: userIdentity.email,
      sessionId: userIdentity.sessionId,
      planId,
      amount,
      currency,
      createdAt: now,
      expiresAt
    }

    // Store session
    const sessionKey = this.generateSessionKey(userIdentity.userId, planId)
    this.activeSessions.set(sessionKey, paymentSession)

    console.log('Created payment session:', {
      userId: userIdentity.userId,
      email: userIdentity.email,
      planId,
      amount,
      expiresAt
    })

    return paymentSession
  }

  /**
   * Validate payment session before processing
   * Requirement 1.4: Validate session remains active during payment
   */
  public async validatePaymentSession(
    userId: string,
    planId: string
  ): Promise<PaymentSessionValidation> {
    try {
      // First validate the underlying auth session
      const sessionResult = await authGuard.validateSessionActive()
      if (!sessionResult.isValid) {
        return {
          isValid: false,
          session: null,
          error: 'Authentication session is invalid'
        }
      }

      // Check if payment session exists
      const sessionKey = this.generateSessionKey(userId, planId)
      const paymentSession = this.activeSessions.get(sessionKey)

      if (!paymentSession) {
        return {
          isValid: false,
          session: null,
          error: 'Payment session not found'
        }
      }

      // Check if payment session has expired
      const now = new Date()
      if (paymentSession.expiresAt <= now) {
        // Remove expired session
        this.activeSessions.delete(sessionKey)
        return {
          isValid: false,
          session: null,
          error: 'Payment session has expired'
        }
      }

      // Validate user identity matches
      const currentUser = await authGuard.getUserIdentity()
      if (!currentUser || currentUser.userId !== paymentSession.userId) {
        return {
          isValid: false,
          session: null,
          error: 'User identity mismatch'
        }
      }

      return {
        isValid: true,
        session: paymentSession
      }
    } catch (error) {
      console.error('Error validating payment session:', error)
      return {
        isValid: false,
        session: null,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      }
    }
  }

  /**
   * Update payment session with payment intent ID
   */
  public updatePaymentSession(
    userId: string,
    planId: string,
    paymentIntentId: string
  ): boolean {
    const sessionKey = this.generateSessionKey(userId, planId)
    const session = this.activeSessions.get(sessionKey)

    if (!session) {
      return false
    }

    session.paymentIntentId = paymentIntentId
    this.activeSessions.set(sessionKey, session)

    console.log('Updated payment session with payment intent:', {
      userId,
      planId,
      paymentIntentId
    })

    return true
  }

  /**
   * Complete payment session (remove from active sessions)
   */
  public completePaymentSession(userId: string, planId: string): boolean {
    const sessionKey = this.generateSessionKey(userId, planId)
    const session = this.activeSessions.get(sessionKey)

    if (!session) {
      return false
    }

    this.activeSessions.delete(sessionKey)

    console.log('Completed payment session:', {
      userId,
      planId,
      sessionId: session.sessionId
    })

    return true
  }

  /**
   * Cancel payment session
   */
  public cancelPaymentSession(userId: string, planId: string): boolean {
    const sessionKey = this.generateSessionKey(userId, planId)
    const session = this.activeSessions.get(sessionKey)

    if (!session) {
      return false
    }

    this.activeSessions.delete(sessionKey)

    console.log('Cancelled payment session:', {
      userId,
      planId,
      sessionId: session.sessionId
    })

    return true
  }

  /**
   * Get active payment session
   */
  public getPaymentSession(userId: string, planId: string): PaymentSessionData | null {
    const sessionKey = this.generateSessionKey(userId, planId)
    return this.activeSessions.get(sessionKey) || null
  }

  /**
   * Get all active sessions for a user
   */
  public getUserPaymentSessions(userId: string): PaymentSessionData[] {
    const userSessions: PaymentSessionData[] = []
    
    for (const session of this.activeSessions.values()) {
      if (session.userId === userId) {
        userSessions.push(session)
      }
    }

    return userSessions
  }

  /**
   * Extend payment session expiry
   */
  public extendPaymentSession(userId: string, planId: string, additionalMinutes: number = 30): boolean {
    const sessionKey = this.generateSessionKey(userId, planId)
    const session = this.activeSessions.get(sessionKey)

    if (!session) {
      return false
    }

    const additionalTime = additionalMinutes * 60 * 1000
    session.expiresAt = new Date(session.expiresAt.getTime() + additionalTime)
    this.activeSessions.set(sessionKey, session)

    console.log('Extended payment session:', {
      userId,
      planId,
      newExpiresAt: session.expiresAt
    })

    return true
  }

  /**
   * Cleanup expired sessions
   */
  public cleanupExpiredSessions(): number {
    const now = new Date()
    let cleanedCount = 0

    for (const [key, session] of this.activeSessions.entries()) {
      if (session.expiresAt <= now) {
        this.activeSessions.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired payment sessions`)
    }

    return cleanedCount
  }

  /**
   * Get session statistics
   */
  public getSessionStats(): {
    totalSessions: number
    expiredSessions: number
    activeSessions: number
  } {
    const now = new Date()
    let expiredCount = 0
    let activeCount = 0

    for (const session of this.activeSessions.values()) {
      if (session.expiresAt <= now) {
        expiredCount++
      } else {
        activeCount++
      }
    }

    return {
      totalSessions: this.activeSessions.size,
      expiredSessions: expiredCount,
      activeSessions: activeCount
    }
  }

  /**
   * Generate session key for storage
   */
  private generateSessionKey(userId: string, planId: string): string {
    return `${userId}:${planId}`
  }

  /**
   * Initialize cleanup interval
   */
  private initializeCleanup(): void {
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions()
    }, 5 * 60 * 1000)
  }

  /**
   * Cleanup method
   */
  public cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.activeSessions.clear()
  }
}

// Export singleton instance
export const paymentSessionManager = PaymentSessionManager.getInstance()