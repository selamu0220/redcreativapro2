'use client'

import Link from 'next/link'
import { useAuth } from './hooks/useAuth'
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
import ThemeToggle from './components/ThemeToggle'
import { MobileContainer, MobileButton } from './components/MobileLayout'

function LandingPage() {
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
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <div className="mr-4 hidden md:flex">
              <Link className="mr-6 flex items-center space-x-2 hover:scale-105 transition-transform duration-200" href="/">
                <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                  <span className="text-primary-foreground font-bold text-xs">RC</span>
                </div>
                <span className="hidden font-bold sm:inline-block hover:text-primary transition-colors duration-200">Red Creativa Pro Beta</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <nav className="flex items-center space-x-6">
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
                
                <ThemeToggle />
                
                <Link
                  href="/correos-ia"
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105 flex items-center gap-1"
                >
                  🤖 Campañas IA
                </Link>
                
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
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
                >
                  Reserva tu lugar
                </Link>
              </nav>
            </div>
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
            Asistente de IA para Escritura Profesional
          </h1>
          
          {/* Value Proposition */}
          <p className={`max-w-[750px] mx-auto text-center text-muted-foreground animate-fade-in-up opacity-0 [animation-delay:0.5s] [animation-fill-mode:forwards] ${
            isMobile ? 'text-base px-2' : isTablet ? 'text-lg' : 'text-lg sm:text-xl'
          }`}>
            Nuestra IA especializada te ayuda a escribir contenido profesional, enviar correos inteligentes y gestionar prompts personalizados.
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
                ¿Tus emails no son efectivos?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Bajas tasas de apertura y clics</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.6s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Emails que van directo a spam</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.8s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Falta de personalización efectiva</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.0s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Campañas poco efectivas</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.2s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Riesgo de multas por correos promocionales sin desuscripción</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-in-up opacity-0 [animation-delay:0.3s] [animation-fill-mode:forwards]">
                <span className="text-primary bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">Con nuestra IA obtienes:</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.5s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Mejora significativa en efectividad de emails</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.7s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Emails que evitan spam y llegan a bandeja</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.9s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Personalización inteligente y efectiva</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.1s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Campañas que mantienen tu voz única</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.3s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Protección legal automática con enlaces de desuscripción</p>
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
              <span className="text-primary">Escritor IA Inteligente</span> y Chat Asistente
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-12 animate-fade-in-up opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards]">
              La IA te ayuda a escribir mejor, enviar correos inteligentes y gestionar tus prompts favoritos
            </p>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-8 animate-fade-in-up opacity-0 [animation-delay:0.6s] [animation-fill-mode:forwards] hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">📧</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Escritor IA Profesional</h3>
                      <p className="text-sm text-muted-foreground">Contenido optimizado con inteligencia artificial</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600 hover:scale-105 transition-transform duration-300 inline-block">Plan Pro</span>
                    <p className="text-xs text-green-600 font-medium">Plan básico</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">🎯</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Chat IA Asistente</h3>
                      <p className="text-sm text-muted-foreground">Conversaciones inteligentes y respuestas automáticas</p>
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
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Gestión de Prompts</h3>
                      <p className="text-sm text-muted-foreground">Guarda y organiza tus prompts favoritos</p>
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
              <Link
                href="/auth"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group"
              >
                <span className="group-hover:animate-bounce">🎯</span> Comenzar gratis ahora
              </Link>
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
                🚀 <span className="text-primary">Prueba gratis</span> nuestro Asistente de IA
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-2">
                Experimenta el poder de la IA para escribir y gestionar contenido • Sin registro • Sin tarjeta
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
                  Crea contenido profesional con ayuda de inteligencia artificial
                </p>
                <button
                  onClick={() => handleTrialClick('Escritor IA')}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-2"
                >
                  🚀 Probar SIN REGISTRO
                </button>
                <p className="text-xs text-muted-foreground">3 min/semana • Sin tarjeta</p>
              </div>

              {/* Email Sender */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center transition-all hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <span className="text-3xl">📧</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Envío Inteligente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Envía correos optimizados automáticamente con ayuda de IA
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
                <h3 className="text-xl font-semibold mb-2">Chat IA y Prompts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conversa con IA y guarda tus prompts favoritos para uso futuro
                </p>
                <button
                  onClick={() => handleTrialClick('Chat IA y Prompts')}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-2"
                >
                  🚀 Probar SIN REGISTRO
                </button>
                <p className="text-xs text-muted-foreground">3 min/semana • Sin tarjeta</p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <div className="mx-auto max-w-2xl rounded-lg border bg-primary/5 p-6">
                <h3 className="mb-2 font-semibold">🎯 ¿Por qué 7 días de prueba Pro?</h3>
                <p className="text-sm text-muted-foreground">
                  Es tiempo suficiente para experimentar completamente todas las funciones premium y ver cómo pueden transformar tu productividad. 
                  Si te gusta lo que ves, el registro es 100% gratuito para las herramientas básicas.
                </p>
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
                Lo que hace diferente a nuestra IA
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Tú tienes el control</strong> - La IA mejora tu texto según tus instrucciones, no inventa lo que quiere</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Mejoras en tiempo real</strong> - Ves los cambios mientras escribes, sin esperas</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Mantiene tu estilo</strong> - A diferencia de ChatGPT, no genera texto genérico que parece robótico</p>
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
              ¿Listo para <span className="text-primary">tener el control</span> de tu contenido?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-12">
              Únete a los empresarios que ya están mejorando sus resultados con email marketing inteligente
            </p>
            
            <div className="mx-auto max-w-2xl rounded-lg border bg-card text-card-foreground shadow-sm p-8 mb-8">
              <h3 className="text-2xl font-semibold mb-4">
                🚀 COMIENZA HOY MISMO
              </h3>
              <p className="text-muted-foreground mb-2">
                Herramientas gratuitas + Escritor IA en Plan Pro
              </p>
              <p className="text-muted-foreground mb-6">
                <strong className="text-foreground">Modelo transparente: solo pagas por lo que realmente usas</strong>
              </p>
              
              <div className="rounded-lg bg-muted/50 p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">✅ Chat IA y Envío de Emails: <span className="font-semibold text-primary">GRATIS</span></p>
                <p className="text-sm text-muted-foreground">💰 Escritor IA Controlado: <span className="font-semibold text-blue-600">Plan Pro</span></p>
              </div>
              
              <Link
                href="/auth"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 py-2 text-lg font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-6"
              >
                🎯 COMENZAR GRATIS
              </Link>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✅ Mejoras en tiempo real según tus instrucciones</p>
                <p className="text-sm text-muted-foreground">✅ Sin compromisos ni tarjeta de crédito</p>
                <p className="text-sm text-muted-foreground">✅ Envío de emails y chat IA incluidos</p>
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
              <button
                onClick={() => window.location.href = '/correos-ia'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                📧 Ir al Chat IA
              </button>
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