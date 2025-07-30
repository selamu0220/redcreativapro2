'use client'

import Link from 'next/link'
import { useAuth } from './hooks/useAuth'
import { useEffect, useState } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import TrialModal from './components/TrialModal'
import TrialInterface from './components/TrialInterface'
import { useTrialMode } from './hooks/useTrialMode'

function LandingPage() {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  const [showTrialInterface, setShowTrialInterface] = useState(false);
  const { startTrial, isTrialActive, canUseTrial } = useTrialMode();

  const handleTrialClick = (toolName: string) => {
    setSelectedTool(toolName);
    if (canUseTrial) {
      setIsTrialModalOpen(true);
    } else {
      // Si ya usó su prueba diaria, mostrar mensaje
      alert('Ya has usado tu prueba gratuita de 7 días. Regístrate para continuar con acceso completo.');
    }
  };

  const handleStartTrial = () => {
    startTrial();
    setIsTrialModalOpen(false);
    setShowTrialInterface(true);
  };

  const handleCloseTrialInterface = () => {
    setShowTrialInterface(false);
    setSelectedTool('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in-up">
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
            <nav className="flex items-center">
              <Link
                href="/auth"
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
              >
                Reserva tu lugar
              </Link>
              <Link
                href="/auth"
                className="ml-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-all duration-200 hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Comenzar gratis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container relative overflow-hidden">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
          {/* Beta Badge */}
          <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium animate-fade-in-up opacity-0 [animation-delay:0.1s] [animation-fill-mode:forwards] hover:scale-105 transition-transform duration-300">
            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-primary"></span>
            🚀 VERSIÓN BETA - Acceso anticipado disponible
          </div>
          
          {/* Main Headline */}
          <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] animate-fade-in-up opacity-0 [animation-delay:0.3s] [animation-fill-mode:forwards] mx-auto">
            <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent animate-gradient-x">Red Creativa Pro Beta</span>
            <br/>
            Escribe y la IA Te Mejora en Tiempo Real
          </h1>
          
          {/* Value Proposition */}
          <p className="max-w-[750px] mx-auto text-center text-lg text-muted-foreground sm:text-xl animate-fade-in-up opacity-0 [animation-delay:0.5s] [animation-fill-mode:forwards]">
            <span className="font-semibold text-foreground">¿Cansado de que la IA invente lo que se le ocurre?</span>{" "}
            Tú escribes, tú controlas cómo la IA mejora tu texto. Sin perder tu estilo ni tu mensaje.
          </p>
          
          {/* Social Proof */}
          <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10 animate-fade-in-up opacity-0 [animation-delay:0.7s] [animation-fill-mode:forwards]">
            <div className="flex flex-col items-center space-y-2 hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">500</div>
              <p className="text-xs text-muted-foreground">Límite de usuarios</p>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex flex-col items-center space-y-2 hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">100%</div>
              <div className="text-sm">Control sobre la IA</div>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex flex-col items-center space-y-2 hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">0.2s</div>
              <p className="text-xs text-muted-foreground">Tiempo de respuesta</p>
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
      </section>

      {/* AI Demo Animation Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 animate-fade-in-up opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
              Mira cómo funciona la <span className="text-primary">magia</span>
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed animate-fade-in-up opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards]">
              Tu texto se mejora automáticamente mientras escribes
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
                  <div className="mb-2 text-sm font-medium text-muted-foreground">Tu texto original:</div>
                  <div className="font-mono text-sm leading-relaxed">
                    <span className="typing-animation opacity-0 [animation-delay:1s] [animation-fill-mode:forwards]">Hola, quiero escribir sobre marketing digital. Es importante para las empresas hoy en día.</span>
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
                  <div className="mb-2 text-sm font-medium text-primary">✨ Texto mejorado automáticamente:</div>
                  <div className="font-mono text-sm leading-relaxed">
                    <span className="typing-animation-improved opacity-0 [animation-delay:5s] [animation-fill-mode:forwards]">El marketing digital se ha convertido en el pilar fundamental del crecimiento empresarial moderno. En un ecosistema donde la presencia online determina el éxito, las empresas que dominan estas estrategias no solo sobreviven, sino que prosperan exponencialmente.</span>
                  </div>
                </div>
                
                {/* Control Panel */}
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4 animate-fade-in-up opacity-0 [animation-delay:7s] [animation-fill-mode:forwards]">
                  <div className="mb-2 text-sm font-medium">🎯 Tus prompts de control:</div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      <span>"Hazlo más profesional y persuasivo"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      <span>"Usa un tono más impactante"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                      <span>"Mantén mi estilo personal"</span>
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
      <section className="border-t bg-background py-24 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-in-up opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
                ¿Te suena familiar?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">La IA inventa contenido que no querías</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.6s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Pierdes tu estilo personal al usar IA</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.8s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">No tienes control sobre las mejoras</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.0s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive hover:scale-110 transition-transform duration-300">
                    <span className="text-xs text-destructive-foreground">✗</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">El contenido se nota que está hecho con IA</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-in-up opacity-0 [animation-delay:0.3s] [animation-fill-mode:forwards]">
                <span className="text-primary bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">Ahora imagina esto:</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.5s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Tú escribes, la IA solo mejora según TUS instrucciones</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.7s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Mantienes tu estilo y personalidad</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:0.9s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Control total sobre las mejoras en tiempo real</p>
                </div>
                <div className="flex items-start space-x-3 animate-fade-in-up opacity-0 [animation-delay:1.1s] [animation-fill-mode:forwards] hover:translate-x-2 transition-transform duration-300">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary hover:scale-110 hover:bg-green-500 transition-all duration-300">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                  <p className="text-muted-foreground hover:text-foreground transition-colors duration-300">Contenido auténtico que no se nota artificial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Stack Section */}
      <section className="py-24 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 animate-fade-in-up opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
              Lo que obtienes con <span className="text-primary">precios transparentes</span>
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-12 animate-fade-in-up opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards]">
              Solo pagas por lo que realmente usas
            </p>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-8 animate-fade-in-up opacity-0 [animation-delay:0.6s] [animation-fill-mode:forwards] hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">🤖</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Escritor IA Controlado</h3>
                      <p className="text-sm text-muted-foreground">Mejora tu texto en tiempo real según TUS instrucciones</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600 hover:scale-105 transition-transform duration-300 inline-block">5€/mes</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">📧</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Envío de Emails</h3>
                      <p className="text-sm text-muted-foreground">Envía emails directamente desde la plataforma</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">GRATIS</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">💬</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Chat IA Personalizado</h3>
                      <p className="text-sm text-muted-foreground">Conversa con IA usando tus propios prompts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">GRATIS</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">⚡</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Soporte y Actualizaciones</h3>
                      <p className="text-sm text-muted-foreground">Acceso completo a todas las mejoras y soporte técnico</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">GRATIS</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4 hover:bg-muted/20 transition-colors duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">🎯</span>
                    <div className="text-left">
                      <h3 className="font-semibold hover:text-primary transition-colors duration-300">Control Total</h3>
                      <p className="text-sm text-muted-foreground">Tú decides cómo la IA mejora tu contenido</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary hover:scale-105 transition-transform duration-300 inline-block">GRATIS</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-600/5 transition-all duration-300 rounded-lg p-2 -m-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl hover:scale-110 transition-transform duration-300">💎</span>
                    <div className="text-left">
                      <h3 className="font-bold text-lg hover:text-primary transition-colors duration-300">MODELO TRANSPARENTE</h3>
                      <p className="text-sm text-primary font-medium">Solo pagas por lo que realmente usas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 hover:scale-105 transition-transform duration-300 inline-block">5€/mes</div>
                    <div className="text-xs text-muted-foreground">Solo Escritor IA</div>
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
                ⚡ Herramientas gratuitas + Escritor IA por solo 5€/mes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trial Section */}
      <section className="py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                🚀 <span className="text-primary">Prueba antes de decidir</span>
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-2">
                7 días de prueba Pro gratis • Sin registro • Sin tarjeta
              </p>
              <p className="text-sm text-muted-foreground">
                ⏰ Acceso completo a todas las funciones premium
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {/* Chat IA */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center transition-all hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Chat IA Personalizado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conversa con IA usando tus propios prompts y obtén respuestas personalizadas
                </p>
                <button
                  onClick={() => handleTrialClick('Chat IA')}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-2"
                >
                  🚀 Probar 7 días Gratis
                </button>
                <p className="text-xs text-muted-foreground">Luego: 100% GRATIS</p>
              </div>

              {/* Email Sender */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center transition-all hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <span className="text-3xl">📧</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Envío de Emails</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Envía emails profesionales directamente desde la plataforma
                </p>
                <button
                  onClick={() => handleTrialClick('Envío de Emails')}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-2"
                >
                  🚀 Probar 30s Gratis
                </button>
                <p className="text-xs text-muted-foreground">Luego: 100% GRATIS</p>
              </div>

              {/* AI Writer */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center transition-all hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Escritor IA Controlado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Mejora tu texto en tiempo real según TUS instrucciones específicas
                </p>
                <button
                  onClick={() => handleTrialClick('Escritor IA')}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-2"
                >
                  🚀 Probar 30s Gratis
                </button>
                <p className="text-xs text-muted-foreground">Luego: 5€/mes</p>
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
      <section className="py-24 bg-muted/30">
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

      {/* Final CTA */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              ¿Listo para <span className="text-primary">tener el control</span> de tu contenido?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-12">
              Únete a los creadores que ya están mejorando su contenido sin perder su esencia
            </p>
            
            <div className="mx-auto max-w-2xl rounded-lg border bg-card text-card-foreground shadow-sm p-8 mb-8">
              <h3 className="text-2xl font-semibold mb-4">
                🚀 COMIENZA HOY MISMO
              </h3>
              <p className="text-muted-foreground mb-2">
                Herramientas gratuitas + Escritor IA por solo 5€/mes
              </p>
              <p className="text-muted-foreground mb-6">
                <strong className="text-foreground">Modelo transparente: solo pagas por lo que realmente usas</strong>
              </p>
              
              <div className="rounded-lg bg-muted/50 p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">✅ Chat IA y Envío de Emails: <span className="font-semibold text-primary">GRATIS</span></p>
                <p className="text-sm text-muted-foreground">💰 Escritor IA Controlado: <span className="font-semibold text-blue-600">5€/mes</span></p>
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
      
      {/* Trial Interface */}
      {showTrialInterface && (
        <TrialInterface
          toolName={selectedTool}
          onClose={handleCloseTrialInterface}
        />
      )}
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