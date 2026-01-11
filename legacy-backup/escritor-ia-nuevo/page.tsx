"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Sparkles, Save, Copy, Download, Upload, Settings } from "lucide-react";

export default function EscritorIANuevo() {
  const [content, setContent] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [autoTimeout, setAutoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Función principal para mejorar texto
  const improveText = useCallback(async (text: string, isAuto: boolean = false) => {
    if (!text.trim()) {
      if (!isAuto) toast.error("Escribe algo de texto primero");
      return;
    }

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 5) {
      const msg = `Contenido muy corto (${wordCount} palabras, mínimo 5)`;
      if (!isAuto) toast.error(msg);
      console.log(`[EscritorIA] ${msg}`);
      return;
    }

    setIsImproving(true);
    const toastId = isAuto ? undefined : toast.loading("Mejorando texto...");

    try {
      console.log(`[EscritorIA] ${isAuto ? 'Auto' : 'Manual'} improvement started`);
      console.log(`[EscritorIA] Original text:`, text);

      const response = await fetch('/api/improve-text-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, language: 'es' })
      });

      const data = await response.json();
      console.log(`[EscritorIA] API response:`, data);

      if (!response.ok) {
        throw new Error(data.error || 'Error en la API');
      }

      if (!data.improvedContent) {
        throw new Error('No se recibió contenido mejorado');
      }

      // CRÍTICO: Verificar que el texto realmente cambió
      const originalLower = text.trim().toLowerCase();
      const improvedLower = data.improvedContent.trim().toLowerCase();
      
      if (originalLower === improvedLower) {
        const msg = "El texto no necesita mejoras";
        if (!isAuto) toast.error(msg);
        console.log(`[EscritorIA] ${msg}`);
        return;
      }

      // Actualizar contenido
      setContent(data.improvedContent);
      
      if (!isAuto) {
        toast.dismiss(toastId);
        toast.success("¡Texto mejorado exitosamente!");
      } else {
        toast.success("Mejora automática aplicada", { duration: 2000 });
      }

      console.log(`[EscritorIA] Improvement successful`);
      console.log(`[EscritorIA] Improved text:`, data.improvedContent);

    } catch (error) {
      console.error(`[EscritorIA] Error:`, error);
      if (!isAuto) {
        toast.dismiss(toastId);
        toast.error(error instanceof Error ? error.message : "Error al mejorar texto");
      }
    } finally {
      setIsImproving(false);
    }
  }, []);

  // Manejar cambios en el contenido
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);

    // Auto-mejoramiento
    if (autoMode && !isImproving) {
      // Limpiar timeout anterior
      if (autoTimeout) {
        clearTimeout(autoTimeout);
      }

      // Configurar nuevo timeout
      const timeout = setTimeout(() => {
        const wordCount = newContent.trim().split(/\s+/).length;
        if (wordCount >= 5) {
          improveText(newContent, true);
        }
      }, 3000); // 3 segundos después de dejar de escribir

      setAutoTimeout(timeout);
    }
  }, [autoMode, isImproving, autoTimeout, improveText]);

  // Mejoramiento manual
  const handleManualImprove = useCallback(() => {
    improveText(content, false);
  }, [content, improveText]);

  // Funciones de utilidad
  const handleSave = useCallback(() => {
    if (!content.trim()) return;
    localStorage.setItem('escritor-ia-content', content);
    toast.success("Contenido guardado");
  }, [content]);

  const handleCopy = useCallback(async () => {
    if (!content.trim()) return;
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Contenido copiado al portapapeles");
    } catch (error) {
      toast.error("Error al copiar");
    }
  }, [content]);

  const handleExport = useCallback(() => {
    if (!content.trim()) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escritor-ia-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Archivo exportado");
  }, [content]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Escritor IA - Nuevo
          </h1>
          <p className="text-muted-foreground">
            Mejora tu texto automáticamente con inteligencia artificial
          </p>
        </div>

        {/* Controls */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Auto-mejoramiento:</span>
                <button
                  onClick={() => setAutoMode(!autoMode)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    autoMode 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {autoMode ? 'Activado' : 'Desactivado'}
                </button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {content.length} caracteres • {wordCount} palabras
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!content.trim()}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>

              <button
                onClick={handleCopy}
                disabled={!content.trim()}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>

              <button
                onClick={handleExport}
                disabled={!content.trim()}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Escribe tu texto aquí... Se mejorará automáticamente después de 3 segundos si tienes el modo automático activado."
              className="w-full h-96 p-6 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none resize-none text-lg leading-relaxed"
              disabled={isImproving}
            />
            
            {/* Processing Overlay */}
            {isImproving && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm font-medium">Mejorando tu contenido...</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="bg-muted/50 px-6 py-4 border-t flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {autoMode ? 'Modo automático activado - Se mejorará automáticamente' : 'Modo manual - Usa el botón para mejorar'}
            </div>

            <button
              onClick={handleManualImprove}
              disabled={isImproving || !content.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isImproving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Mejorando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Mejorar con IA
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status */}
        {wordCount > 0 && wordCount < 5 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Necesitas al menos 5 palabras para activar la mejora automática. 
              Actualmente tienes {wordCount} palabra{wordCount !== 1 ? 's' : ''}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}