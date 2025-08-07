'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../firebase'
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
    if (typeof window === 'undefined' || !auth) {
      setLoading(false)
      return
    }
    
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
        setLoading(false)
      }, (error) => {
        console.error('Auth state change error:', error)
        setError(error.message)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error: any) {
      console.error('Auth initialization error:', error)
      setError(error.message)
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      setError('Authentication not initialized')
      return
    }
    try {
      setError(null)
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) {
      setError('Authentication not initialized')
      return
    }
    try {
      setError(null)
      setLoading(true)
      await createUserWithEmailAndPassword(auth, email, password)
      router.push('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (!auth) {
      setError('Authentication not initialized')
      return
    }
    try {
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