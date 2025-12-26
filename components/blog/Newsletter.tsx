'use client'

import React, { useState } from 'react'
import { Mail, Send, CheckCircle, Award } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

interface NewsletterProps {
  compact?: boolean
}

export default function Newsletter({ compact = false }: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubscribed(true)
    setIsLoading(false)
    setEmail('')
  }

  if (isSubscribed) {
    return (
      <div className={`${compact ? 'p-4' : 'p-8'} bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800 rounded-3xl text-center`}>
        <CheckCircle size={compact ? 32 : 64} className="text-green-400 mx-auto mb-4" />
        <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-black text-white mb-2 italic uppercase`}>¡Listo!</h3>
        <p className="text-green-300 text-sm font-bold">
          Ya eres parte de la élite.
        </p>
      </div>
    )
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu mejor email"
            className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-2xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full rounded-2xl h-12 font-black tracking-widest uppercase italic shadow-lg shadow-primary/20"
        >
          {isLoading ? '...' : 'Suscribirse'}
        </Button>
      </form>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden group">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center rotate-3">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-sm font-black text-primary uppercase tracking-widest">Newsletter VIP</span>
          </div>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tighter italic uppercase">
            Únete a nuestra <br /> <span className="text-primary">lista de élite</span>
          </h3>
          <p className="text-zinc-400 text-lg font-bold leading-relaxed max-w-md">
            Recibe estrategias avanzadas de IA y contenido exclusivo que no compartimos en el blog.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Tu correo profesional</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@empresa.com"
                className="w-full pl-16 pr-6 py-5 bg-black border-2 border-zinc-800 rounded-3xl text-white text-lg placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xl"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-8 rounded-3xl text-xl font-black uppercase tracking-widest italic group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center gap-3">
              {isLoading ? 'Enviando...' : 'Obtener acceso VIP'}
              {!isLoading && <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
          <p className="text-center text-xs text-zinc-500 font-bold tracking-tight">
            Cero spam. Solo valor. Cancela cuando quieras con un clic.
          </p>
        </form>
      </div>
    </div>
  )
}
