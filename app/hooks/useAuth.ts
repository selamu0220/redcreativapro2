'use client'

import { useAuth as useMinimalAuth } from '../components/MinimalProviders'
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useMemo } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'

export interface AuthUser {
  id: string
  email: string
  user_metadata?: any
  displayName?: string
  uid?: string
  created_at?: string
  fullName?: string
  firstName?: string
  primaryEmailAddress?: {
    emailAddress: string
  }
}

export function useAuth() {
  const clerkUser = useUser()
  const clerkAuth = useClerkAuth()
  const working = useContext(AuthContext)

  // Memoize the bridged user to avoid unnecessary re-renders
  const user = useMemo(() => {
    if (clerkUser.isSignedIn && clerkUser.user) {
      return {
        id: clerkUser.user.id,
        email: clerkUser.user.primaryEmailAddress?.emailAddress || '',
        displayName: clerkUser.user.fullName || clerkUser.user.firstName || clerkUser.user.username || '',
        fullName: clerkUser.user.fullName || '',
        firstName: clerkUser.user.firstName || '',
        primaryEmailAddress: clerkUser.user.primaryEmailAddress,
        uid: clerkUser.user.id,
        user_metadata: clerkUser.user.publicMetadata
      } as AuthUser
    }
    if (working?.authUser) return working.authUser
    return null
  }, [clerkUser.isSignedIn, clerkUser.user, working?.authUser])

  if (clerkUser.isLoaded && clerkUser.isSignedIn) {
    return {
      user,
      loading: false,
      isInitializing: false,
      error: null,
      signIn: async () => {}, // Clerk handles this
      signUp: async () => {}, // Clerk handles this
      logout: async () => clerkAuth.signOut(),
      isAuthenticated: true
    }
  }

  if (working) {
    const signIn = typeof working.signIn === 'function' ? working.signIn : async () => { throw new Error('Auth provider not ready') }
    const signUp = typeof working.signUp === 'function' ? working.signUp : async () => { throw new Error('Auth provider not ready') }
    const logout = typeof working.logout === 'function' ? working.logout : async () => {}
    return {
      user: working.authUser || null,
      loading: working.loading,
      isInitializing: working.isInitializing,
      error: working.error || null,
      signIn,
      signUp,
      logout,
      isAuthenticated: working.isAuthenticated
    }
  }

  let minimal: ReturnType<typeof useMinimalAuth> | undefined
  try {
    minimal = useMinimalAuth()
  } catch {}

  if (minimal) {
    const signIn = typeof minimal.signIn === 'function' ? minimal.signIn : async () => { throw new Error('Auth provider not ready') }
    const signUp = typeof minimal.signUp === 'function' ? minimal.signUp : async () => { throw new Error('Auth provider not ready') }
    const logout = typeof minimal.logout === 'function' ? minimal.logout : async () => {}
    return {
      user: minimal.user,
      loading: minimal.loading,
      isInitializing: false,
      error: minimal.error,
      signIn,
      signUp,
      logout,
      isAuthenticated: minimal.isAuthenticated
    }
  }

  const signIn = async () => { throw new Error('Auth provider not initialized') }
  const signUp = async () => { throw new Error('Auth provider not initialized') }
  const logout = async () => {}
  return {
    user: null,
    loading: false,
    isInitializing: false,
    error: 'Auth provider not initialized',
    signIn,
    signUp,
    logout,
    isAuthenticated: false
  }
}
