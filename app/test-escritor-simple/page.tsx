"use client";

import { useState, useRef } from 'react';
import { useSimpleAutoImprovement } from '../hooks/useSimpleAutoImprovement';
import { improveContent } from '../lib/ai-client';
import { getSettings } from '../lib/settings-manager';
import { toast } from 'sonner';

export default function TestEscritorSimple() {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const contentRef = useRef(content);

  // Actualizar ref cuando cambie el contenido
  contentRef.current = content;

  // Configuración del mejoramiento automático
  const autoConfig = {
    enabled: true,
    delay: 3000, // 3 segundos
    minWords: 5,
    improvementLevel: 'balanced' as const
  };

  // Función de mejoramiento
  const performImprovement = async (text: string, isAuto: boolean) => {
    console.log('🔄 Iniciando mejoramiento...', { isAuto, textLength: text.length });
    console.log('📝 Texto original completo:', text);
    
    if (isProcessing) {
      console.log('⏸️ Ya hay un procesamiento en curso, saltando...');
      return;
    }

    setIsProcessing(true);
    
    try {
      const settings = getSettings();
      
      // Verificar configuración antes de llamar a la API
      if (!settings?.apiKey && !process.env.OPEN_ROUTER_API_KEY) {
        throw new Error('API key no configurada. Ve a configuración y agrega tu API key de OpenRouter.');
      }
      
      const response = await improveContent({
        content: text,
        instruction: 'Mejora la gramática, fluidez y tono profesional',
        language: 'es'
      }, {
        provider: 'openrouter',
        model: 'openai/gpt-4o-mini',
        temperature: 0.7,
        apiKey: settings?.apiKey
      });

      console.log('📊 Respuesta de la API:', response);

      if (response.success && response.improvedContent) {
        // CRITICAL: Verify the text actually changed
        const originalText = text.trim();
        const improvedText = response.improvedContent.trim();
        
        console.log('🔍 Comparando textos:');
        console.log('Original:', originalText);
        console.log('Mejorado:', improvedText);
        console.log('¿Son diferentes?:', originalText !== improvedText);
        
        if (originalText === improvedText) {
          const errorMsg = "El texto no cambió. La IA no encontró mejoras que hacer.";
          console.warn('⚠️ Texto sin cambios:', errorMsg);
          throw new Error(errorMsg);
        }
        
        setContent(response.improvedContent);
        toast.success(isAuto ? 'Mejora automática aplicada' : 'Texto mejorado manualmente');
        console.log('✅ Mejoramiento exitoso - texto realmente cambió');
      } else {
        const errorMsg = response.error?.userMessage || 'Error desconocido al mejorar texto';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      
      if (isAuto) {
        // Para errores automáticos, no mostrar toast pero sí loggear
        console.error('Error en mejoramiento automático:', errorMessage);
      } else {
        toast.error(errorMessage);
      }
      
      // Re-lanzar el error para que el hook lo capture
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Hook de mejoramiento automático
  const { state, handleTyping } = useSimpleAutoImprovement({
    config: autoConfig,
    enabled: true,
    getCurrentContent: () => contentRef.current,
    onImprove: performImprovement
  });

  // Manejar cambios en el contenido
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    handleTyping(); // Activar detección de escritura
  };

  // Mejoramiento manual
  const handleManualImprove = () => {
    if (content.trim()) {
      performImprovement(content, false);
    } else {
      toast.error('Escribe algo primero');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Prueba del Escritor IA Simple</h1>
          <p className="text-muted-foreground">
            Escribe texto y se mejorará automáticamente después de 3 segundos de inactividad
          </p>
        </div>

        {/* Estado del sistema */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Estado del Sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Modo Auto:</span>
              <span className={`ml-2 font-medium ${autoConfig.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {autoConfig.enabled ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Escribiendo:</span>
              <span className={`ml-2 font-medium ${state.isTyping ? 'text-blue-600' : 'text-gray-600'}`}>
                {state.isTyping ? 'Sí' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Procesando:</span>
              <span className={`ml-2 font-medium ${state.isImproving || isProcessing ? 'text-orange-600' : 'text-gray-600'}`}>
                {state.isImproving || isProcessing ? 'Sí' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Palabras:</span>
              <span className="ml-2 font-medium">
                {content.trim() ? content.trim().split(/\s+/).length : 0}
              </span>
            </div>
          </div>
          
          {/* Error Display */}
          {state.lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-red-500 text-sm">⚠️</span>
                <div>
                  <p className="text-red-800 font-medium text-sm">Error en mejoramiento automático:</p>
                  <p className="text-red-700 text-sm">{state.lastError}</p>
                  <p className="text-red-600 text-xs mt-1">Errores consecutivos: {state.errorCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="content" className="text-lg font-semibold">
              Contenido
            </label>
            <button
              onClick={handleManualImprove}
              disabled={isProcessing || !content.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando...' : 'Mejorar Manualmente'}
            </button>
          </div>
          
          <textarea
            id="content"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Escribe aquí tu texto. Se mejorará automáticamente después de 3 segundos de inactividad..."
            className="w-full h-64 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isProcessing}
          />
        </div>

        {/* Estadísticas */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Mejoras automáticas:</span>
              <span className="ml-2 font-medium">{state.improvementCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Última mejora:</span>
              <span className="ml-2 font-medium">
                {state.lastImprovement ? new Date(state.lastImprovement).toLocaleTimeString() : 'Nunca'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Configuración:</span>
              <span className="ml-2 font-medium">
                {autoConfig.delay / 1000}s, {autoConfig.minWords} palabras mín.
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total errores:</span>
              <span className={`ml-2 font-medium ${state.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {state.errorCount}
              </span>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Cómo probar</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Escribe al menos 5 palabras en el área de texto</li>
            <li>Deja de escribir y espera 3 segundos</li>
            <li>El texto se mejorará automáticamente</li>
            <li>También puedes usar el botón "Mejorar Manualmente"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}