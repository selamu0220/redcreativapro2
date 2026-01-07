"use client";

import { useState } from "react";

export default function EscritorIA() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const improveText = async () => {
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

    try {
      console.log("🚀 Enviando texto a mejorar:", text);

      const response = await fetch('/api/improve-text-ai-sdk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });

      console.log("📡 Respuesta recibida, status:", response.status);

      const data = await response.json();
      console.log("📊 Datos:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Error en la API');
      }

      if (!data.improvedContent) {
        throw new Error('No se recibió contenido mejorado');
      }

      // Verificar que cambió
      if (text.trim().toLowerCase() === data.improvedContent.trim().toLowerCase()) {
        throw new Error('El texto no cambió - no se pudo mejorar');
      }

      setText(data.improvedContent);
      console.log("✅ Texto mejorado exitosamente");

    } catch (err) {
      console.error("❌ Error:", err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card border rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            Escritor con IA
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Tu asistente de escritura personalizado
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Tu texto ({wordCount} palabras)
              </label>
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

            <div className="flex justify-center">
              <button
                type="button"
                onClick={improveText}
                disabled={isLoading || !text.trim() || wordCount < 5}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                    Mejorando...
                  </span>
                ) : (
                  "✨ Mejorar con IA"
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

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Usa tu API key de Gemini configurada en el servidor</p>
          <p>Mínimo 5 palabras • Solo mejora si es necesario</p>
        </div>
      </div>
    </div>
  );
}