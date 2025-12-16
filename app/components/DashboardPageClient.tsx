'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useOptimizedAuth } from '../hooks/useOptimizedAuth'
import { useGuestTrial } from '../hooks/useGuestTrial'
import { usePremiumAccess } from '../hooks/usePremiumAccess'
import GuestTrialInterface from '../components/GuestTrialInterface'
import VideoModal from '../components/VideoModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { 
  PenTool,
  Mail,
  FileText,
  Lightbulb,
  Users,
  BarChart3,
  Clock,
  Target,
  Activity,
  TrendingUp,
  Star,
  Crown,
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { 
  AnimatedPageWrapper,
  AnimatedHeroSection, 
  AnimatedTitle, 
  AnimatedSubtitle,
  AnimatedDashboardCard,
  AnimatedGreeting,
  AnimatedList,
  AnimatedListItem,
  AnimatedBadge
} from '../../components/animations/PageAnimations'
import { useTranslation } from '../lib/language/context'
import { formatNumber } from '../lib/localization'
import type { LanguageCode } from "../lib/language/config";

interface DashboardPageClientProps {
  initialLang: LanguageCode;
}

export default function DashboardPageClient({ initialLang }: DashboardPageClientProps) {
  const { user, isInitializing } = useAuth()
  const { isTrialActive, timeRemainingSeconds, stopGuestTrial, startGuestTrial, canStartTrial } = useGuestTrial()
  const { isPremium, loading: premiumLoading } = usePremiumAccess()
  const { t, currentLanguage } = useTranslation('dashboard')
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [currentLang, setCurrentLang] = useState<LanguageCode>(initialLang);

  useEffect(() => {
    setCurrentLang(initialLang);
  }, [initialLang]);

  // Función para obtener el saludo según la hora del día
  const getGreeting = (t: (key: string) => string) => {
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
    
    // Si hay nombre en metadata, usar las primeras dos sílabas
    if (user.user_metadata?.name) {
      const name = user.user_metadata.name.trim()
      const words = name.split(' ')
      if (words.length > 1) {
        // Si hay más de una palabra, tomar la primera
        return words[0]
      } else {
        // Si es una sola palabra, tomar las primeras dos sílabas aproximadamente
        return name.length > 6 ? name.substring(0, 6) : name
      }
    }
    
    // Si no hay nombre, usar el email hasta el @
    if (user.email) {
      const emailName = user.email.split('@')[0]
      return emailName.length > 8 ? emailName.substring(0, 8) : emailName
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

  // Efecto para manejar la redirección cuando no hay usuario
  useEffect(() => {
    if (!isLoading && !user && !isInitializing) {
      router.push(`/${currentLang}/auth`)
    }
  }, [user, isLoading, isInitializing, router, currentLang])

  // Mostrar loading mientras se inicializa
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, mostrar loading mientras redirige
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  const userName = getUserName()

  return (
    <AnimatedPageWrapper>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <AnimatedHeroSection>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="space-y-2">
                <AnimatedGreeting>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {getGreeting(t)}, {userName}
                  </h1>
                </AnimatedGreeting>
                <AnimatedSubtitle>
                  <p className="text-muted-foreground">
                    Bienvenido a tu espacio de trabajo
                  </p>
                </AnimatedSubtitle>
              </div>
              
              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                {isPremium ? (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                ) : (
                  <Button asChild>
                    <Link href={`/${currentLang}/subscription`}>
                      <Star className="h-4 w-4 mr-2" />
                      Obtener Premium
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/${currentLang}/ajustes`}>
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedHeroSection>

          {/* Tools Grid */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Herramientas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Escritor IA */}
                <AnimatedDashboardCard>
                  <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <Link href={`/${currentLang}/escritor-ia`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-md">
                              <PenTool className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Escritor IA</CardTitle>
                              <CardDescription className="text-xs">
                                Genera contenido con IA
                              </CardDescription>
                            </div>
                          </div>
                          {!isPremium && !isTrialActive && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          Crea contenido de alta calidad usando inteligencia artificial
                        </p>
                        <div className="flex items-center text-xs text-primary font-medium group-hover:gap-2 transition-all">
                          Explorar
                          <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </AnimatedDashboardCard>

                {/* Correos IA */}
                <AnimatedDashboardCard>
                  <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <Link href={`/${currentLang}/correos-ia`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/50 rounded-md">
                              <Mail className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Correos IA</CardTitle>
                              <CardDescription className="text-xs">
                                Campañas de email inteligentes
                              </CardDescription>
                            </div>
                          </div>
                          {!isPremium && !isTrialActive && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          Crea campañas de email marketing personalizadas
                        </p>
                        <div className="flex items-center text-xs text-foreground font-medium group-hover:gap-2 transition-all">
                          Explorar
                          <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </AnimatedDashboardCard>

                {/* Plantillas */}
                <AnimatedDashboardCard>
                  <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <Link href={`/${currentLang}/plantillas`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/50 rounded-md">
                              <FileText className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Plantillas</CardTitle>
                              <CardDescription className="text-xs">
                                Plantillas prediseñadas
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Gratis
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          Accede a plantillas profesionales para tus proyectos
                        </p>
                        <div className="flex items-center text-xs text-foreground font-medium group-hover:gap-2 transition-all">
                          Explorar
                          <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </AnimatedDashboardCard>

                {/* Prompts */}
                <AnimatedDashboardCard>
                  <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <Link href={`/${currentLang}/prompts`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/50 rounded-md">
                              <Lightbulb className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Prompts</CardTitle>
                              <CardDescription className="text-xs">
                                Prompts optimizados
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Gratis
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          Colección de prompts para mejorar tus resultados con IA
                        </p>
                        <div className="flex items-center text-xs text-foreground font-medium group-hover:gap-2 transition-all">
                          Explorar
                          <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </AnimatedDashboardCard>

                {/* Documentos */}
                <AnimatedDashboardCard>
                  <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <Link href={`/${currentLang}/documentos`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/50 rounded-md">
                              <FileText className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Documentos</CardTitle>
                              <CardDescription className="text-xs">
                                Gestiona tus documentos
                              </CardDescription>
                            </div>
                          </div>
                          {!isPremium && !isTrialActive && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          Organiza y gestiona todos tus documentos creados
                        </p>
                        <div className="flex items-center text-xs text-foreground font-medium group-hover:gap-2 transition-all">
                          Explorar
                          <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </AnimatedDashboardCard>

                {/* Contactos */}
                <AnimatedDashboardCard>
                  <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <Link href={`/${currentLang}/contactos`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/50 rounded-md">
                              <Users className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Contactos</CardTitle>
                              <CardDescription className="text-xs">
                                Gestiona tus contactos
                              </CardDescription>
                            </div>
                          </div>
                          {!isPremium && !isTrialActive && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          Organiza tu base de datos de contactos y clientes
                        </p>
                        <div className="flex items-center text-xs text-foreground font-medium group-hover:gap-2 transition-all">
                          Explorar
                          <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </AnimatedDashboardCard>
              </div>
            </div>

            <Separator />

            {/* Quick Stats */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Estadísticas Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnimatedDashboardCard>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-muted-foreground">Documentos creados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedDashboardCard>

                <AnimatedDashboardCard>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <Clock className="h-6 w-6 text-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">0h</p>
                          <p className="text-sm text-muted-foreground">Tiempo ahorrado</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedDashboardCard>

                <AnimatedDashboardCard>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <Target className="h-6 w-6 text-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-muted-foreground">Plantillas usadas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedDashboardCard>
              </div>
            </div>

            <Separator />

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
              <AnimatedList>
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto">
                        <Activity className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">No hay actividad reciente</h3>
                        <p className="text-sm text-muted-foreground">
                          Comienza creando tu primer documento para ver tu actividad aquí
                        </p>
                      </div>
                      <Button asChild>
                        <Link href={`/${currentLang}/escritor-ia`}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Crear primer documento
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedList>
            </div>
          </div>
        </div>

        {/* Guest Trial Interface */}
        {!isPremium && isTrialActive && (
          <GuestTrialInterface
            toolName="Dashboard"
            onClose={stopGuestTrial}
          >
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Prueba activa</h3>
              <p className="text-sm text-muted-foreground">
                Estás usando la versión de prueba
              </p>
              <p className="text-xs text-muted-foreground">
                Tiempo restante: {Math.ceil(timeRemainingSeconds / 60)} minutos
              </p>
            </div>
          </GuestTrialInterface>
        )}

        {/* Video Modal */}
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoId="dQw4w9WgXcQ"
          title="Tutorial de Red Creativa Pro"
        />
      </div>
    </AnimatedPageWrapper>
  )
}