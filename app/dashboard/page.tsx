'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useOptimizedAuth } from '../hooks/useOptimizedAuth'
import { useGuestTrial } from '../hooks/useGuestTrial'
import { usePremiumAccess } from '../hooks/usePremiumAccess'
import GuestTrialInterface from '../components/GuestTrialInterface'
import VideoModal from '../components/VideoModal'

export default function DashboardPage() {
  const { user, isInitializing } = useAuth()
  const { isTrialActive, timeRemainingSeconds, stopGuestTrial, startGuestTrial, canStartTrial } = useGuestTrial()
  const { isPremium, loading: premiumLoading } = usePremiumAccess()
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Función para obtener el saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) {
      return 'Buenos días'
    } else if (hour >= 12 && hour < 20) {
      return 'Buenas tardes'
    } else {
      return 'Buenas noches'
    }
  }

  // Función para obtener el nombre del usuario
  const getUserName = () => {
    if (!user) return ''
    
    // Si hay nombre en metadata, usar las primeras dos sílabas
    if (user.user_metadata?.name) {
      const name = user.user_metadata.name
      const firstTwoSyllables = name.substring(0, 4)
      return firstTwoSyllables.charAt(0).toUpperCase() + firstTwoSyllables.slice(1).toLowerCase()
    }
    
    // Si hay full_name en metadata, usar las primeras dos sílabas
    if (user.user_metadata?.full_name) {
      const fullName = user.user_metadata.full_name
      const firstTwoSyllables = fullName.substring(0, 4)
      return firstTwoSyllables.charAt(0).toUpperCase() + firstTwoSyllables.slice(1).toLowerCase()
    }
    
    // Si solo hay email, usar las primeras dos sílabas del email
    if (user.email) {
      const emailPrefix = user.email.split('@')[0]
      const firstTwoSyllables = emailPrefix.substring(0, 4)
      return firstTwoSyllables.charAt(0).toUpperCase() + firstTwoSyllables.slice(1).toLowerCase()
    }
    
    return 'Usuario'
  }

  useEffect(() => {
    setIsHydrated(true)
    // Give time for useGuestTrial to initialize
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Solo redirigir si la autenticación ha terminado de inicializar Y no hay usuario Y no hay prueba activa
    // Dar más tiempo para la inicialización
    if (!isInitializing && isHydrated && !isLoading) {
      if (!user && !isTrialActive) {
        console.log('Redirecting: no user and no trial active', { user: !!user, isTrialActive, isInitializing })
        // Redirigir a auth con redirect parameter para volver aquí
        const currentPath = window.location.pathname + window.location.search
        const redirectUrl = encodeURIComponent(currentPath)
        router.push(`/auth?redirect=${redirectUrl}`)
      } else {
        console.log('Access granted:', { user: !!user, isTrialActive, isInitializing })
      }
    }
  }, [user, isTrialActive, router, isHydrated, isLoading, isInitializing])

  if (!isHydrated || isLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isInitializing ? 'Verificando autenticación...' : 'Cargando dashboard...'}
          </p>
        </div>
      </div>
    )
  }

  const tools = [
    {
      id: 'escritor-ia',
      name: 'Escritor IA',
      description: 'Mejora tu texto en tiempo real con IA controlada',
      icon: '🤖',
      color: 'from-purple-500 to-purple-700',
      href: '/escritor-ia',
      premium: true,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    },
    {
      id: 'correos-ia',
      name: 'Correos IA',
      description: 'Genera correos personalizados con inteligencia artificial',
      icon: '📧',
      color: 'from-blue-500 to-blue-700',
      href: '/correos-ia',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    },
    {
      id: 'documentos',
      name: 'Mis Documentos',
      description: 'Gestiona y organiza todos tus documentos',
      icon: '📄',
      color: 'from-green-500 to-green-700',
      href: '/documentos',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    },
    {
      id: 'prompts',
      name: 'Prompts',
      description: 'Biblioteca de prompts optimizados para IA',
      icon: '⚡',
      color: 'from-yellow-500 to-yellow-700',
      href: '/prompts',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    },
    {
      id: 'estadisticas',
      name: 'Estadísticas',
      description: 'Analiza tu uso y productividad',
      icon: '📊',
      color: 'from-indigo-500 to-indigo-700',
      href: '/estadisticas',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    },
    {
      id: 'email-pages',
      name: 'Tu Página de Captura',
      description: 'Gestiona tu página única de captura de emails con cuestionarios personalizados',
      icon: '📧',
      color: 'from-orange-500 to-orange-700',
      href: '/dashboard/email-pages',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    },
    {
      id: 'contactos',
      name: 'Contactos',
      description: 'Gestiona tu base de datos de contactos',
      icon: '👥',
      color: 'from-teal-500 to-teal-700',
      href: '/contactos',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    },
    {
      id: 'lead-magnets',
      name: 'Lead Magnets',
      description: 'Crea archivos de valor para capturar emails con preferencias de suscripción',
      icon: '🧲',
      color: 'from-pink-500 to-pink-700',
      href: '/lead-magnets',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    },
    {
      id: 'voice-guide',
      name: 'Guía de Voz IA',
      description: 'Asistente de voz inteligente con explicaciones interactivas',
      icon: '🎤',
      color: 'from-violet-500 to-violet-700',
      href: '/voice-guide',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    },
    {
      id: 'ajustes',
      name: 'Configuración',
      description: 'Personaliza tu experiencia',
      icon: '⚙️',
      color: 'from-gray-500 to-gray-700',
      href: '/ajustes',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA' // Video de presentación de Red Creativa Pro
    }
  ]

  const handleToolClick = (tool: typeof tools[0]) => {
    if (user || isTrialActive) {
      router.push(tool.href)
    } else if (canStartTrial) {
      // Iniciar prueba gratuita automáticamente
      console.log('Starting guest trial from dashboard for tool:', tool.name)
      startGuestTrial()
      // Pequeño delay para que se active la prueba antes de navegar
      setTimeout(() => {
        router.push(tool.href)
      }, 100)
    } else {
      router.push('/auth')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Guest Trial Interface */}
      {!user && isTrialActive && (
        <GuestTrialInterface
          toolName="Dashboard"
          onClose={() => {
            stopGuestTrial()
            router.push('/')
          }}
        >
          <div></div>
        </GuestTrialInterface>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2 hover:scale-105 transition-transform duration-200" href="/">
              <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="hidden font-bold sm:inline-block hover:text-primary transition-colors duration-200">Red Creativa Pro</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">{getGreeting()}, {getUserName()}</span>
                  <Link
                    href="/planes"
                    className="text-sm font-medium text-primary transition-all duration-200 hover:text-primary/80 hover:scale-105 flex items-center"
                  >
                    <span className="mr-1">💎</span>
                    Planes
                  </Link>
                  <Link
                    href="/auth"
                    className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
                  >
                    Cerrar Sesión
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-sm text-green-500 font-medium">🎯 Modo Prueba Activo</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(timeRemainingSeconds / 60)}:{(timeRemainingSeconds % 60).toString().padStart(2, '0')} restantes
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Upgrade Banner for Free Users */}
        {user && !isPremium && !premiumLoading && (
          <div className="mb-8 p-8 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl shadow-2xl border-2 border-yellow-300">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl animate-bounce">💎</div>
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">🚀 Desbloquea todas las funciones premium</h3>
                  <p className="text-lg text-white/90 drop-shadow">✨ Accede a herramientas avanzadas de IA y envíos ilimitados</p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center lg:justify-start">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">🤖 IA Avanzada</span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">📧 Envíos Ilimitados</span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">⚡ Prioridad Alta</span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">🎯 Soporte Premium</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/planes"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-white to-yellow-50 px-8 py-4 text-lg font-bold text-orange-600 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:from-yellow-50 hover:to-white group"
                >
                  <span className="mr-3 text-2xl group-hover:animate-pulse">⚡</span>
                  Actualizar a Premium
                  <span className="ml-2 text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                </Link>
                <Link
                  href="/subscription"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white/50 px-6 py-3 text-white font-medium transition-all duration-300 hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
                >
                  Ver más detalles
                </Link>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-white/80 text-sm">💳 Pago seguro con Stripe • Cancela cuando quieras</p>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {user ? `${getGreeting()}, ${getUserName()}` : '🚀 Dashboard de Prueba'}
            </h1>
            <p className="text-muted-foreground">
              {user 
                ? 'Accede a todas tus herramientas de IA desde aquí'
                : 'Tienes acceso completo a todas las herramientas durante tu prueba'
              }
            </p>
          </div>
          {user && !isPremium && !premiumLoading && (
            <Link
              href="/planes"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <span className="mr-2">⚡</span>
              Actualizar a Premium
            </Link>
          )}
        </div>

        {/* Trial Status */}
        {!user && isTrialActive && (
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">⏰ Prueba Gratuita Activa</h3>
              <span className="text-sm font-mono bg-primary/20 px-2 py-1 rounded">
                {Math.floor(timeRemainingSeconds / 60)}:{(timeRemainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeRemainingSeconds / 180) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Aprovecha al máximo tu tiempo de prueba. ¡Regístrate para acceso ilimitado!
            </p>
          </div>
        )}

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative p-6">
                <div className="flex items-center mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${tool.color} text-white text-2xl mr-4`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                      {tool.name}
                    </h3>
                    {tool.premium && !user && (
                      <span className="inline-block px-2 py-1 text-xs bg-primary/20 text-primary rounded-full mt-1">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>
                
                {/* Video Tutorial Button */}
                <div className="mb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowVideoModal(true)
                    }}
                    className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors duration-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 hover:border-red-300"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="font-medium">📺 Ver Tutorial</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {user ? 'Acceso completo' : isTrialActive ? 'Disponible en prueba' : 'Requiere registro'}
                  </span>
                  <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform duration-200">
                    <span className="text-sm font-medium mr-1">Abrir</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="mt-12 text-center">
            <div className="mx-auto max-w-2xl rounded-lg border bg-primary/5 p-8">
              <h3 className="text-2xl font-semibold mb-4">
                🎯 ¿Te gusta lo que ves?
              </h3>
              <p className="text-muted-foreground mb-6">
                Regístrate gratis para obtener acceso completo y sin límites de tiempo a todas las herramientas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-all duration-200 hover:bg-primary/90 hover:scale-105"
                >
                  🚀 Registrarse Gratis
                </Link>
                <Link
                  href="/planes"
                  className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted hover:scale-105"
                >
                  💎 Ver Planes Premium
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Modal de Video */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoId="k5OYlxYdIuA"
        title="Introducción a Red Creativa Pro"
      />
    </div>
  )
}