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

  
  // Redirect to sign-in if not authenticated
  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

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

  // Main UI - Simple editor interface
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Escritor de IA
          </h1>
          <p className="text-gray-600">
            Mejora tu contenido con inteligencia artificial
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Editor Component */}
        <AIWriterEditor
          content={content}
          onContentChange={setContent}
          onImprove={handleImprove}
          onCopy={handleCopy}
          onOpenSettings={handleOpenSettings}
          isProcessing={isProcessing}
        />

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );
}

export default EscritorIAPage;