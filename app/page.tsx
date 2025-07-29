'use client'

import Link from 'next/link'
import { useAuth } from './hooks/useAuth'
import { useEffect, useState } from 'react'
import ProtectedRoute from './components/ProtectedRoute'

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <span className="text-black font-bold text-sm">RC</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">Red Creativa Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Reserva tu lugar
              </Link>
              <Link
                href="/auth"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Registrarse Gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Alex Hormozi Style */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          {/* Urgency Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-full text-destructive text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse"></span>
            ⚡ LÍMITE DE 500 USUARIOS - Quedan pocos lugares
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Escribe y la IA
            <br />
            <span className="text-primary">Te Mejora en Tiempo Real</span>
            <br />
            <span className="text-muted-foreground text-3xl md:text-4xl">Según TUS Prompts</span>
          </h1>
          
          {/* Value Proposition */}
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            <strong className="text-foreground">¿Cansado de que la IA invente lo que se le ocurre?</strong>
            <br />
            Tú escribes, tú controlas cómo la IA mejora tu texto. Sin perder tu estilo ni tu mensaje.
          </p>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 mb-12 text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">500</div>
              <div className="text-sm">Límite de usuarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-sm">Control sobre la IA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">0.2s</div>
              <div className="text-sm">Tiempo de respuesta</div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mb-16">
            <Link
              href="/auth"
              className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🚀 EMPEZAR GRATIS AHORA
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-sm text-muted-foreground mt-3">
              ✅ Sin tarjeta de crédito • ✅ Acceso inmediato • ✅ Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-8">
                ¿Te suena familiar?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-destructive-foreground text-sm">✗</span>
                  </div>
                  <p className="text-muted-foreground">La IA inventa contenido que no querías</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-destructive-foreground text-sm">✗</span>
                  </div>
                  <p className="text-muted-foreground">Pierdes tu estilo personal al usar IA</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-destructive-foreground text-sm">✗</span>
                  </div>
                  <p className="text-muted-foreground">No tienes control sobre las mejoras</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-destructive-foreground text-sm">✗</span>
                  </div>
                  <p className="text-muted-foreground">El contenido se nota que está hecho con IA</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-8">
                <span className="text-primary">Ahora imagina esto:</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground text-sm">✓</span>
                  </div>
                  <p className="text-muted-foreground">Tú escribes, la IA solo mejora según TUS instrucciones</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground text-sm">✓</span>
                  </div>
                  <p className="text-muted-foreground">Mantienes tu estilo y personalidad</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground text-sm">✓</span>
                  </div>
                  <p className="text-muted-foreground">Control total sobre las mejoras en tiempo real</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground text-sm">✓</span>
                  </div>
                  <p className="text-muted-foreground">Contenido auténtico que no se nota artificial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Stack Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Lo que obtienes <span className="text-primary">GRATIS</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Herramientas profesionales sin límites
          </p>
          
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="text-left">
                  <h3 className="font-semibold text-card-foreground">🤖 Escritor IA Controlado</h3>
                  <p className="text-muted-foreground text-sm">Mejora tu texto en tiempo real según TUS instrucciones</p>
                </div>
                <span className="text-primary font-semibold">✓ Incluido</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="text-left">
                  <h3 className="font-semibold text-card-foreground">📧 Envío de Emails</h3>
                  <p className="text-muted-foreground text-sm">Envía emails directamente desde la plataforma</p>
                </div>
                <span className="text-primary font-semibold">✓ Incluido</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="text-left">
                  <h3 className="font-semibold text-card-foreground">💬 Chat IA Personalizado</h3>
                  <p className="text-muted-foreground text-sm">Conversa con IA usando tus propios prompts</p>
                </div>
                <span className="text-primary font-semibold">✓ Incluido</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="text-left">
                  <h3 className="font-semibold text-card-foreground">⚡ Mejoras Instantáneas</h3>
                  <p className="text-muted-foreground text-sm">Desde 0.2 segundos de respuesta</p>
                </div>
                <span className="text-primary font-semibold">✓ Incluido</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="text-left">
                  <h3 className="font-semibold text-card-foreground">🎯 Control Total</h3>
                  <p className="text-muted-foreground text-sm">Tú decides cómo la IA mejora tu contenido</p>
                </div>
                <span className="text-primary font-semibold">✓ Incluido</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="text-left">
                  <h3 className="font-bold text-card-foreground text-lg">💎 ACCESO COMPLETO</h3>
                  <p className="text-primary font-semibold">Todo incluido, sin límites</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">GRATIS</div>
                  <div className="text-sm text-muted-foreground">Por tiempo limitado</div>
                </div>
              </div>
            </div>
          </div>
          
          <Link
            href="/auth"
            className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl mb-4"
          >
            🎯 RECLAMAR MI ACCESO GRATIS
          </Link>
          <p className="text-sm text-muted-foreground">
            ⏰ Esta oferta expira en 24 horas
          </p>
        </div>
      </section>

      {/* Trustpilot Reviews */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
            Opiniones <span className="text-primary">reales</span> de usuarios
          </h2>
          
          <p className="text-center text-muted-foreground mb-8">
            ¿Ya eres usuario de Red Creativa Pro? Comparte tu experiencia en Trustpilot
          </p>
          
          <div className="flex justify-center mb-12">
            <a 
              href="https://es.trustpilot.com/review/redcreativa.pro" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-[#00b67a] hover:bg-[#00b67a]/90 text-white font-medium rounded-md transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0l2.47 7.59h7.99l-6.47 4.7 2.47 7.59-6.47-4.7-6.47 4.7 2.47-7.59-6.47-4.7h7.99z"/>
              </svg>
              Ver opiniones en Trustpilot
            </a>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-card-foreground mb-4 text-center">
              Lo que hace diferente a nuestra IA
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-primary mr-3 text-xl">✓</span>
                <p className="text-muted-foreground"><strong className="text-foreground">Tú tienes el control</strong> - La IA mejora tu texto según tus instrucciones, no inventa lo que quiere</p>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 text-xl">✓</span>
                <p className="text-muted-foreground"><strong className="text-foreground">Mejoras en tiempo real</strong> - Ves los cambios mientras escribes, sin esperas</p>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 text-xl">✓</span>
                <p className="text-muted-foreground"><strong className="text-foreground">Mantiene tu estilo</strong> - A diferencia de ChatGPT, no genera texto genérico que parece robótico</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-8">
            ¿Listo para <span className="text-primary">tener el control</span> de tu contenido?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Únete a los creadores que ya están mejorando su contenido sin perder su esencia
          </p>
          
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              🚨 PLAZAS LIMITADAS
            </h3>
            <p className="text-muted-foreground mb-6">
              Por razones técnicas, solo podemos aceptar 500 usuarios en total.
              <br />
              <strong className="text-foreground">Quedan pocos espacios disponibles.</strong>
            </p>
            
            <Link
              href="/auth"
              className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xl font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl mb-4"
            >
              🔥 RESERVA TU LUGAR AHORA
            </Link>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✅ Mejoras en tiempo real según tus instrucciones</p>
              <p>✅ Sin compromisos ni tarjeta de crédito</p>
              <p>✅ Envío de emails y chat IA incluidos</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            ⚠️ Advertencia: Una vez que pruebes cómo la IA mejora tu contenido manteniendo tu estilo, no querrás volver atrás.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Red Creativa Pro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

function HomePage() {
  const { user, logout } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show landing page if user is not authenticated
  if (!user) {
    return <LandingPage />
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const tools = [
    {
      name: "Escritor IA",
      description: "Genera y mejora contenido con inteligencia artificial avanzada",
      icon: "✍️",
      href: "/escritor-ia",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Correos IA",
      description: "Redacta emails profesionales automáticamente con contexto",
      icon: "📧",
      href: "/correos-ia",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      name: "Chat IA con Prompts",
      description: "Conversa con IA usando prompts predefinidos y personalizados",
      icon: "💬",
      href: "/prompts",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Estadísticas",
      description: "Visualiza tu actividad y uso de las herramientas en tiempo real",
      icon: "📊",
      href: "/estadisticas",
      gradient: "from-orange-500 to-red-500"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <span className="text-black font-bold text-sm">RC</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">Red Creativa Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/ajustes"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Ajustes
              </Link>
              <Link
                href="/planes"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Planes
              </Link>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{user?.displayName || user?.email}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-border"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 bg-secondary border border-border rounded-full text-muted-foreground text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Potenciado por IA
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Herramientas de IA
              <br />
              <span className="text-muted-foreground">para creativos</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Genera contenido, redacta emails y chatea con IA. 
              Todo lo que necesitas para potenciar tu creatividad.
            </p>
            <div className="mt-8">
              <Link
                href="/escritor-ia"
                className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
              >
                Comenzar ahora
              </Link>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {tools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                className="group bg-card border border-border rounded-lg p-6 hover:bg-accent transition-colors"
              >
                <div className="text-2xl mb-4">{tool.icon}</div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-accent-foreground transition-colors">
                  {tool.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {tool.description}
                </p>
                <div className="inline-flex items-center text-muted-foreground text-sm font-medium group-hover:text-foreground transition-colors">
                  Usar herramienta
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>


        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    return <LandingPage />
  }
  
  return <HomePage />
}