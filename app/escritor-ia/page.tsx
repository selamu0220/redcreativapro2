"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import AIWriterEditor from "./components/AIWriterEditor";
import SettingsPanel from "./components/SettingsPanel";
import { improveContent } from "../lib/ai-client";
import { getSettings, type AISettings } from "../lib/settings-manager";
import { SimpleMainNavigation } from "../components/SimpleMainNavigation";
import Footer from "../components/Footer";
import { ProtectedRoute } from "../components/ProtectedRoute";
import WorkingClientLayout from "../components/WorkingClientLayout";
import { LanguageProvider } from "../lib/language/context";
import { DEFAULT_LANGUAGE } from "../lib/language/config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { PenTool, Sparkles, Settings as SettingsIcon, Copy, Info, Zap, Target, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useOpenRouterSync } from "../hooks/useOpenRouterSync";
import { useSubscription } from "../hooks/useSubscription";

/**
 * AI Writer Page - Simplified Implementation
 * 
 * This is a minimal, stateless implementation that:
 * - Uses only Clerk for authentication
 * - Stores content only in React state (no database)
 * - Makes direct API calls to AI providers
 * - Stores settings in localStorage only
 */
function EscritorIAPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Simple state - content exists only in memory
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { openRouterApiKey, openRouterModel, geminiApiKey } = useOpenRouterSync();
  const { subscriptionData, loading: subLoading } = useSubscription();
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    usage: number;
    limit: number;
    isPremium: boolean;
  } | null>(null);

  // Load settings and usage info
  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);

    async function fetchUsage() {
      try {
        const usageRes = await fetch('/api/usage-stats');
        const usageData = await usageRes.json();
        setSubscriptionInfo({
          usage: usageData.usage || 0,
          limit: usageData.limit || 3,
          isPremium: !!subscriptionData?.isPremium
        });
      } catch (e) {
        console.error("Error fetching usage stats:", e);
      }
    }
    
    if (!subLoading) {
      fetchUsage();
    }
  }, [subscriptionData, subLoading]);

  // Handler functions
  const handleImprove = async () => {
    if (!content.trim()) {
      setError("Por favor, escribe algo de texto primero.");
      return;
    }

    // Determine which key to use
    let apiKeyToUse = settings?.apiKey;
    let providerToUse = settings?.provider || 'openrouter';
    let modelToUse = settings?.model || 'google/gemini-2.0-flash-exp:free';

    // If using synced keys and provider matches
    if (!settings?.usePersonalKey) {
      if (providerToUse === 'google' && geminiApiKey) {
        apiKeyToUse = geminiApiKey;
      } else if (providerToUse === 'openrouter' && openRouterApiKey) {
        apiKeyToUse = openRouterApiKey;
        modelToUse = openRouterModel || modelToUse;
      }
    }
    
    if (!apiKeyToUse) {
      setError("Por favor, configura tu API key en ajustes para el proveedor seleccionado.");
      return;
    }

    if (!subscriptionInfo?.isPremium && subscriptionInfo && subscriptionInfo.usage >= subscriptionInfo.limit) {
      setError("Has alcanzado tu límite diario de uso gratuito. Sube a Premium para uso ilimitado.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await improveContent(
        { content },
        {
          provider: providerToUse,
          model: modelToUse,
          temperature: settings?.temperature || 0.7,
          apiKey: apiKeyToUse
        }
      );

      if (response.success && response.improvedContent) {
        setContent(response.improvedContent);
        
        // Track usage if not premium
        if (!subscriptionInfo?.isPremium) {
          try {
            const trackRes = await fetch('/api/usage-stats', { method: 'POST' });
            if (trackRes.ok) {
                const trackData = await trackRes.json();
                setSubscriptionInfo(prev => prev ? { ...prev, usage: trackData.usage } : null);
            }
          } catch (trackErr) {
            console.error("Error tracking usage:", trackErr);
          }
        }
      } else if (response.error) {
        setError(response.error.userMessage);
      }
    } catch (err) {
      setError("Error inesperado. Por favor, intenta de nuevo.");
      console.error("Improve content error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setError(null);
    // Show success message briefly
    const temp = error;
    setError("✓ Contenido copiado al portapapeles");
    setTimeout(() => setError(temp), 2000);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsChange = (newSettings: AISettings) => {
    setSettings(newSettings);
  };

  // Main UI - Modern editor interface matching site design
  return (
    <WorkingClientLayout>
      <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
        <ProtectedRoute>
          <div className="min-h-screen bg-background flex flex-col">
            <SimpleMainNavigation />

            {/* Hero Header Section */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b">
              <div className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center">
                  {/* Icon Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-medium mb-8">
                    <PenTool className="w-4 h-4" />
                    <span>Escritor IA</span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    Potencia tu Escritura
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Escribe, edita y perfecciona textos profesionales con inteligencia artificial de última generación.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow container mx-auto px-4 py-12">
              <div className="max-w-5xl mx-auto">
                {/* Error Banner */}
                {error && (
                  <div className={`mb-8 p-4 rounded-lg border flex items-start justify-between shadow-sm ${
                    error.startsWith('✓') 
                      ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-400'
                      : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400'
                  }`}>
                    <div className="flex gap-3">
                      {error.startsWith('✓') ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                      <p className="font-medium">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-black/5 rounded">✕</button>
                  </div>
                )}

                  {/* Editor Component */}
                  <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden mb-12">
                    <AIWriterEditor
                      content={content}
                      onContentChange={setContent}
                      onImprove={handleImprove}
                      onCopy={handleCopy}
                      onOpenSettings={handleOpenSettings}
                      isProcessing={isProcessing}
                      usageInfo={subscriptionInfo}
                    />
                  </Card>

                {/* Help Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2">
                        <Zap className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg">Mejora Instantánea</CardTitle>
                      <CardDescription>Optimiza gramática, tono y estilo con un solo clic.</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2">
                        <Target className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg">Personalizable</CardTitle>
                      <CardDescription>Ajusta el modelo y la creatividad según tus necesidades.</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2">
                        <Lock className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg">100% Privado</CardTitle>
                      <CardDescription>Tu contenido está seguro y nunca se usa para entrenamiento.</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>

            <Footer />

            {/* Settings Panel */}
            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </ProtectedRoute>
      </LanguageProvider>
    </WorkingClientLayout>
  );
}

export default EscritorIAPage;
