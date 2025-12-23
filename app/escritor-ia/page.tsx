"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AIWriterEditor from "./components/AIWriterEditor";
import SettingsPanel from "./components/SettingsPanel";
import { improveContent } from "../lib/ai-client";
import { getSettings, type AISettings } from "../lib/settings-manager";
import { SimpleMainNavigation } from "../components/SimpleMainNavigation";
import Footer from "../components/Footer";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { PenTool, Sparkles, Settings as SettingsIcon, Copy, Info, Zap, Target, Lock } from "lucide-react";

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
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  
  // Simple state - content exists only in memory
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
  }, []);

  // Handler functions
  const handleImprove = async () => {
    if (!content.trim()) {
      setError("Por favor, escribe algo de texto primero.");
      return;
    }

    if (!settings) {
      setError("Cargando configuración...");
      return;
    }

    // Check if API key is configured
    if (!settings.apiKey) {
      setError("Por favor, configura tu API key en la configuración.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await improveContent(
        { content },
        {
          provider: settings.provider,
          model: settings.model,
          temperature: settings.temperature,
          apiKey: settings.apiKey
        }
      );

      if (response.success && response.improvedContent) {
        setContent(response.improvedContent);
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

  
  // Loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Main UI - Modern editor interface matching site design
  return (
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
  );
}

export default EscritorIAPage;