'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  PenTool,
  Mail,
  Users,
  ArrowUpRight,
  Target,
  BarChart3,
  Globe2,
  Star,
  Heart,
  Coffee,
  Github
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import dynamic from 'next/dynamic'

// Dynamically import animation components to prevent SSR issues
const ParticleCanvas = dynamic(() => import('./ParticleCanvas'), { ssr: false })
const TiltCardPremium = dynamic(() => import('./TiltCardPremium'), { ssr: false })

gsap.registerPlugin(ScrollTrigger)

export default function HomePageClient() {
  const heroRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    // Hero stagger animation
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll('.hero-animate')
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        }
      )
    }

    // SEO Section Animations - Smooth and subtle
    const seoSection = document.querySelector('.seo-content')
    if (seoSection) {
      // Badge animation - gentle slide
      gsap.fromTo(
        '.seo-badge',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.seo-badge',
            start: 'top 85%',
          },
        }
      )

      // Title animation - smooth fade up
      gsap.fromTo(
        '.seo-title',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.seo-title',
            start: 'top 85%',
          },
        }
      )

      // Description fade in - very subtle
      gsap.fromTo(
        '.seo-description',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.seo-description',
            start: 'top 85%',
          },
        }
      )

      // Features stagger animation - gentle
      gsap.fromTo(
        '.seo-feature',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.seo-features',
            start: 'top 85%',
          },
        }
      )

      // Chart bars animation - smooth scale from bottom
      gsap.fromTo(
        '.seo-bar',
        { scaleY: 0.3, opacity: 0.5 },
        {
          scaleY: 1,
          opacity: 1,
          duration: 1.2,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.seo-chart-container',
            start: 'top 80%',
          },
        }
      )
    }

    // Scroll reveal animations for other sections
    sectionsRef.current.forEach((section) => {
      if (!section) return

      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
        }
      )
    })
  }, [])

  return (
    <>
      <div className="grain-overlay" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold">Red Creativa Pro</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Blog
              </Link>
              <Link href="/planes" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Planes
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/escritor-ia">Probar Gratis</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/planes">Ver Planes</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden border-b">
          <ParticleCanvas />

          <div className="container mx-auto px-4 relative z-10" ref={heroRef}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex flex-wrap justify-center gap-3 mb-6 hero-animate">
                <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider glass-enhanced border-primary/20 text-primary">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Para Periodistas
                </Badge>
                <Badge variant="secondary" className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" /> 100% Gratis siempre
                </Badge>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] hero-animate">
                IA Para Periodistas<br />
                <span className="gradient-text-animated italic font-serif">Que Saben Escribir</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed hero-animate">
                Escribe 3x más rápido con IA que <span className="text-foreground font-semibold">aprende tu estilo</span> (no lo reemplaza).
                SEO automático. Detección reducida al mínimo.
              </p>

              {/* Trust message */}
              <div className="bg-muted/30 border border-dashed border-primary/20 rounded-xl p-4 max-w-2xl mx-auto mb-8 hero-animate">
                <p className="text-sm text-muted-foreground">
                  👋 Proyecto indie hecho con cariño. Todo funciona gratis.
                  Si escribes profesionalmente y te sirve, úsalo. Si quieres apoyar el desarrollo, genial.
                </p>
              </div>

              {/* Proof Points - Más creíbles */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12 hero-animate">
                <div className="p-4 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-1">3x</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Más Rápido</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">Auto</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">SEO Integrado</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">Tu</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Estilo Único</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 hero-animate">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 magnetic-hover" asChild>
                  <Link href="/escritor-ia">
                    Probar Gratis <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full hover:bg-muted/50 transition-all active:scale-95 magnetic-hover" asChild>
                  <Link href="#como-funciona">
                    Ver cómo funciona
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 text-sm font-medium text-muted-foreground hero-animate">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>Sin tarjeta</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>Todo incluido</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>Úsalo para siempre</span>
                </div>
              </div>
            </div>
          </div>

          {/* Background Gradient Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
          </div>
        </section>

        {/* Value Proposition Sections */}
        <section className="py-32 space-y-32">

          {/* Value Equation Section - HACK #2 */}
          <div id="como-funciona" className="container mx-auto px-4 scroll-mt-24">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="px-4 py-1.5">
                <Target className="h-3.5 w-3.5 mr-2" /> Cómo Funciona
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                La Fórmula del Valor
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No vendemos promesas vacías. Aquí está exactamente qué obtienes, cómo lo garantizamos y cuánto tiempo te lleva.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Dream Outcome */}
              <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">🎯 Resultado Aspiracional</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-primary">Más</div>
                  <p className="text-lg font-semibold">Alcance orgánico</p>
                  <p className="text-sm text-muted-foreground">Contenido optimizado que posiciona mejor en buscadores.</p>
                </CardContent>
              </Card>

              {/* Probability */}
              <Card className="relative overflow-hidden border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all"></div>
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">📊 Probabilidad Alta</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">Apoyo</div>
                  <p className="text-lg font-semibold">1 a 1</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ Reunión mensual personalizada</p>
                    <p>✓ Plan Anual: SEO técnico incluido</p>
                    <Badge variant="secondary" className="mt-2">Asistencia real</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Time */}
              <Card className="relative overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">⏱️ Tiempo Mínimo</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">Rápido</div>
                  <p className="text-lg font-semibold">Escribe en minutos</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>IA asiste</strong> mientras escribes</p>
                    <p><strong>Publicación:</strong> Cuando estés listo</p>
                  </div>
                </CardContent>
              </Card>

              {/* Effort */}
              <Card className="relative overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl">💪 Esfuerzo Mínimo</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">Auto</div>
                  <p className="text-lg font-semibold">Optimización automática</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ SEO mientras escribes</p>
                    <p>✓ Estilo adaptado a ti</p>
                    <p>✓ Plan Anual: hacemos lo técnico</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Guarantee Badge */}
            <div className="mt-16 max-w-3xl mx-auto">
              <Card className="bg-gradient-to-r from-primary/10 via-green-500/10 to-blue-500/10 border-2 border-primary/30">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold">Garantía de Satisfacción</h3>
                  </div>
                  <p className="text-lg mb-4">
                    Prueba <span className="font-bold text-primary">30 días</span>. Si no te gusta cómo funciona,
                    te devolvemos el <span className="font-bold text-primary">100%</span>. Sin preguntas.
                  </p>
                  <Badge className="text-xs">Cancela cuando quieras</Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Prop 2: Analytics/SEO */}
          <div className="bg-muted/30 py-24" ref={(el) => { if (el) sectionsRef.current[1] = el }}>
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative seo-chart-container">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden">
                    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">+247%</div>
                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">Crecimiento en tráfico</div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 w-full max-w-md">
                        <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">89%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Conversión</div>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3.2x</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">ROI</div>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24h</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Respuesta</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-8 seo-content">
                  <div className="seo-badge inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                    <Target className="h-3.5 w-3.5" /> Estrategia y SEO
                  </div>
                  <h2 className="seo-title text-4xl md:text-5xl font-bold leading-tight">
                    Domina los buscadores <br />
                    <span className="text-muted-foreground">con datos, no conjeturas.</span>
                  </h2>
                  <p className="seo-description text-lg text-muted-foreground leading-relaxed">
                    Nuestras herramientas de análisis SEO identifican oportunidades de tráfico que tu competencia está ignorando. Analizamos la intención de búsqueda real para que cada contenido que publiques tenga un propósito claro.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-6 seo-features">
                    <div className="seo-feature space-y-3 p-4 rounded-lg hover:bg-background/50 transition-all duration-300">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shadow-sm transform transition-transform duration-300 hover:scale-110">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-bold">Análisis de Intención</h4>
                      <p className="text-sm text-muted-foreground">Entiende por qué tus clientes buscan lo que buscan.</p>
                    </div>
                    <div className="seo-feature space-y-3 p-4 rounded-lg hover:bg-background/50 transition-all duration-300">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shadow-sm transform transition-transform duration-300 hover:scale-110">
                        <Globe2 className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-bold">SEO Local</h4>
                      <p className="text-sm text-muted-foreground">Optimiza tu presencia para mercados específicos en LATAM y España.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prop 3: Tools Overview */}
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16 space-y-4">
                <Badge variant="outline" className="px-4 py-1.5">
                  <Zap className="h-3.5 w-3.5 mr-2" /> Herramientas
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Todo lo que necesitas en un solo lugar
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Desde la generación de contenido hasta el análisis SEO, todas las herramientas que necesitas para hacer crecer tu negocio.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PenTool className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Escritor IA</h3>
                    <p className="text-muted-foreground">Genera contenido de calidad en segundos con IA entrenada en español.</p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold">Email Marketing</h3>
                    <p className="text-muted-foreground">Crea campañas de email personalizadas que convierten.</p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold">Análisis SEO</h3>
                    <p className="text-muted-foreground">Optimiza tu contenido para aparecer en los primeros resultados.</p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12">
                <Button asChild size="lg">
                  <Link href="/dashboard">Ver todas las herramientas <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section - HACK #4 */}
        <section className="py-24 border-t bg-muted/20 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="px-4 py-1.5 mb-4">
                <Star className="h-3.5 w-3.5 mr-2 fill-primary" /> Caso Real
              </Badge>
              <h2 className="text-4xl font-bold mb-6">Esto No es Magia, Es Método</h2>
              <p className="text-lg text-muted-foreground">
                Resultado real usando Red Creativa Pro consistentemente durante 60 días.
              </p>
            </div>

            {/* Featured Case Study */}
            <div className="max-w-4xl mx-auto mb-16">
              <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Side */}
                  <div className="relative bg-gradient-to-br from-primary/5 to-blue-500/5 p-8 flex items-center justify-center">
                    <div className="relative w-full aspect-square">
                      <img
                        src="/traffic-growth-before-after.png"
                        alt="Resultados de crecimiento"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Content Side */}
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="space-y-6">
                      <div>
                        <Badge className="mb-4">Uso Consistente = Resultados</Badge>
                        <h3 className="text-2xl font-bold mb-3">60 Días Escribiendo con Asistencia de IA</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          "Escribí 12 artículos usando Red Creativa Pro.
                          <span className="font-semibold text-foreground"> El proceso fue más rápido</span>,
                          el SEO mejoró, y los artículos mantuvieron mi estilo."
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary mb-1">12</div>
                          <div className="text-xs text-muted-foreground uppercase">Artículos</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">60</div>
                          <div className="text-xs text-muted-foreground uppercase">Días</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">3x</div>
                          <div className="text-xs text-muted-foreground uppercase">Más Rápido</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">SEO</div>
                          <div className="text-xs text-muted-foreground uppercase">Automatizado</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
                          SG
                        </div>
                        <div>
                          <p className="font-bold">Sela (Creador)</p>
                          <p className="text-sm text-muted-foreground">Creador & Developer</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Trustpilot CTA */}
            <div className="max-w-xl mx-auto">
              <Card className="bg-background border-dashed border-2 flex flex-col items-center justify-center p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                <Link href="https://es.trustpilot.com/review/redcreativa.pro" target="_blank" className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Star className="h-8 w-8 text-primary fill-primary" />
                  </div>
                  <CardTitle className="mb-4 text-2xl">¿Listo para ser el próximo caso de éxito?</CardTitle>
                  <CardDescription className="text-base mb-6 text-center">
                    Únete a los primeros 100 usuarios fundadores y comparte tu historia en Trustpilot.
                  </CardDescription>
                  <Button variant="outline" className="rounded-full">
                    Dejar tu reseña <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            </div>

            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-background border shadow-sm">
                <div className="text-sm font-medium">
                  Solo <span className="text-primary font-bold">38 plazas</span> disponibles para el Plan Elite con Traffic Accelerator.
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-x-1/2" />
        </section>

        {/* Story & Support Section */}
        <section id="historia" className="py-32 bg-background border-y scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold">La historia detrás del código</h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Este es un proyecto colaborativo diseñado para crecer juntos. He creado este espacio para que sea <span className="text-foreground font-semibold">nuestro</span>, donde cada mejora cuenta.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Red Creativa Pro está en constante evolución. Si quieres proponer cambios, mejorar el software o simplemente charlar, escríbeme a <Link href="https://instagram.com/sela_gb" target="_blank" className="text-primary hover:underline">@sela_gb</Link>.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl bg-muted/30 border border-primary/10 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Github className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Código Abierto</h3>
                    <p className="text-sm text-muted-foreground">Este proyecto es de código abierto. Puedes revisar el código, aprender cómo está construido o contribuir en GitHub.</p>
                    <Button variant="link" className="p-0 h-auto text-primary" asChild>
                      <Link href="https://github.com/selamu0220/redcreativapro2" target="_blank" className="flex items-center gap-2">
                        Ver repositorio en GitHub <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="p-6 rounded-2xl bg-muted/30 border border-primary/10 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coffee className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Apoya el proyecto</h3>
                    <p className="text-sm text-muted-foreground">Si valoras el esfuerzo y quieres ayudarme a mantener los servidores y seguir estudiando, puedes apoyar económicamente.</p>
                    <Button variant="link" className="p-0 h-auto text-primary" asChild>
                      <Link href="/planes" className="flex items-center gap-2">
                        Ver formas de apoyo <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/5] bg-muted rounded-[2rem] overflow-hidden border-8 border-background shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex flex-col justify-end p-8 text-white">
                    <p className="text-xl font-medium italic">"Empecé esto en mi habitación con un café y muchas ganas de crear algo útil para todos."</p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center font-bold border-2 border-white">RC</div>
                      <div>
                        <p className="font-bold">El Creador</p>
                        <p className="text-sm opacity-80">Creador & Dev</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground p-12 md:p-20 text-center overflow-hidden relative">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                Forma parte de esto
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                No estás comprando un software corporativo. Estás uniéndote a un equipo que busca simplificar el marketing para humanos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto font-bold" asChild>
                  <Link href="/dashboard">
                    Únete a nosotros gratis
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto bg-transparent border-primary-foreground/20 hover:bg-white/10" asChild>
                  <Link href="https://instagram.com/sela_gb" target="_blank">
                    Escríbeme a @sela_gb
                  </Link>
                </Button>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Red Creativa Pro</span>
              <Badge variant="secondary" className="text-[10px] scale-90 ml-2">BETA</Badge>
            </div>

            <nav className="flex gap-8 text-sm text-muted-foreground font-medium">
              <Link href="/politica-privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
              <Link href="/terminos-servicio" className="hover:text-foreground transition-colors">Términos</Link>
              <Link href="https://es.trustpilot.com/review/redcreativa.pro" target="_blank" className="hover:text-foreground transition-colors flex items-center gap-1">
                Trustpilot <ArrowUpRight className="h-3 w-3" />
              </Link>
            </nav>

            <div className="text-xs text-muted-foreground font-mono flex flex-col md:flex-row items-center gap-4">
              <span>© 2025 RED CREATIVA PRO</span>
              <Separator orientation="vertical" className="hidden md:block h-4" />
              <span>UN PROYECTO INDEPENDIENTE</span>
              <Separator orientation="vertical" className="hidden md:block h-4" />
              <span>MADE WITH <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> IN SPAIN</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}



