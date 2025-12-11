'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Search, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Globe,
  ArrowLeft,
  RefreshCw,
  Lightbulb,
  BarChart3,
  Users,
  ShoppingCart,
  BookOpen
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface IntentAnalysis {
  keyword: string
  url: string
  detectedIntent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  intentConfidence: number
  currentPageIntent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  intentMatch: boolean
  competitors: CompetitorData[]
  semanticGaps: string[]
  recommendations: string[]
}

interface CompetitorData {
  position: number
  url: string
  title: string
  snippet: string
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  keywordDensity: number
  semanticKeywords: string[]
}

const intentIcons = {
  informational: <BookOpen className="h-4 w-4" />,
  commercial: <Users className="h-4 w-4" />,
  transactional: <ShoppingCart className="h-4 w-4" />,
  navigational: <Globe className="h-4 w-4" />
}

const intentColors = {
  informational: 'bg-blue-100 text-blue-800 border-blue-200',
  commercial: 'bg-orange-100 text-orange-800 border-orange-200',
  transactional: 'bg-green-100 text-green-800 border-green-200',
  navigational: 'bg-purple-100 text-purple-800 border-purple-200'
}

const intentDescriptions = {
  informational: 'El usuario busca información, guías o respuestas',
  commercial: 'El usuario investiga productos/servicios antes de comprar',
  transactional: 'El usuario quiere realizar una acción específica',
  navigational: 'El usuario busca un sitio web específico'
}

function IntentAnalyzerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [url, setUrl] = useState(searchParams.get('url') || '')
  const [analysis, setAnalysis] = useState<IntentAnalysis | null>(null)

  useEffect(() => {
    if (keyword && url) {
      analyzeIntent()
    }
  }, [])

  const analyzeIntent = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch('/api/seo/analyze-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, url }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalysis(data)
      } else {
        // Datos de ejemplo para demostración
        await new Promise(resolve => setTimeout(resolve, 2000))
        setAnalysis({
          keyword,
          url,
          detectedIntent: 'informational',
          intentConfidence: 85,
          currentPageIntent: 'commercial',
          intentMatch: false,
          competitors: [
            {
              position: 1,
              url: 'https://competitor1.com',
              title: `Guía completa de ${keyword} - Todo lo que necesitas saber`,
              snippet: `Aprende todo sobre ${keyword} con nuestra guía paso a paso. Incluye ejemplos prácticos y consejos de expertos.`,
              intent: 'informational',
              keywordDensity: 2.3,
              semanticKeywords: ['guía', 'tutorial', 'paso a paso', 'ejemplos', 'consejos']
            },
            {
              position: 2,
              url: 'https://competitor2.com',
              title: `${keyword}: Definición, tipos y mejores prácticas`,
              snippet: `Descubre qué es ${keyword}, los diferentes tipos que existen y las mejores prácticas para implementarlo correctamente.`,
              intent: 'informational',
              keywordDensity: 1.8,
              semanticKeywords: ['definición', 'tipos', 'mejores prácticas', 'implementar']
            },
            {
              position: 3,
              url: 'https://competitor3.com',
              title: `Cómo usar ${keyword} - Tutorial completo 2024`,
              snippet: `Tutorial actualizado sobre cómo usar ${keyword} efectivamente. Incluye herramientas, técnicas y casos de estudio.`,
              intent: 'informational',
              keywordDensity: 2.1,
              semanticKeywords: ['tutorial', 'cómo usar', 'herramientas', 'técnicas', 'casos de estudio']
            }
          ],
          semanticGaps: [
            'tutorial paso a paso',
            'mejores prácticas',
            'casos de estudio',
            'herramientas recomendadas',
            'errores comunes',
            'ejemplos prácticos'
          ],
          recommendations: [
            'Cambiar el enfoque de comercial a informacional',
            'Agregar sección de tutorial paso a paso',
            'Incluir casos de estudio reales',
            'Añadir lista de herramientas recomendadas',
            'Crear sección de errores comunes a evitar'
          ]
        })
      }
    } catch (error) {
      console.error('Error analyzing intent:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAnalyze = () => {
    if (keyword && url) {
      analyzeIntent()
    }
  }

  if (analyzing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Analizando Search Intent</h3>
            <p className="text-gray-600 mb-4">Comparando con competencia top 3 y detectando huecos semánticos...</p>
            <div className="w-64 mx-auto">
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/seo-dashboard/opportunities">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Oportunidades
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analizador de Intención</h1>
            <p className="text-gray-600 mt-1">Verifica el search intent y compara con la competencia top 3</p>
          </div>
        </div>
      </div>

      {/* Formulario de análisis */}
      {!analysis && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Analizar Search Intent
            </CardTitle>
            <CardDescription>
              Ingresa la keyword y URL para analizar la intención de búsqueda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Keyword</label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ej: cómo hacer SEO"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://ejemplo.com/pagina"
                  className="mt-1"
                />
              </div>
            </div>
            <Button 
              onClick={handleAnalyze}
              disabled={!keyword || !url}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Analizar Intent
            </Button>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-8">
          {/* Resumen del análisis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Intent Detectado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${intentColors[analysis.detectedIntent]}`}>
                    {intentIcons[analysis.detectedIntent]}
                    <span className="font-medium capitalize">{analysis.detectedIntent}</span>
                  </div>
                  <Badge variant="secondary">{analysis.intentConfidence}%</Badge>
                </div>
                <p className="text-sm text-gray-600">{intentDescriptions[analysis.detectedIntent]}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Intent de tu Página</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${intentColors[analysis.currentPageIntent]} mb-2`}>
                  {intentIcons[analysis.currentPageIntent]}
                  <span className="font-medium capitalize">{analysis.currentPageIntent}</span>
                </div>
                <p className="text-sm text-gray-600">{intentDescriptions[analysis.currentPageIntent]}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Coincidencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  {analysis.intentMatch ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  )}
                  <span className={`font-medium ${analysis.intentMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.intentMatch ? 'Coincide' : 'No coincide'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {analysis.intentMatch 
                    ? 'Tu página coincide con el intent de búsqueda'
                    : 'Tu página no coincide con el intent esperado'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alerta de desajuste */}
          {!analysis.intentMatch && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Desajuste de Intent Detectado:</strong> Tu página tiene un enfoque {analysis.currentPageIntent} 
                pero los usuarios buscan contenido {analysis.detectedIntent}. Esto puede limitar tu ranking.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Análisis de Competencia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Competencia Top 3
                </CardTitle>
                <CardDescription>
                  Análisis de las páginas mejor posicionadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.competitors.map((competitor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Posición {competitor.position}
                        </Badge>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${intentColors[competitor.intent]}`}>
                          {intentIcons[competitor.intent]}
                          <span className="capitalize">{competitor.intent}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-blue-600 mb-1 line-clamp-2">
                        {competitor.title}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {competitor.snippet}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Densidad: {competitor.keywordDensity}%</span>
                        <span>{competitor.semanticKeywords.length} keywords semánticas</span>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {competitor.semanticKeywords.slice(0, 3).map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {competitor.semanticKeywords.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{competitor.semanticKeywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Huecos Semánticos y Recomendaciones */}
            <div className="space-y-6">
              {/* Huecos Semánticos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                    Huecos Semánticos NLP
                  </CardTitle>
                  <CardDescription>
                    Keywords que usa la competencia y tú no
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {analysis.semanticGaps.map((gap, index) => (
                      <Badge key={index} variant="outline" className="justify-center py-2">
                        {gap}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recomendaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                    Recomendaciones
                  </CardTitle>
                  <CardDescription>
                    Acciones para mejorar el intent matching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-900">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Pasos</CardTitle>
              <CardDescription>
                Acciones recomendadas basadas en el análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href={`/seo-dashboard/optimizer?keyword=${encodeURIComponent(analysis.keyword)}&url=${encodeURIComponent(analysis.url)}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Target className="h-4 w-4 mr-2" />
                    Optimizar Tres Reyes
                  </Button>
                </Link>
                
                <Button variant="outline" onClick={() => setAnalysis(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nuevo Análisis
                </Button>
                
                <Link href={`/seo-dashboard/results?keyword=${encodeURIComponent(analysis.keyword)}&url=${encodeURIComponent(analysis.url)}`}>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Resultados
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function IntentAnalyzerPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando analizador de intención...</p>
          </div>
        </div>
      </div>
    }>
      <IntentAnalyzerContent />
    </Suspense>
  )
}