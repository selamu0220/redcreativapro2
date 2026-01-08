'use client'

import { useSimpleTranslations } from '../lib/simple-translations'
import SimpleLanguageToggle from '../components/SimpleLanguageToggle'
import { useEffect, useState } from 'react'

export default function TestLanguageSystem() {
  const { t, currentLang, isClient, forceUpdate } = useSimpleTranslations()
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    setRenderCount(prev => prev + 1)
  }, [currentLang, forceUpdate])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Cargando sistema de idiomas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <SimpleLanguageToggle />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🌍 Test del Sistema de Idiomas</h1>
          <p className="text-lg text-muted-foreground">
            Usa el selector de idioma en la esquina superior derecha para cambiar el idioma
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border mb-8 border-l-4 border-l-blue-500">
          <h2 className="text-2xl font-semibold mb-4">📊 Estado del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded">
              <p className="font-semibold">Idioma actual</p>
              <p className="text-2xl font-bold text-primary">{currentLang.toUpperCase()}</p>
            </div>
            <div className="bg-muted p-4 rounded">
              <p className="font-semibold">Cliente cargado</p>
              <p className="text-2xl font-bold text-green-500">{isClient ? 'Sí' : 'No'}</p>
            </div>
            <div className="bg-muted p-4 rounded">
              <p className="font-semibold">Renders</p>
              <p className="text-2xl font-bold text-orange-500">{renderCount}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded">
            <p><strong>LocalStorage:</strong> {typeof window !== 'undefined' ? localStorage.getItem('simple-language') || 'No definido' : 'No disponible'}</p>
            <p><strong>Force Update:</strong> {forceUpdate}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              🧭 Navegación
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-medium">Tutorial:</span>
                <span className="font-bold text-primary">{t('tutorial')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-medium">Campañas:</span>
                <span className="font-bold text-primary">{t('campaigns')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-medium">Membresía:</span>
                <span className="font-bold text-primary">{t('membership')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-medium">Login:</span>
                <span className="font-bold text-primary">{t('login')}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              🎯 Contenido Principal
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded">
                <p className="font-medium text-sm text-muted-foreground">Título Principal</p>
                <p className="font-bold text-lg text-primary">{t('mainTitle')}</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="font-medium text-sm text-muted-foreground">Subtítulo</p>
                <p className="font-bold text-primary">{t('subtitle')}</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="font-medium text-sm text-muted-foreground">Potenciado por</p>
                <p className="font-bold text-primary">{t('poweredBy')}</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="font-medium text-sm text-muted-foreground">Botón Principal</p>
                <p className="font-bold text-primary">{t('joinPlatform')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border mt-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            🤖 {t('aiTools')}
          </h2>
          <p className="text-muted-foreground mb-6">{t('aiToolsDesc')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-lg mb-2 text-primary">{t('aiWriter')}</h4>
              <p className="text-sm text-muted-foreground">{t('aiWriterDesc')}</p>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-lg mb-2 text-primary">{t('aiEmails')}</h4>
              <p className="text-sm text-muted-foreground">{t('aiEmailsDesc')}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border mt-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            👨‍💻 {t('aboutCreator')}
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-l-primary pl-4">
              <h3 className="font-semibold text-lg">{t('creatorTitle')}</h3>
              <p className="text-muted-foreground">{t('creatorDesc')}</p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{t('myPhilosophy')}</h4>
              <p className="text-muted-foreground italic">{t('philosophyDesc')}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            ✅ Instrucciones de Prueba
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-green-700 dark:text-green-300 text-sm">
            <li>Haz clic en el selector de idioma en la esquina superior derecha</li>
            <li>Selecciona un idioma diferente (English, Français, etc.)</li>
            <li>Observa cómo cambian todos los textos en esta página</li>
            <li>El contador de "Renders" debería incrementarse</li>
            <li>El "Idioma actual" debería mostrar el nuevo idioma</li>
          </ol>
        </div>
      </div>
    </div>
  )
}