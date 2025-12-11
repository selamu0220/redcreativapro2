'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { useOptimizedAuth } from '../hooks/useOptimizedAuth'
import { useGuestTrial } from '../hooks/useGuestTrial'
import type { LanguageCode } from "../lib/language/config";

interface AuthPageClientProps {
  initialLang: LanguageCode;
}

export default function AuthPageClient({ initialLang }: AuthPageClientProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentLang, setCurrentLang] = useState<LanguageCode>(initialLang);
  
  const { signIn, signUp, error, loading } = useAuth()
  const { startGuestTrial, canStartTrial } = useGuestTrial()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsHydrated(true)
    setCurrentLang(initialLang)
  }, [initialLang])

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Cargando...</p>
        </div>
      </div>
    )
  }

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (!isLogin) {
      const passwordValidation = validatePassword(password)
      if (passwordValidation) {
        setPasswordError(passwordValidation)
        return
      }
      if (password !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden')
        return
      }
    }

    try {
      if (isLogin) {
        await signIn(email, password)
        // Small pause to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100))
        // After successful login, redirect to saved URL or dashboard
        const redirectUrl = searchParams.get('redirect')
        if (redirectUrl) {
          router.push(redirectUrl)
        } else {
          router.push(`/${currentLang}/dashboard`)
        }
      } else {
        await signUp(email, password)
        // Small pause to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100))
        // After successful signup, redirect to saved URL or dashboard
        const redirectUrl = searchParams.get('redirect')
        if (redirectUrl) {
          router.push(redirectUrl)
        } else {
          router.push(`/${currentLang}/dashboard`)
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-card rounded-md flex items-center justify-center mx-auto mb-6">
            <span className="text-card-foreground font-bold text-lg">RC</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Red Creativa Pro</h1>
          <p className="text-muted-foreground">Plataforma de Marketing con IA</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isLogin ? 'Accede a tu cuenta' : 'Únete a Red Creativa Pro'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-10 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {(error || passwordError) && (
              <div className="bg-red-900/20 border border-red-800 rounded-md p-3">
                <p className="text-red-400 text-sm">{error || passwordError}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            
            {canStartTrial && (
              <div className="border-t border-border pt-4">
                <p className="text-muted-foreground text-sm mb-3">
                  Prueba sin registro
                </p>
                <button
                   type="button"
                   onClick={() => {
                     startGuestTrial()
                     router.push(`/${currentLang}/dashboard`)
                   }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-md font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all duration-200 transform hover:scale-105"
                >
                  Probar Gratis
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  Acceso limitado sin registro
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}