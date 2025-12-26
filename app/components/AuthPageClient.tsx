'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignIn, SignUp } from '@clerk/nextjs'
import { useGuestTrial } from '../hooks/useGuestTrial'
import type { LanguageCode } from "../lib/language/config";
import posthog from 'posthog-js';

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
          <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center mx-auto mb-6">
            <span className="text-primary-foreground font-bold text-lg">RC</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Red Creativa Pro</h1>
          <p className="text-muted-foreground">Plataforma de Marketing con IA</p>
        </div>
        
        <div className="flex justify-center">
          {isLogin ? (
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-card border border-border shadow-none w-full",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",
                    socialButtonsBlockButton: "bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                    formFieldLabel: "text-foreground",
                    formFieldInput: "bg-background border-input text-foreground",
                    footerActionText: "text-muted-foreground",
                    footerActionLink: "text-primary hover:text-primary/90"
                  }
                }}
                routing="hash"
                fallbackRedirectUrl={`/dashboard`}
                signUpUrl="#" 
              />
            ) : (
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-card border border-border shadow-none w-full",
                      headerTitle: "text-foreground",
                      headerSubtitle: "text-muted-foreground",
                      socialButtonsBlockButton: "bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground",
                      formFieldLabel: "text-foreground",
                      formFieldInput: "bg-background border-input text-foreground",
                      footerActionText: "text-muted-foreground",
                      footerActionLink: "text-primary hover:text-primary/90"
                    }
                  }}
                  routing="hash"
                  fallbackRedirectUrl={`/dashboard`}
                  signInUrl="#"
                />

            )}
          </div>
          
          <div className="text-center space-y-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            
            {canStartTrial && (
              <div className="border-t border-border pt-4 mt-6">
                <p className="text-muted-foreground text-sm mb-3">
                  ¿Solo quieres probar?
                </p>
                <button
                   type="button"
                   onClick={() => {
                     startGuestTrial()
                     posthog.capture('guest_trial_started', {
                       source: 'auth_page',
                       language: currentLang,
                     })
                     router.push(`/dashboard`)
                   }}
                className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-md font-medium hover:bg-secondary/80 transition-all duration-200"
              >
                Probar sin registro
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Acceso limitado a funciones básicas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}