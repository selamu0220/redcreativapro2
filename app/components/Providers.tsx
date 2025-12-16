'use client'

import { WorkingAuthProvider } from './WorkingAuthProvider'
import { ToastProvider } from './ToastProvider'
import { LanguageProvider } from '@/app/lib/language/context'
import { LocalizationProvider } from '@/app/contexts/LocalizationContext'
import { LocalizationLanguageSync } from './LocalizationLanguageSync'
import { ConsentBanner } from './ConsentBanner'
import { ThemeProvider } from './theme-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <WorkingAuthProvider>
        <LanguageProvider>
          <LocalizationProvider>
            <LocalizationLanguageSync />
            <ToastProvider>
              {children}
            </ToastProvider>
            <ConsentBanner />
          </LocalizationProvider>
        </LanguageProvider>
      </WorkingAuthProvider>
    </ThemeProvider>
  )
}