'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Target,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Globe,
  Search,
  Users,
  Clock
} from 'lucide-react'
import { AnalyticsData, TrafficData, RankingData } from '@/types/seo'
import { ConversionData } from '@/app/types/seo'
import { toast } from 'sonner'

interface AnalyticsDashboardProps {
  projectId: string
}

export default function AnalyticsDashboard({ projectId }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'traffic' | 'rankings' | 'conversions'>('traffic')
  const [refreshing, setRefreshing] = useState(false)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadAnalyticsData()
  }, [projectId, dateRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      const params = new URLSearchParams({
        projectId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      const response = await fetch(`/api/seo/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        throw new Error('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadAnalyticsData()
    setRefreshing(false)
    toast.success('Analytics data refreshed')
  }

  const exportData = () => {
    if (!analyticsData) return

    const csvData = []
    
    // Add traffic data
    if (analyticsData.traffic) {
      csvData.push(['Traffic Data'])
      csvData.push(['Date', 'Sessions', 'Users', 'Page Views', 'Bounce Rate', 'Avg Session Duration'])
      analyticsData.traffic.forEach(day => {
        csvData.push([
          day.date,
          day.sessions?.toString() || '0',
          day.users?.toString() || '0',
          day.pageviews?.toString() || '0',
          day.bounce_rate?.toString() || '0',
          day.avg_session_duration?.toString() || '0'
        ])
      })
      csvData.push([]) // Empty row
    }

    // Add ranking data
    if (analyticsData.rankings) {
      csvData.push(['Ranking Data'])
      csvData.push(['Keyword', 'Position', 'Previous Position', 'Change', 'Search Volume'])
      analyticsData.rankings.forEach(keyword => {
        csvData.push([
          keyword.keyword,
          keyword.position?.toString() || '0',
          keyword.previous_position?.toString() || '0',
          keyword.change?.toString() || '0',
          keyword.search_volume?.toString() || '0'
        ])
      })
    }

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics_${projectId}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Analytics data exported')
  }

  const formatNumber = (num?: number) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatPercentage = (num?: number) => {
    if (!num) return '0%'
    return `${num.toFixed(1)}%`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getChangeIcon = (change?: number) => {
    if (!change) return null
    return change > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500'
    return change > 0 ? 'text-green-500' : 'text-red-500'
  }

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Period:</span>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">View:</span>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="traffic">Traffic</option>
                  <option value="rankings">Rankings</option>
                  <option value="conversions">Conversions</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportData}
                disabled={!analyticsData}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Traffic Overview */}
          {analyticsData.traffic && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sessions</p>
                      <p className="text-2xl font-bold">{formatNumber(analyticsData.traffic.reduce((sum, day) => sum + day.sessions, 0))}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Users</p>
                      <p className="text-2xl font-bold">{formatNumber(analyticsData.traffic.reduce((sum, day) => sum + day.users, 0))}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                      <p className="text-2xl font-bold">{formatPercentage(analyticsData.traffic.reduce((sum, day) => sum + day.bounce_rate, 0) / analyticsData.traffic.length)}</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                      <p className="text-2xl font-bold">{formatDuration(analyticsData.traffic.reduce((sum, day) => sum + day.avg_session_duration, 0) / analyticsData.traffic.length)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Detailed Analytics */}
      {analyticsData && selectedMetric === 'traffic' && analyticsData.traffic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Traffic Analytics
            </CardTitle>
            <CardDescription>
              Detailed traffic metrics from Google Analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-medium">Traffic Data</h4>
              <div className="space-y-2">
                {analyticsData.traffic.slice(0, 10).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{day.date}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{formatNumber(day.sessions)} sessions</span>
                      <span>{formatNumber(day.users)} users</span>
                      <span>{formatPercentage(day.bounce_rate)} bounce</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analyticsData && selectedMetric === 'rankings' && analyticsData.rankings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Rankings
            </CardTitle>
            <CardDescription>
              Keyword rankings from Google Search Console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {analyticsData.rankings.slice(0, 15).map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{keyword.keyword}</p>
                      <p className="text-xs text-gray-600">{keyword.url}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                       <div className="text-center">
                         <p className="font-medium">#{keyword.position}</p>
                         <p className="text-xs text-gray-600">Position</p>
                       </div>
                       <div className="text-center">
                         <p className="font-medium">{formatNumber(keyword.search_volume)}</p>
                         <p className="text-xs text-gray-600">Search Volume</p>
                       </div>
                       <div className="text-center">
                         <p className="font-medium">{keyword.previous_position || 'N/A'}</p>
                         <p className="text-xs text-gray-600">Previous Position</p>
                       </div>
                       <div className="text-center">
                         <p className={`font-medium ${keyword.change === 'up' ? 'text-green-600' : keyword.change === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                           {keyword.change}
                         </p>
                         <p className="text-xs text-gray-600">Change</p>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analyticsData && selectedMetric === 'conversions' && analyticsData.conversions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conversion Analytics
            </CardTitle>
            <CardDescription>
              Goal completions and conversion tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(analyticsData.conversions.reduce((sum, day) => sum + day.conversions, 0))}
                </p>
                <p className="text-sm text-gray-600">Total Conversions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatPercentage(analyticsData.conversions.reduce((sum, day) => sum + day.conversion_rate, 0) / analyticsData.conversions.length)}
                </p>
                <p className="text-sm text-gray-600">Average Conversion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ${analyticsData.conversions.reduce((sum, day) => sum + (day.revenue || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Daily Conversion Data</h4>
              <div className="space-y-2">
                {analyticsData.conversions.slice(0, 10).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{day.date}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{formatNumber(day.conversions)}</p>
                        <p className="text-xs text-gray-600">Conversions</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{formatPercentage(day.conversion_rate)}</p>
                        <p className="text-xs text-gray-600">Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">${day.revenue?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!analyticsData && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
            <p className="text-gray-600 mb-4">
              Connect your Google Analytics and Search Console to view detailed metrics
            </p>
            <Button onClick={loadAnalyticsData} variant="outline">
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
