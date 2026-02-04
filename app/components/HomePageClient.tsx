'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
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
  Github,
  X,
  FileText,
  PhoneCall
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { SimpleLanguageSlider } from './SimpleLanguageSlider'
import * as m from '@/paraglide/messages'
import { languageTag } from '@/paraglide/runtime'
import { useAuth } from '@/app/hooks/useAuth'

// Dynamically import animation components to prevent initialization errors in production
const HeroTextAnimation = dynamic(() => import('./HeroTextAnimation'), {
  ssr: false,
  loading: () => <span className="opacity-0">...</span>
})

const MetaJourneySection = dynamic(() => import('./visual-effects/MetaJourneySection').catch(() => ({ default: () => null })), { ssr: false })
const TechSpecsAnimation = dynamic(() => import('./visual-effects/TechSpecsAnimation').catch(() => ({ default: () => null })), { ssr: false })
const IntegrationShowcase = dynamic(() => import('./visual-effects/IntegrationShowcase').catch(() => ({ default: () => null })), { ssr: false })
const ThreeBackground = dynamic(() => import('./visual-effects/ThreeBackground').catch(() => ({ default: () => null })), { ssr: false })
const SmoothScroll = dynamic(() => import('./visual-effects/SmoothScroll').catch(() => ({ default: () => null })), { ssr: false })
const GrainOverlay = dynamic(() => import('./visual-effects/GrainOverlay').catch(() => ({ default: () => null })), { ssr: false })

import { useHeroAnimation, useStaggerAnimation, useScrollAnimation } from '@/app/hooks/useScrollAnimations'


