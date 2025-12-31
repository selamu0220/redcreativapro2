'use client'

import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from './theme-provider'
import { SWRProvider } from './SWRProvider'
import { ConvexClientProvider } from './ConvexClientProvider'
import { LanguageProvider } from '@/app/lib/language/context'
import { LocalizationProvider } from '@/app/contexts/LocalizationContext'
import { WorkingAuthProvider } from './WorkingAuthProvider'
import { ToastProvider } from './ToastProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{ cssLayerName: 'clerk' }}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <WorkingAuthProvider>
        <LocalizationProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ConvexClientProvider>
                <SWRProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </SWRProvider>
              </ConvexClientProvider>
            </ThemeProvider>
          </LanguageProvider>
        </LocalizationProvider>
      </WorkingAuthProvider>
    </ClerkProvider>
  )
}