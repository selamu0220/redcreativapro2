'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Download, TrendingUp, Target, Globe, BarChart3, Filter, RefreshCw } from 'lucide-react'
import { KeywordData, KeywordResearchRequest, KeywordResearchResponse } from '@/types/seo'
import { toast } from 'sonner'
import { createClientComponentClient } from '@/app/lib/supabase-client'

interface KeywordResearchToolProps {
  projectId: string
  onKeywordsUpdate?: (keywords: KeywordData[]) => void
}

export default function KeywordResearchTool({ projectId, onKeywordsUpdate }: KeywordResearchToolProps) {
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('United States')
  const [language, setLanguage] = useState('en')
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [sortBy, setSortBy] = useState<'volume' | 'difficulty' | 'cpc'>('volume')
  const [exporting, setExporting] = useState(false)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadExistingKeywords()
  }, [projectId])

  const loadExistingKeywords = async () => {
    try {
      const response = await fetch(`/api/seo/keywords/research?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setKeywords(data.keywords || [])
        onKeywordsUpdate?.(data.keywords || [])
      }
    } catch (error) {
      console.error('Error loading keywords:', error)
    }
  }

  const handleKeywordResearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setLoading(true)
    try {
      const request: KeywordResearchRequest = {
        keyword: searchTerm,
        location,
        language
      }

      const response = await fetch('/api/seo/keywords/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error('Failed to research keywords')
      }

      const data: KeywordResearchResponse = await response.json()
      setKeywords(prev => {
        const newKeywords = [...prev, ...(data.data || [])]
        const uniqueKeywords = newKeywords.filter((keyword, index, self) => 
          index === self.findIndex(k => k.keyword === keyword.keyword)
        )
        onKeywordsUpdate?.(uniqueKeywords)
        return uniqueKeywords
      })
      
      toast.success(`Found ${data.data?.length || 0} new keywords`)
    } catch (error) {
      console.error('Error researching keywords:', error)
      toast.error('Failed to research keywords')
    } finally {
      setLoading(false)
    }
  }

  const exportToGoogleSheets = async () => {
    if (keywords.length === 0) {
      toast.error('No keywords to export')
      return
    }

    setExporting(true)
    try {
      // Create CSV data
      const csvHeaders = ['Keyword', 'Search Volume', 'Difficulty', 'CPC', 'Competition', 'Trend', 'Intent']
      const csvData = keywords.map(k => [
        k.keyword,
        k.search_volume?.toString() || '0',
        k.difficulty?.toString() || '0',
        k.cpc?.toString() || '0',
        k.competition || 'Unknown',
        k.trend || 'Stable',
        k.intent || 'Unknown'
      ])

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `keywords_${projectId}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Keywords exported successfully')
    } catch (error) {
      console.error('Error exporting keywords:', error)
      toast.error('Failed to export keywords')
    } finally {
      setExporting(false)
    }
  }

  const filteredKeywords = keywords
    .filter(keyword => {
      if (filterDifficulty === 'all') return true
      const difficulty = keyword.difficulty || 0
      if (filterDifficulty === 'easy') return difficulty <= 30
      if (filterDifficulty === 'medium') return difficulty > 30 && difficulty <= 70
      if (filterDifficulty === 'hard') return difficulty > 70
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'volume') return (b.search_volume || 0) - (a.search_volume || 0)
      if (sortBy === 'difficulty') return (a.difficulty || 0) - (b.difficulty || 0)
      if (sortBy === 'cpc') return (b.cpc || 0) - (a.cpc || 0)
      return 0
    })

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-500'
    if (difficulty <= 30) return 'bg-green-500'
    if (difficulty <= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getIntentColor = (intent?: string) => {
    switch (intent?.toLowerCase()) {
      case 'commercial': return 'bg-blue-500'
      case 'informational': return 'bg-green-500'
      case 'navigational': return 'bg-purple-500'
      case 'transactional': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Research Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Keyword Research
          </CardTitle>
          <CardDescription>
            Discover high-value keywords for your SEO strategy using DataForSEO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Term</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter keyword or phrase"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleKeywordResearch()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Spain">Spain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleKeywordResearch} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? 'Researching...' : 'Research Keywords'}
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToGoogleSheets}
              disabled={exporting || keywords.length === 0}
              className="flex items-center gap-2"
            >
              {exporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Stats */}
      {keywords.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Difficulty:</span>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value as any)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="all">All</option>
                    <option value="easy">Easy (≤30)</option>
                    <option value="medium">Medium (31-70)</option>
                    <option value="hard">Hard (&gt;70)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="volume">Search Volume</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="cpc">CPC</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Total: {keywords.length}</span>
                <span>Filtered: {filteredKeywords.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keywords List */}
      {filteredKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Keywords ({filteredKeywords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredKeywords.map((keyword, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{keyword.keyword}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            {keyword.search_volume?.toLocaleString() || 'N/A'} searches/month
                          </span>
                        </div>
                        <Badge 
                          className={`${getDifficultyColor(keyword.difficulty)} text-white`}
                        >
                          Difficulty: {keyword.difficulty || 'N/A'}
                        </Badge>
                        {keyword.cpc && (
                          <span className="text-sm text-green-600 font-medium">
                            ${keyword.cpc.toFixed(2)} CPC
                          </span>
                        )}
                        {keyword.intent && (
                          <Badge className={`${getIntentColor(keyword.intent)} text-white`}>
                            {keyword.intent}
                          </Badge>
                        )}
                      </div>
                      {keyword.related_keywords && keyword.related_keywords.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Related: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {keyword.related_keywords.slice(0, 5).map((related, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {related}
                                </Badge>
                              ))}
                              {keyword.related_keywords.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{keyword.related_keywords.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                      {keyword.trend && (
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className={`h-4 w-4 ${
                            keyword.trend === 'up' ? 'text-green-500' :
                            keyword.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                          }`} />
                          <span className="text-gray-600">{keyword.trend}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {keywords.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No keywords yet</h3>
            <p className="text-gray-600 mb-4">
              Start by researching keywords for your SEO strategy
            </p>
            <Button onClick={() => setSearchTerm('your business')} variant="outline">
              Try a sample search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
