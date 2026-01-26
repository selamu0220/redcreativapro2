'use client'

import React from 'react'
import Link from 'next/link'

export default function HomePageClient() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <div className="border border-green-500 bg-green-900/20 p-8 rounded-lg max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-green-400">DEBUG MODE ACTIVATED</h1>
        <p className="text-xl mb-6">
          Si ves esta pantalla, significa que el error <strong>NO</strong> está en el Layout global ni en los Providers.
        </p>
        <p className="text-lg text-gray-300 mb-8">
          El error "Cannot access 'O' before initialization" está ocurriendo dentro de uno de los componentes eliminados de esta página.
        </p>

        <div className="bg-black/50 p-4 rounded text-left font-mono text-sm mb-6">
          <p className="text-yellow-400">Status: WORKING</p>
          <p className="text-blue-400">Next Step: Restore components one by one.</p>
        </div>

        <Link href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
          Ir al Dashboard
        </Link>
      </div>
    </div>
  )
}
