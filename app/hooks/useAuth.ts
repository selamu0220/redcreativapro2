'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import { getFirebaseAuth } from '../firebase'
import { useRouter } from 'next/navigation'




interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }
    
    const auth = getFirebaseAuth()
    if (!auth) {
      setLoading(false)
      return
    }
    
    const initAuth = async () => {
      try {
        const { onAuthStateChanged } = await import('firebase/auth')
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
        }, (error) => {
          console.error('Auth state change error:', error)
          setError(error.message)
          setLoading(false)
        })

        return unsubscribe
      } catch (error: any) {
        console.error('Auth initialization error:', error)
        setError(error.message)
        setLoading(false)
        return null
      }
    }
    
    let unsubscribe: (() => void) | null = null
    initAuth().then((unsub) => {
      unsubscribe = unsub
    })
    
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setError('Authentication not initialized')
      return
    }
    try {
      setError(null)
      setLoading(true)
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setError('Authentication not initialized')
      return
    }
    try {
      setError(null)
      setLoading(true)
      const { createUserWithEmailAndPassword } = await import('firebase/auth')
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // After successful Firebase user creation, create/update user in our database
      const token = await userCredential.user.getIdToken()
      await fetch(`/api/users/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': email
        },
        body: JSON.stringify({})
      })
      
      router.push('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setError('Authentication not initialized')
      return
    }
    try {
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
      router.push('/auth')
    } catch (error: any) {
      setError(error.message)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    logout,
    error
  }
}