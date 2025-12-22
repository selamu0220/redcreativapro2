"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AIWriterEditor from "./components/AIWriterEditor";
import SettingsPanel from "./components/SettingsPanel";
import { improveContent } from "../lib/ai-client";
import { getSettings, type AISettings } from "../lib/settings-manager";

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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Header Section */}
        <div className="bg-gradient-to-br from-background to-muted/20 border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              {/* Icon Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Escritor IA</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Escritor de IA
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Mejora tu contenido con inteligencia artificial. Escribe, edita y perfecciona textos de forma profesional.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border shadow-sm">
                  <span className="text-xl">⚡</span>
                  <span className="text-sm font-medium">Mejora instantánea</span>
                </div>
                <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border shadow-sm">
                  <span className="text-xl">🎯</span>
                  <span className="text-sm font-medium">Múltiples modelos IA</span>
                </div>
                <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border shadow-sm">
                  <span className="text-xl">🔒</span>
                  <span className="text-sm font-medium">100% privado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-destructive font-medium">{error}</p>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="mt-2 text-sm text-destructive/80 hover:text-destructive underline"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Editor Component */}
            <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
              <AIWriterEditor
                content={content}
                onContentChange={setContent}
                onImprove={handleImprove}
                onCopy={handleCopy}
                onOpenSettings={handleOpenSettings}
                isProcessing={isProcessing}
              />
            </div>

            {/* Help Section */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">💡</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Consejo</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Escribe tu texto inicial y presiona "Mejorar" para que la IA lo optimice
                </p>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Configuración</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Personaliza el modelo de IA y parámetros desde el panel de ajustes
                </p>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🚀</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Rápido</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Copia el resultado con un clic y úsalo donde lo necesites
                </p>
              </div>
            </div>
          </div>
        </div>

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