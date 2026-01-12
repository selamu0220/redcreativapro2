'use client'

import { KindeProvider } from '@kinde-oss/kinde-auth-nextjs'
import { ReactNode } from 'react'
import { ThemeStyleProvider } from '@/app/contexts/ThemeStyleContext'
import { ThemePickerModal } from './ThemePickerModal'
import { GlobalThemeToggle } from './GlobalThemeToggle'
import { CookieConsentBanner } from './CookieConsentBanner'

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <KindeProvider>
      <ThemeStyleProvider>
        {children}
        <GlobalThemeToggle />
        <CookieConsentBanner />
        <ThemePickerModal showOnFirstVisit />
      </ThemeStyleProvider>
    </KindeProvider>
  )
}
