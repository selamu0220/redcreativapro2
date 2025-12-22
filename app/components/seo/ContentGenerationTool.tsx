'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PenTool, 
  Wand2, 
  Copy, 
  Download, 
  RefreshCw, 
  FileText, 
  Target, 
  Globe,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { ContentGenerationRequest, ContentGenerationResponse, GeneratedContent } from '@/types/seo'
import { toast } from 'sonner'

interface ContentGenerationToolProps {
  projectId: string
  keywords?: string[]
  onContentGenerated?: (content: GeneratedContent) => void
}

export default function ContentGenerationTool({ 
  projectId, 
  keywords = [], 
  onContentGenerated 
}: ContentGenerationToolProps) {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [loading, setLoading] = useState(false)
  const [contentType, setContentType] = useState<'blog_post' | 'product_description' | 'meta_description' | 'landing_page'>('blog_post')
  const [targetKeyword, setTargetKeyword] = useState('')
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'authoritative'>('professional')
  const [wordCount, setWordCount] = useState(800)
  const [audience, setAudience] = useState('')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadExistingContent()
  }, [projectId])

  useEffect(() => {
    if (keywords.length > 0 && !targetKeyword) {
      setTargetKeyword(keywords[0])
    }
  }, [keywords])

  const loadExistingContent = async () => {
    try {
      const response = await fetch(`/api/seo/content/generate?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setGeneratedContent(data.content || [])
      }
    } catch (error) {
      console.error('Error loading content:', error)
    }
  }

  const handleContentGeneration = async () => {
    if (!targetKeyword.trim()) {
      toast.error('Please enter a target keyword')
      return
    }

    setLoading(true)
    try {
      const request: ContentGenerationRequest = {
        project_id: projectId,
        content_type: contentType,
        target_keyword: targetKeyword,
        tone,
        word_count: wordCount,
        audience: audience || undefined,
        additional_instructions: additionalInstructions || undefined
      }

      const response = await fetch('/api/seo/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data: ContentGenerationResponse = await response.json()
      const newContent = data.data!
      
      setGeneratedContent(prev => [newContent, ...prev])
      setSelectedContent(newContent)
      onContentGenerated?.(newContent)
      
      toast.success('Content generated successfully!')
    } catch (error) {
      console.error('Error generating content:', error)
      toast.error('Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Content copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy content')
    }
  }

  const downloadContent = (content: GeneratedContent) => {
    const blob = new Blob([content.content], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Content downloaded!')
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'blog_post': return 'Blog Post'
      case 'product_description': return 'Product Description'
      case 'meta_description': return 'Meta Description'
      case 'landing_page': return 'Landing Page'
      default: return type
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'blog_post': return <FileText className="h-4 w-4" />
      case 'product_description': return <Target className="h-4 w-4" />
      case 'meta_description': return <Globe className="h-4 w-4" />
      case 'landing_page': return <BarChart3 className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getSeoScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Content Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Content Generation
          </CardTitle>
          <CardDescription>
            Generate SEO-optimized content using AI with your target keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="blog_post">Blog Post</option>
                <option value="product_description">Product Description</option>
                <option value="meta_description">Meta Description</option>
                <option value="landing_page">Landing Page</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Keyword</label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="Enter primary keyword"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {keywords.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-600">Suggested: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {keywords.slice(0, 5).map((keyword, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-blue-50"
                        onClick={() => setTargetKeyword(keyword)}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Word Count</label>
              <input
                type="number"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value) || 800)}
                min="100"
                max="3000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Target Audience (Optional)</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., Small business owners, Marketing professionals"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Additional Instructions (Optional)</label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="Any specific requirements or style preferences..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button 
            onClick={handleContentGeneration} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? 'Generating...' : 'Generate Content'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content List */}
      {generatedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Generated Content ({generatedContent.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedContent.map((content, index) => (
                <div key={content.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getContentTypeIcon(content.content_type)}
                        <h3 className="font-medium text-lg">{content.title}</h3>
                        <Badge variant="outline">
                          {getContentTypeLabel(content.content_type)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>Target: <strong>{content.target_keyword}</strong></span>
                        <span>Words: {content.word_count}</span>
                        <span>Tone: {content.tone}</span>
                        {content.seo_analysis && (
                          <span className={`font-medium ${getSeoScoreColor(content.seo_analysis.readability_score)}`}>
                            SEO Score: {content.seo_analysis.readability_score}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(content.content)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadContent(content)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <div className="text-sm text-gray-700 line-clamp-4">
                      {content.content.substring(0, 300)}
                      {content.content.length > 300 && '...'}
                    </div>
                  </div>

                  {/* SEO Analysis */}
                  {content.seo_analysis && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">SEO Analysis:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          {content.seo_analysis.keyword_density && content.seo_analysis.keyword_density > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Keyword Density: {content.seo_analysis.keyword_density?.toFixed(1) || 'N/A'}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {content.seo_analysis.readability_score && content.seo_analysis.readability_score > 60 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Readability: {content.seo_analysis.readability_score || 'N/A'}/100</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {content.seo_analysis.heading_structure ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Heading Structure: {content.seo_analysis.heading_structure ? 'Good' : 'Needs Work'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Related Keywords */}
                  {content.related_keywords && content.related_keywords.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium">Related Keywords: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {content.related_keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-3">
                    Generated on {new Date(content.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {generatedContent.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content generated yet</h3>
            <p className="text-gray-600 mb-4">
              Use AI to create SEO-optimized content for your target keywords
            </p>
            <Button 
              onClick={() => setTargetKeyword('your business')} 
              variant="outline"
            >
              Try generating content
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
