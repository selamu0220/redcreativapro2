"use client";

import { useState } from "react";
import { useSimpleAutoImprovement } from "../hooks/useSimpleAutoImprovement";
import { improveContent } from "../lib/ai-client";

export default function TestEscritorDebug() {
  const [content, setContent] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[TestEscritorDebug] ${message}`);
  };

  // Configuración del auto-improvement
  const autoConfig = {
    enabled: true,
    delay: 3000,
    minWords: 5,
    improvementLevel: 'balanced' as const
  };

  // Hook de auto-improvement
  const { state: autoState, handleTyping, clearError } = useSimpleAutoImprovement({
    config: autoConfig,
    enabled: true,
    getCurrentContent: () => content,
    onImprove: async (text, isAuto) => {
      addLog(`onImprove called - isAuto: ${isAuto}, text: "${text}"`);
      
      try {
        const response = await improveContent(
          { content: text },
          {
            provider: 'openrouter',
            model: 'openai/gpt-4o-mini',
            temperature: 0.7
          }
        );

        addLog(`API response - success: ${response.success}`);
        
        if (response.success && response.improvedContent) {
          addLog(`Text improved: "${response.improvedContent}"`);
          setContent(response.improvedContent);
        } else {
          addLog(`API error: ${response.error?.userMessage || 'Unknown error'}`);
        }
      } catch (error) {
        addLog(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  });

  const handleContentChange = (newContent: string) => {
    addLog(`Content changed: "${newContent}" (${newContent.split(' ').length} words)`);
    setContent(newContent);
    
    // Trigger typing detection
    if (autoConfig.enabled) {
      addLog('Triggering handleTyping...');
      handleTyping();
    }
  };

  const handleManualImprove = async () => {
    addLog('Manual improve clicked');
    
    if (!content.trim()) {
      addLog('Content is empty');
      return;
    }

    try {
      const response = await improveContent(
        { content },
        {
          provider: 'openrouter',
          model: 'openai/gpt-4o-mini',
          temperature: 0.7
        }
      );

      addLog(`Manual API response - success: ${response.success}`);
      
      if (response.success && response.improvedContent) {
        addLog(`Manual text improved: "${response.improvedContent}"`);
        setContent(response.improvedContent);
      } else {
        addLog(`Manual API error: ${response.error?.userMessage || 'Unknown error'}`);
      }
    } catch (error) {
      addLog(`Manual exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🔍 Test Debug - Escritor IA
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Area */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Editor</h2>
              
              {/* Auto Mode Status */}
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Auto Mode:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    autoConfig.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {autoConfig.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <div>Delay: {autoConfig.delay}ms</div>
                  <div>Min Words: {autoConfig.minWords}</div>
                  <div>Current Words: {content.split(/\s+/).filter(w => w.length > 0).length}</div>
                </div>
              </div>

              {/* Auto State */}
              <div className="mb-4 p-3 bg-yellow-50 rounded">
                <div className="text-sm">
                  <div>Is Typing: {autoState.isTyping ? 'YES' : 'NO'}</div>
                  <div>Is Improving: {autoState.isImproving ? 'YES' : 'NO'}</div>
                  <div>Improvement Count: {autoState.improvementCount}</div>
                  <div>Error Count: {autoState.errorCount}</div>
                  {autoState.lastError && (
                    <div className="text-red-600 mt-2">
                      Last Error: {autoState.lastError}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Text Area */}
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Escribe aquí tu texto... (mínimo 5 palabras para auto-mejora)"
                className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Manual Improve Button */}
              <button
                onClick={handleManualImprove}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                🚀 Mejorar Manualmente
              </button>

              {/* Clear Error Button */}
              {autoState.lastError && (
                <button
                  onClick={clearError}
                  className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Limpiar Error
                </button>
              )}
            </div>
          </div>

          {/* Logs Area */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Logs en Tiempo Real</h2>
                <button
                  onClick={() => setLogs([])}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Limpiar
                </button>
              </div>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No hay logs aún...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📋 Instrucciones de Prueba</h2>
          <div className="space-y-2 text-sm">
            <div>1. <strong>Escribe:</strong> "hola como estas espero que todo este bien"</div>
            <div>2. <strong>Espera:</strong> 5 segundos sin tocar nada</div>
            <div>3. <strong>Observa:</strong> Los logs en tiempo real</div>
            <div>4. <strong>Verifica:</strong> Si el texto se mejora automáticamente</div>
            <div>5. <strong>Prueba manual:</strong> Usa el botón "Mejorar Manualmente"</div>
          </div>
        </div>
      </div>
    </div>
  );
}