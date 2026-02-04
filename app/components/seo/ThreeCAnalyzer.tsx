'use client';

import { useState } from 'react';
import { Search, FileText, Layout, Target, ExternalLink, Copy, Check } from 'lucide-react';

interface AnalysisResult {
  contentType: string;
  contentFormat: string;
  contentAngle: string;
  confidence: 'high' | 'medium' | 'low';
  recommendation: string;
}

export default function ThreeCAnalyzer() {
  const [keyword, setKeyword] = useState('');
  const [urls, setUrls] = useState(['', '', '']);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const analyzeKeyword = async () => {
    if (!keyword.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis based on keyword patterns
    const mockAnalysis = generateMockAnalysis(keyword);
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const generateMockAnalysis = (kw: string): AnalysisResult => {
    const lowerKw = kw.toLowerCase();
    
    // Determine content type based on keyword patterns
    let contentType = 'Artículos de blog';
    if (lowerKw.includes('comprar') || lowerKw.includes('precio') || lowerKw.includes('tienda')) {
      contentType = 'Páginas de producto/categoría';
    } else if (lowerKw.includes('herramienta') || lowerKw.includes('calculadora') || lowerKw.includes('generador')) {
      contentType = 'Páginas de herramientas';
    }
    
    // Determine content format
    let contentFormat = 'Guía paso a paso';
    if (lowerKw.includes('mejor') || lowerKw.includes('top')) {
      contentFormat = 'Lista comparativa ("Los X mejores...")';
    } else if (lowerKw.includes('vs') || lowerKw.includes('comparar')) {
      contentFormat = 'Comparativa directa';
    } else if (lowerKw.includes('como') || lowerKw.includes('cómo')) {
      contentFormat = 'Tutorial paso a paso';
    }
    
    // Determine content angle
    let contentAngle = 'Enfoque profesional';
    if (lowerKw.includes('gratis') || lowerKw.includes('free')) {
      contentAngle = '"Gratis" y "sin costo"';
    } else if (lowerKw.includes('principiante') || lowerKw.includes('fácil')) {
      contentAngle = '"Para principiantes" y "fácil"';
    } else if (lowerKw.includes('2025') || lowerKw.includes('2024')) {
      contentAngle = 'Actualidad y tendencias actuales';
    } else if (lowerKw.includes('mejor')) {
      contentAngle = '"Mejor" y "top quality"';
    }
    
    // Generate confidence and recommendation
    const confidence: 'high' | 'medium' | 'low' = 'high';
    const recommendation = `Crea ${contentType.toLowerCase()} con formato de ${contentFormat.toLowerCase()}, enfocándote en ${contentAngle.toLowerCase()}. Asegúrate de incluir ejemplos prácticos y información actualizada.`;
    
    return {
      contentType,
      contentFormat,
      contentAngle,
      confidence,
      recommendation
    };
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Palabra Clave a Analizar
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ej: mejor software de contabilidad"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={analyzeKeyword}
              disabled={!keyword.trim() || isAnalyzing}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analizar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional URLs input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URLs de Competidores (Opcional)
          </label>
          <div className="space-y-2">
            {urls.map((url, index) => (
              <input
                key={index}
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder={`URL del resultado #${index + 1}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Opcional: Pega las URLs de los primeros 3 resultados para un análisis más preciso
          </p>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Análisis 3C para "{keyword}"
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Content Type */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Content Type
                </h5>
                <button
                  onClick={() => copyToClipboard(analysis.contentType, 'type')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedText === 'type' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-700 font-medium">{analysis.contentType}</p>
            </div>

            {/* Content Format */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900 flex items-center">
                  <Layout className="w-4 h-4 mr-2 text-green-600" />
                  Content Format
                </h5>
                <button
                  onClick={() => copyToClipboard(analysis.contentFormat, 'format')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedText === 'format' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-700 font-medium">{analysis.contentFormat}</p>
            </div>

            {/* Content Angle */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-purple-600" />
                  Content Angle
                </h5>
                <button
                  onClick={() => copyToClipboard(analysis.contentAngle, 'angle')}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedText === 'angle' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-700 font-medium">{analysis.contentAngle}</p>
            </div>
          </div>

          {/* Confidence Level */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Nivel de Confianza:</span>
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${analysis.confidence === 'high' ? 'bg-green-100 text-green-800' : ''}
                ${analysis.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${analysis.confidence === 'low' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {analysis.confidence === 'high' ? 'Alto' : analysis.confidence === 'medium' ? 'Medio' : 'Bajo'}
              </span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-semibold text-blue-800 mb-2">Recomendación de Contenido</h5>
                <p className="text-sm text-blue-700">{analysis.recommendation}</p>
              </div>
              <button
                onClick={() => copyToClipboard(analysis.recommendation, 'recommendation')}
                className="ml-2 p-1 text-blue-400 hover:text-blue-600 transition-colors"
              >
                {copiedText === 'recommendation' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Action Items */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="font-semibold text-yellow-800 mb-2">Próximos Pasos</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Crea un outline basado en el formato identificado</li>
              <li>• Incluye el ángulo de contenido en tu título y subtítulos</li>
              <li>• Analiza la longitud promedio del contenido competidor</li>
              <li>• Identifica oportunidades para mejorar el contenido existente</li>
            </ul>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!analysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Cómo usar esta herramienta</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Ingresa la palabra clave que quieres analizar</li>
            <li>2. Opcionalmente, pega las URLs de los primeros resultados de Google</li>
            <li>3. Haz clic en "Analizar" para obtener el análisis 3C</li>
            <li>4. Usa los resultados para crear contenido optimizado</li>
          </ol>
        </div>
      )}
    </div>
  );
}
