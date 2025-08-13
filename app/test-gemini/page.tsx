"use client";

import { useState } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

export default function TestGeminiPage() {
  const { post } = useAuthenticatedFetch();
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testGeminiAPI = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      const data = await post('/api/test-gemini', {
        testApiKey: apiKey.trim() || undefined
      });
      setResults(data);
    } catch (error) {
      setResults({
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Error de red al probar la API',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Diagnóstico de API de Gemini
          </h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key de Gemini (opcional - usa la del entorno si está vacío)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ingresa tu API key para probar..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si no ingresas una API key, se usará la configurada en las variables de entorno.
            </p>
          </div>
          
          <button
            onClick={testGeminiAPI}
            disabled={testing}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? '🔄 Probando...' : '🚀 Probar API de Gemini'}
          </button>
          
          {results && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 Resultados del Diagnóstico
              </h2>
              
              {/* Status general */}
              <div className={`p-4 rounded-md mb-4 ${
                results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">
                    {results.success ? '✅' : '❌'}
                  </span>
                  <span className={`font-medium ${
                    results.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {results.success ? 'API funcionando correctamente' : 'API con problemas'}
                  </span>
                </div>
                {results.message && (
                  <p className={`mt-2 text-sm ${
                    results.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {results.message}
                  </p>
                )}
              </div>
              
              {/* Recomendaciones */}
              {results.recommendations && results.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
                  <h3 className="font-medium text-blue-800 mb-2">💡 Recomendaciones:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Diagnóstico detallado */}
              {results.diagnosis && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h3 className="font-medium text-gray-800 mb-2">🔍 Diagnóstico:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">API Key configurada:</span>
                      <span className={`ml-2 ${results.diagnosis.apiKeyConfigured ? 'text-green-600' : 'text-red-600'}`}>
                        {results.diagnosis.apiKeyConfigured ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Modelos exitosos:</span>
                      <span className="ml-2 text-blue-600">
                        {results.diagnosis.successfulModels}/{results.diagnosis.totalModels}
                      </span>
                    </div>
                    {results.diagnosis.recommendedModel && (
                      <div>
                        <span className="text-gray-600">Modelo recomendado:</span>
                        <span className="ml-2 text-green-600 font-mono">
                          {results.diagnosis.recommendedModel}
                        </span>
                      </div>
                    )}
                    {results.diagnosis.averageResponseTime && (
                      <div>
                        <span className="text-gray-600">Tiempo promedio:</span>
                        <span className="ml-2 text-blue-600">
                          {results.diagnosis.averageResponseTime}ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Resultados detallados por modelo */}
              {results.results && results.results.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">📋 Resultados por Modelo:</h3>
                  {results.results.map((result: any, index: number) => (
                    <div key={index} className={`border rounded-md p-4 ${
                      result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-medium">
                          {result.model}
                        </span>
                        <span className={`text-sm ${
                          result.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.success ? '✅ Exitoso' : '❌ Falló'}
                        </span>
                      </div>
                      
                      {result.success ? (
                        <div className="text-sm text-gray-700">
                          <p><strong>Respuesta:</strong> {result.response}</p>
                          <p><strong>Tiempo:</strong> {result.responseTime}ms</p>
                        </div>
                      ) : (
                        <div className="text-sm text-red-700">
                          <p><strong>Error:</strong> {result.error?.message || 'Error desconocido'}</p>
                          {result.status && (
                            <p><strong>Status:</strong> {result.status} {result.statusText}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* JSON completo para debugging */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  🔧 Ver respuesta completa (para debugging)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-md text-xs overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}