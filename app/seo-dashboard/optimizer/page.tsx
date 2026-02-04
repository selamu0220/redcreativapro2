'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Edit3, 
  Eye, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Search,
  Globe,
  ArrowLeft,
  Save,
  RefreshCw
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface OptimizationData {
  keyword: string
  url: string
  currentTitle: string
  currentH1: string
  currentFirstParagraph: string
  optimizedTitle: string
  optimizedH1: string
  optimizedFirstParagraph: string
}

interface SerpPreview {
  title: string
  url: string
  description: string
}

function OptimizerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [optimizationData, setOptimizationData] = useState<OptimizationData>({
    keyword: searchParams.get('keyword') || '',
    url: searchParams.get('url') || '',
    currentTitle: '',
    currentH1: '',
    currentFirstParagraph: '',
    optimizedTitle: '',
    optimizedH1: '',
    optimizedFirstParagraph: ''
  })
  
  const [optimizationScore, setOptimizationScore] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [serpPreview, setSerpPreview] = useState<SerpPreview>({
    title: '',
    url: '',
    description: ''
  })

  // Contadores de caracteres
  const titleLength = optimizationData.optimizedTitle.length
  const h1Length = optimizationData.optimizedH1.length
  const paragraphLength = optimizationData.optimizedFirstParagraph.length

  // Estados de validación
  const titleStatus = titleLength >= 30 && titleLength <= 60 ? 'optimal' : titleLength > 60 ? 'warning' : 'error'
  const h1Status = h1Length >= 20 && h1Length <= 70 ? 'optimal' : 'warning'
  const paragraphStatus = paragraphLength >= 120 && paragraphLength <= 160 ? 'optimal' : 'warning'

  useEffect(() => {
    if (optimizationData.keyword && optimizationData.url) {
      fetchCurrentContent()
    }
  }, [])

  useEffect(() => {
    updateSerpPreview()
    calculateOptimizationScore()
    generateSuggestions()
  }, [optimizationData.optimizedTitle, optimizationData.optimizedH1, optimizationData.optimizedFirstParagraph])

  const fetchCurrentContent = async () => {
    setLoading(true)
    try {
      // Simular fetch del contenido actual
      // En producción, esto haría una llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOptimizationData(prev => ({
        ...prev,
        currentTitle: `Guía completa de ${prev.keyword} - Ejemplo`,
        currentH1: `Todo sobre ${prev.keyword}`,
        currentFirstParagraph: `En esta guía aprenderás todo lo necesario sobre ${prev.keyword} y cómo implementarlo correctamente.`,
        optimizedTitle: `Guía completa de ${prev.keyword} - Ejemplo`,
        optimizedH1: `Todo sobre ${prev.keyword}`,
        optimizedFirstParagraph: `En esta guía aprenderás todo lo necesario sobre ${prev.keyword} y cómo implementarlo correctamente.`
      }))
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSerpPreview = () => {
    setSerpPreview({
      title: optimizationData.optimizedTitle || 'Título de la página',
      url: optimizationData.url || 'https://ejemplo.com/pagina',
      description: optimizationData.optimizedFirstParagraph || 'Descripción de la página...'
    })
  }

  const calculateOptimizationScore = () => {
    let score = 0
    const keyword = optimizationData.keyword.toLowerCase()
    
    // Verificar keyword en title (30 puntos)
    if (optimizationData.optimizedTitle.toLowerCase().includes(keyword)) {
      score += 30
    }
    
    // Verificar keyword en H1 (25 puntos)
    if (optimizationData.optimizedH1.toLowerCase().includes(keyword)) {
      score += 25
    }
    
    // Verificar keyword en primera frase (25 puntos)
    if (optimizationData.optimizedFirstParagraph.toLowerCase().includes(keyword)) {
      score += 25
    }
    
    // Verificar longitud óptima del title (10 puntos)
    if (titleStatus === 'optimal') {
      score += 10
    }
    
    // Verificar longitud óptima del H1 (5 puntos)
    if (h1Status === 'optimal') {
      score += 5
    }
    
    // Verificar longitud óptima del párrafo (5 puntos)
    if (paragraphStatus === 'optimal') {
      score += 5
    }
    
    setOptimizationScore(score)
  }

  const generateSuggestions = () => {
    const newSuggestions: string[] = []
    const keyword = optimizationData.keyword.toLowerCase()
    
    if (!optimizationData.optimizedTitle.toLowerCase().includes(keyword)) {
      newSuggestions.push(`Incluye "${optimizationData.keyword}" en el título`)
    }
    
    if (!optimizationData.optimizedH1.toLowerCase().includes(keyword)) {
      newSuggestions.push(`Incluye "${optimizationData.keyword}" en el H1`)
    }
    
    if (!optimizationData.optimizedFirstParagraph.toLowerCase().includes(keyword)) {
      newSuggestions.push(`Incluye "${optimizationData.keyword}" en la primera frase`)
    }
    
    if (titleLength > 60) {
      newSuggestions.push('Reduce la longitud del título (máximo 60 caracteres)')
    } else if (titleLength < 30) {
      newSuggestions.push('Aumenta la longitud del título (mínimo 30 caracteres)')
    }
    
    if (h1Length < 20) {
      newSuggestions.push('Aumenta la longitud del H1 (mínimo 20 caracteres)')
    }
    
    if (paragraphLength < 120) {
      newSuggestions.push('Aumenta la longitud del párrafo (mínimo 120 caracteres)')
    }
    
    setSuggestions(newSuggestions)
  }

  const handleSaveOptimization = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/seo/optimize-three-kings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: optimizationData.url,
          targetKeyword: optimizationData.keyword,
          titleTag: optimizationData.optimizedTitle,
          h1Tag: optimizationData.optimizedH1,
          firstParagraph: optimizationData.optimizedFirstParagraph
        }),
      })
      
      if (response.ok) {
        // Redirigir al monitor de resultados
        router.push(`/seo-dashboard/results?keyword=${encodeURIComponent(optimizationData.keyword)}&url=${encodeURIComponent(optimizationData.url)}`)
      }
    } catch (error) {
      console.error('Error saving optimization:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando contenido actual...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Optimizador Tres Reyes</h1>
            <p className="text-gray-600 mt-1">Optimiza title tag, H1 y primera frase para maximizar el CTR</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{optimizationScore}%</div>
            <div className="text-sm text-gray-600">Score de Optimización</div>
          </div>
          <Button 
            onClick={handleSaveOptimization}
            disabled={saving || optimizationScore < 50}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Optimización
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Información de la keyword */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Keyword Objetivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Keyword</label>
              <div className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium text-blue-900">{optimizationData.keyword}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">URL</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="text-gray-900 truncate">{optimizationData.url}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Tag */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Edit3 className="h-5 w-5 mr-2 text-blue-600" />
                  Title Tag
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(titleStatus)}`}>
                  {getStatusIcon(titleStatus)}
                  <span className="text-sm font-medium">{titleLength}/60</span>
                </div>
              </CardTitle>
              <CardDescription>
                El título que aparece en los resultados de búsqueda. Debe incluir la keyword objetivo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={optimizationData.optimizedTitle}
                onChange={(e) => setOptimizationData(prev => ({ ...prev, optimizedTitle: e.target.value }))}
                placeholder="Escribe el título optimizado..."
                className="text-lg"
              />
              <div className="mt-2 text-sm text-gray-600">
                <strong>Original:</strong> {optimizationData.currentTitle}
              </div>
            </CardContent>
          </Card>

          {/* H1 Tag */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Edit3 className="h-5 w-5 mr-2 text-green-600" />
                  H1 Tag
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(h1Status)}`}>
                  {getStatusIcon(h1Status)}
                  <span className="text-sm font-medium">{h1Length}/70</span>
                </div>
              </CardTitle>
              <CardDescription>
                El encabezado principal de la página. Debe coincidir con el title tag y incluir la keyword.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={optimizationData.optimizedH1}
                onChange={(e) => setOptimizationData(prev => ({ ...prev, optimizedH1: e.target.value }))}
                placeholder="Escribe el H1 optimizado..."
                className="text-lg"
              />
              <div className="mt-2 text-sm text-gray-600">
                <strong>Original:</strong> {optimizationData.currentH1}
              </div>
            </CardContent>
          </Card>

          {/* Primera Frase/Párrafo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Edit3 className="h-5 w-5 mr-2 text-orange-600" />
                  Primera Frase/Párrafo
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(paragraphStatus)}`}>
                  {getStatusIcon(paragraphStatus)}
                  <span className="text-sm font-medium">{paragraphLength}/160</span>
                </div>
              </CardTitle>
              <CardDescription>
                La primera frase o párrafo del contenido. Debe responder directamente a la keyword objetivo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={optimizationData.optimizedFirstParagraph}
                onChange={(e) => setOptimizationData(prev => ({ ...prev, optimizedFirstParagraph: e.target.value }))}
                placeholder="Escribe la primera frase/párrafo optimizado..."
                rows={4}
                className="text-base"
              />
              <div className="mt-2 text-sm text-gray-600">
                <strong>Original:</strong> {optimizationData.currentFirstParagraph}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview SERP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                Preview SERP
              </CardTitle>
              <CardDescription>
                Cómo se verá en los resultados de Google
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer line-clamp-2">
                  {serpPreview.title || 'Título de la página'}
                </div>
                <div className="text-green-700 text-sm mt-1">
                  {serpPreview.url || 'https://ejemplo.com/pagina'}
                </div>
                <div className="text-gray-700 text-sm mt-2 line-clamp-3">
                  {serpPreview.description || 'Descripción de la página...'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sugerencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                Sugerencias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <Alert key={index}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {suggestion}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">¡Excelente! No hay sugerencias adicionales.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Desglose del Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Keyword en Title</span>
                  <Badge variant={optimizationData.optimizedTitle.toLowerCase().includes(optimizationData.keyword.toLowerCase()) ? "default" : "secondary"}>
                    {optimizationData.optimizedTitle.toLowerCase().includes(optimizationData.keyword.toLowerCase()) ? "30pts" : "0pts"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Keyword en H1</span>
                  <Badge variant={optimizationData.optimizedH1.toLowerCase().includes(optimizationData.keyword.toLowerCase()) ? "default" : "secondary"}>
                    {optimizationData.optimizedH1.toLowerCase().includes(optimizationData.keyword.toLowerCase()) ? "25pts" : "0pts"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Keyword en Párrafo</span>
                  <Badge variant={optimizationData.optimizedFirstParagraph.toLowerCase().includes(optimizationData.keyword.toLowerCase()) ? "default" : "secondary"}>
                    {optimizationData.optimizedFirstParagraph.toLowerCase().includes(optimizationData.keyword.toLowerCase()) ? "25pts" : "0pts"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Longitud Title</span>
                  <Badge variant={titleStatus === 'optimal' ? "default" : "secondary"}>
                    {titleStatus === 'optimal' ? "10pts" : "0pts"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Longitud H1</span>
                  <Badge variant={h1Status === 'optimal' ? "default" : "secondary"}>
                    {h1Status === 'optimal' ? "5pts" : "0pts"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Longitud Párrafo</span>
                  <Badge variant={paragraphStatus === 'optimal' ? "default" : "secondary"}>
                    {paragraphStatus === 'optimal' ? "5pts" : "0pts"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <Badge className="bg-blue-600">
                    {optimizationScore}pts
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function OptimizerPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando optimizador...</p>
          </div>
        </div>
      </div>
    }>
      <OptimizerContent />
    </Suspense>
  )
}
