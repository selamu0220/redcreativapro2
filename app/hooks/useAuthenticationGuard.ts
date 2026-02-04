/**
 * React Hook for Authentication Guard
 * 
 * Provides React integration for the Authentication Guard component
 * Implements requirements 1.1, 1.2, 1.3, 1.4, 1.5 from secure-payment-flow spec
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { authGuard, type UserIdentity, type AuthResult, type SessionValidationResult } from '../lib/auth/AuthenticationGuard'

export interface UseAuthenticationGuardResult {
  // State
  isAuthenticated: boolean
  user: UserIdentity | null
  isLoading: boolean
  sessionExpiry: Date | null
  error: string | null

  // Session validation
  isSessionValid: boolean
  timeUntilExpiry: number | null

  // Methods
  verifyAuthentication: () => Promise<AuthResult>
  validateSession: () => Promise<SessionValidationResult>
  requireAuthentication: () => Promise<UserIdentity>
  validateSessionForPayment: () => Promise<UserIdentity>
  refreshSession: () => Promise<boolean>
  redirectToLogin: (returnUrl?: string) => void
  handleSessionExpiry: () => Promise<void>
}

export function useAuthenticationGuard(): UseAuthenticationGuardResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserIdentity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSessionValid, setIsSessionValid] = useState(false)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const authResult = await authGuard.verifyUserAuthentication()

        setIsAuthenticated(authResult.isAuthenticated)
        setUser(authResult.user)
        setSessionExpiry(authResult.user?.sessionExpiry || null)

        if (authResult.error) {
          setError(authResult.error)
        }

        // Also validate session
        if (authResult.isAuthenticated) {
          const sessionResult = await authGuard.validateSessionActive()
          setIsSessionValid(sessionResult.isValid)
          setTimeUntilExpiry(sessionResult.timeUntilExpiry || null)
        }
      } catch (err) {
        console.error('Error initializing authentication guard:', err)
        setError(err instanceof Error ? err.message : 'Unknown authentication error')
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Set up periodic session validation
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const validateSessionPeriodically = async () => {
      try {
        const sessionResult = await authGuard.validateSessionActive()
        setIsSessionValid(sessionResult.isValid)
        setTimeUntilExpiry(sessionResult.timeUntilExpiry || null)

        if (!sessionResult.isValid && sessionResult.isExpired) {
          // Session expired, update state
          setIsAuthenticated(false)
          setUser(null)
          setSessionExpiry(null)
          setError('Session expired')
        }
      } catch (err) {
        console.error('Error during periodic session validation:', err)
      }
    }

    // Validate immediately
    validateSessionPeriodically()

    // Set up interval for periodic validation
    const interval = setInterval(validateSessionPeriodically, 60000) // Every minute

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Verify authentication method
  const verifyAuthentication = useCallback(async (): Promise<AuthResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const authResult = await authGuard.verifyUserAuthentication()

      setIsAuthenticated(authResult.isAuthenticated)
      setUser(authResult.user)
      setSessionExpiry(authResult.user?.sessionExpiry || null)

      if (authResult.error) {
        setError(authResult.error)
      }

      return authResult
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown authentication error'
      setError(error)
      return {
        isAuthenticated: false,
        user: null,
        error
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Validate session method
  const validateSession = useCallback(async (): Promise<SessionValidationResult> => {
    try {
      const sessionResult = await authGuard.validateSessionActive()

      setIsSessionValid(sessionResult.isValid)
      setTimeUntilExpiry(sessionResult.timeUntilExpiry || null)

      if (sessionResult.error) {
        setError(sessionResult.error)
      }

      return sessionResult
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown session validation error'
      setError(error)
      return {
        isValid: false,
        isExpired: false,
        timeUntilExpiry: 0,
        error
      }
    }
  }, [])

  // Require authentication method
  const requireAuthentication = useCallback(async (): Promise<UserIdentity> => {
    try {
      setError(null)
      const userIdentity = await authGuard.requireAuthentication()

      // Update state if successful
      setIsAuthenticated(true)
      setUser(userIdentity)

      return userIdentity
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Authentication required'
      setError(error)
      setIsAuthenticated(false)
      setUser(null)
      throw err
    }
  }, [])

  // Validate session for payment method
  const validateSessionForPayment = useCallback(async (): Promise<UserIdentity> => {
    try {
      setError(null)
      const userIdentity = await authGuard.requireAuthentication()

      // Update state if successful
      setIsAuthenticated(true)
      setUser(userIdentity)
      setIsSessionValid(true)

      return userIdentity
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Session validation failed for payment'
      setError(error)

      if (error.includes('expired')) {
        setIsAuthenticated(false)
        setUser(null)
        setIsSessionValid(false)
      }

      throw err
    }
  }, [])

  // Refresh session method
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)
      const success = await authGuard.refreshSessionIfNeeded()

      if (success) {
        // Re-verify authentication after refresh
        await verifyAuthentication()
      }

      return success
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to refresh session'
      setError(error)
      return false
    }
  }, [verifyAuthentication])

  // Redirect to login method
  const redirectToLogin = useCallback((returnUrl?: string): void => {
    authGuard.redirectToLogin(returnUrl)
  }, [])

  // Handle session expiry method
  const handleSessionExpiry = useCallback(async (): Promise<void> => {
    try {
      await authGuard.handleSessionExpiry()

      // Update state
      setIsAuthenticated(false)
      setUser(null)
      setSessionExpiry(null)
      setIsSessionValid(false)
      setTimeUntilExpiry(null)
      setError('Session expired')
    } catch (err) {
      console.error('Error handling session expiry:', err)
      // Still update state even if cleanup fails
      setIsAuthenticated(false)
      setUser(null)
      setSessionExpiry(null)
      setIsSessionValid(false)
      setTimeUntilExpiry(null)
      setError('Session expired')
    }
  }, [])

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    sessionExpiry,
    error,
    isSessionValid,
    timeUntilExpiry,

    // Methods
    verifyAuthentication,
    validateSession,
    requireAuthentication,
    validateSessionForPayment,
    refreshSession,
    redirectToLogin,
    handleSessionExpiry
  }
}

/**
 * Hook specifically for payment flows
 * Automatically handles authentication requirements for payment operations
 */
export function usePaymentAuthentication() {
  const authGuard = useAuthenticationGuard()

  const [isPaymentReady, setIsPaymentReady] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Automatically validate authentication for payment on mount
  useEffect(() => {
    const validateForPayment = async () => {
      try {
        setPaymentError(null)
        await authGuard.validateSessionForPayment()
        setIsPaymentReady(true)
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Payment authentication failed'
        setPaymentError(error)
        setIsPaymentReady(false)
      }
    }

    if (!authGuard.isLoading) {
      validateForPayment()
    }
  }, [authGuard.isLoading, authGuard.isAuthenticated])

  return {
    ...authGuard,
    isPaymentReady,
    paymentError: paymentError || authGuard.error
  }
}
