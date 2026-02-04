'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Users, 
  Calendar,
  ArrowLeft,
  RefreshCw,
  Download,
  Filter,
  Search,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface ResultsData {
  keyword: string
  url: string
  optimizationDate: string
  beforeOptimization: {
    position: number
    ctr: number
    impressions: number
    clicks: number
  }
  afterOptimization: {
    position: number
    ctr: number
    impressions: number
    clicks: number
  }
  evolution: EvolutionData[]
  improvements: {
    positionChange: number
    ctrChange: number
    clicksChange: number
    impressionsChange: number
  }
}

interface EvolutionData {
  date: string
  position: number
  ctr: number
  clicks: number
  impressions: number
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [url, setUrl] = useState(searchParams.get('url') || '')
  const [results, setResults] = useState<ResultsData | null>(null)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    if (keyword && url) {
      fetchResults()
    }
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    try {
      // Simular datos de ejemplo
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockResults: ResultsData = {
        keyword,
        url,
        optimizationDate: '2024-01-15',
        beforeOptimization: {
          position: 12,
          ctr: 1.2,
          impressions: 2500,
          clicks: 30
        },
        afterOptimization: {
          position: 6,
          ctr: 4.8,
          impressions: 3200,
          clicks: 154
        },
        evolution: [
          { date: '2024-01-01', position: 12, ctr: 1.2, clicks: 30, impressions: 2500 },
          { date: '2024-01-05', position: 11, ctr: 1.4, clicks: 35, impressions: 2600 },
          { date: '2024-01-10', position: 10, ctr: 1.8, clicks: 45, impressions: 2700 },
          { date: '2024-01-15', position: 8, ctr: 2.5, clicks: 68, impressions: 2800 },
          { date: '2024-01-20', position: 7, ctr: 3.2, clicks: 96, impressions: 3000 },
          { date: '2024-01-25', position: 6, ctr: 4.1, clicks: 123, impressions: 3100 },
          { date: '2024-01-30', position: 6, ctr: 4.8, clicks: 154, impressions: 3200 }
        ],
        improvements: {
          positionChange: -6, // Negativo porque bajó de posición (mejoró)
          ctrChange: 3.6,
          clicksChange: 124,
          impressionsChange: 700
        }
      }
      
      setResults(mockResults)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (keyword && url) {
      fetchResults()
    }
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString()
  }

  const getChangeColor = (value: number, isPosition = false) => {
    if (isPosition) {
      return value < 0 ? 'text-green-600' : value > 0 ? 'text-red-600' : 'text-gray-600'
    }
    return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'
  }

