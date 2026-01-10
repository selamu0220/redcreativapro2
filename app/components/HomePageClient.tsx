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
  Github,
  X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { SimpleLanguageSlider } from './SimpleLanguageSlider'
import { useSimpleTranslations } from '../lib/simple-translations'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import HeroTextAnimation from './HeroTextAnimation'
import { useHeroAnimation, useStaggerAnimation, useScrollAnimation } from '../hooks/useScrollAnimations'

// Dynamically import animation components to prevent SSR issues
const ThreeBackground = dynamic(() => import('./visual-effects/ThreeBackground'), { ssr: false })
const SmoothScroll = dynamic(() => import('./visual-effects/SmoothScroll'), { ssr: false })
const GrainOverlay = dynamic(() => import('./visual-effects/GrainOverlay'), { ssr: false })

export default function HomePageClient() {
  const { t, currentLang } = useSimpleTranslations()
  const { isAuthenticated, user, isLoading: authLoading } = useKindeBrowserClient()
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
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold">Red Creativa Pro</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">
                {t('blog')}
              </Link>
              <Link href="/planes" className="transition-colors hover:text-foreground/80 text-foreground/60">
                {t('plans')}
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
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/api/auth/login">{t('login')}</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/api/auth/register">{t('register')}</Link>
                    </Button>
                  </>
                ) : (
                  // Autenticado: mostrar Dashboard y Usuario
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard">{t('dashboard')}</Link>
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                      <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xs">
                          {user?.given_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium hidden sm:block">
                        {user?.given_name || user?.email?.split('@')[0]}
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
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {t('forJournalists')}
                </Badge>
                <Badge variant="destructive" className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider animate-pulse">
                  🔥 BETA LIMITADA: Solo {availableSpots} usuarios
                </Badge>
                <Badge variant="secondary" className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Github className="h-3 w-3" /> Open Source
                </Badge>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] hero-animate">
                {t('heroTitle1')}<br />
                <HeroTextAnimation />
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed hero-animate">
                {t('heroDescription')}
              </p>

              {/* Trust message */}
              <div className="bg-muted/30 border border-dashed border-primary/20 rounded-xl p-4 max-w-2xl mx-auto mb-8 hero-animate">
                <p className="text-sm text-muted-foreground">
                  {t('indieProject')}
                </p>
              </div>

              {/* Proof Points - Más creíbles */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12 hero-animate">
                <div className="p-4 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-1">3x</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('fasterProof')}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">Auto</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('seoProof')}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{currentLang === 'es' ? 'Tu' : 'Your'}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('styleProof')}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 hero-animate">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 magnetic-hover" asChild>
                  <Link href="/escritor-ia">
                    {t('tryFree')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full hover:bg-muted/50 transition-all active:scale-95 magnetic-hover" asChild>
                  <Link href="#como-funciona">
                    {t('seeHowItWorks')}
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 text-sm font-medium text-muted-foreground hero-animate">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{t('noCard')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{t('allIncluded')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{t('useForever')}</span>
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
        <section className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20 border-y-4 border-dashed border-orange-300 dark:border-orange-700 animate-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="destructive" className="px-6 py-2 text-sm font-bold uppercase tracking-wider mb-6 animate-bounce">
                  ⚠️ {t('realWarning')}
                </Badge>
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  {currentLang === 'es' ? (
                    <>Esta IA <span className="line-through decoration-4 decoration-red-500">NO</span> te vuelve estúpido</>
                  ) : (
                    <>This AI <span className="line-through decoration-4 decoration-red-500">does NOT</span> make you stupid</>
                  )}
                </h2>
                <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-8">
                  {t('adaptsNotReplaces')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Left - Lo que NO hacemos */}
                <Card className="border-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <X className="h-8 w-8 text-red-600" />
                      {t('otherAIs')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{t('writeForYou')}</strong> → {t('yourVoiceDisappears')}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{t('genericContent')}</strong> → {t('googlePenalizes')}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{t('becomeDependant')}</strong> → {t('loseSkill')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Right - Lo que SÍ hacemos */}
                <Card className="border-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      Red Creativa Pro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{t('learnsYourStyle')}</strong> → {t('soundsLikeYouImproved')}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{t('uniqueContent')}</strong> → {t('minimalDetection')}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{t('youKeepWriting')}</strong> → {t('aiOnlyAssists')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom message */}
              <div className="text-center bg-white/50 dark:bg-gray-900/50 p-8 rounded-2xl border-2 border-orange-300 dark:border-orange-700">
                <p className="text-xl md:text-2xl font-bold mb-4">
                  💡 {t('differencInHow')}
                </p>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t('dontGenerateForYou')} <strong className="text-foreground">{t('improveWhatYouWrote')}</strong> {t('brainKeepsWorking')}
                </p>
                <div className="mt-6">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full" asChild>
                    <Link href="/escritor-ia">
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t('tryNowFree')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Sections */}
        <section className="py-32 space-y-32 animate-section">

          {/* Value Equation Section - HACK #2 */}
          <div id="como-funciona" className="container mx-auto px-4 scroll-mt-24">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="px-4 py-1.5">
                <Target className="h-3.5 w-3.5 mr-2" /> {t('howItWorks')}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                {t('valueFormula')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('noEmptyPromises')}
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
                  <CardTitle className="text-xl">🎯 {t('dreamOutcome')}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-primary">{t('more')}</div>
                  <p className="text-lg font-semibold">{t('organicReach')}</p>
                  <p className="text-sm text-muted-foreground">{t('optimizedContent')}</p>
                </CardContent>
              </Card>

              {/* Probability */}
              <Card className="relative overflow-hidden border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all"></div>
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">📊 {t('highProbability')}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">{t('support121')}</div>
                  <p className="text-lg font-semibold">{currentLang === 'es' ? 'Apoyo' : 'Support'}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ {t('monthlyMeeting')}</p>
                    <p>✓ {t('annualPlanSEO')}</p>
                    <Badge variant="secondary" className="mt-2">{t('realSupport')}</Badge>
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
                  <CardTitle className="text-xl">⏱️ {t('minimalTime')}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{t('fast')}</div>
                  <p className="text-lg font-semibold">{t('writeInMinutes')}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>{t('aiAssists')}</strong></p>
                    <p><strong>{t('publishWhenReady')}</strong></p>
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
                  <CardTitle className="text-xl">💪 {t('minimalEffort')}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{t('auto')}</div>
                  <p className="text-lg font-semibold">{t('automaticOptimization')}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ {t('seoWhileWriting')}</p>
                    <p>✓ {t('styleAdapted')}</p>
                    <p>✓ {t('annualPlanTechnical')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>


          </div>

          {/* Prop 2: Analytics/SEO */}
          <div className="bg-muted/30 py-24" ref={seoSectionRef}>
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative seo-chart-container">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden">
                    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">+247%</div>
                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('trafficGrowthStat')}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 w-full max-w-md">
                        <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">89%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('conversionStat')}</div>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3.2x</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('roiStat')}</div>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24h</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('responseStat')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-8 seo-content">
                  <div className="seo-badge inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                    <Target className="h-3.5 w-3.5" /> {t('strategyAndSEO')}
                  </div>
                  <h2 className="seo-title text-4xl md:text-5xl font-bold leading-tight">
                    {t('dominateSearchEngines')} <br />
                    <span className="text-muted-foreground">{t('withDataNotGuesses')}</span>
                  </h2>
                  <p className="seo-description text-lg text-muted-foreground leading-relaxed">
                    {t('seoToolsDesc')}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-6 seo-features">
                    <div className="seo-feature space-y-3 p-4 rounded-lg hover:bg-background/50 transition-all duration-300">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shadow-sm transform transition-transform duration-300 hover:scale-110">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-bold">{t('intentAnalysis')}</h4>
                      <p className="text-sm text-muted-foreground">{t('understandWhy')}</p>
                    </div>
                    <div className="seo-feature space-y-3 p-4 rounded-lg hover:bg-background/50 transition-all duration-300">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shadow-sm transform transition-transform duration-300 hover:scale-110">
                        <Globe2 className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-bold">{t('localSEO')}</h4>
                      <p className="text-sm text-muted-foreground">{t('optimizePresence')}</p>
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
                  <Zap className="h-3.5 w-3.5 mr-2" /> {t('tools')}
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold">
                  {t('everythingInOnePlace')}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t('toolsDesc')}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PenTool className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{t('writerIA')}</h3>
                    <p className="text-muted-foreground">{t('writerIADesc')}</p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold">{t('emailMarketing')}</h3>
                    <p className="text-muted-foreground">{t('emailMarketingDesc')}</p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-background hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold">{t('seoAnalysis')}</h3>
                    <p className="text-muted-foreground">{t('seoAnalysisDesc')}</p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12">
                <Button asChild size="lg">
                  <Link href="/dashboard">{t('seeAllTools')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section - HACK #4 */}
        <section className="py-24 border-t bg-muted/20 relative overflow-hidden animate-section">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="px-4 py-1.5 mb-4">
                <Star className="h-3.5 w-3.5 mr-2 fill-primary" /> {t('realCase')}
              </Badge>
              <h2 className="text-4xl font-bold mb-6">{t('notMagicMethod')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('realResultUsing')}
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
                        <Badge className="mb-4">{t('consistentUse')}</Badge>
                        <h3 className="text-2xl font-bold mb-3">{t('daysWritingAI')}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t('testimonialQuote')}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary mb-1">12</div>
                          <div className="text-xs text-muted-foreground uppercase">{t('articlesCount')}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">60</div>
                          <div className="text-xs text-muted-foreground uppercase">{t('daysCount')}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">3x</div>
                          <div className="text-xs text-muted-foreground uppercase">{t('fasterTimes3x')}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">SEO</div>
                          <div className="text-xs text-muted-foreground uppercase">{t('seoAutomatedShort')}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
                          SG
                        </div>
                        <div>
                          <p className="font-bold">{t('selaCreator')}</p>
                          <p className="text-sm text-muted-foreground">{t('creatorAndDev')}</p>
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
                  <CardTitle className="mb-4 text-2xl">{t('readyNextSuccess')}</CardTitle>
                  <CardDescription className="text-base mb-6 text-center">
                    {t('joinFirst100')}
                  </CardDescription>
                  <Button variant="outline" className="rounded-full">
                    {t('leaveReview')} <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            </div>

            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-background border shadow-sm">
                <div className="text-sm font-medium">
                  {t('onlyPlacesAvailable')}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-x-1/2" />
        </section>

        {/* Story & Support Section */}
        <section id="historia" className="py-32 bg-background border-y scroll-mt-24 animate-section">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold">{t('storyBehindCode')}</h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {t('collaborativeProject')}
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('constantEvolution')} <Link href="https://instagram.com/sela_gb" target="_blank" className="text-primary hover:underline">@sela_gb</Link>.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl bg-muted/30 border border-primary/10 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Github className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">{t('openSource')}</h3>
                    <p className="text-sm text-muted-foreground">{t('openSourceDesc')}</p>
                    <Button variant="link" className="p-0 h-auto text-primary" asChild>
                      <Link href="https://github.com/selamu0220/redcreativapro2" target="_blank" className="flex items-center gap-2">
                        {t('viewGithubRepo')} <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="p-6 rounded-2xl bg-muted/30 border border-primary/10 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coffee className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">{t('supportProject')}</h3>
                    <p className="text-sm text-muted-foreground">{t('supportProjectDesc')}</p>
                    <Button variant="link" className="p-0 h-auto text-primary" asChild>
                      <Link href="/planes" className="flex items-center gap-2">
                        {t('viewSupportWays')} <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/5] bg-muted rounded-[2rem] overflow-hidden border-8 border-background shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex flex-col justify-end p-8 text-white">
                    <p className="text-xl font-medium italic">{t('creatorQuote')}</p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center font-bold border-2 border-white">RC</div>
                      <div>
                        <p className="font-bold">{t('theCreator')}</p>
                        <p className="text-sm opacity-80">{t('creatorDev')}</p>
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
                {t('bePartOfThis')}
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                {t('notCorporateSoftware')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto font-bold" asChild>
                  <Link href="/dashboard">
                    {t('joinUsFree')}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto bg-transparent border-primary-foreground/20 hover:bg-white/10" asChild>
                  <Link href="https://instagram.com/sela_gb" target="_blank">
                    {t('writeToMe')}
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
              <Link href="/politica-privacidad" className="hover:text-foreground transition-colors">{t('privacyShort')}</Link>
              <Link href="/terminos-servicio" className="hover:text-foreground transition-colors">{t('termsShort')}</Link>
              <Link href="https://es.trustpilot.com/review/redcreativa.pro" target="_blank" className="hover:text-foreground transition-colors flex items-center gap-1">
                {t('trustpilotShort')} <ArrowUpRight className="h-3 w-3" />
              </Link>
            </nav>

            <div className="text-xs text-muted-foreground font-mono flex flex-col md:flex-row items-center gap-4">
              <span>© 2025 RED CREATIVA PRO</span>
              <Separator orientation="vertical" className="hidden md:block h-4" />
              <span>{t('indieProjectFooter')}</span>
              <Separator orientation="vertical" className="hidden md:block h-4" />
              <span>{t('madeWithLove')} <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> {t('inSpain')}</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}



