"use client";

import { useState, useRef } from "react";

export default function EscritorSimpleFix() {
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[EscritorSimple] ${message}`);
  };

  const improveText = async (text: string, isAuto: boolean = false) => {
    addLog(`${isAuto ? 'AUTO' : 'MANUAL'} - Iniciando mejora de texto`);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/improve-text-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          language: 'es'
        })
      });

      const data = await response.json();
      addLog(`API Response: ${response.status}`);

      if (response.ok && data.improvedContent) {
        addLog(`Texto mejorado exitosamente`);
        addLog(`Original: "${text}"`);
        addLog(`Mejorado: "${data.improvedContent}"`);
        setContent(data.improvedContent);
        return true;
      } else {
        addLog(`Error: ${data.error}`);
        return false;
      }
    } catch (error) {
      addLog(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    addLog(`Contenido cambiado: "${newContent}" (${newContent.split(' ').filter(w => w.length > 0).length} palabras)`);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      addLog('Timeout anterior cancelado');
    }

    // Set new timeout for auto-improvement
    const wordCount = newContent.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount >= 5 && !isProcessing) {
      addLog(`Programando auto-mejora en 3 segundos (${wordCount} palabras)`);
      
      timeoutRef.current = setTimeout(() => {
        addLog('¡TIMEOUT ACTIVADO! Iniciando auto-mejora...');
        improveText(newContent, true);
      }, 3000);
    } else {
      addLog(`No se programa auto-mejora: ${wordCount < 5 ? 'muy pocas palabras' : 'ya procesando'}`);
    }
  };

  const handleManualImprove = () => {
    if (!content.trim()) {
      addLog('ERROR: Contenido vacío');
      return;
    }
    
    // Cancel auto-improvement
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      addLog('Auto-mejora cancelada por mejora manual');
    }
    
    improveText(content, false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
          🚀 ESCRITOR IA - FIX DIRECTO
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">📝 Editor</h2>
            
            {/* Status */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isProcessing 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {isProcessing ? '⏳ Procesando...' : '✅ Listo'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                <div>Palabras: {content.split(/\s+/).filter(w => w.length > 0).length}</div>
                <div>Auto-mejora: {content.split(/\s+/).filter(w => w.length > 0).length >= 5 ? '✅ Activada' : '❌ Necesita 5+ palabras'}</div>
              </div>
            </div>
            
            {/* Text Area */}
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Escribe aquí... Ejemplo: 'hola como estas espero que todo este bien'"
              className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={isProcessing}
            />
            
            {/* Buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleManualImprove}
                disabled={isProcessing || !content.trim()}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isProcessing ? '⏳ Procesando...' : '🚀 Mejorar Ahora'}
              </button>
              
              <button
                onClick={() => {
                  setContent("");
                  setLogs([]);
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">📊 Logs en Tiempo Real</h2>
              <button
                onClick={() => setLogs([])}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Limpiar Logs
              </button>
            </div>
            
            <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">Esperando actividad...</div>
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

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-600">✅ INSTRUCCIONES RÁPIDAS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">🤖 Auto-Mejora (3 segundos)</h3>
              <ol className="text-sm space-y-1">
                <li>1. Escribe: "hola como estas espero que todo este bien"</li>
                <li>2. <strong>NO TOQUES NADA</strong> por 3 segundos</li>
                <li>3. Observa los logs</li>
                <li>4. El texto se mejorará automáticamente</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-purple-600 mb-2">✋ Mejora Manual</h3>
              <ol className="text-sm space-y-1">
                <li>1. Escribe cualquier texto</li>
                <li>2. Haz clic en "Mejorar Ahora"</li>
                <li>3. Ve el resultado inmediatamente</li>
                <li>4. Funciona con cualquier cantidad de texto</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}