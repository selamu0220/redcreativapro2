'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Importar SimpleMainNavigation dinámicamente para evitar problemas de SSR
const SimpleMainNavigation = dynamic(
  () => import('./SimpleMainNavigation').then(mod => ({ default: mod.SimpleMainNavigation })),
  {
    ssr: false,
    loading: () => (
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
)

export function SafeNavigation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
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

  return <SimpleMainNavigation />
}
