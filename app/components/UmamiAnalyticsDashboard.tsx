"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Users,
  Clock,
  TrendingUp,
  Eye,
  MousePointer,
  RefreshCw,
  Download,
  Search,
  Globe,
  MapPin,
} from "lucide-react";
import { useLocalization } from "../contexts/LocalizationContext";
import { geoDetectionService, getCountryDisplayName } from "../lib/geo-detection";

// Types for analytics data
interface PageMetrics {
  url: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
  bounceRate: number;
  engagementRate: number;
}

interface TimeSeriesData {
  date: string;
  views: number;
  visitors: number;
}

interface DeviceData {
  device: string;
  visitors: number;
  percentage: number;
}

interface CountryData {
  country: string;
  countryCode: string;
  visitors: number;
  percentage: number;
  avgSessionDuration: number;
  conversionRate: number;
}

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
    growthRate: number;
  };
  pages: PageMetrics[];
  timeSeries: TimeSeriesData[];
  devices: DeviceData[];
  countries: CountryData[];
  realtime: {
    activeUsers: number;
    currentPage: string;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function UmamiAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("7d");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Localization context
  const { country, language, isLatinAmerica } = useLocalization();

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    overview: {
      totalViews: 12543,
      uniqueVisitors: 8921,
      avgSessionDuration: 245,
      bounceRate: 42.3,
      growthRate: 15.2,
    },
    pages: [
      {
        url: "/",
        title: "Inicio",
        views: 5432,
        uniqueVisitors: 3821,
        avgTimeSpent: 180,
        bounceRate: 35.2,
        engagementRate: 68.4,
      },
      {
        url: "/servicios",
        title: "Servicios",
        views: 2341,
        uniqueVisitors: 1892,
        avgTimeSpent: 320,
        bounceRate: 28.1,
        engagementRate: 75.3,
      },
      {
        url: "/blog",
        title: "Blog",
        views: 1876,
        uniqueVisitors: 1234,
        avgTimeSpent: 420,
        bounceRate: 22.5,
        engagementRate: 82.1,
      },
    ],
    timeSeries: [
      { date: "2024-01-01", views: 1200, visitors: 800 },
      { date: "2024-01-02", views: 1350, visitors: 920 },
      { date: "2024-01-03", views: 1180, visitors: 780 },
      { date: "2024-01-04", views: 1420, visitors: 1050 },
      { date: "2024-01-05", views: 1680, visitors: 1200 },
      { date: "2024-01-06", views: 1890, visitors: 1340 },
      { date: "2024-01-07", views: 2100, visitors: 1580 },
    ],
    devices: [
      { device: "Desktop", visitors: 4521, percentage: 52.1 },
      { device: "Mobile", visitors: 3234, percentage: 37.2 },
      { device: "Tablet", visitors: 932, percentage: 10.7 },
    ],
    countries: [
      { country: "México", countryCode: "MX", visitors: 3245, percentage: 36.4, avgSessionDuration: 280, conversionRate: 4.2 },
      { country: "Colombia", countryCode: "CO", visitors: 2156, percentage: 24.2, avgSessionDuration: 245, conversionRate: 3.8 },
      { country: "Argentina", countryCode: "AR", visitors: 1432, percentage: 16.1, avgSessionDuration: 320, conversionRate: 5.1 },
      { country: "España", countryCode: "ES", visitors: 987, percentage: 11.1, avgSessionDuration: 195, conversionRate: 2.9 },
      { country: "Chile", countryCode: "CL", visitors: 654, percentage: 7.3, avgSessionDuration: 265, conversionRate: 4.5 },
      { country: "Perú", countryCode: "PE", visitors: 447, percentage: 5.0, avgSessionDuration: 230, conversionRate: 3.6 },
    ],
    realtime: {
      activeUsers: 23,
      currentPage: "/servicios",
    },
  };

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(mockData);
      } catch (err) {
        setError("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Filter pages based on search term
  const filteredPages =
    data?.pages.filter(
      (page) =>
        page.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos de analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Error al cargar datos
            </h3>
            <p className="text-sm mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Métricas de rendimiento y engagement</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1d">Último día</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Vistas totales
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(data.overview.totalViews)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">
                +{data.overview.growthRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Visitantes únicos
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(data.overview.uniqueVisitors)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Duración promedio
                </p>
                <p className="text-2xl font-bold">
                  {formatDuration(data.overview.avgSessionDuration)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tasa de rebote
                </p>
                <p className="text-2xl font-bold">
                  {data.overview.bounceRate.toFixed(1)}%
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Usuarios activos
                </p>
                <p className="text-2xl font-bold">
                  {data.realtime.activeUsers}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <Badge variant="secondary" className="mt-2">
              En tiempo real
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="audience">Audiencia</TabsTrigger>
          <TabsTrigger value="geography">
            <Globe className="h-4 w-4 mr-2" />
            Geografía
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de tráfico</CardTitle>
                <CardDescription>
                  Vistas y visitantes en el tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por dispositivo</CardTitle>
                <CardDescription>
                  Visitantes por tipo de dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.devices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) =>
                        `${device} ${percentage}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="visitors"
                    >
                      {data.devices.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rendimiento por página</CardTitle>
                  <CardDescription>
                    Métricas detalladas de cada página
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar páginas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border rounded-md w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Página</th>
                      <th className="text-right p-2">Vistas</th>
                      <th className="text-right p-2">Visitantes únicos</th>
                      <th className="text-right p-2">Tiempo promedio</th>
                      <th className="text-right p-2">Tasa de rebote</th>
                      <th className="text-right p-2">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPages.map((page, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{page.title}</div>
                            <div className="text-sm text-gray-500">
                              {page.url}
                            </div>
                          </div>
                        </td>
                        <td className="text-right p-2">
                          {formatNumber(page.views)}
                        </td>
                        <td className="text-right p-2">
                          {formatNumber(page.uniqueVisitors)}
                        </td>
                        <td className="text-right p-2">
                          {formatDuration(page.avgTimeSpent)}
                        </td>
                        <td className="text-right p-2">
                          <Badge
                            variant={
                              page.bounceRate > 70 ? "destructive" : "secondary"
                            }
                          >
                            {page.bounceRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right p-2">
                          <Badge
                            variant={
                              page.engagementRate > 50 ? "default" : "secondary"
                            }
                          >
                            {page.engagementRate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de audiencia</CardTitle>
              <CardDescription>
                Distribución por dispositivos y comportamiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.devices}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="device" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Country Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Distribución por País
                </CardTitle>
                <CardDescription>
                  Visitantes por ubicación geográfica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.countries.map((countryData, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{countryData.countryCode}</span>
                        </div>
                        <div>
                          <p className="font-medium">{countryData.country}</p>
                          <p className="text-sm text-gray-500">
                            {formatDuration(countryData.avgSessionDuration)} promedio
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatNumber(countryData.visitors)}</p>
                        <p className="text-sm text-gray-500">{countryData.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Regional Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento Regional</CardTitle>
                <CardDescription>
                  Métricas de conversión por región
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current User Location Highlight */}
                  {isLatinAmerica && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Tu ubicación actual</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Detectado desde: {getCountryDisplayName(country, language)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Mostrando datos optimizados para Latinoamérica
                      </p>
                    </div>
                  )}

                  {/* Top Performing Countries */}
                  <div>
                    <h4 className="font-medium mb-3">Países con mejor conversión</h4>
                    {data.countries
                      .sort((a, b) => b.conversionRate - a.conversionRate)
                      .slice(0, 3)
                      .map((countryData, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm">{countryData.country}</span>
                          <Badge variant={countryData.conversionRate > 4 ? "default" : "secondary"}>
                            {countryData.conversionRate.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                  </div>

                  {/* Latin America Summary */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Resumen Latinoamérica</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• Total visitantes LATAM: {
                        data.countries
                          .filter(c => ['MX', 'CO', 'AR', 'CL', 'PE'].includes(c.countryCode))
                          .reduce((sum, c) => sum + c.visitors, 0)
                          .toLocaleString()
                      }</p>
                      <p>• Conversión promedio: {
                        (data.countries
                          .filter(c => ['MX', 'CO', 'AR', 'CL', 'PE'].includes(c.countryCode))
                          .reduce((sum, c) => sum + c.conversionRate, 0) / 5).toFixed(1)
                      }%</p>
                      <p>• Duración promedio: {
                        formatDuration(Math.round(
                          data.countries
                            .filter(c => ['MX', 'CO', 'AR', 'CL', 'PE'].includes(c.countryCode))
                            .reduce((sum, c) => sum + c.avgSessionDuration, 0) / 5
                        ))
                      }</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Country Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Visitantes por País</CardTitle>
              <CardDescription>
                Comparación de tráfico internacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.countries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="countryCode" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatNumber(value as number), 
                      name === 'visitors' ? 'Visitantes' : name
                    ]}
                    labelFormatter={(label) => {
                      const country = data.countries.find(c => c.countryCode === label);
                      return country ? country.country : label;
                    }}
                  />
                  <Bar dataKey="visitors" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
