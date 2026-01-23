'use client'

import { useState, useEffect } from 'react'

export default function TestIsolated() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    setMessage('Isolated test working!')
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test Isolated</h1>
      <div className="bg-zinc-900 p-6 rounded-lg">
        <p>{message}</p>
      </div>
    </div>
  )
}