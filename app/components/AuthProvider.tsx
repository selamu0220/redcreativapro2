'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signInWithGoogle = async () => {
    // Priority: 
    // 1. Environment variable (NEXT_PUBLIC_SITE_URL)
    // 2. Window origin (dynamic)
    // 3. Hardcoded production fallback (safety net)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '') ||
      'https://www.redcreativa.pro';

    // Ensure we don't send 'localhost' in production if possible, unless we are actually on localhost
    const isLocal = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
    const finalRedirectTo = isLocal
      ? `${siteUrl}/auth/callback`
      : 'https://www.redcreativa.pro/auth/callback'; // Always enforce canonical prod URL in production to match Supabase whitelist

    console.log('🔐 [Auth] Initiating Google Login');
    console.log('📍 [Auth] Redirect URL:', finalRedirectTo);

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: finalRedirectTo,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