export default function HomePageClient() {
  const currentLang = languageTag()
  // const { isAuthenticated, user, isLoading: authLoading } = useKindeBrowserClient() // REMOVED
  const { user, isLoading: authLoading, login, logout, isAuthenticated } = useAuth() // ADDED
  const heroRef = useRef<HTMLDivElement>(null)
  const seoSectionRef = useRef<HTMLDivElement>(null)

  // Contador de usuarios
  const [availableSpots, setAvailableSpots] = useState(1002)

  useEffect(() => {
    const interval = setInterval(() => {
      setAvailableSpots(prev => {
        if (prev <= 1000) {
          clearInterval(interval)
          return 1000
        }
        return prev - 1
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Animation hooks
  useHeroAnimation(heroRef)
  useStaggerAnimation('.seo-feature', seoSectionRef, { stagger: 0.15 })
  useStaggerAnimation('.animate-section', seoSectionRef, { y: 30, duration: 0.8 })

  return (
    <>
      <ThreeBackground />
      <SmoothScroll />
      <GrainOverlay />
      {/* <SliderVisibilityFix />  -- Replaced by global styles / Lenis might handle better, or keep if needed. Keeping to be safe but GrainOverlay replaces .grain-overlay div */}
      {/* <div className="grain-overlay" /> -- Creating dedicated component for this */}

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2" aria-label="Red Creativa Pro - Inicio">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold">Red Creativa Pro</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">
                {m.blog()}
              </Link>
              <Link href="/planes" className="transition-colors hover:text-foreground/80 text-foreground/60">
                {m.plans()}
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <SimpleLanguageSlider className="mr-2" />

            {!authLoading && (
              <>
                {!isAuthenticated ? (
                  // No autenticado: mostrar Login y Registrarse
                  <>
                    <Button variant="ghost" size="sm" onClick={() => login()}>
                      {m.login()}
                    </Button>
                    <Button size="sm" onClick={() => login()}>
                      {m.register()}
                    </Button>
                  </>
                ) : (
                  // Autenticado: mostrar Dashboard y Usuario
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard">{m.dashboard()}</Link>
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                      <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xs">
                          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium hidden sm:block">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden border-b animate-section">
          {/* <ParticleCanvas /> Replaced by ThreeBackground */}

          <div className="container mx-auto px-4 relative z-10" ref={heroRef}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex flex-wrap justify-center gap-3 mb-6 hero-animate">
                <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider glass-enhanced border-primary/20 text-primary">
                  {/* Updated Badge with Animation */}
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {/* <HeroTextAnimation
                    phrases={[m.forJournalists(), m.forBloggers(), m.forStudents(), m.forBusiness()]}
                    type="badge"
                    startDelay={1000}
                    textClassName="text-xs font-medium uppercase tracking-wider text-primary"
                  /> */}
                  <span>{m.forBusiness()}</span>
                </Badge>
                <Link href="https://github.com/selamu0220/redcreativapro2" target="_blank">
                  <Badge variant="secondary" className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 hover:bg-secondary/80 transition-colors cursor-pointer">
                    <Github className="h-3 w-3" aria-hidden="true" /> {m.openSource()}
                  </Badge>
                </Link>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] hero-animate text-foreground">
                <span className="block text-primary">{m.heroTitle1()}</span>
                {/* Updated Subtitle with Animation */}
                {/* <HeroTextAnimation
                  phrases={[
                    m.heroTitle2(),
                    m.heroTitleVariation1(),
                    m.heroTitleVariation2(),
                    m.heroTitleVariation3()
                  ]}
                  className="block mt-4"
                  textClassName="text-3xl md:text-4xl font-bold text-muted-foreground"
                  startDelay={3000}
                /> */}
                <span className="text-3xl md:text-4xl font-bold text-muted-foreground block mt-4">{m.heroTitle2()}</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed hero-animate">
                {m.heroDescription()}
              </p>

              {/* Trust message */}
              <div className="bg-muted/30 border border-dashed border-primary/20 rounded-xl p-4 max-w-2xl mx-auto mb-8 hero-animate">
                <p className="text-sm text-muted-foreground">
                  {m.indieProject()}
                </p>
              </div>



              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 hero-animate">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 magnetic-hover" asChild>
                  <Link href="/escritor-ia">
                    {m.tryFree()} <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full hover:bg-muted/50 transition-all active:scale-95 magnetic-hover" asChild>
                  <Link href="#como-funciona">
                    {m.seeHowItWorks()}
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 text-sm font-medium text-muted-foreground hero-animate">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  </div>
                  <span>{m.noCard()}</span>
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

        {/* Anti-Stupidity Section - La IA no te reemplaza */}
        {/* Collaborative Intelligence Section */}
        {/* META JOURNEY SECTION (Proof of Mechanism) - Replaces Anti-Stupidity */}
        <section className="py-24 bg-zinc-950 border-b animate-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <Badge variant="outline" className="px-6 py-2 text-sm font-bold uppercase tracking-wider mb-6 border-rose-500/50 text-rose-500 bg-rose-500/10">
                🧬 {m.highProbability()}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-white">
                {m.howItWorks()}
              </h2>
              <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                No es magia. Es ingeniería inversa de Google. Mira la ruta exacta que te trajo aquí:
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* <MetaJourneySection /> */}
            </div>
          </div>
        </section>

        {/* Conversational Guarantee Section */}
        <section className="py-24 bg-background border-y animate-section">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-pulse">
                  <PhoneCall className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                {m.satisfactionGuarantee()}
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                {m.trial30Days()}
              </p>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" asChild>
                <Link href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2-Z2h3NT5e7ZMnKNhTjNwvvvU_T-bTo9Bl_Ar_e6XYIZFOJbWGX4kWxej9u64ewm7n_WFa4TB7" target="_blank">
                  {m.startNow()}
                </Link>
              </Button>
            </div>
          </div>
        </section >

        {/* Value Proposition Sections */}
        < section className="py-32 space-y-32 animate-section" >

          {/* Value Equation Section - HACK #2 */}
          < div id="como-funciona" className="container mx-auto px-4 scroll-mt-24" >
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="px-4 py-1.5">
                <Target className="h-3.5 w-3.5 mr-2" aria-hidden="true" /> {m.howItWorks()}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                {m.valueFormula()}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {m.noEmptyPromises()}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Dream Outcome */}
              <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">🎯 {m.dreamOutcome()}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-primary">{m.more()}</div>
                  <p className="text-lg font-semibold">{m.organicReach()}</p>
                  <p className="text-sm text-muted-foreground">{m.optimizedContent()}</p>
                </CardContent>
              </Card>

              {/* Probability */}
              <Card className="relative overflow-hidden border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all"></div>
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">📊 {m.highProbability()}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">{m.support121()}</div>
                  <p className="text-lg font-semibold">{currentLang === 'es' ? 'Apoyo' : 'Support'}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ {m.monthlyMeeting()}</p>
                    <p>✓ {m.annualPlanSEO()}</p>
                    <Badge variant="secondary" className="mt-2">{m.realSupport()}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Time */}
              <Card className="relative overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">⏱️ {m.minimalTime()}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{m.fast()}</div>
                  <p className="text-lg font-semibold">{m.writeInMinutes()}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>{m.aiAssists()}</strong></p>
                    <p><strong>{m.publishWhenReady()}</strong></p>
                  </div>
                </CardContent>
              </Card>

              {/* Effort */}
              <Card className="relative overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">💪 {m.minimalEffort()}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{m.auto()}</div>
                  <p className="text-lg font-semibold">{m.automaticOptimization()}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ {m.seoWhileWriting()}</p>
                    <p>✓ {m.styleAdapted()}</p>
                    <p>✓ {m.annualPlanTechnical()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>


          </div >

          {/* Prop 2: Writing Tools - Simplified without fake stats */}
          < div className="bg-muted/30 py-24" ref={seoSectionRef} >
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  {/* <TechSpecsAnimation /> */}
                </div>
                <div className="space-y-8 seo-content">
                  <div className="seo-badge inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {m.tools()}
                  </div>
                  <h2 className="seo-title text-4xl md:text-5xl font-bold leading-tight">
                    {m.everythingInOnePlace()}
                  </h2>
                  <p className="seo-description text-lg text-muted-foreground leading-relaxed">
                    {m.toolsDesc()}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-6 seo-features">
                    <div className="seo-feature space-y-3 p-4 rounded-lg hover:bg-background/50 transition-all duration-300">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shadow-sm transform transition-transform duration-300 hover:scale-110">
                        <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <h3 className="font-bold">{m.intentAnalysis()}</h3>
                      <p className="text-sm text-muted-foreground">{m.understandWhy()}</p>
                    </div>
                    <div className="seo-feature space-y-3 p-4 rounded-lg hover:bg-background/50 transition-all duration-300">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shadow-sm transform transition-transform duration-300 hover:scale-110">
                        <Globe2 className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <h3 className="font-bold">{m.localSEO()}</h3>
                      <p className="text-sm text-muted-foreground">{m.optimizePresence()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div >

          {/* Prop 3: Tools Overview */}
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16 space-y-4">
                <Badge variant="outline" className="px-4 py-1.5">
                  <Zap className="h-3.5 w-3.5 mr-2" aria-hidden="true" /> {m.tools()}
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold">
                  {m.everythingInOnePlace()}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {m.toolsDesc()}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PenTool className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold">{m.writerIA()}</h3>
                    <p className="text-muted-foreground">{m.writerIADesc()}</p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-500" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold">{m.emailMarketing()}</h3>
                    <p className="text-muted-foreground">{m.emailMarketingDesc()}</p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-500" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold">{m.seoAnalysis()}</h3>
                    <p className="text-muted-foreground">{m.seoAnalysisDesc()}</p>
                  </div>
                </div>
              </div>


              <div className="text-center mt-12">
                <Button asChild size="lg">
                  <Link href="/dashboard">{m.seeAllTools()} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section >

        {/* AGENCY KIT / ECOSYSTEM SECTON (NEW W/ Integrations) */}
        <section className="py-24 bg-zinc-950 border-t border-zinc-800 animate-section relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="mb-6 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/50">AGENCY SCALING KIT</Badge>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                  No es solo Software.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-rose-400">Es tu Nuevo Sistema Operativo.</span>
                </h2>
                <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                  Incluido en todos los planes PRO: Acceso a nuestra "Bóveda de Automatización".
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="h-10 w-10 flex items-center justify-center rounded bg-purple-500/20 text-purple-400 font-bold shrink-0">M</div>
                    <div>
                      <h4 className="font-bold text-white">Workflows de Make.com</h4>
                      <p className="text-sm text-zinc-400">Plantillas "Copy & Paste" para automatizar la publicación de blogs.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="h-10 w-10 flex items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0">P</div>
                    <div>
                      <h4 className="font-bold text-white">Bóveda de Prompts</h4>
                      <p className="text-sm text-zinc-400">Los System Prompts exactos que usa nuestra IA. Total transparencia.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="h-10 w-10 flex items-center justify-center rounded bg-blue-500/20 text-blue-400 font-bold shrink-0">API</div>
                    <div>
                      <h4 className="font-bold text-white">MCP & API Access</h4>
                      <p className="text-sm text-zinc-400">Conecta Red Creativa Pro a tu propio cerebro digital o CRM.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button size="lg" className="rounded-full bg-white text-black hover:bg-zinc-200" asChild>
                    <Link href="/planes">
                      Explorar el Kit Agencias <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                {/* <IntegrationShowcase /> */}
              </div>
            </div>
          </div>

          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        </section>

        {/* Social Proof Section - HACK #4 */}
        < section className="py-24 border-t bg-muted/20 relative overflow-hidden animate-section" >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="px-4 py-1.5 mb-4">
                <Star className="h-3.5 w-3.5 mr-2 fill-primary" aria-hidden="true" /> {m.realCase()}
              </Badge>
              <h2 className="text-4xl font-bold mb-6">{m.notMagicMethod()}</h2>
              <p className="text-lg text-muted-foreground">
                {m.realResultUsing()}
              </p>
            </div>

            {/* Featured Case Study */}
            <div className="max-w-4xl mx-auto mb-16">
              <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Side */}
                  <div className="relative bg-gradient-to-br from-primary/5 to-blue-500/5 p-8 flex items-center justify-center">
                    <div className="relative w-full aspect-square">
                      <Image
                        src="/traffic-growth-before-after.png"
                        alt="Gráfico de crecimiento de tráfico web antes y después de usar Red Creativa Pro"
                        fill
                        className="object-contain rounded-lg"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>

                  {/* Content Side */}
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="space-y-6">
                      <div>
                        <Badge className="mb-4">{m.consistentUse()}</Badge>
                        <h3 className="text-2xl font-bold mb-3">{m.daysWritingAI()}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {m.testimonialQuote()}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary mb-1">12</div>
                          <div className="text-xs text-muted-foreground uppercase">{m.articlesCount()}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">60</div>
                          <div className="text-xs text-muted-foreground uppercase">{m.daysCount()}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">3x</div>
                          <div className="text-xs text-muted-foreground uppercase">{m.fasterTimes3x()}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">SEO</div>
                          <div className="text-xs text-muted-foreground uppercase">{m.seoAutomatedShort()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
                          SG
                        </div>
                        <div>
                          <p className="font-bold">{m.selaCreator()}</p>
                          <p className="text-sm text-muted-foreground">{m.creatorAndDev()}</p>
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
                    <Star className="h-8 w-8 text-primary fill-primary" aria-hidden="true" />
                  </div>
                  <CardTitle className="mb-4 text-2xl">{m.readyNextSuccess()}</CardTitle>
                  <CardDescription className="text-base mb-6 text-center">
                    {m.joinFirst100()}
                  </CardDescription>
                  <Button variant="outline" className="rounded-full">
                    {m.leaveReview()} <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </Card>
            </div>

            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-background border shadow-sm">
                <div className="text-sm font-medium">
                  {m.onlyPlacesAvailable()}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-x-1/2" />
        </section >

        {/* Story & Support Section */}
        < section id="historia" className="py-32 bg-background border-y scroll-mt-24 animate-section" >
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold">{m.storyBehindCode()}</h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {m.collaborativeProject()}
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {m.constantEvolution()} <Link href="https://instagram.com/sela_gb" target="_blank" className="text-primary hover:underline">@sela_gb</Link>.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl bg-muted/30 border border-primary/10 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Github className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-lg">{m.openSource()}</h3>
                    <p className="text-sm text-muted-foreground">{m.openSourceDesc()}</p>
                    <Button variant="link" className="p-0 h-auto text-primary" asChild>
                      <Link href="https://github.com/selamu0220/redcreativapro2" target="_blank" className="flex items-center gap-2">
                        {m.viewGithubRepo()} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>

                  <div className="p-6 rounded-2xl bg-muted/30 border border-primary/10 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coffee className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-lg">{m.supportProject()}</h3>
                    <p className="text-sm text-muted-foreground">{m.supportProjectDesc()}</p>
                    <Button variant="link" className="p-0 h-auto text-primary" asChild>
                      <Link href="/planes" className="flex items-center gap-2">
                        {m.viewSupportWays()} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/5] bg-muted rounded-[2rem] overflow-hidden border-8 border-background shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex flex-col justify-end p-8 text-white">
                    <p className="text-xl font-medium italic">{m.creatorQuote()}</p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center font-bold border-2 border-white">RC</div>
                      <div>
                        <p className="font-bold">{m.theCreator()}</p>
                        <p className="text-sm opacity-80">{m.creatorDev()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </section >

        {/* Final CTA */}
        < section className="py-24 container mx-auto px-4" >
          <Card className="bg-primary text-primary-foreground p-12 md:p-20 text-center overflow-hidden relative">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                {m.bePartOfThis()}
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                {m.notCorporateSoftware()}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto font-bold" asChild>
                  <Link href="/dashboard">
                    {m.joinUsFree()}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto bg-transparent border-primary-foreground/20 hover:bg-white/10" asChild>
                  <Link href="https://instagram.com/sela_gb" target="_blank">
                    {m.writeToMe()}
                  </Link>
                </Button>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
          </Card>
        </section >
      </main >

      {/* Footer */}
      < footer className="border-t py-12 bg-background" >
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
              <Link href="/politica-privacidad" className="hover:text-foreground transition-colors">{m.privacyShort()}</Link>
              <Link href="/terminos-servicio" className="hover:text-foreground transition-colors">{m.termsShort()}</Link>
              <Link href="https://es.trustpilot.com/review/redcreativa.pro" target="_blank" className="hover:text-foreground transition-colors flex items-center gap-1">
                {m.trustpilotShort()} <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </nav>

            <div className="text-xs text-muted-foreground font-mono flex flex-col md:flex-row items-center gap-4">
              <span>© 2025 RED CREATIVA PRO</span>
              <Separator orientation="vertical" className="hidden md:block h-4" />
              <span>{m.indieProjectFooter()}</span>
              <Separator orientation="vertical" className="hidden md:block h-4" />
              <span>{m.madeWithLove()} <Heart className="inline h-3 w-3 text-red-500 fill-red-500" aria-hidden="true" /> {m.inSpain()}</span>
            </div>
          </div>
        </div>
      </footer >


    </>
  )
}



