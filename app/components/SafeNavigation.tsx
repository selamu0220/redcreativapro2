'use client'

import { Suspense } from 'react'
import { SimpleMainNavigation } from './SimpleMainNavigation'
import Link from 'next/link'

function NavigationFallback() {
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

export function SafeNavigation() {
  return (
    <Suspense fallback={<NavigationFallback />}>
      <SimpleMainNavigation />
    </Suspense>
  )
}
