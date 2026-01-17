'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGuestTrial } from '../hooks/useGuestTrial'
import type { LanguageCode } from "../lib/language/config";
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components'

interface AuthPageClientProps {
  initialLang: LanguageCode;
}

export default function AuthPageClient({ initialLang }: AuthPageClientProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [currentLang, setCurrentLang] = useState<LanguageCode>(initialLang);

  const { startGuestTrial, canStartTrial } = useGuestTrial()
  const router = useRouter()

  useEffect(() => {
    setIsHydrated(true)
    setCurrentLang(initialLang)
  }, [initialLang])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-primary-foreground font-bold text-lg">RC</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Red Creativa Pro</h1>
          <p className="text-muted-foreground">Plataforma de Marketing con IA</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>

          <div className="space-y-4">
            {isLogin ? (
              <LoginLink
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 inline-block text-center"
                postLoginRedirectURL="/dashboard"
              >
                Iniciar Sesión
              </LoginLink>
            ) : (
              <RegisterLink
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 inline-block text-center"
                postLoginRedirectURL="/dashboard"
              >
                Crear Cuenta
              </RegisterLink>
            )}
          </div>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>

        {canStartTrial && (
          <div className="border-t border-border pt-4 mt-6">
            <p className="text-muted-foreground text-sm mb-3 text-center">
              ¿Solo quieres probar?
            </p>
            <button
              type="button"
              onClick={() => {
                startGuestTrial()
                router.push(`/dashboard`)
              }}
              className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-lg font-medium hover:bg-secondary/80 transition-all duration-200"
            >
              Probar sin registro
            </button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Acceso limitado a funciones básicas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
