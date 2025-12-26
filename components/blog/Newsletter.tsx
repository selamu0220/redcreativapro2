'use client'

import React, { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'
import posthog from 'posthog-js'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Track newsletter subscription
    posthog.capture('newsletter_subscribed', {
      source: 'blog_newsletter_widget',
      email_domain: email.split('@')[1],
    })

    setIsSubscribed(true)
    setIsLoading(false)
    setEmail('')
  }

  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800 rounded-lg p-8 text-center mobile-spacing">
        <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">¡Suscripción exitosa!</h3>
        <p className="text-green-300">
          Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-gray-900/20 to-gray-900/20 border border-gray-800 rounded-lg p-8 mobile-spacing">
      <div className="text-center mb-6">
        <Mail size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">
          Únete a nuestra newsletter
        </h3>
        <p className="text-zinc-300">
          Recibe los mejores consejos de escritura y las últimas tendencias de IA directamente en tu email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex gap-3">
          <input aria-label="Campo de entrada"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isLoading ? 'Enviando...' : 'Suscribirse'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-500">
          No spam. Puedes cancelar tu suscripción en cualquier momento.
        </p>
      </div>
    </div>
  )
}