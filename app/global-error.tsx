'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('🔴 GLOBAL ERROR CAUGHT:', error)
    console.error('🔴 Stack:', error.stack)
    // Optional: Log to error reporting service directly here
  }, [error])

  return (
    <html>
      <body className="bg-black text-white font-sans">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Critical Application Error</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto max-w-full text-xs text-red-200 mb-6">
            {error.message}
            {'\n'}
            {error.stack}
          </pre>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
