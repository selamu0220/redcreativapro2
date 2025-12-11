'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

// Simple wrapper that works with Next.js 15 server components
export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      {children}
    </React.Suspense>
  )
}