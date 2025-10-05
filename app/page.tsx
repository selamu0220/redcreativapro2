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
                className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors duration-200 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
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
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105 flex items-center gap-1"
              >
                💎 Membresía
              </Link>
              
              <Link 
                href="/blog" 
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
              >
                Blog
              </Link>
              
              <Link 
                href="/creador" 
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105 flex items-center gap-2"
              >
                <img 
                  src="https://i.ibb.co/bfb1ncN/image.png" 
                  alt="Selamu, creador de Red Creativa Pro" 
                  className="w-5 h-5 rounded-full object-cover border border-muted-foreground/20"
                />
                Creador
              </Link>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Botón Iniciar Sesión */}
              <Link href="/auth/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs font-medium hover:scale-105 transition-all duration-200"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              
              {/* Botón Ver Demo */}
              <Button 
                onClick={() => handleTrialClick('demo')}
                variant="outline" 
                size="sm"
                className="text-xs font-medium hover:scale-105 transition-all duration-200"
              >
                Ver Demo
              </Button>
            </nav>
          </div>
        </header>
      )}

      {/* Mobile Layout */}
      {(isMobile || isTablet) && (
        <MobileContainer>
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-background/95 backdrop-blur">
            <Link className="flex items-center space-x-2" href="/">
              <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold text-sm">Red Creativa Pro Beta</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <MobileButton 
                onClick={() => handleTrialClick('demo')}
                variant="outline"
                size="sm"
              >
                Demo
              </MobileButton>
            </div>
          </div>
        </MobileContainer>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20"></div>
          <div className="relative container mx-auto px-4 text-center">
            {/* VERSION BETA Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              ✨ VERSION BETA - Acceso anticipado disponible
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-primary">
              Red Creativa Pro
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 text-muted-foreground">
              Plataforma Hispana de Marketing con IA
            </h2>
            
            {/* Powered by OpenRouter */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-sm text-muted-foreground">Powered by</span>
              <span className="text-sm font-semibold text-primary">OpenRouter</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">AI</span>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Escritor IA, Correos IA, Chat con Prompts, Gestión de Contactos, Lead Magnets, 
              Páginas de Captura, Estadísticas y más. Todo lo que necesitas para tu marketing 
              digital en una sola plataforma.
            </p>

            {/* Key Benefits Icons */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                <span className="text-2xl">🤖</span>
                <span className="font-semibold text-secondary-foreground">IA</span>
                <span className="text-sm text-muted-foreground">Escritura inteligente</span>
              </div>
              
              <div className="flex items-center gap-2 bg-accent px-4 py-2 rounded-full">
                <span className="text-2xl">⚡</span>
                <span className="font-semibold text-accent-foreground">Auto</span>
                <span className="text-sm text-muted-foreground">Flujo automático</span>
              </div>
              
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <span className="text-2xl">⏰</span>
                <span className="font-semibold text-muted-foreground">24h</span>
                <span className="text-sm text-muted-foreground">Configuración rápida</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mb-8">
              <Button 
                onClick={() => handleTrialClick('main')}
                size="lg"
                className="text-lg px-8 py-6 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                🚀 Unirse a Red Creativa Pro
              </Button>
            </div>

            {/* Feature Checkmarks */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Acceso inmediato</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancela cuando quieras</span>
              </div>
            </div>

            {/* Conoce al Creador Link */}
            <div className="text-center">
              <Link 
                href="/creador"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 border border-muted rounded-full px-4 py-2 hover:border-primary/30"
              >
                <img 
                  src="https://i.ibb.co/bfb1ncN/image.png" 
                  alt="Selamu, creador de Red Creativa Pro" 
                  className="w-6 h-6 rounded-full object-cover border border-muted-foreground/20"
                />
                <span>Conoce al creador</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Preview Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Herramientas Potenciadas por IA
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Todo lo que necesitas para automatizar y optimizar tu marketing digital
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Escritor IA</h3>
                <p className="text-muted-foreground text-sm">Genera contenido de alta calidad para blogs, redes sociales y marketing</p>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Correos IA</h3>
                <p className="text-muted-foreground text-sm">Crea campañas de email marketing personalizadas y efectivas</p>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Chat con Prompts</h3>
                <p className="text-muted-foreground text-sm">Interactúa con IA usando prompts optimizados para resultados precisos</p>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Gestión de Contactos</h3>
                <p className="text-muted-foreground text-sm">Organiza y gestiona tu base de datos con herramientas avanzadas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sobre el Creador Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden border-2 border-primary/20">
                  <img 
                    src="https://i.ibb.co/bfb1ncN/image.png" 
                    alt="Selamu, creador de Red Creativa Pro" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Conoce a Sela, el Creador
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Estudiante de Humanidades que decidió crear herramientas que realmente ahorren tiempo
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">💡</span>
                    <h3 className="text-lg font-semibold">Emprendimiento Personal</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No soy una gran empresa. Soy una persona real que cree en crear herramientas útiles. 
                    Cada función está pensada desde la experiencia real de uso.
                  </p>
                </div>

                <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🤝</span>
                    <h3 className="text-lg font-semibold">Acceso Directo</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Puedes hablar directamente conmigo. Tu feedback impulsa las mejoras. 
                    Construimos juntos la herramienta que realmente necesitas.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Mi Filosofía</h3>
                <p className="text-muted-foreground mb-6">
                  "Creo que las herramientas deben demostrar su valor antes de pedir dinero. 
                  Prueba Red Creativa Pro, explora todas sus funciones, y solo si realmente te ayuda 
                  a ser más productivo, entonces considera apoyar el proyecto."
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/creador">
                    <Button size="lg" className="px-8">
                      <span className="mr-2">📖</span>
                      Leer Mi Historia Completa
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="px-8">
                    <span className="mr-2">💬</span>
                    Contactar Directamente
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>✨ Cuando te suscribes, apoyas directamente a un emprendedor independiente</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold">Red Creativa Pro</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">BETA</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Plataforma completa de marketing digital con IA
            </p>
            <div className="flex justify-center items-center gap-4 mb-4">
              <Link 
                href="https://es.trustpilot.com/review/redcreativa.pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2"
              >
                ⭐ Déjanos una reseña en Trustpilot
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 Red Creativa Pro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showVideoModal && (
        <VideoModal 
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoId="k5OYlxYdIuA"
          title="Introducción a Red Creativa Pro"
        />
      )}

      {isTrialModalOpen && (
        <TrialModal
          isOpen={isTrialModalOpen}
          onClose={() => setIsTrialModalOpen(false)}
          onStartTrial={handleStartTrial}
          toolName={selectedTool}
        />
      )}

      {isGuestTrialModalOpen && (
        <GuestTrialModal
          isOpen={isGuestTrialModalOpen}
          onClose={() => setIsGuestTrialModalOpen(false)}
          onStartTrial={handleStartGuestTrial}
          toolName={selectedTool}
        />
      )}

      {showTrialInterface && (
        <TrialInterface
          onClose={handleCloseTrialInterface}
          toolName={selectedTool}
        />
      )}

      {showGuestTrialInterface && (
        <GuestTrialInterface
          onClose={handleCloseGuestTrialInterface}
          toolName={selectedTool}
        >
          <div />
        </GuestTrialInterface>
      )}
    </div>
  )
}

export default LandingPage