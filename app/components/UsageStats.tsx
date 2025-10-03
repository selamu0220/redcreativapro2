'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import RegisterUserButton from './RegisterUserButton'
import { getUserByEmailAsync } from '../lib/database'

interface UsageStatsData {
  totalGenerations: number
  generationsToday: number
  dailyLimit: number
  subscriptionStatus: string
  lastGenerationAt: string | null
  dailyTextsGenerated?: number
  dailyEmailsSent?: number
  dailyPrompts?: number
  last30DaysTextsGenerated?: number
  last30DaysEmailsSent?: number
  last30DaysPrompts?: number
}

export default function UsageStats() {
  const { user, supabaseUser } = useAuth()
  const [stats, setStats] = useState<UsageStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [localUser, setLocalUser] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  const checkLocalUser = async () => {
    try {
      if (supabaseUser?.email) {
        const localDbUser = await getUserByEmailAsync(supabaseUser.email)
        setLocalUser(localDbUser)
      } else {
        setLocalUser(null)
      }
    } catch (err) {
      console.error('Error al verificar usuario local:', err)
      setLocalUser(null)
    }
  }

  const fetchUsageStats = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Construir información de depuración detallada
      const debug = {
        authenticated: !!supabaseUser,
        email: supabaseUser?.email || null,
        user: localUser,
        error: null
      }
      
      setDebugInfo(debug)
      console.log('Debug info:', debug)
      
      const response = await fetch('/api/usage-stats')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar estadísticas')
      }
      
      setStats(data)
      
      // Actualizar debug con datos de stats si existen
      if (data) {
        setDebugInfo((prev: any) => ({
          ...prev,
          stats: {
            totalGenerations: data.totalGenerations,
            generationsToday: data.generationsToday,
            dailyLimit: data.dailyLimit,
            subscriptionStatus: data.subscriptionStatus
          } as UsageStatsData
        }))
      }
    } catch (err: any) {
      console.error('Error al obtener estadísticas:', err)
      setError(`Error al cargar estadísticas: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (supabaseUser?.email) {
      checkLocalUser()
      fetchUsageStats()
    } else {
      setLoading(false)
      setError('No hay usuario autenticado')
      checkLocalUser()
    }
  }, [supabaseUser])

  // Refrescar estadísticas cada 30 segundos
  useEffect(() => {
    if (supabaseUser?.email) {
      const interval = setInterval(fetchUsageStats, 30000)
      return () => clearInterval(interval)
    }
  }, [supabaseUser])

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 animate-fade-in-up">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
          <span className="text-zinc-400 text-lg">Cargando estadísticas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-zinc-900 border border-red-800 rounded-xl p-8 animate-fade-in-up">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error al cargar estadísticas</h3>
          <p className="text-red-400 mb-2">{error}</p>
          {user?.email && (
            <p className="text-zinc-400 text-sm mb-4">
              Usuario: {user.email}
            </p>
          )}
          {!user?.email && (
            <>
              <p className="text-yellow-400 text-sm mb-4">
                ⚠️ No se detectó email de usuario
              </p>
              <RegisterUserButton />
            </>
          )}
          {debugInfo && (
            <div className="bg-zinc-800 rounded-lg p-4 mb-4 text-xs text-left max-w-md mx-auto">
              <h4 className="font-medium text-zinc-300 mb-2">Información de debug:</h4>
              <div className="space-y-1">
                <p><span className="font-medium">Autenticado:</span> {debugInfo.authenticated ? 'Sí' : 'No'}</p>
                <p><span className="font-medium">Email:</span> {debugInfo.email || 'No disponible'}</p>
                <p><span className="font-medium">Usuario BD:</span> {debugInfo.user ? 'Encontrado' : 'No encontrado'}</p>
                <p><span className="font-medium">Error:</span> {debugInfo.error || 'Ninguno'}</p>
              </div>
            </div>
          )}
          <button 
          onClick={fetchUsageStats}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          🔄 Reintentar
        </button>
        <button 
          onClick={async () => {
            if (!supabaseUser?.email) {
              setError('No se puede registrar: el usuario no tiene email');
              return;
            }
            try {
              const response = await fetch('/api/register-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: supabaseUser.email, subscriptionStatus: 'free' })
              });
              const data = await response.json();
              if (response.ok) {
                const localDbUser = await getUserByEmailAsync(supabaseUser.email);
                setLocalUser(localDbUser);
                setError('Usuario registrado exitosamente');
                fetchUsageStats();
              } else {
                setError(`Error al registrar: ${data.error}`);
              }
            } catch (err: any) {
              setError(`Error al registrar: ${err.message}`);
            }
          }}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg ml-3"
        >
          ✅ Registrar Usuario
        </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 animate-fade-in-up">
        <div className="text-center">
          <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
            <span className="text-zinc-400 text-xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Sin datos disponibles</h3>
          <p className="text-zinc-400">No se encontraron estadísticas para mostrar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-2xl font-bold text-white mb-2">Panel de Estadísticas</h2>
          <p className="text-zinc-400">Monitorea tu actividad en tiempo real</p>
        </div>
        <button 
          onClick={fetchUsageStats}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105 hover:shadow-lg animate-fade-in-up"
          style={{animationDelay: '0.2s'}}
        >
          <span>🔄</span>
          <span>Actualizar</span>
        </button>
      </div>
      


       {/* Estadísticas Diarias */}
       <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
         <div className="flex items-center mb-6">
           <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
           <h3 className="text-xl font-semibold text-white">Actividad de Hoy</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{animationDelay: '0.4s'}}>
             <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
               <span className="text-blue-400 text-lg">✍️</span>
             </div>
             <div className="text-2xl font-bold text-white mb-1">{stats?.dailyTextsGenerated || 0}</div>
             <div className="text-zinc-400 text-sm font-medium">Textos generados</div>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{animationDelay: '0.5s'}}>
             <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
               <span className="text-green-400 text-lg">📧</span>
             </div>
             <div className="text-2xl font-bold text-white mb-1">{stats?.dailyEmailsSent || 0}</div>
             <div className="text-zinc-400 text-sm font-medium">Correos enviados</div>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{animationDelay: '0.6s'}}>
             <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
               <span className="text-purple-400 text-lg">💬</span>
             </div>
             <div className="text-2xl font-bold text-white mb-1">{stats?.dailyPrompts || 0}</div>
             <div className="text-zinc-400 text-sm font-medium">Prompts utilizados</div>
           </div>
         </div>
       </div>

       {/* Estadísticas de 30 días */}
       <div className="animate-fade-in-up" style={{animationDelay: '0.7s'}}>
         <div className="flex items-center mb-6">
           <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></span>
           <h3 className="text-xl font-semibold text-white">Últimos 30 Días</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{animationDelay: '0.8s'}}>
             <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
               <span className="text-blue-400 text-lg">📈</span>
             </div>
             <div className="text-2xl font-bold text-white mb-1">{stats?.last30DaysTextsGenerated?.toLocaleString() || '0'}</div>
             <div className="text-zinc-400 text-sm font-medium">Textos generados</div>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{animationDelay: '0.9s'}}>
             <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
               <span className="text-green-400 text-lg">📊</span>
             </div>
             <div className="text-2xl font-bold text-white mb-1">{stats?.last30DaysEmailsSent?.toLocaleString() || '0'}</div>
             <div className="text-zinc-400 text-sm font-medium">Correos enviados</div>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{animationDelay: '1s'}}>
             <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
               <span className="text-purple-400 text-lg">💭</span>
             </div>
             <div className="text-2xl font-bold text-white mb-1">{stats?.last30DaysPrompts?.toLocaleString() || '0'}</div>
             <div className="text-zinc-400 text-sm font-medium">Prompts utilizados</div>
           </div>
         </div>
       </div>
     </div>
  )
}