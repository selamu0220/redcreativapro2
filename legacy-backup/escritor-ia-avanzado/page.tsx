"use client";

import { useState, useEffect, useRef } from "react";

interface Settings {
  creativity: number; // 0.1 - 1.0 (temperatura)
  autoInterval: number; // segundos entre mejoras automáticas
  autoMode: boolean; // activar/desactivar agente
  customPrompt: string; // pre-prompt personalizable
}

export default function EscritorIAAvanzado() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [settings, setSettings] = useState<Settings>({
    creativity: 0.3,
    autoInterval: 30,
    autoMode: false,
    customPrompt: "Mejora este texto corrigiendo gramática, ortografía y fluidez. Mantén el idioma original y el tono."
  });
  
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Manejar modo automático
  useEffect(() => {
    if (settings.autoMode && text.trim() && text.trim().split(/\s+/).length >= 5) {
      startAutoMode();
    } else {
      stopAutoMode();
    }
    
    return () => stopAutoMode();
  }, [settings.autoMode, settings.autoInterval]);

  const startAutoMode = () => {
    stopAutoMode(); // Limpiar intervalos existentes
    
    setTimeLeft(settings.autoInterval);
    
    // Countdown
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          improveText(true); // Auto mode
          return settings.autoInterval;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopAutoMode = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setTimeLeft(0);
  };

  const improveText = async (isAutoMode = false) => {
    if (!text.trim()) {
      setError("Escribe algo de texto primero");
      return;
    }

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 5) {
      setError(`Necesitas al menos 5 palabras. Tienes ${wordCount}.`);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🚀 Mejorando texto con configuración:", {
        creativity: settings.creativity,
        autoMode: isAutoMode,
        customPrompt: settings.customPrompt.substring(0, 50) + "..."
      });

      const response = await fetch('/api/improve-text-ai-sdk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: text,
          creativity: settings.creativity,
          customPrompt: settings.customPrompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la API');
      }

      if (!data.improvedContent) {
        throw new Error('No se recibió contenido mejorado');
      }

      // Verificar que cambió
      if (text.trim().toLowerCase() === data.improvedContent.trim().toLowerCase()) {
        if (!isAutoMode) {
          setError('El texto no cambió - no se pudo mejorar');
        }
        return;
      }

      setText(data.improvedContent);
      setSuccess(isAutoMode ? "✨ Mejorado automáticamente" : "✨ Texto mejorado exitosamente");
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      console.error("❌ Error:", err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      
      // Si es modo automático y hay error, pausar por un momento
      if (isAutoMode) {
        setTimeout(() => setError(""), 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Panel Principal */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Escritor con IA Avanzado
              </h1>
              <p className="text-muted-foreground mb-6">
                Tu asistente de escritura con funciones avanzadas
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-muted-foreground">
                      Tu texto ({wordCount} palabras)
                    </label>
                    {settings.autoMode && timeLeft > 0 && (
                      <div className="text-sm text-blue-600 font-medium">
                        Próxima mejora en: {timeLeft}s
                      </div>
                    )}
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe tu texto aquí... Mínimo 5 palabras."
                    className="w-full h-64 p-4 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-foreground"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                    {success}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => improveText(false)}
                    disabled={isLoading || !text.trim() || wordCount < 5}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                        Mejorando...
                      </span>
                    ) : (
                      "✨ Mejorar Ahora"
                    )}
                  </button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {wordCount < 5 ? (
                    <span className="text-destructive">
                      Necesitas {5 - wordCount} palabras más
                    </span>
                  ) : (
                    <span className="text-green-600">
                      ✓ Listo para mejorar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Configuración */}
          <div className="space-y-6">
            
            {/* Modo Automático */}
            <div className="bg-card border rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🤖 Agente Automático
                <div className={`w-2 h-2 rounded-full ${settings.autoMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Activar Agente</label>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, autoMode: !prev.autoMode }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoMode ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Intervalo: {settings.autoInterval} segundos
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={settings.autoInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoInterval: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10s</span>
                    <span>5min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creatividad */}
            <div className="bg-card border rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🎨 Creatividad</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nivel: {settings.creativity} {settings.creativity <= 0.3 ? '(Conservador)' : settings.creativity <= 0.7 ? '(Equilibrado)' : '(Creativo)'}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.creativity}
                  onChange={(e) => setSettings(prev => ({ ...prev, creativity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Conservador</span>
                  <span>Creativo</span>
                </div>
              </div>
            </div>

            {/* Pre-prompt Personalizable */}
            <div className="bg-card border rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📝 Instrucciones Personalizadas</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pre-prompt
                </label>
                <textarea
                  value={settings.customPrompt}
                  onChange={(e) => setSettings(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Instrucciones para la IA..."
                  className="w-full h-24 p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-foreground text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Personaliza cómo la IA debe mejorar tu texto
                </p>
              </div>
            </div>

            {/* Presets Rápidos */}
            <div className="bg-card border rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">⚡ Presets Rápidos</h3>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    creativity: 0.2, 
                    customPrompt: "Corrige únicamente errores gramaticales y ortográficos. Mantén el estilo original." 
                  }))}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                >
                  📚 Corrección Básica
                </button>
                
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    creativity: 0.5, 
                    customPrompt: "Mejora la claridad y fluidez del texto manteniendo el mensaje original." 
                  }))}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                >
                  ✨ Mejora Equilibrada
                </button>
                
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    creativity: 0.8, 
                    customPrompt: "Reescribe el texto de forma más creativa y atractiva, mejorando el estilo y la expresión." 
                  }))}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                >
                  🚀 Reescritura Creativa
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Escritor IA Avanzado • Powered by Gemini 2.5 Flash • AI SDK</p>
        </div>
      </div>
    </div>
  );
}