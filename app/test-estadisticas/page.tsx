'use client'

import { useAuth } from '../hooks/useAuth'

export default function TestEstadisticas() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1>Test Estadisticas Page</h1>
      <p>User: {user?.email || 'No user'}</p>
      <p>Auth status: {loading ? 'Loading' : user ? 'Authenticated' : 'Not authenticated'}</p>
    </div>
  )
}