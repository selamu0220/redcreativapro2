'use client'

import { useState } from 'react'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'

export function SimpleMainNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <header className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-sm bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">RC</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">Red Creativa Pro</span>
            </Link>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-sm bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">RC</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Red Creativa Pro</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">BETA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Blog
            </Link>
            <Link href="/herramientas-ia-copywriting" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              🧰 Herramientas IA
            </Link>
            <Link href="/planes" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              💎 Membresía
            </Link>
            
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Iniciar Sesión
                </button>
              </SignInButton>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            <Link href="/blog" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Blog
            </Link>
            <Link href="/herramientas-ia-copywriting" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600">
              🧰 Herramientas IA
            </Link>
            <Link href="/planes" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600">
              💎 Membresía
            </Link>
            {isSignedIn ? (
              <Link href="/dashboard" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600">
                Dashboard
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full text-left py-2 text-blue-600 font-medium">
                  Iniciar Sesión
                </button>
              </SignInButton>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
