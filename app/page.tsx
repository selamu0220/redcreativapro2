'use client'

import Link from 'next/link'
import { useOptimizedAuth } from './hooks/useOptimizedAuth'
import { useAuth } from './hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import TrialModal from './components/TrialModal'
import TrialInterface from './components/TrialInterface'
import GuestTrialModal from './components/GuestTrialModal'
import GuestTrialInterface from './components/GuestTrialInterface'
import VideoModal from './components/VideoModal'
import ConversionFunnel from './components/ConversionFunnel'
import { useTrialMode } from './hooks/useTrialMode'
import { useGuestTrial } from './hooks/useGuestTrial'
import { usePremiumAccess } from './hooks/usePremiumAccess'
import ThemeToggle from './components/ThemeToggle'
import { MobileContainer, MobileButton } from './components/MobileLayout'
import { Button } from './components/ui/button'
// import TestLocaleCompare from './components/TestLocaleCompare'

function LandingPage() {
  const router = useRouter();
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isGuestTrialModalOpen, setIsGuestTrialModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  const [showTrialInterface, setShowTrialInterface] = useState(false);
  const [showGuestTrialInterface, setShowGuestTrialInterface] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { startTrial, isTrialActive, canUseTrial } = useTrialMode();
  const { startGuestTrial, canStartTrial: canStartGuestTrial } = useGuestTrial();

  const handleTrialClick = (toolName: string) => {
    setSelectedTool(toolName);
    // Primero intentar prueba de invitado (sin registro)
    if (canStartGuestTrial) {
      setIsGuestTrialModalOpen(true);
    } else if (canUseTrial) {
      // Si no puede usar prueba de invitado, ofrecer registro para 7 días
      setIsTrialModalOpen(true);
    } else {
      // Si ya usó ambas pruebas, mostrar mensaje
      alert('Ya has usado tu tiempo de prueba gratuito. Regístrate para continuar con acceso completo.');
    }
  };

  const handleStartTrial = () => {
    startTrial();
    setIsTrialModalOpen(false);
    setShowTrialInterface(true);
  };

  const handleStartGuestTrial = () => {
    startGuestTrial();
    setIsGuestTrialModalOpen(false);
    // Redirigir al dashboard donde están todas las herramientas
    window.location.href = '/dashboard';
  };

  const handleCloseTrialInterface = () => {
    setShowTrialInterface(false);
    setSelectedTool('');
  };

  const handleCloseGuestTrialInterface = () => {
    setShowGuestTrialInterface(false);
    setSelectedTool('');
  };

  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const { user } = useAuth()
  const { isPremium, loading: premiumLoading } = usePremiumAccess()

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        setIsMobile(width < 768)
        setIsTablet(width >= 768 && width < 1024)
      }
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Solo visible en desktop, en móvil se usa MobileNavigation */}
      {!isMobile && !isTablet && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in-up">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-center">
            <nav className="flex items-center space-x-6">
              {/* Logo y nombre */}
              <Link className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200" href="/">
                <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                  <span className="text-primary-foreground font-bold text-xs">RC</span>
                </div>
                <span className="font-bold hover:text-primary transition-colors duration-200">Red Creativa Pro Beta</span>
              </Link>
              
              {/* Botón de Tutorial de YouTube */}
              <button
                onClick={() => setShowVideoModal(true)}
                className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors duration-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 hover:border-red-300"
                title="Ver tutorial de la aplicación"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="font-medium">📺 Tutorial</span>
              </button>
              
              <Link
                href="/correos-ia"
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105 flex items-center gap-1"
              >
                🤖 Campañas IA
              </Link>
              
              <Link
                href="/planes"
                className={`text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
                  user && !isPremium && !premiumLoading
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-semibold hover:from-yellow-500 hover:to-orange-600'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                💎 Planes
              </Link>
              
              {/* Botón de upgrade para usuarios gratuitos */}
              {user && !isPremium && !premiumLoading && (
                <Link
                  href="/planes"
                  className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <span className="mr-2">💎</span>
                  Actualizar a Premium
                </Link>
              )}
              
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-all duration-200 hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Comenzar gratis
              </Link>
              
              <Link
                href="/blog"
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
              >
                Blog
              </Link>
              
              <Link
                href="/auth"
                className="inline-flex h-9 items-center justify-center text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
              >
                Reserva tu lugar
              </Link>
              
              <ThemeToggle />
            </nav>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="w-full flex justify-center relative overflow-hidden">
        <MobileContainer className={`${isMobile || isTablet ? 'pt-4' : ''}`}>
          <div className={`mx-auto flex max-w-[980px] flex-col items-center gap-2 ${isMobile ? 'py-6 px-4' : isTablet ? 'py-8 px-6' : 'py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20'}`}>
          {/* Beta Badge */}
          <div className={`inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium animate-fade-in-up opacity-0 [animation-delay:0.1s] [animation-fill-mode:forwards] hover:scale-105 transition-transform duration-300 ${isMobile ? 'text-xs' : ''}`}>
            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-primary"></span>
            🚀 VERSIÓN BETA - Acceso anticipado disponible
          </div>
          
          {/* Main Headline */}
          <h1 className={`text-center font-bold leading-tight tracking-tighter animate-fade-in-up opacity-0 [animation-delay:0.3s] [animation-fill-mode:forwards] mx-auto ${
            isMobile ? 'text-2xl' : isTablet ? 'text-4xl' : 'text-3xl md:text-6xl lg:leading-[1.1]'
          }`}>
            <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent animate-gradient-x">Red Creativa Pro</span>
            <br/>
            Plataforma Completa de Marketing con IA
          </h1>
          
          {/* Value Proposition */}
          <p className={`max-w-[750px] mx-auto text-center text-muted-foreground animate-fade-in-up opacity-0 [animation-delay:0.5s] [animation-fill-mode:forwards] ${
            isMobile ? 'text-base px-2' : isTablet ? 'text-lg' : 'text-lg sm:text-xl'
          }`}>
            Escritor IA, Correos IA, Chat con Prompts, Gestión de Contactos, Lead Magnets, Páginas de Captura, Estadísticas y más. Todo lo que necesitas para tu marketing digital en una sola plataforma.
          </p>
          
          {/* Email Marketing Features */}
          <div className={`flex w-full items-center justify-center py-4 animate-fade-in-up opacity-0 [animation-delay:0.7s] [animation-fill-mode:forwards] ${
            isMobile ? 'space-x-2 flex-wrap gap-2' : 'space-x-4 md:pb-10'
          }`}>
            <div className="flex flex-col items-center space-y-2 hover:scale-110 transition-transform duration-300 cursor-default">
              <div className={`font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent ${isMobile ? 'text-xl' : 'text-2xl'}`}>IA</div>
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>Escritura inteligente</p>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex flex-col items-center space-y-2 hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Auto</div>
              <div className="text-sm">Envío automático</div>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex flex-col items-center space-y-2 hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">24h</div>
              <p className="text-xs text-muted-foreground">Configuración rápida</p>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="flex flex-col items-center space-y-4 animate-fade-in-up opacity-0 [animation-delay:0.9s] [animation-fill-mode:forwards]">
            <Link
              href="/auth"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 group"
            >
              <span className="group-hover:animate-bounce">🚀</span> Empezar gratis ahora
            </Link>
            <p className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              ✅ Sin tarjeta de crédito • ✅ Acceso inmediato • ✅ Cancela cuando quieras
            </p>
            
            {/* Test Component for LocaleCompare Error - Temporarily disabled */}
            {/* <div className="mt-8 w-full max-w-4xl">
              <TestLocaleCompare />
            </div> */}
          </div>
          </div>
        </MobileContainer>
      </section>

      {/* AI Demo Animation Section */}
      <section className="w-full flex justify-center py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 animate-fade-in-up opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
              Email Marketing <span className="text-primary">Profesional</span>
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed animate-fade-in-up opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards]">
              Transforma emails básicos en comunicaciones profesionales con IA
            </p>
          </div>
          
          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border bg-card text-card-foreground shadow-lg p-6 animate-fade-in-up opacity-0 [animation-delay:0.6s] [animation-fill-mode:forwards]">
              <div className="mb-4 flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm text-muted-foreground">Red Creativa Pro Beta - Escritor IA</span>
              </div>
              
              <div className="space-y-6">
                {/* Original Text */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">Tu email básico:</div>
                  <div className="font-mono text-sm leading-relaxed">
                    <span className="typing-animation opacity-0 [animation-delay:1s] [animation-fill-mode:forwards]">Hola, tenemos una nueva oferta. Es muy buena. Haz clic aquí para verla. Saludos.</span>
                  </div>
                </div>
                
                {/* AI Processing */}
                <div className="flex items-center justify-center py-4 animate-fade-in-up opacity-0 [animation-delay:3s] [animation-fill-mode:forwards]">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.2s]"></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.4s]"></div>
                    <span className="ml-2 text-sm text-primary font-medium">IA mejorando según tus prompts...</span>
                  </div>
                </div>
                
                {/* Improved Text */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 animate-fade-in-up opacity-0 [animation-delay:4.5s] [animation-fill-mode:forwards]">
                  <div className="mb-2 text-sm font-medium text-primary">✨ Email profesional mejorado:</div>
                  <div className="font-mono text-sm leading-relaxed">
                    <span className="typing-animation-improved opacity-0 [animation-delay:5s] [animation-fill-mode:forwards]">Hola [NOMBRE],

Espero que estés bien. Quería compartir contigo una nueva solución que hemos desarrollado.

Hemos trabajado durante meses para crear algo que realmente marque la diferencia en tu día a día.

👉 [BOTÓN: Conocer más detalles]

Si tienes alguna pregunta, no dudes en contactarme.

Saludos cordiales,
[TU NOMBRE]

PD: Si conoces a alguien que pueda estar interesado, siéntete libre de compartir.</span>
                  </div>
                </div>
                
                {/* Control Panel */}
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4 animate-fade-in-up opacity-0 [animation-delay:7s] [animation-fill-mode:forwards]">
                  <div className="mb-2 text-sm font-medium">🎯 Mejoras aplicadas automáticamente:</div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      <span>"Personalización con nombre"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      <span>"Tono profesional y cercano"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                      <span>"Llamada a la acción clara"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                      <span>"Estructura profesional"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center animate-fade-in-up opacity-0 [animation-delay:8s] [animation-fill-mode:forwards]">
              <Link
                href="/auth"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 py-2 text-lg font-medium text-primary-foreground shadow transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group"
              >
                <span className="group-hover:animate-bounce">🚀</span> Probar Red Creativa Pro Beta
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">✅ Acceso beta gratuito • ✅ Sin compromisos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="w-full flex justify-center border-t bg-background py-24 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-in-up opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
                ¿Tu marketing digital no da resultados?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Contenido genérico sin personalización</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.6s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Gestión manual de contactos y leads</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.8s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Falta de páginas de captura profesionales</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.0s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Sin estadísticas ni análisis de rendimiento</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.2s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Herramientas dispersas y costosas</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-in-up opacity-0 [animation-delay:0.3s] [animation-fill-mode:forwards]">
                <span className="text-primary bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">Con Red Creativa Pro obtienes:</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.5s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Escritor IA que mantiene tu estilo único</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.7s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Gestión automática de contactos y leads</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.9s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Páginas de captura profesionales integradas</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.1s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Estadísticas detalladas y análisis en tiempo real</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.3s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Suite completa en una sola plataforma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Stack Section */}
      <section className="w-full flex justify-center py-24 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 animate-fade-in-up opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
              <span className="text-primary">Suite Completa</span> de Marketing con IA
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-12 animate-fade-in-up opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards]">
              Todo lo que necesitas para tu marketing digital: Escritor IA, Correos IA, Gestión de Contactos, Lead Magnets, Páginas de Captura, Estadísticas y más
            </p>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-8 animate-fade-in-up opacity-0 [animation-delay:0.6s] [animation-fill-mode:forwards] hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">✍️</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Escritor IA Profesional</h3>
                      <p className="text-sm text-muted-foreground">Contenido optimizado con inteligencia artificial</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600 hover:scale-105 transition-transform duration-300 inline-block">Plan Pro</span>
                    <p className="text-xs text-green-600 font-medium">Premium</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">📧</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Correos IA Inteligentes</h3>
                      <p className="text-sm text-muted-foreground">Campañas de email marketing automatizadas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">INCLUIDO</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">🎯</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Chat IA con Prompts</h3>
                      <p className="text-sm text-muted-foreground">Conversaciones inteligentes y prompts personalizados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">INCLUIDO</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">👥</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Gestión de Contactos</h3>
                      <p className="text-sm text-muted-foreground">Organiza y segmenta tu base de datos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">INCLUIDO</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">🎁</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Lead Magnets</h3>
                      <p className="text-sm text-muted-foreground">Crea incentivos para capturar leads</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">INCLUIDO</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">🌐</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Páginas de Captura</h3>
                      <p className="text-sm text-muted-foreground">Landing pages profesionales integradas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">INCLUIDO</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">📊</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Estadísticas Avanzadas</h3>
                      <p className="text-sm text-muted-foreground">Análisis detallado de rendimiento</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">INCLUIDO</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">🛡️</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Anti-Spam Garantizado</h3>
                      <p className="text-sm text-muted-foreground">Tus emails llegan a bandeja de entrada, no a spam</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">INCLUIDO</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">⚖️</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Evita Multas por Spam</h3>
                      <p className="text-sm text-muted-foreground">Enlaces de desuscripción automáticos - Evita denuncias y multas millonarias</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">INCLUIDO</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-300 rounded-lg p-2 -m-2 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">💰</span>
                    <div className="text-left">
                      <h3 className="font-bold text-lg hover:text-green-600 transition-colors duration-300">RESULTADOS MEDIBLES</h3>
                      <p className="text-sm text-green-600 font-medium">Métricas claras y mejoras comprobables</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 hover:scale-105 transition-transform duration-300 inline-block">Plan Pro</div>
                    <div className="text-xs text-green-600 font-semibold">Plan completo</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-4 animate-fade-in-up opacity-0 [animation-delay:0.8s] [animation-fill-mode:forwards]">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group"
                >
                  <span className="group-hover:animate-bounce">🎯</span> Comenzar gratis ahora
                </Link>
                <Link
                  href="/planes"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-primary bg-transparent px-8 py-2 text-sm font-medium text-primary shadow transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group"
                >
                  <span className="group-hover:animate-bounce">💎</span> Ver Planes
                </Link>
              </div>
              <p className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                ⚡ Herramientas gratuitas + Escritor IA en Plan Pro
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trial Section */}
      <section className="w-full flex justify-center py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                🚀 <span className="text-primary">Prueba gratis</span> nuestra Plataforma de Marketing IA
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-2">
                Experimenta el poder completo de la IA para marketing digital • Sin registro • Sin tarjeta
              </p>
              <p className="text-sm text-muted-foreground">
                ⏰ Resultados visibles desde el primer uso
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {/* Chat IA */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center transition-all hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Escritor IA</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea contenido profesional optimizado con IA
                </p>
                <Button
                  onClick={() => handleTrialClick('Escritor IA')}
                  className="w-full mb-2"
                >
                  🚀 Probar SIN REGISTRO
                </Button>
                <p className="text-xs text-muted-foreground">3 min/semana • Sin tarjeta</p>
              </div>

              {/* Email Sender */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center transition-all hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <span className="text-3xl">📧</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Correos IA</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Campañas de email marketing automatizadas e inteligentes
                </p>
                <button
                  onClick={() => handleTrialClick('Envío Inteligente')}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-2"
                >
                  🚀 Probar SIN REGISTRO
                </button>
                <p className="text-xs text-muted-foreground">3 min/semana • Sin tarjeta</p>
              </div>

              {/* AI Writer */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center transition-all hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Gestión Completa</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contactos, Lead Magnets, Páginas de Captura y Estadísticas
                </p>
                <Button
                  onClick={() => handleTrialClick('Chat IA y Prompts')}
                  className="w-full mb-2"
                  variant="secondary"
                >
                  🚀 Probar SIN REGISTRO
                </Button>
                <p className="text-xs text-muted-foreground">3 min/semana • Sin tarjeta</p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <div className="mx-auto max-w-2xl rounded-lg border bg-primary/5 p-6 mb-6">
                <h3 className="mb-2 font-semibold">🎯 ¿Por qué 7 días de prueba Pro?</h3>
                <p className="text-sm text-muted-foreground">
                  Es tiempo suficiente para experimentar completamente todas las funciones premium y ver cómo pueden transformar tu productividad. 
                  Si te gusta lo que ves, el registro es 100% gratuito para las herramientas básicas.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/planes')}
                  className="h-12 px-8 text-base font-medium group transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  💎 Ver Planes y Precios
                </Button>
                <Button
                  onClick={() => router.push('/auth')}
                  variant="outline"
                  className="h-12 px-8 text-base font-medium group transition-all duration-300 hover:scale-105 hover:shadow-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  ✨ Registrarse Gratis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trustpilot Reviews */}
      <section className="w-full flex justify-center py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-6">
              Opiniones <span className="text-primary">reales</span> de usuarios
            </h2>
            
            <p className="mx-auto max-w-[700px] text-center text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-8">
              ¿Ya eres usuario de Red Creativa Pro Beta? Comparte tu experiencia en Trustpilot
            </p>
            
            <div className="flex justify-center mb-12">
              <a 
                href="https://es.trustpilot.com/review/redcreativa.pro" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#00b67a] px-6 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-[#00b67a]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l2.47 7.59h7.99l-6.47 4.7 2.47 7.59-6.47-4.7-6.47 4.7 2.47-7.59-6.47-4.7h7.99z"/>
                </svg>
                Ver opiniones en Trustpilot
              </a>
            </div>
            
            <div className="mx-auto max-w-3xl rounded-lg border bg-card text-card-foreground shadow-sm p-8">
              <h3 className="text-2xl font-semibold text-center mb-6">
                Lo que hace diferente a Red Creativa Pro
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Plataforma todo-en-uno</strong> - Escritor IA, Correos IA, Gestión de Contactos, Lead Magnets y más en un solo lugar</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Automatización inteligente</strong> - Campañas de email marketing y páginas de captura que funcionan 24/7</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Estadísticas en tiempo real</strong> - Analiza el rendimiento de tus campañas y optimiza automáticamente</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Mantiene tu estilo único</strong> - La IA se adapta a tu voz y marca personal</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="w-full flex justify-center py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                📚 <span className="text-primary">Blog de IA y Escritura</span>
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Guías, consejos y técnicas para dominar la escritura con inteligencia artificial
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {/* Artículo destacado 1 */}
               <Link
                 href="/blog/como-usar-ia-para-escribir-mejor"
                 className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-lg hover:scale-105"
               >
                 <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                   <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                     <path d="M8,12H16V14H8V12M8,16H13V18H8V16Z" />
                   </svg>
                   <div className="absolute top-4 right-4">
                     <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                       Guía Completa
                     </span>
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                     Cómo usar IA para escribir mejor en 2025
                   </h3>
                   <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                     Descubre las técnicas más efectivas para usar inteligencia artificial en tu escritura sin perder tu estilo personal.
                   </p>
                   <div className="flex items-center text-xs text-muted-foreground">
                     <span>📖 15 min de lectura</span>
                     <span className="mx-2">•</span>
                     <span>✍️ Escritura</span>
                   </div>
                 </div>
               </Link>
              
              {/* Artículo destacado 3 */}
               <Link
                 href="/blog/escritor-ia-gratis-online"
                 className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-lg hover:scale-105"
               >
                 <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                   <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
                     <path d="M9,11H15V13H9V11M9,15H13V17H9V15Z" />
                   </svg>
                   <div className="absolute top-4 right-4">
                     <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                       Herramientas
                     </span>
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                     Escritor IA gratis online: Las mejores opciones
                   </h3>
                   <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                     Comparativa completa de las mejores herramientas de escritura con IA disponibles gratuitamente en 2025.
                   </p>
                   <div className="flex items-center text-xs text-muted-foreground">
                     <span>📖 10 min de lectura</span>
                     <span className="mx-2">•</span>
                     <span>🛠️ Herramientas</span>
                   </div>
                 </div>
               </Link>
              
              {/* Artículo destacado 4 */}
               <Link
                 href="/blog/ia-copywriting-ventas"
                 className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-lg hover:scale-105"
               >
                 <div className="relative h-48 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                   <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
                     <path d="M7,13L9,15L17,7L15.59,5.59L9,12.17L8.41,11.59L7,13Z" />
                   </svg>
                   <div className="absolute top-4 right-4">
                     <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                       Copywriting
                     </span>
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                     IA para copywriting: Textos profesionales
                   </h3>
                   <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                     Estrategias avanzadas para crear copy profesional usando inteligencia artificial de manera efectiva.
                   </p>
                   <div className="flex items-center text-xs text-muted-foreground">
                     <span>📖 18 min de lectura</span>
                     <span className="mx-2">•</span>
                     <span>✍️ Copywriting</span>
                   </div>
                 </div>
               </Link>
              
              {/* Artículo destacado 5 */}
               <Link
                 href="/blog/corrector-gramatica-ia-online"
                 className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-lg hover:scale-105"
               >
                 <div className="relative h-48 bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                   <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                   </svg>
                   <div className="absolute top-4 right-4">
                     <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                       Corrección
                     </span>
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                     Corrector de gramática IA online
                   </h3>
                   <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                     Las mejores herramientas de corrección gramatical con IA para perfeccionar tus textos automáticamente.
                   </p>
                   <div className="flex items-center text-xs text-muted-foreground">
                     <span>📖 8 min de lectura</span>
                     <span className="mx-2">•</span>
                     <span>✅ Corrección</span>
                   </div>
                 </div>
               </Link>
              
              {/* Artículo destacado 6 */}
               <Link
                 href="/blog/mejores-prompts-ia-escritura"
                 className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-lg hover:scale-105"
               >
                 <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                   <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M6.5,12.5L7.5,16.5L11.5,17.5L7.5,18.5L6.5,22.5L5.5,18.5L1.5,17.5L5.5,16.5L6.5,12.5M17.5,12.5L18.5,16.5L22.5,17.5L18.5,18.5L17.5,22.5L16.5,18.5L12.5,17.5L16.5,16.5L17.5,12.5Z" />
                   </svg>
                   <div className="absolute top-4 right-4">
                     <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                       Prompts
                     </span>
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                     Los mejores prompts de IA para escritura
                   </h3>
                   <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                     Colección de prompts probados y optimizados para obtener los mejores resultados en tus textos con IA.
                   </p>
                   <div className="flex items-center text-xs text-muted-foreground">
                     <span>📖 20 min de lectura</span>
                     <span className="mx-2">•</span>
                     <span>🎯 Prompts</span>
                   </div>
                 </div>
               </Link>
            </div>
            
            <div className="text-center">
              <Link
                href="/blog"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                📚 Ver todos los artículos del blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full flex justify-center py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              ¿Listo para <span className="text-primary">revolucionar</span> tu marketing digital?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-12">
              Únete a los empresarios que ya están automatizando su marketing con la plataforma completa de IA
            </p>
            
            <div className="mx-auto max-w-2xl rounded-lg border bg-card text-card-foreground shadow-sm p-8 mb-8">
              <h3 className="text-2xl font-semibold mb-4">
                🚀 COMIENZA HOY MISMO
              </h3>
              <p className="text-muted-foreground mb-2">
                Suite completa de marketing + Herramientas IA avanzadas
              </p>
              <p className="text-muted-foreground mb-6">
                <strong className="text-foreground">Todo lo que necesitas para automatizar tu marketing digital</strong>
              </p>
              
              <div className="rounded-lg bg-muted/50 p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">✅ Gestión de Contactos, Lead Magnets y Páginas de Captura: <span className="font-semibold text-primary">GRATIS</span></p>
                <p className="text-sm text-muted-foreground">💰 Escritor IA y Funciones Avanzadas: <span className="font-semibold text-blue-600">Plan Pro</span></p>
              </div>
              
              <Link
                href="/auth"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 py-2 text-lg font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-6"
              >
                🎯 COMENZAR GRATIS
              </Link>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✅ Plataforma completa de marketing con IA</p>
                <p className="text-sm text-muted-foreground">✅ Sin compromisos ni tarjeta de crédito</p>
                <p className="text-sm text-muted-foreground">✅ Estadísticas y automatización incluidas</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              ⚠️ Advertencia: Una vez que pruebes cómo la IA mejora tu contenido manteniendo tu estilo, no querrás volver atrás.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Red Creativa Pro Beta. Todos los derechos reservados.
          </p>
        </div>
      </footer>
      
      {/* Trial Modal */}
      <TrialModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
        onStartTrial={handleStartTrial}
        toolName={selectedTool}
      />
      
      {/* Guest Trial Modal */}
      <GuestTrialModal
        isOpen={isGuestTrialModalOpen}
        onClose={() => setIsGuestTrialModalOpen(false)}
        onStartTrial={handleStartGuestTrial}
        toolName={selectedTool}
      />
      
      {/* Trial Interface */}
      {showTrialInterface && (
        <TrialInterface
          toolName={selectedTool}
          onClose={handleCloseTrialInterface}
        />
      )}
      
      {/* Guest Trial Interface */}
      {showGuestTrialInterface && (
        <GuestTrialInterface
          toolName={selectedTool}
          onClose={handleCloseGuestTrialInterface}
        >
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4">🚀 ¡Prueba {selectedTool} ahora!</h3>
            <p className="text-muted-foreground mb-4">
              Tienes acceso completo a todas las funciones durante tu tiempo de prueba.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/escritor-ia'}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-all duration-200"
              >
                🖊️ Ir al Escritor IA
              </button>
              <Button
                onClick={() => window.location.href = '/correos-ia'}
                className="w-full py-3"
              >
                📧 Ir al Chat IA
              </Button>
            </div>
          </div>
        </GuestTrialInterface>
      )}
      
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

// Function to extract first two syllables from email
const getNameFromEmail = (email: string): string => {
  if (!email) return 'Usuario'
  
  const username = email.split('@')[0]
  const cleanUsername = username.replace(/[^a-zA-Z]/g, '')
  
  if (cleanUsername.length <= 4) {
    return cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1).toLowerCase()
  }
  
  // Extract first 4 characters as approximation of two syllables
  const name = cleanUsername.substring(0, 4)
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}

function HomePage() {
  const { user, logout } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Función para obtener el saludo basado en la hora actual
  const getTimeBasedGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    
    console.log('⏰ Hora actual:', hour)
    
    if (hour >= 6 && hour < 12) {
      console.log('🌅 Saludo: Buenos días')
      return 'Buenos días'
    } else if (hour >= 12 && hour < 20) {
      console.log('☀️ Saludo: Buenas tardes')
      return 'Buenas tardes'
    } else {
      console.log('🌙 Saludo: Buenas noches')
      return 'Buenas noches'
    }
  }
  
  // Obtener el saludo actual directamente
  const currentGreeting = getTimeBasedGreeting()

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
    return <ConversionFunnel />
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
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in-up">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-card rounded-md flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                <span className="text-card-foreground font-bold text-sm">RC</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground hover:text-primary transition-colors duration-200">Red Creativa Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 text-sm font-medium hover:scale-105"
              >
                Blog
              </Link>
              <Link
                href="/ajustes"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 text-sm font-medium hover:scale-105"
              >
                Ajustes
              </Link>
              <Link
                href="/planes"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 text-sm font-medium hover:scale-105"
              >
                Planes
              </Link>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium hover:text-foreground transition-colors duration-200">{user?.displayName || user?.email}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border border-border hover:scale-105 hover:shadow-lg"
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
              {currentGreeting} {getNameFromEmail(user?.email || '')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {tools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon with background */}
                <div className="relative mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${tool.gradient} text-white text-xl shadow-lg`}>
                    {tool.icon}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {tool.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                  {tool.description}
                </p>
                
                {/* CTA with enhanced styling */}
                <div className="inline-flex items-center text-muted-foreground text-sm font-medium group-hover:text-primary transition-all duration-300">
                  <span className="mr-2">Usar herramienta</span>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted group-hover:bg-primary/10 transition-colors duration-300">
                    <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
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
  const { isTrialActive, timeRemainingSeconds, stopGuestTrial, startGuestTrial, canStartTrial } = useGuestTrial()
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
    return user.user_metadata?.name || 
           user.user_metadata?.full_name || 
           (user.email ? user.email.split('@')[0] : 'Usuario')
  }

  useEffect(() => {
    setIsHydrated(true)
    // Give time for useGuestTrial to initialize
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])
  
  if (!isHydrated || isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? 'Verificando autenticación...' : 'Cargando dashboard...'}
          </p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <LandingPage />
  }

  // Dashboard content for authenticated users
  const dashboardTools = [
    {
      id: 'escritor-ia',
      name: 'Escritor IA',
      description: 'Mejora tu texto en tiempo real con IA controlada',
      icon: '🤖',
      color: 'from-purple-500 to-purple-700',
      href: '/escritor-ia',
      premium: true,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    },
    {
      id: 'correos-ia',
      name: 'Correos IA',
      description: 'Genera correos personalizados con inteligencia artificial',
      icon: '📧',
      color: 'from-blue-500 to-blue-700',
      href: '/correos-ia',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    },
    {
      id: 'documentos',
      name: 'Mis Documentos',
      description: 'Gestiona y organiza todos tus documentos',
      icon: '📄',
      color: 'from-green-500 to-green-700',
      href: '/documentos',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    },
    {
      id: 'prompts',
      name: 'Prompts',
      description: 'Biblioteca de prompts optimizados para IA',
      icon: '⚡',
      color: 'from-yellow-500 to-yellow-700',
      href: '/prompts',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    },
    {
      id: 'estadisticas',
      name: 'Estadísticas',
      description: 'Analiza tu uso y productividad',
      icon: '📊',
      color: 'from-indigo-500 to-indigo-700',
      href: '/estadisticas',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    },
    {
      id: 'email-pages',
      name: 'Tu Página de Captura',
      description: 'Gestiona tu página única de captura de emails con cuestionarios personalizados',
      icon: '📧',
      color: 'from-orange-500 to-orange-700',
      href: '/dashboard/email-pages',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    },
    {
      id: 'contactos',
      name: 'Contactos',
      description: 'Gestiona tu base de datos de contactos',
      icon: '👥',
      color: 'from-teal-500 to-teal-700',
      href: '/contactos',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    },
    {
      id: 'lead-magnets',
      name: 'Lead Magnets',
      description: 'Crea archivos de valor para capturar emails con preferencias de suscripción',
      icon: '🧲',
      color: 'from-pink-500 to-pink-700',
      href: '/lead-magnets',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    },
    {
      id: 'voice-guide',
      name: 'Guía de Voz IA',
      description: 'Asistente de voz inteligente con explicaciones interactivas',
      icon: '🎤',
      color: 'from-violet-500 to-violet-700',
      href: '/voice-guide',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    },
    {
      id: 'ajustes',
      name: 'Configuración',
      description: 'Personaliza tu experiencia',
      icon: '⚙️',
      color: 'from-gray-500 to-gray-700',
      href: '/ajustes',
      premium: false,
      videoUrl: 'https://youtu.be/k5OYlxYdIuA'
    }
  ]

  const handleToolClick = (tool: typeof dashboardTools[0]) => {
    if (user || isTrialActive) {
      router.push(tool.href)
    } else if (canStartTrial) {
      console.log('Starting guest trial from dashboard for tool:', tool.name)
      startGuestTrial()
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
        {/* Welcome Section */}
        <div className="mb-8">
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
          {dashboardTools.map((tool) => (
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