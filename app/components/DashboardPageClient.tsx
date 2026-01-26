'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useGuestTrial } from '../hooks/useGuestTrial'
import { usePremiumAccess } from '../hooks/usePremiumAccess'
import GuestTrialInterface from '../components/GuestTrialInterface'
import WriterTutorialModal from '../components/WriterTutorialModal'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import {
  PenTool,
  Settings,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  BarChart3,
  Plus,
  LayoutDashboard,
  FolderOpen,
  Play,
  Crown,
  Star,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Type,
  Flame,
  Users
} from 'lucide-react'
import { useSimpleTranslations } from '../lib/simple-translations'
import { SimpleLanguageSlider } from './SimpleLanguageSlider'
import type { LanguageCode } from "../lib/language/config";

interface DashboardPageClientProps {
  initialLang: LanguageCode;
}

// Sidebar navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', active: true },
  { id: 'writer', label: 'Escritor IA', icon: PenTool, href: '/escritor-ia' },
  { id: 'documents', label: 'Documentos', icon: FolderOpen, href: '/escritor-ia' },
  { id: 'community', label: 'Comunidad', icon: Users, href: '/dashboard/community' },
  { id: 'settings', label: 'Ajustes', icon: Settings, href: '/ajustes' },
]

// Metric card component with trend badge
function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  description,
  icon: Icon
}: {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {trend !== undefined && (
            <Badge
              variant="outline"
              className={`gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50' :
                isNegative ? 'text-red-600 border-red-200 bg-red-50 dark:bg-red-950/50' :
                  'text-muted-foreground'
                }`}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : null}
              {isPositive ? '+' : ''}{trend}%
            </Badge>
          )}
          {Icon && !trend && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trendLabel && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {trendLabel}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
export default function DashboardPageClient({ initialLang }: DashboardPageClientProps) {
  const { user, isLoading: isInitializing } = useAuth()
  const { isTrialActive, timeRemainingSeconds, stopGuestTrial } = useGuestTrial()
  const { hasPremiumAccess: isPremium } = usePremiumAccess()
  const { t } = useSimpleTranslations()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState<LanguageCode>(initialLang)
  const [stats, setStats] = useState({ totalDocuments: 0, totalWords: 0, docsThisMonth: 0 })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    setCurrentLang(initialLang)
  }, [initialLang])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'Buenos días'
    if (hour >= 12 && hour < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const getUserName = () => {
    if (!user) return ''
    // Check Supabase user_metadata first
    if (user.user_metadata?.full_name) return user.user_metadata.full_name
    if (user.user_metadata?.name) return user.user_metadata.name
    if (user.user_metadata?.first_name) return user.user_metadata.first_name

    // Fallbacks
    if ((user as any).fullName) return (user as any).fullName
    if ((user as any).firstName) return (user as any).firstName
    if (user.email) {
      const emailName = user.email.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
    return 'Usuario'
  }

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isInitializing) {
      setIsLoading(false)
    }
  }, [isHydrated, isInitializing])

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/documents/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    if (!isLoading) {
      fetchStats()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
            <Sparkles className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  const userName = getUserName()
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 border-r bg-card flex-col fixed h-screen">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">RC</span>
            </div>
            <span className="font-bold text-lg">Red Creativa</span>
          </Link>
        </div>

        {/* Quick Create Button */}
        <div className="p-4">
          <Button asChild className="w-full gap-2 shadow-lg shadow-primary/20">
            <Link href="/escritor-ia">
              <Plus className="h-4 w-4" />
              Nuevo Documento
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recursos
            </p>
            <Link
              href="https://instagram.com/sela_gb"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Soporte
            </Link>
            <Link
              href="https://es.trustpilot.com/review/redcreativa.pro"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Star className="h-4 w-4" />
              Dejar Reseña
            </Link>
          </div>
        </nav>

        {/* Premium Badge / Upgrade */}
        <div className="p-4 border-t">
          {isPremium ? (
            <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
              <Crown className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium">Premium</p>
                <p className="text-xs text-muted-foreground">Acceso completo</p>
              </div>
            </div>
          ) : (
            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="/planes">
                <Star className="h-4 w-4" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-72 bg-card border-r z-50 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">RC</span>
                </div>
                <span className="font-bold">Red Creativa</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <Button asChild className="w-full gap-2">
                <Link href="/escritor-ia">
                  <Plus className="h-4 w-4" />
                  Nuevo Documento
                </Link>
              </Button>
            </div>
            <nav className="flex-1 px-3 py-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SimpleLanguageSlider />
              {isPremium && (
                <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">

          {/* Welcome Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="capitalize">{currentDate}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              {getGreeting()}, <span className="text-primary">{userName}</span>
            </h1>
            <p className="text-muted-foreground">
              Aquí tienes un resumen de tu actividad
            </p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Total Documentos"
              value={statsLoading ? '...' : stats.totalDocuments.toLocaleString()}
              icon={FileText}
              description={`${stats.docsThisMonth} creados este mes`}
            />
            <MetricCard
              title="Palabras Escritas"
              value={statsLoading ? '...' : stats.totalWords.toLocaleString()}
              icon={Type}
              description="Total en todos tus documentos"
            />
            <MetricCard
              title="Racha Activa"
              value="1 día"
              icon={Flame}
              description="Escribe cada día para aumentarla"
            />
          </div>

          {/* Main CTA */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 lg:p-8 relative">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    Escritor IA con Auto-Mejora
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold">
                    Crea contenido que conquista Google
                  </h3>
                  <p className="text-muted-foreground">
                    Escribe artículos optimizados para SEO con IA que mejora tu texto automáticamente.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
                      <Link href="/escritor-ia">
                        <PenTool className="h-4 w-4" />
                        Empezar a Escribir
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2" onClick={() => setShowTutorial(true)}>
                      <Play className="h-4 w-4" />
                      Ver Tutorial
                    </Button>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-2xl blur-2xl opacity-20" />
                    <div className="relative p-6 bg-gradient-to-br from-primary to-primary/80 rounded-2xl text-white">
                      <PenTool className="h-12 w-12" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: PenTool, label: 'Nuevo Artículo', href: '/escritor-ia', color: 'bg-violet-500' },
                { icon: FileText, label: 'Mis Documentos', href: '/escritor-ia', color: 'bg-emerald-500' },
                { icon: Type, label: 'Plantillas', href: '/escritor-ia', color: 'bg-amber-500' },
                { icon: Settings, label: 'Ajustes', href: '/ajustes', color: 'bg-slate-500' },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                      <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {action.label}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main >

      {/* Guest Trial Interface */}
      {
        !isPremium && isTrialActive && (
          <GuestTrialInterface toolName="Dashboard" onClose={stopGuestTrial}>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">{t('guestTrialActive')}</h3>
              <p className="text-sm text-muted-foreground">{t('usingTrialVersion')}</p>
              <p className="text-xs text-muted-foreground">
                {t('timeRemaining')}: {Math.ceil(timeRemainingSeconds / 60)} {t('minutes')}
              </p>
            </div>
          </GuestTrialInterface>
        )
      }

      {/* Tutorial Modal */}
      <WriterTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div >
  )
}
