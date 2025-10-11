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

export default function DashboardPage() {
  const { user, isInitializing } = useAuth()
  const { isTrialActive, timeRemainingSeconds, stopGuestTrial, startGuestTrial, canStartTrial } = useGuestTrial()
  const { isPremium, loading: premiumLoading } = usePremiumAccess()
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

  // Si no hay usuario, redirigir al login
  if (!user) {
    router.push('/auth/login')
    return null
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
                    {getGreeting()}, {userName}
                  </h1>
                </AnimatedGreeting>
                <AnimatedSubtitle>
                  <p className="text-muted-foreground">
                    Bienvenido a tu centro de control de Red Creativa Pro
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
                    <Link href="/subscription">
                      <Star className="h-4 w-4 mr-2" />
                      Obtener Premium
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" size="icon" asChild>
                  <Link href="/ajustes">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedHeroSection>

          {/* Tools Grid */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Herramientas Disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Escritor IA */}
                <AnimatedDashboardCard>
                  <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <Link href="/escritor-ia">
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
                          Crea artículos, posts, emails y más contenido de alta calidad usando inteligencia artificial avanzada.
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
                    <Link href="/correos-ia">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-md">
                              <Mail className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Correos IA</CardTitle>
                              <CardDescription className="text-xs">
                                Emails profesionales
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
                          Genera emails profesionales, newsletters y campañas de marketing con IA especializada.
                        </p>
                        <div className="flex items-center text-xs text-green-600 font-medium group-hover:gap-2 transition-all">
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
                    <Link href="/plantillas">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-md">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Plantillas</CardTitle>
                              <CardDescription className="text-xs">
                                Templates listos
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                            Gratis
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          Accede a cientos de plantillas prediseñadas para diferentes tipos de contenido y propósitos.
                        </p>
                        <div className="flex items-center text-xs text-purple-600 font-medium group-hover:gap-2 transition-all">
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
                    <Link href="/prompts">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-md">
                              <Lightbulb className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Prompts</CardTitle>
                              <CardDescription className="text-xs">
                                Comandos optimizados
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                            Gratis
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          Biblioteca de prompts optimizados para obtener los mejores resultados de cualquier IA.
                        </p>
                        <div className="flex items-center text-xs text-blue-600 font-medium group-hover:gap-2 transition-all">
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
                    <Link href="/documentos">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-md">
                              <FileText className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Documentos</CardTitle>
                              <CardDescription className="text-xs">
                                Gestión de archivos
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
                          Organiza y gestiona todos tus documentos generados con IA en un solo lugar.
                        </p>
                        <div className="flex items-center text-xs text-orange-600 font-medium group-hover:gap-2 transition-all">
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
                    <Link href="/contactos">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-500/10 rounded-md">
                              <Users className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Contactos</CardTitle>
                              <CardDescription className="text-xs">
                                Gestión de clientes
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
                          Administra tu base de datos de contactos y clientes de manera eficiente.
                        </p>
                        <div className="flex items-center text-xs text-teal-600 font-medium group-hover:gap-2 transition-all">
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
                          <p className="text-sm text-muted-foreground">Documentos Creados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedDashboardCard>

                <AnimatedDashboardCard>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                          <Clock className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">0h</p>
                          <p className="text-sm text-muted-foreground">Tiempo Ahorrado</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedDashboardCard>

                <AnimatedDashboardCard>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-muted-foreground">Plantillas Usadas</p>
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
                          Comienza a usar nuestras herramientas para ver tu actividad aquí
                        </p>
                      </div>
                      <Button asChild>
                        <Link href="/escritor-ia">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Crear Primer Documento
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
              <h3 className="font-semibold">¡Prueba Premium Activa!</h3>
              <p className="text-sm text-muted-foreground">
                Tienes acceso completo a todas las herramientas premium.
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