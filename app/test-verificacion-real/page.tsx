"use client";

import { useState } from 'react';
import { toast } from 'sonner';

export default function TestVerificacionReal() {
  const [originalText, setOriginalText] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  const testTexts = [
    {
      name: "Texto con errores evidentes",
      text: "este texto tiene muchos errores de gramatica y ortografia que necesita ser corregido"
    },
    {
      name: "Texto sin puntuación",
      text: "hola como estas espero que bien me gustaria saber si puedes ayudarme"
    },
    {
      name: "Texto informal",
      text: "oye tio esto esta super mal ayudame porfa"
    },
    {
      name: "Texto ya perfecto",
      text: "Este texto está perfectamente escrito con gramática correcta y tono profesional."
    }
  ];

  const analyzeTexts = (original: string, improved: string) => {
    const analysis = {
      identical: original.trim() === improved.trim(),
      identicalIgnoreCase: original.trim().toLowerCase() === improved.trim().toLowerCase(),
      lengthChange: improved.length - original.length,
      wordCountChange: improved.split(/\s+/).length - original.split(/\s+/).length,
      changes: [] as string[]
    };

    // Detectar cambios específicos
    if (!/^[A-Z]/.test(original) && /^[A-Z]/.test(improved)) {
      analysis.changes.push('Mayúscula inicial agregada');
    }
    
    if (!original.endsWith('.') && improved.endsWith('.')) {
      analysis.changes.push('Punto final agregado');
    }
    
    if (original.includes('gramatica') && improved.includes('gramática')) {
      analysis.changes.push('Tilde en "gramática" corregida');
    }
    
    if (original.includes('ortografia') && improved.includes('ortografía')) {
      analysis.changes.push('Tilde en "ortografía" corregida');
    }

    if (original.includes('estas') && improved.includes('estás')) {
      analysis.changes.push('Tilde en "estás" corregida');
    }

    return analysis;
  };

  const testImprovement = async (text: string) => {
    setOriginalText(text);
    setImprovedText('');
    setApiResponse(null);
    setComparisonResult(null);
    setIsProcessing(true);

    try {
      console.log('🔄 Enviando texto a la API:', text);
      
      const response = await fetch('/api/improve-text-simple', {
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
      setApiResponse({ status: response.status, data });

      console.log('📊 Respuesta de la API:', { status: response.status, data });

      if (response.ok && data.improvedContent) {
        setImprovedText(data.improvedContent);
        
        // Analizar los cambios
        const analysis = analyzeTexts(text, data.improvedContent);
        setComparisonResult(analysis);
        
        if (analysis.identical) {
          toast.error('🚨 PROBLEMA: El texto no cambió pero la API dice que sí');
        } else {
          toast.success('✅ Texto realmente mejorado');
        }
      } else {
        toast.warning(`API rechazó el texto: ${data.error}`);
      }

    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error de conexión');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Verificación Real de Mejoras</h1>
          <p className="text-muted-foreground">
            Prueba si el sistema realmente mejora el texto o solo miente
          </p>
        </div>

        {/* Textos de prueba */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Textos de Prueba</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testTexts.map((test, index) => (
              <button
                key={index}
                onClick={() => testImprovement(test.text)}
                disabled={isProcessing}
                className="p-4 text-left border rounded-lg hover:bg-muted/50 disabled:opacity-50"
              >
                <h3 className="font-medium mb-2">{test.name}</h3>
                <p className="text-sm text-muted-foreground">{test.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Texto personalizado */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Prueba Personalizada</h2>
          <div className="space-y-4">
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Escribe tu texto aquí para probarlo..."
              className="w-full h-32 p-4 border rounded-lg resize-none"
              disabled={isProcessing}
            />
            <button
              onClick={() => testImprovement(originalText)}
              disabled={isProcessing || !originalText.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isProcessing ? 'Probando...' : 'Probar Mejora'}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {apiResponse && (
          <div className="space-y-6">
            {/* Respuesta de la API */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Respuesta de la API</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    apiResponse.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {apiResponse.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Mensaje:</span>
                  <span className="ml-2">{apiResponse.data.error || 'Éxito'}</span>
                </div>
              </div>
            </div>

            {/* Comparación de textos */}
            {improvedText && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 text-red-600">Texto Original</h3>
                  <p className="text-sm bg-red-50 p-3 rounded">{originalText}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {originalText.length} caracteres, {originalText.split(/\s+/).length} palabras
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-600">Texto Mejorado</h3>
                  <p className="text-sm bg-green-50 p-3 rounded">{improvedText}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {improvedText.length} caracteres, {improvedText.split(/\s+/).length} palabras
                  </div>
                </div>
              </div>
            )}

            {/* Análisis de cambios */}
            {comparisonResult && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-4">Análisis de Cambios</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${comparisonResult.identical ? 'text-red-600' : 'text-green-600'}`}>
                      {comparisonResult.identical ? '❌' : '✅'}
                    </div>
                    <div className="text-xs">
                      {comparisonResult.identical ? 'Idéntico' : 'Diferente'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {comparisonResult.lengthChange > 0 ? '+' : ''}{comparisonResult.lengthChange}
                    </div>
                    <div className="text-xs">Caracteres</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {comparisonResult.wordCountChange > 0 ? '+' : ''}{comparisonResult.wordCountChange}
                    </div>
                    <div className="text-xs">Palabras</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {comparisonResult.changes.length}
                    </div>
                    <div className="text-xs">Mejoras</div>
                  </div>
                </div>

                {comparisonResult.changes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Mejoras Detectadas:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {comparisonResult.changes.map((change, index) => (
                        <li key={index} className="text-green-700">{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {comparisonResult.identical && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 font-medium">
                      🚨 PROBLEMA CRÍTICO: El sistema dice que mejoró el texto pero es idéntico al original
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}