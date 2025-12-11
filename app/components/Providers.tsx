'use client'

import { WorkingAuthProvider } from './WorkingAuthProvider'
import { ToastProvider } from './ToastProvider'
import SimpleLanguageProvider from './SimpleLanguageProvider'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <WorkingAuthProvider>
      <SimpleLanguageProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SimpleLanguageProvider>
    </WorkingAuthProvider>
  )
}