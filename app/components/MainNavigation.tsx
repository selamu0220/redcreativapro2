'use client'

import { useState } from 'react'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { CustomUserMenu } from './CustomUserMenu'

import Link from 'next/link'
import { Button } from './ui/button'
import { HeaderCountrySelector, CountryStatusIndicator } from './HeaderCountrySelector'
import { useLocalization } from '@/app/contexts/LocalizationContext'
import { ModeToggle } from './ModeToggle'
import { LanguageSlider } from './LanguageSlider'

interface MainNavigationProps {
  className?: string
  showCountrySelector?: boolean
  showStatusIndicator?: boolean
}

// ... Component ...
export function MainNavigation({
  className = '',
  showCountrySelector = true,
  showStatusIndicator = false
}: MainNavigationProps) {
  const { language, isLatinAmerica } = useLocalization()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, isLoading } = useKindeBrowserClient()
  const isSignedIn = isAuthenticated
  const isLoaded = !isLoading

  // ... getNavigationText ...
  const getNavigationText = () => {
    if (language === 'es') {
      return {
        campaigns: '🤖 Campañas IA',
        membership: '💎 Membresía',
        tools: '🧰 Herramientas IA',
        blog: 'Blog',
        login: 'Iniciar Sesión',
        demo: 'Ver Demo',
        menu: 'Menú'
      }
    } else if (language === 'pt') {
      return {
        campaigns: '🤖 Campanhas IA',
        membership: '💎 Assinatura',
        tools: '🧰 Ferramentas IA',
        blog: 'Blog',
        login: 'Entrar',
        demo: 'Ver Demo',
        menu: 'Menu'
      }
    } else {
      return {
        campaigns: '🤖 AI Campaigns',
        membership: '💎 Membership',
        tools: '🧰 AI Tools',
        blog: 'Blog',
        login: 'Sign In',
        demo: 'View Demo',
        menu: 'Menu'
      }
    }
  }

  const text = getNavigationText()

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container mx-auto px-4">
        <nav className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link className="flex items-center space-x-2" href="/">
            <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">RC</span>
            </div>
            <span className="font-bold text-foreground">Red Creativa Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Country/Currency Selector */}
            {showCountrySelector && (
              <div className="flex items-center space-x-2">
                <HeaderCountrySelector />
                {showStatusIndicator && (
                  <CountryStatusIndicator />
                )}
              </div>
            )}

            {/* Navigation Links */}


            <Link
              prefetch={false}
              href="/planes"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {text.membership}
            </Link>

            <Link
              prefetch={false}
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {text.tools}
            </Link>

            <Link
              prefetch={false}
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {text.blog}
            </Link>

            {/* Mode Toggle */}
            <ModeToggle />

            {/* Language Slider */}
            <LanguageSlider className="ml-2" />



            {(!isLoaded || !isSignedIn) && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/api/auth/login">
                    {text.login}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/api/auth/register">
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            {isLoaded && isSignedIn && (
              <CustomUserMenu />
            )}

            <Button asChild>
              <Link href="/dashboard" prefetch={false}>
                {text.demo}
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {showCountrySelector && (
              <HeaderCountrySelector />
            )}

            <ModeToggle />

            {/* Language Slider for Mobile */}
            <LanguageSlider className="ml-1" />

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label={text.menu}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="space-y-2">
              {showCountrySelector && (
                <div className="px-4 py-2 border-b border-border mb-2">
                  <HeaderCountrySelector />
                  {showStatusIndicator && (
                    <div className="mt-2">
                      <CountryStatusIndicator />
                    </div>
                  )}
                </div>
              )}



              <Link
                href="/planes"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text.membership}
              </Link>

              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text.tools}
              </Link>

              <Link
                href="/blog"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text.blog}
              </Link>

              {isLoaded && !isSignedIn && (
                  <Button variant="ghost" asChild className="w-full justify-start px-4">
                    <Link
                      href="/api/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {text.login}
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start px-4 mt-2">
                    <Link
                      href="/api/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </Button>
              )}

              {isLoaded && isSignedIn && (
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Perfil</span>
                  <CustomUserMenu />
                </div>
              )}

              <div className="px-4 mt-4">
                <Button asChild className="w-full">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {text.demo}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Regional Banner for Latin America */}
      {isLatinAmerica && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center py-1 text-xs">
          {language === 'es' ?
            '🌎 Precios y métodos de pago localizados para Latinoamérica' :
            language === 'pt' ?
              '🌎 Preços e métodos de pagamento localizados para a América Latina' :
              '🌎 Localized pricing and payment methods for Latin America'
          }
        </div>
      )}
    </header>
  )
}

/**
 * Simplified Navigation for specific pages
 */
export function SimpleNavigation({ className = '' }: { className?: string }) {
  return (
    <MainNavigation
      className={className}
      showCountrySelector={true}
      showStatusIndicator={false}
    />
  )
}

/**
 * Admin Navigation with detailed status
 */
export function AdminNavigation({ className = '' }: { className?: string }) {
  return (
    <MainNavigation
      className={className}
      showCountrySelector={true}
      showStatusIndicator={true}
    />
  )
}