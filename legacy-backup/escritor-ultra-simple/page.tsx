"use client";

import { useState } from "react";

export default function EscritorUltraSimple() {
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

      const response = await fetch('/api/improve-text-gemini-simple', {
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Escritor IA Ultra Simple
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu texto ({wordCount} palabras)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe tu texto aquí... Mínimo 5 palabras."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={improveText}
                disabled={isLoading || !text.trim() || wordCount < 5}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Mejorando...
                  </span>
                ) : (
                  "✨ Mejorar Texto"
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              {wordCount < 5 ? (
                <span className="text-red-500">
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

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Usa tu API key de Gemini configurada en el servidor</p>
          <p>Mínimo 5 palabras • Solo mejora si es necesario</p>
        </div>
      </div>
    </div>
  );
}