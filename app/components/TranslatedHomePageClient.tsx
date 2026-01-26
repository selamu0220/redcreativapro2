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
import dynamic from 'next/dynamic'
import { HydrationSafeLanguageSlider } from './HydrationSafeLanguageSlider'
import { SliderVisibilityFix } from './SliderVisibilityFix'
import { useSimpleTranslations } from '../lib/simple-translations'

const ParticleCanvas = dynamic(() => import('./ParticleCanvas'), { ssr: false })
const TiltCardPremium = dynamic(() => import('./TiltCardPremium'), { ssr: false })

async function initGsap() {
    if (typeof window === 'undefined') return null
    try {
        const gsapModule = await import('gsap')
        const scrollTriggerModule = await import('gsap/ScrollTrigger')
        const gsapInstance = gsapModule.gsap
        if (gsapInstance) {
            gsapInstance.registerPlugin(scrollTriggerModule.ScrollTrigger)
        }
        return gsapInstance
    } catch {
        return null
    }
}

export default function TranslatedHomePageClient() {
  const { t: rawT } = useSimpleTranslations()
  const t = (key: string) => rawT(key as any)
  const heroRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const setup = async () => {
      const gsap = await initGsap()
      if (!gsap) return
      
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
    }
    setup()
  }, [])

  return (
    <>
      <SliderVisibilityFix />
      <div className="grain-overlay" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold">{t('hero.title')}</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Blog
              </Link>
              <Link href="/planes" className="transition-colors hover:text-foreground/80 text-foreground/60">
                {t('navigation.plans') || 'Plans'}
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <HydrationSafeLanguageSlider className="mr-2" />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/escritor-ia">{t('hero.tryFree')}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/planes">{t('hero.seePlans')}</Link>
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
                {t('hero.title')}<br />
                <span className="gradient-text-animated italic font-serif">{t('hero.subtitle')}</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed hero-animate">
                {t('hero.description')}
              </p>

              {/* Trust message */}
              <div className="bg-muted/30 border border-dashed border-primary/20 rounded-xl p-4 max-w-2xl mx-auto mb-8 hero-animate">
                <p className="text-sm text-muted-foreground">
                  {t('hero.projectNote')}
                </p>
              </div>

              {/* Proof Points */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12 hero-animate">
                <div className="p-4 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-1">3x</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('features.faster')}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">Auto</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('features.autoSEO')}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">Tu</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('features.uniqueStyle')}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 hero-animate">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 magnetic-hover" asChild>
                  <Link href="/escritor-ia">
                    {t('hero.tryFree')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full hover:bg-muted/50 transition-all active:scale-95 magnetic-hover" asChild>
                  <Link href="#como-funciona">
                    {t('hero.seeHowItWorks')}
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 text-sm font-medium text-muted-foreground hero-animate">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{t('hero.noCard')}</span>
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

        {/* Value Proposition Section */}
        <section className="py-32">
          <div id="como-funciona" className="container mx-auto px-4 scroll-mt-24">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="px-4 py-1.5">
                <Target className="h-3.5 w-3.5 mr-2" /> {t('valueFormula.title')}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                {t('valueFormula.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('valueFormula.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Dream Outcome */}
              <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl group">
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{t('valueFormula.aspirationalResult')}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-primary">{t('valueFormula.moreReach')}</div>
                  <p className="text-sm text-muted-foreground">{t('valueFormula.optimizedContent')}</p>
                </CardContent>
              </Card>

              {/* Probability */}
              <Card className="relative overflow-hidden border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-xl group">
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">{t('valueFormula.highProbability')}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">{t('valueFormula.oneOnOneSupport')}</div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{t('valueFormula.monthlyMeeting')}</p>
                    <p>{t('valueFormula.annualPlan')}</p>
                    <Badge variant="secondary" className="mt-2">{t('valueFormula.realAssistance')}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Time */}
              <Card className="relative overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-xl group">
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">{t('valueFormula.minimalTime')}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{t('valueFormula.fast')}</div>
                  <p className="text-lg font-semibold">{t('valueFormula.writeInMinutes')}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{t('valueFormula.aiAssists')}</p>
                    <p>{t('valueFormula.publication')}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Effort */}
              <Card className="relative overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-xl group">
                <CardHeader className="relative">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl">{t('valueFormula.minimalEffort')}</CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{t('valueFormula.auto')}</div>
                  <p className="text-lg font-semibold">{t('valueFormula.automaticOptimization')}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{t('valueFormula.seoWhileWriting')}</p>
                    <p>{t('valueFormula.styleAdapted')}</p>
                    <p>{t('valueFormula.annualPlanTechnical')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>


          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">RC</span>
                </div>
                <span className="font-bold text-xl">{t('hero.title')}</span>
                <Badge variant="secondary" className="ml-2">{t('footer.beta')}</Badge>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.privacy')}
                </Link>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.terms')}
                </Link>
                <Link href="https://trustpilot.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.trustpilot')}
                </Link>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">{t('footer.copyright')}</p>
                <p className="text-xs text-muted-foreground font-medium">{t('footer.independentProject')}</p>
                <p className="text-xs text-muted-foreground">{t('footer.madeInSpain')}</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}