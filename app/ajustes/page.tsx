'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { SimpleMainNavigation } from '@/app/components/SimpleMainNavigation'
import Footer from '@/app/components/Footer'
import VideoModal from '../components/VideoModal'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'
import ErrorBoundary from '../components/ErrorBoundary'
import { useAuth } from '../hooks/useAuth'
import { createClient } from '@/utils/supabase/client'
import { useOpenRouterSync } from '../hooks/useOpenRouterSync'
import { useSubscription } from '../hooks/useSubscription'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { Youtube, Key, Save, Trash2, Eye, EyeOff, CheckCircle2, AlertCircle, Shield, ChevronRight, Palette, Mic } from 'lucide-react'
import Link from 'next/link'

import WorkingClientLayout from "../components/WorkingClientLayout";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { ThemeStyleProvider } from "../contexts/ThemeStyleContext";

function AjustesPageContent() {
  const { user, logout } = useAuth()
  const [showVideoModal, setShowVideoModal] = useState(false)

  const {
    openRouterApiKey,
    openRouterModel,
    geminiApiKey,
    saveOpenRouterConfig,
    saveGeminiConfig,
    clearOpenRouterConfig,
    clearGeminiConfig
  } = useOpenRouterSync()

  const [showOpenRouterApiKey, setShowOpenRouterApiKey] = useState(false)
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false)
  const [isTestingOpenRouterApiKey, setIsTestingOpenRouterApiKey] = useState(false)
  const [openRouterApiKeyTestResult, setOpenRouterApiKeyTestResult] = useState<{ success: boolean, message: string } | null>(null)

  // Assistant Preference
  const [showAssistant, setShowAssistant] = useState(true)

  useEffect(() => {
    if (user) {
      setShowAssistant(user.user_metadata?.show_assistant !== false)
    }
  }, [user])

  const toggleAssistant = async (checked: boolean) => {
    setShowAssistant(checked)
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: { show_assistant: checked }
    })
    window.location.reload()
  }

  const { subscriptionData, loading: subLoading } = useSubscription()
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    plan: string,
    isPremium: boolean,
    usage: number,
    limit: number,
    daysLeft?: number
  } | null>(null)

  useEffect(() => {
    async function fetchUsageInfo() {
      try {
        const usageRes = await fetch('/api/usage-stats')
        const usageData = await usageRes.json()

        if (subscriptionData) {
          setSubscriptionInfo({
            plan: subscriptionData.subscriptionPlan || 'Free',
            isPremium: subscriptionData.isActive || false,
            usage: usageData.usage || 0,
            limit: usageData.limit || 3,
            daysLeft: undefined
          })
        } else {
          // Default fallback state if subscription data is missing but loaded (unlikely but safe)
          setSubscriptionInfo({
            plan: 'Free',
            isPremium: false,
            usage: usageData.usage || 0,
            limit: usageData.limit || 3,
            daysLeft: undefined
          })
        }
      } catch (e) {
        console.error('Error fetching usage info:', e)
      }
    }

    if (!subLoading) {
      fetchUsageInfo()
    }
  }, [subscriptionData, subLoading])

  const handleOpenRouterModelChange = (newModel: string) => {
    saveOpenRouterConfig(openRouterApiKey, newModel)
  }

  const handleOpenRouterApiKeyChange = (newApiKey: string) => {
    saveOpenRouterConfig(newApiKey, openRouterModel)
  }

  const handleGeminiApiKeyChange = (newApiKey: string) => {
    saveGeminiConfig(newApiKey)
  }

  const saveConfig = () => {
    alert('Configuración sincronizada automáticamente con tu cuenta')
  }

  const clearConfig = () => {
    if (confirm('¿Estás seguro de que quieres limpiar la API key de OpenRouter?')) {
      clearOpenRouterConfig()
      setOpenRouterApiKeyTestResult(null)
    }
  }

  const clearGemini = () => {
    if (confirm('¿Estás seguro de que quieres limpiar la API key de Gemini?')) {
      clearGeminiConfig()
    }
  }

  const testOpenRouterApiKey = async () => {
    if (!openRouterApiKey.trim()) return

    setIsTestingOpenRouterApiKey(true)
    setOpenRouterApiKeyTestResult(null)

    try {
      const response = await fetch('/api/test-openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: openRouterApiKey, model: openRouterModel })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setOpenRouterApiKeyTestResult({ success: true, message: 'API Key válida y funcionando correctamente' })
        saveOpenRouterConfig(openRouterApiKey, openRouterModel)
      } else {
        setOpenRouterApiKeyTestResult({ success: false, message: data.error || 'API Key inválida' })
      }
    } catch (error) {
      setOpenRouterApiKeyTestResult({ success: false, message: 'Error de conexión al probar la API key' })
    } finally {
      setIsTestingOpenRouterApiKey(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ErrorBoundary>
        <SimpleMainNavigation />
      </ErrorBoundary>
      <main className="flex-grow container mx-auto px-4 py-24 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          {/* ... header content ... */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
            <p className="text-muted-foreground">Administra tu configuración y preferencias de IA.</p>
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowVideoModal(true)}
          >
            <Youtube className="h-4 w-4 text-red-600" />
            <span>Ver Tutorial</span>
          </Button>
        </div>

        <div className="space-y-8">
          {/* ... cards ... */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl">Configuración de OpenRouter</CardTitle>
                <CardDescription>Configura tu proveedor de modelos de IA para todas las herramientas.</CardDescription>
              </div>
              {openRouterApiKey ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30">
                  <AlertCircle className="w-3 h-3 mr-1" /> Pendiente
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key de OpenRouter</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showOpenRouterApiKey ? 'text' : 'password'}
                    value={openRouterApiKey}
                    onChange={(e) => handleOpenRouterApiKeyChange(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenRouterApiKey(!showOpenRouterApiKey)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showOpenRouterApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtén tu API key en <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">OpenRouter Keys</a>.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo preferido</Label>
                <select
                  id="model"
                  value={openRouterModel}
                  onChange={(e) => handleOpenRouterModelChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="openai/gpt-4o-mini">GPT-4o Mini (Rápido y Económico)</option>
                  <option value="openai/gpt-4o">GPT-4o (Avanzado)</option>
                  <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Rápido)</option>
                  <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet (Balanceado)</option>
                </select>
              </div>

              {openRouterApiKeyTestResult && (
                <div className={`p-4 rounded-lg text-sm flex items-start gap-3 ${openRouterApiKeyTestResult.success
                  ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-400'
                  : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400'
                  }`}>
                  {openRouterApiKeyTestResult.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <span>{openRouterApiKeyTestResult.message}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={testOpenRouterApiKey}
                disabled={isTestingOpenRouterApiKey || !openRouterApiKey.trim()}
              >
                {isTestingOpenRouterApiKey ? 'Probando...' : 'Probar conexión'}
              </Button>
              <Button onClick={saveConfig} className="gap-2">
                <Save className="w-4 h-4" /> Guardar
              </Button>
              <Button variant="ghost" onClick={clearConfig} className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                <Trash2 className="w-4 h-4" /> Limpiar
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl text-blue-600 dark:text-blue-400">Google Gemini</CardTitle>
                <CardDescription>Usa tu propia API key de Google Gemini para mayor flexibilidad.</CardDescription>
              </div>
              {geminiApiKey ? (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30">
                  <AlertCircle className="w-3 h-3 mr-1" /> Opcional
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-key">API Key de Gemini</Label>
                <div className="relative">
                  <Input
                    id="gemini-key"
                    type={showGeminiApiKey ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => handleGeminiApiKeyChange(e.target.value)}
                    placeholder="AIzaSy..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showGeminiApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtén tu API key gratuita en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google AI Studio</a>.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 border-t pt-6">
              <Button variant="ghost" onClick={clearGemini} className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                <Trash2 className="w-4 h-4" /> Limpiar Gemini
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Estado de Suscripción
                {subscriptionInfo?.isPremium && <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Premium</Badge>}
              </CardTitle>
              <CardDescription>Controla tu uso y tiempo restante.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Plan Actual</p>
                  <p className="text-xl font-bold capitalize">{subscriptionInfo?.plan || 'Cargando...'}</p>
                  {subscriptionInfo?.daysLeft !== undefined && (
                    <p className={`text-sm mt-1 ${subscriptionInfo.daysLeft === 0 ? 'text-red-500 font-bold animate-pulse' : 'text-primary'}`}>
                      {subscriptionInfo.daysLeft === 0 ? '¡SUSCRIPCIÓN EXPIRADA!' : `Quedan ${subscriptionInfo.daysLeft} días`}
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Uso Diario</p>
                  <div className="flex items-end gap-2">
                    <p className="text-xl font-bold">{subscriptionInfo?.usage || 0}</p>
                    <p className="text-sm text-muted-foreground mb-1">/ {subscriptionInfo?.limit || 3} peticiones</p>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${(subscriptionInfo?.usage || 0) >= (subscriptionInfo?.limit || 3) ? 'bg-red-500' : 'bg-primary'
                        }`}
                      style={{ width: `${Math.min(((subscriptionInfo?.usage || 0) / (subscriptionInfo?.limit || 3)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {!subscriptionInfo?.isPremium && (
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    <strong>Límite de uso:</strong> Como usuario gratuito tienes 3 usos diarios.
                    <a href="/planes" className="ml-2 font-bold underline">¡Sube a Premium para uso ilimitado!</a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Seguridad</CardTitle>
                  <CardDescription>Gestiona tus sesiones activas y seguridad de la cuenta.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/ajustes/seguridad">
                <Button variant="outline" className="w-full justify-between group h-auto py-4">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-semibold">Sesiones y Dispositivos</span>
                    <span className="text-xs text-muted-foreground">Ver y cerrar sesiones en otros dispositivos</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </Link>
            </CardContent>
          </Card>



          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Cuenta</CardTitle>
              <CardDescription>Sesión y preferencias de idioma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>Cerrar sesión</Button>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Idioma del sistema</p>
                <SimpleLanguageToggle />
              </div>
            </CardContent>

          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Preferencias de Interfaz</CardTitle>
              <CardDescription>Personaliza tu experiencia en la plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Asistente de Voz (ElevenLabs)</Label>
                  <p className="text-sm text-muted-foreground">
                    Muestra el widget de asistente de voz en la esquina de la pantalla.
                  </p>
                </div>
                <Switch
                  checked={showAssistant}
                  onCheckedChange={toggleAssistant}
                />
              </div>
            </CardContent>
          </Card>
        </div >
      </main >

      <Footer />

      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoId="k5OYlxYdIuA"
        title="Tutorial de Configuración"
      />
    </div >
  )
}

export default function AjustesPage() {
  return (
    <WorkingClientLayout>
      <LanguageProvider>
        <ProtectedRoute>
          <ThemeStyleProvider>
            <ErrorBoundary>
              <AjustesPageContent />
            </ErrorBoundary>
          </ThemeStyleProvider>
        </ProtectedRoute>
      </LanguageProvider>
    </WorkingClientLayout>
  );
}
