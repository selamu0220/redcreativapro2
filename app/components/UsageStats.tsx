'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import RegisterUserButton from './RegisterUserButton'
import { getUserByEmailAsync } from '../lib/database'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'
import { useTranslation } from '../lib/language/context'
import { formatNumber, formatCompactNumber } from '../lib/localization'
import { useLocalization } from '../contexts/LocalizationContext'
import { getCountryDisplayName } from '../lib/geo-detection'

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
  const { user } = useAuth()
  const { t, currentLanguage } = useTranslation('dashboard')
  const [stats, setStats] = useState<UsageStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [localUser, setLocalUser] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const { get } = useAuthenticatedFetch()

  // Localization context
  const { country, language, isLatinAmerica } = useLocalization()

  const checkLocalUser = async () => {
    try {
      if (user?.email) {
        const localDbUser = await getUserByEmailAsync(user.email)
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
        authenticated: !!user,
        email: user?.email || null,
        user: localUser,
        error: null
      }

      setDebugInfo(debug)
      console.log('Debug info:', debug)

      const data = await get('/api/usage-stats')

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
    if (user?.email) {
      checkLocalUser()
      fetchUsageStats()
    } else {
      setLoading(false)
      setError('No hay usuario autenticado')
      checkLocalUser()
    }
  }, [user])

  // Refrescar estadísticas cada 30 segundos
  useEffect(() => {
    if (user?.email) {
      const interval = setInterval(fetchUsageStats, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 animate-fade-in-up">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
          <span className="text-zinc-400 text-lg">{t('loading.statistics')}</span>
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
          <h3 className="text-xl font-semibold text-white mb-2">{t('statistics.errorLoading')}</h3>
          <p className="text-red-400 mb-2">{error}</p>
          {user?.email && (
            <p className="text-zinc-400 text-sm mb-4">
              {t('statistics.email')}: {user.email}
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
              <h4 className="font-medium text-zinc-300 mb-2">{t('statistics.debugInfo')}</h4>
              <div className="space-y-1">
                <p><span className="font-medium">{t('statistics.authenticated')}</span> {debugInfo.authenticated ? t('statistics.yes') : t('statistics.no')}</p>
                <p><span className="font-medium">{t('statistics.email')}</span> {debugInfo.email || t('statistics.notAvailable')}</p>
                <p><span className="font-medium">{t('statistics.userDB')}</span> {debugInfo.user ? t('statistics.found') : t('statistics.notFound')}</p>
                <p><span className="font-medium">{t('statistics.error')}</span> {debugInfo.error || t('statistics.none')}</p>
              </div>
            </div>
          )}
          <button
            onClick={fetchUsageStats}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            {t('statistics.retry')}
          </button>
          <button
            onClick={async () => {
              if (!user?.email) {
                setError('No se puede registrar: el usuario no tiene email');
                return;
              }
              try {
                const response = await fetch('/api/register-user', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: user.email, subscriptionStatus: 'free' })
                });
                const data = await response.json();
                if (response.ok) {
                  const localDbUser = await getUserByEmailAsync(user.email);
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
            {t('statistics.registerUser')}
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
          <h3 className="text-xl font-semibold text-white mb-2">{t('statistics.noDataAvailable')}</h3>
          <p className="text-zinc-400">{t('statistics.noDataDescription')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-white mb-2">{t('statistics.title')}</h2>
          <p className="text-zinc-400">{t('statistics.subtitle')}</p>
        </div>
        <button
          onClick={fetchUsageStats}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105 hover:shadow-lg animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <span>🔄</span>
          <span>{t('statistics.update')}</span>
        </button>
      </div>



      {/* Estadísticas Diarias */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
          <h3 className="text-xl font-semibold text-white">{t('periods.today')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-blue-400 text-lg">✍️</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatNumber(stats?.dailyTextsGenerated || 0, language as any)}</div>
            <div className="text-zinc-400 text-sm font-medium">{t('stats.dailyTextsGenerated')}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-green-400 text-lg">📧</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatNumber(stats?.dailyEmailsSent || 0, language as any)}</div>
            <div className="text-zinc-400 text-sm font-medium">{t('stats.dailyEmailsSent')}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-purple-400 text-lg">💬</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatNumber(stats?.dailyPrompts || 0, language as any)}</div>
            <div className="text-zinc-400 text-sm font-medium">{t('stats.dailyPrompts')}</div>
          </div>
        </div>
      </div>

      {/* Estadísticas de 30 días */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
        <div className="flex items-center mb-6">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></span>
          <h3 className="text-xl font-semibold text-white">{t('periods.last30Days')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-blue-400 text-lg">📈</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatCompactNumber(stats?.last30DaysTextsGenerated || 0, language as any)}</div>
            <div className="text-zinc-400 text-sm font-medium">{t('stats.last30DaysTextsGenerated')}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-green-400 text-lg">📊</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatCompactNumber(stats?.last30DaysEmailsSent || 0, language as any)}</div>
            <div className="text-zinc-400 text-sm font-medium">{t('stats.last30DaysEmailsSent')}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-purple-400 text-lg">💭</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatCompactNumber(stats?.last30DaysPrompts || 0, language as any)}</div>
            <div className="text-zinc-400 text-sm font-medium">{t('stats.last30DaysPrompts')}</div>
          </div>
        </div>
      </div>

      {/* Localization Information */}
      {isLatinAmerica && (
        <div className="animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
          <div className="flex items-center mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
            <h3 className="text-xl font-semibold text-white">Información Regional</h3>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-400 text-lg">🌎</span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {getCountryDisplayName(country as any, language as any)}
                </div>
                <div className="text-zinc-400 text-sm font-medium">País detectado</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-400 text-lg">🕐</span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1]?.replace('_', ' ') || 'Local Time'}
                </div>
                <div className="text-zinc-400 text-sm font-medium">Zona horaria</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 text-lg">🗣️</span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {language === 'es' ? 'Español' : language === 'pt' ? 'Português' : 'English'}
                </div>
                <div className="text-zinc-400 text-sm font-medium">Idioma detectado</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm text-center">
                ✨ Contenido optimizado para Latinoamérica - Plantillas y ejemplos adaptados a tu región
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
