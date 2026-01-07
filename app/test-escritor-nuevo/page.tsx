"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function TestEscritorNuevo() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setTestResult("");

    try {
      console.log("🧪 Iniciando prueba de API...");
      
      const testText = "hola como estas espero que todo este bien";
      console.log("📝 Texto de prueba:", testText);

      const response = await fetch('/api/improve-text-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: testText, language: 'es' })
      });

      console.log("📡 Respuesta recibida, status:", response.status);

      const data = await response.json();
      console.log("📊 Datos de respuesta:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Error en la API');
      }

      if (!data.improvedContent) {
        throw new Error('No se recibió contenido mejorado');
      }

      // Verificar que cambió
      const originalLower = testText.trim().toLowerCase();
      const improvedLower = data.improvedContent.trim().toLowerCase();
      
      if (originalLower === improvedLower) {
        throw new Error('El texto no cambió - API no está funcionando');
      }

      setTestResult(`✅ ÉXITO!\n\nOriginal: "${testText}"\nMejorado: "${data.improvedContent}"\n\n🎉 La API funciona correctamente en la web!`);
      toast.success("¡Prueba exitosa! La API funciona");

    } catch (error) {
      console.error("❌ Error en prueba:", error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setTestResult(`❌ ERROR:\n\n${errorMsg}`);
      toast.error("Error en la prueba");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Escritor IA Nuevo</h1>
        
        <div className="space-y-4">
          <button
            onClick={testAPI}
            disabled={isLoading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
          >
            {isLoading ? "Probando..." : "🧪 Probar API"}
          </button>

          {testResult && (
            <div className="p-4 bg-card border rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Enlaces de prueba:</h2>
            <div className="space-y-2">
              <a 
                href="/escritor-ia-nuevo" 
                className="block p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📝 Ir al Escritor IA Nuevo
              </a>
              <a 
                href="/escritor-ia" 
                className="block p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🔧 Escritor IA Original (para comparar)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}