'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { SimpleMainNavigation } from '@/app/components/SimpleMainNavigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Shield, Laptop, Smartphone, Monitor, Globe, Clock, AlertTriangle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import WorkingClientLayout from "@/app/components/WorkingClientLayout";
import { LanguageProvider } from "@/app/lib/language/context";
import { DEFAULT_LANGUAGE } from "@/app/lib/language/config";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

function SeguridadPageContent() {
  const { user, isLoading } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const fetchSessions = async () => {
    if (!user) return
    try {
      setLoading(true)
      // Note: Kinde doesn't provide session management API like Clerk
      // You would need to implement this using your own backend
      // For now, we'll show a placeholder message
      setSessions([])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && user) {
      fetchSessions()
    }
  }, [isLoading, user])

  const handleRevoke = async (sessionId: string) => {
    // Note: Session revocation would need to be implemented on your backend
    alert('La gestión de sesiones está en desarrollo. Por favor, contacta al soporte si necesitas cerrar sesiones activas.')
  }

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType?.toLowerCase().includes('mobile') || deviceType?.toLowerCase().includes('phone')) return <Smartphone className="h-5 w-5" />
    if (deviceType?.toLowerCase().includes('tablet')) return <Smartphone className="h-5 w-5" /> // Tablet icon would be better but Smartphone is fine
    return <Monitor className="h-5 w-5" />
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-24 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link href="/ajustes" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Volver a Ajustes</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Seguridad y Sesiones</h1>
          <p className="text-muted-foreground">Administra los dispositivos que tienen acceso a tu cuenta.</p>
        </div>

        <div className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Sesiones Activas</CardTitle>
                  <CardDescription>
                    Si ves un dispositivo desconocido, puedes cerrar su sesión aquí.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4 py-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">La gestión de sesiones está en desarrollo.</p>
                  <p className="text-sm text-muted-foreground mt-2">Pronto podrás ver y administrar tus sesiones activas aquí.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {sessions.map((session) => (
                    <div key={session.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          {getDeviceIcon(session.latestActivity?.deviceType || 'desktop')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {session.latestActivity?.browserName || 'Navegador'} en {session.latestActivity?.osName || 'Sistema'}
                            </span>
                            {session.status === 'active' && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 border-none">Actual</Badge>
                            )}
                          </div>
                          <div className="flex flex-col text-sm text-muted-foreground gap-1 mt-1">
                            <div className="flex items-center gap-1.5">
                              <Globe className="h-3.5 w-3.5" />
                              <span>{session.latestActivity?.ipAddress || 'IP desconocida'} • {session.latestActivity?.city || 'Ubicación desconocida'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Última actividad: {formatDate(session.lastActiveAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Note: Kinde doesn't provide session management, so we can't revoke specific sessions */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive border-zinc-200 dark:border-zinc-800"
                        onClick={() => handleRevoke(session.id)}
                        disabled={true}
                      >
                        Cerrar sesión
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t px-6 py-4">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Si crees que tu cuenta ha sido comprometida, te recomendamos también cambiar tu contraseña y habilitar la autenticación en dos pasos.
                </span>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SeguridadPage() {
  return (
    <WorkingClientLayout>
      <LanguageProvider>
        <ProtectedRoute>
          <SeguridadPageContent />
        </ProtectedRoute>
      </LanguageProvider>
    </WorkingClientLayout>
  );
}
