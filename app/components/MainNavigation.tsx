'use client'

import React, { useState } from 'react'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser
} from '@clerk/nextjs'

import Link from 'next/link'
import { HeaderCountrySelector, CountryStatusIndicator } from './HeaderCountrySelector'
import { useLocalization } from '@/app/contexts/LocalizationContext'

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
  const { isSignedIn, isLoaded } = useUser()

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
    <header className={`sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur ${className}`}>
      <div className="container mx-auto px-4">
        <nav className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link className="flex items-center space-x-2" href="/">
            <div className="h-6 w-6 rounded-sm bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">RC</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Red Creativa Pro</span>
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
              href="/correos-ia"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              {text.campaigns}
            </Link>

            <Link
              prefetch={false}
              href="/planes"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              {text.membership}
            </Link>

            <Link
              prefetch={false}
              href="/herramientas-ia-copywriting"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              {text.tools}
            </Link>

            <Link
              prefetch={false}
              href="/blog"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              {text.blog}
            </Link>

            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                  {text.login}
                </button>
              </SignInButton>
            )}

            {isLoaded && isSignedIn && (
              <UserButton />
            )}

            <Link
              prefetch={false}
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {text.demo}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {showCountrySelector && (
              <HeaderCountrySelector />
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="space-y-2">
              {showCountrySelector && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                  <HeaderCountrySelector />
                  {showStatusIndicator && (
                    <div className="mt-2">
                      <CountryStatusIndicator />
                    </div>
                  )}
                </div>
              )}

              <Link
                href="/correos-ia"
                className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text.campaigns}
              </Link>

              <Link
                href="/planes"
                className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text.membership}
              </Link>

              <Link
                href="/herramientas-ia-copywriting"
                className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text.tools}
              </Link>

              <Link
                href="/blog"
                className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text.blog}
              </Link>

              {isLoaded && !isSignedIn && (
                <div className="px-4 py-2">
                  <SignInButton mode="modal">
                    <button
                      className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors w-full text-left"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {text.login}
                    </button>
                  </SignInButton>
                </div>
              )}

              {isLoaded && isSignedIn && (
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Perfil</span>
                  <UserButton />
                </div>
              )}

              <Link
                href="/dashboard"
                className="block mx-4 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text.demo}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Regional Banner for Latin America */}
      {isLatinAmerica && (
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-center py-1 text-xs">
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