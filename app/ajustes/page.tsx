'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { SimpleMainNavigation } from '@/app/components/SimpleMainNavigation'
import Footer from '@/app/components/Footer'
import VideoModal from '../components/VideoModal'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'
import { useAuth } from '../hooks/useAuth'
import { useOpenRouterSync } from '../hooks/useOpenRouterSync'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Youtube, Key, Save, Trash2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

function AjustesPage() {
  const { user, logout } = useAuth()
  const [showVideoModal, setShowVideoModal] = useState(false)
  
  const {
    openRouterApiKey,
    openRouterModel,
    saveOpenRouterConfig,
    clearOpenRouterConfig
  } = useOpenRouterSync()
  
  const [showOpenRouterApiKey, setShowOpenRouterApiKey] = useState(false)
  const [isTestingOpenRouterApiKey, setIsTestingOpenRouterApiKey] = useState(false)
  const [openRouterApiKeyTestResult, setOpenRouterApiKeyTestResult] = useState<{success: boolean, message: string} | null>(null)
  
  const handleOpenRouterModelChange = (newModel: string) => {
    saveOpenRouterConfig(openRouterApiKey, newModel)
  }
  
  const handleOpenRouterApiKeyChange = (newApiKey: string) => {
    saveOpenRouterConfig(newApiKey, openRouterModel)
  }

  const saveConfig = () => {
    if (!openRouterApiKey.trim()) {
      alert('Por favor ingresa una API key válida')
      return
    }
    saveOpenRouterConfig(openRouterApiKey, openRouterModel)
    alert('Configuración guardada exitosamente')
  }

  const clearConfig = () => {
    if (confirm('¿Estás seguro de que quieres limpiar la API key?')) {
      clearOpenRouterConfig()
      setOpenRouterApiKeyTestResult(null)
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
      <SimpleMainNavigation />

      <main className="flex-grow container mx-auto px-4 py-24 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
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
                <div className={`p-4 rounded-lg text-sm flex items-start gap-3 ${
                  openRouterApiKeyTestResult.success 
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
        </div>
      </main>

      <Footer />
      
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoId="k5OYlxYdIuA"
        title="Tutorial de Configuración"
      />
    </div>
  )
}

export default AjustesPage