  const getChangeIcon = (value: number, isPosition = false) => {
    if (isPosition) {
      return value < 0 ? <TrendingUp className="h-4 w-4" /> : value > 0 ? <TrendingDown className="h-4 w-4" /> : null
    }
    return value > 0 ? <TrendingUp className="h-4 w-4" /> : value < 0 ? <TrendingDown className="h-4 w-4" /> : null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando resultados...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Monitor de Resultados</h1>
            <p className="text-gray-600 mt-1">Seguimiento de rankings, CTR y tráfico orgánico</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Formulario de búsqueda */}
      {!results && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Buscar Resultados
            </CardTitle>
            <CardDescription>
              Ingresa la keyword y URL para ver los resultados de optimización
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
              onClick={handleSearch}
              disabled={!keyword || !url}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Resultados
            </Button>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-8">
          {/* Información de la optimización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Información de la Optimización
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Keyword</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-medium text-blue-900">{results.keyword}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">URL</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900 truncate">{results.url}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Optimización</label>
                  <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-green-900">{results.optimizationDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Posición
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Antes:</span>
                    <Badge variant="secondary">#{results.beforeOptimization.position}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Después:</span>
                    <Badge className="bg-blue-600">#{results.afterOptimization.position}</Badge>
                  </div>
                  <Separator />
                  <div className={`flex items-center justify-between ${getChangeColor(results.improvements.positionChange, true)}`}>
                    <span className="text-sm font-medium">Cambio:</span>
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(results.improvements.positionChange, true)}
                      <span className="font-bold">
                        {Math.abs(results.improvements.positionChange)} posiciones
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MousePointer className="h-5 w-5 mr-2 text-green-600" />
                  CTR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Antes:</span>
                    <span className="font-medium">{results.beforeOptimization.ctr}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Después:</span>
                    <span className="font-medium text-green-600">{results.afterOptimization.ctr}%</span>
                  </div>
                  <Separator />
                  <div className={`flex items-center justify-between ${getChangeColor(results.improvements.ctrChange)}`}>
                    <span className="text-sm font-medium">Cambio:</span>
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(results.improvements.ctrChange)}
                      <span className="font-bold">
                        {formatPercentage(results.improvements.ctrChange)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-600" />
                  Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Antes:</span>
                    <span className="font-medium">{formatNumber(results.beforeOptimization.clicks)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Después:</span>
                    <span className="font-medium text-orange-600">{formatNumber(results.afterOptimization.clicks)}</span>
                  </div>
                  <Separator />
                  <div className={`flex items-center justify-between ${getChangeColor(results.improvements.clicksChange)}`}>
                    <span className="text-sm font-medium">Cambio:</span>
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(results.improvements.clicksChange)}
                      <span className="font-bold">
                        +{formatNumber(results.improvements.clicksChange)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-600" />
                  Impresiones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Antes:</span>
                    <span className="font-medium">{formatNumber(results.beforeOptimization.impressions)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Después:</span>
                    <span className="font-medium text-purple-600">{formatNumber(results.afterOptimization.impressions)}</span>
                  </div>
                  <Separator />
                  <div className={`flex items-center justify-between ${getChangeColor(results.improvements.impressionsChange)}`}>
                    <span className="text-sm font-medium">Cambio:</span>
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(results.improvements.impressionsChange)}
                      <span className="font-bold">
                        +{formatNumber(results.improvements.impressionsChange)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerta de éxito */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>¡Optimización Exitosa!</strong> La página mejoró {Math.abs(results.improvements.positionChange)} posiciones 
              y aumentó el CTR en {results.improvements.ctrChange.toFixed(1)}%, generando {results.improvements.clicksChange} clicks adicionales.
            </AlertDescription>
          </Alert>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Evolución de Posición */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Posición</CardTitle>
                <CardDescription>
                  Cambios en el ranking a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.evolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      domain={['dataMin - 2', 'dataMax + 2']}
                      reversed={true}
                      tickFormatter={(value) => `#${value}`}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                      formatter={(value) => [`#${value}`, 'Posición']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="position" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolución de CTR */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución de CTR</CardTitle>
                <CardDescription>
                  Cambios en el click-through rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={results.evolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                      formatter={(value) => [`${value}%`, 'CTR']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ctr" 
                      stroke="#16a34a" 
                      fill="#16a34a" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolución de Clicks */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Clicks</CardTitle>
                <CardDescription>
                  Tráfico orgánico generado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={results.evolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                      formatter={(value) => [formatNumber(Number(value)), 'Clicks']}
                    />
                    <Bar dataKey="clicks" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolución de Impresiones */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Impresiones</CardTitle>
                <CardDescription>
                  Visibilidad en resultados de búsqueda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={results.evolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tickFormatter={(value) => formatNumber(Number(value))} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                      formatter={(value) => [formatNumber(Number(value)), 'Impresiones']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="impressions" 
                      stroke="#7c3aed" 
                      fill="#7c3aed" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Adicionales</CardTitle>
              <CardDescription>
                Continúa optimizando tu estrategia SEO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href={`/seo-dashboard/optimizer?keyword=${encodeURIComponent(results.keyword)}&url=${encodeURIComponent(results.url)}`}>
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Optimizar Nuevamente
                  </Button>
                </Link>
                
                <Link href={`/seo-dashboard/intent-analyzer?keyword=${encodeURIComponent(results.keyword)}&url=${encodeURIComponent(results.url)}`}>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Analizar Intent
                  </Button>
                </Link>
                
                <Button variant="outline" onClick={() => setResults(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nueva Búsqueda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando resultados...</p>
          </div>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
