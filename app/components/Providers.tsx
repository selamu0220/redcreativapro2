'use client'

import { WorkingAuthProvider } from './WorkingAuthProvider'
import { ToastProvider } from './ToastProvider'
import { LanguageProvider } from '@/app/lib/language/context'
import { LocalizationProvider } from '@/app/contexts/LocalizationContext'
import { LocalizationLanguageSync } from './LocalizationLanguageSync'
import { LocalizationErrorBoundary } from './LocalizationErrorBoundary'
import { ConsentBanner } from './ConsentBanner'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <WorkingAuthProvider>
      <LanguageProvider>
        {/* LocalizationErrorBoundary removed temporarily to debug blank page */}
        <LocalizationProvider>
          <LocalizationLanguageSync />
          <ToastProvider>
            {children}
          </ToastProvider>
          <ConsentBanner />
        </LocalizationProvider>
      </LanguageProvider>
    </WorkingAuthProvider>
  )
}