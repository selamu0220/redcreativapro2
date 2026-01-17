'use client'

import { KindeProvider } from '@kinde-oss/kinde-auth-nextjs'
import { ReactNode, Component, ErrorInfo } from 'react'
import { ThemeStyleProvider } from '@/app/contexts/ThemeStyleContext'
import { ThemePickerModal } from './ThemePickerModal'
import { GlobalThemeToggle } from './GlobalThemeToggle'
import { GlobalModeToggle } from './GlobalModeToggle'
import { CookieConsentBanner } from './CookieConsentBanner'

// Error Boundary para capturar errores y evitar página en blanco
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              fontFamily: 'system-ui, sans-serif',
              background: '#1a1a2e',
              color: '#fff',
            }}
          >
            <div
              style={{
                maxWidth: '400px',
                textAlign: 'center',
                padding: '32px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h1 style={{ fontSize: '20px', marginBottom: '12px' }}>
                Error al cargar la aplicación
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '14px' }}>
                Ha ocurrido un error inesperado. Por favor, recarga la página.
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  background: '#f97316',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Recargar página
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <KindeProvider>
        <ThemeStyleProvider>
          {children}
          <GlobalThemeToggle />
          <GlobalModeToggle />
          <CookieConsentBanner />
          <ThemePickerModal showOnFirstVisit />
        </ThemeStyleProvider>
      </KindeProvider>
    </ErrorBoundary>
  )
}
