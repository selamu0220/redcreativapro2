'use client'

import { useState, useEffect } from 'react'
import { Eye, Search, Share2, Smartphone, Globe, Copy, Check } from 'lucide-react'

interface MetaData {
  title: string
  description: string
  keywords: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical?: string
}

interface MetaOptimizerProps {
  initialData?: Partial<MetaData>
  onSave?: (data: MetaData) => void
  targetKeywords?: string[]
}

export default function MetaOptimizer({ 
  initialData = {}, 
  onSave,
  targetKeywords = []
}: MetaOptimizerProps) {
  const [metaData, setMetaData] = useState<MetaData>({
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonical: '',
    ...initialData
  })

  const [previewMode, setPreviewMode] = useState<'google' | 'facebook' | 'twitter'>('google')
  const [copied, setCopied] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Generate AI-powered suggestions based on target keywords
    if (targetKeywords.length > 0) {
      generateSuggestions()
    }
  }, [targetKeywords])

  const generateSuggestions = () => {
    const titleSuggestions = [
      `${targetKeywords[0]} - Professional Services & Solutions`,
      `Best ${targetKeywords[0]} Services | Expert Solutions`,
      `${targetKeywords[0]} Guide: Tips, Tools & Best Practices`,
      `Professional ${targetKeywords[0]} - Get Results Fast`,
      `${targetKeywords[0]} Solutions | Trusted by Thousands`
    ]
    setSuggestions(titleSuggestions)
  }

  const handleInputChange = (field: keyof MetaData, value: string) => {
    setMetaData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    onSave?.(metaData)
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const applySuggestion = (suggestion: string) => {
    setMetaData(prev => ({
      ...prev,
      title: suggestion,
      ogTitle: suggestion,
      twitterTitle: suggestion
    }))
  }

  const getCharacterCount = (text: string, limit: number) => {
    const count = text.length
    const isOverLimit = count > limit
    return {
      count,
      isOverLimit,
      className: isOverLimit ? 'text-red-500' : count > limit * 0.8 ? 'text-yellow-500' : 'text-green-500'
    }
  }

  const renderGooglePreview = () => (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="text-xs text-gray-600 mb-1">
        {metaData.canonical || 'https://example.com'}
      </div>
      <div className="text-blue-600 text-lg hover:underline cursor-pointer mb-1">
        {metaData.title || 'Page Title'}
      </div>
      <div className="text-gray-600 text-sm">
        {metaData.description || 'Meta description will appear here...'}
      </div>
    </div>
  )

  const renderFacebookPreview = () => (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white max-w-md">
      {metaData.ogImage && (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <img 
            src={metaData.ogImage} 
            alt="OG Preview" 
            className="max-h-full max-w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}
      <div className="p-3">
        <div className="text-xs text-gray-500 uppercase mb-1">
          {metaData.canonical ? new URL(metaData.canonical).hostname : 'example.com'}
        </div>
        <div className="font-semibold text-gray-900 mb-1">
          {metaData.ogTitle || metaData.title || 'Page Title'}
        </div>
        <div className="text-gray-600 text-sm">
          {metaData.ogDescription || metaData.description || 'Description will appear here...'}
        </div>
      </div>
    </div>
  )

  const renderTwitterPreview = () => (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white max-w-md">
      {metaData.twitterImage && (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <img 
            src={metaData.twitterImage} 
            alt="Twitter Preview" 
            className="max-h-full max-w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}
      <div className="p-3">
        <div className="font-semibold text-gray-900 mb-1">
          {metaData.twitterTitle || metaData.title || 'Page Title'}
        </div>
        <div className="text-gray-600 text-sm mb-2">
          {metaData.twitterDescription || metaData.description || 'Description will appear here...'}
        </div>
        <div className="text-xs text-gray-500">
          {metaData.canonical ? new URL(metaData.canonical).hostname : 'example.com'}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Meta Tags Optimizer
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Optimize your page metadata for search engines and social media
        </p>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            AI-Generated Title Suggestions
          </h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => applySuggestion(suggestion)}
                className="block w-full text-left p-2 text-sm bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Basic Meta Tags */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Basic Meta Tags</h4>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title Tag *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={metaData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter page title..."
                />
                <button
                  onClick={() => copyToClipboard(metaData.title, 'title')}
                  className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {copied === 'title' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Recommended: 50-60 characters</span>
                <span className={getCharacterCount(metaData.title, 60).className}>
                  {getCharacterCount(metaData.title, 60).count}/60
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meta Description *
              </label>
              <div className="relative">
                <textarea
                  value={metaData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter meta description..."
                />
                <button
                  onClick={() => copyToClipboard(metaData.description, 'description')}
                  className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {copied === 'description' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Recommended: 150-160 characters</span>
                <span className={getCharacterCount(metaData.description, 160).className}>
                  {getCharacterCount(metaData.description, 160).count}/160
                </span>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                value={metaData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="keyword1, keyword2, keyword3..."
              />
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Canonical URL
              </label>
              <input
                type="url"
                value={metaData.canonical}
                onChange={(e) => handleInputChange('canonical', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://example.com/page"
              />
            </div>
          </div>

          {/* Open Graph Tags */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Open Graph (Facebook)</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                OG Title
              </label>
              <input
                type="text"
                value={metaData.ogTitle}
                onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Leave empty to use main title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                OG Description
              </label>
              <textarea
                value={metaData.ogDescription}
                onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Leave empty to use main description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                OG Image URL
              </label>
              <input
                type="url"
                value={metaData.ogImage}
                onChange={(e) => handleInputChange('ogImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Twitter Cards */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Twitter Cards</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter Title
              </label>
              <input
                type="text"
                value={metaData.twitterTitle}
                onChange={(e) => handleInputChange('twitterTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Leave empty to use main title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter Description
              </label>
              <textarea
                value={metaData.twitterDescription}
                onChange={(e) => handleInputChange('twitterDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Leave empty to use main description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter Image URL
              </label>
              <input
                type="url"
                value={metaData.twitterImage}
                onChange={(e) => handleInputChange('twitterImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save Meta Tags
          </button>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Preview</h4>
            
            {/* Preview Mode Selector */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setPreviewMode('google')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  previewMode === 'google'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Google</span>
              </button>
              
              <button
                onClick={() => setPreviewMode('facebook')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  previewMode === 'facebook'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Facebook</span>
              </button>
              
              <button
                onClick={() => setPreviewMode('twitter')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  previewMode === 'twitter'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Twitter</span>
              </button>
            </div>

            {/* Preview Content */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {previewMode === 'google' && renderGooglePreview()}
              {previewMode === 'facebook' && renderFacebookPreview()}
              {previewMode === 'twitter' && renderTwitterPreview()}
            </div>
          </div>

          {/* Generated HTML */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Generated HTML</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              <div className="space-y-1">
                {metaData.title && (
                  <div>&lt;title&gt;{metaData.title}&lt;/title&gt;</div>
                )}
                {metaData.description && (
                  <div>&lt;meta name="description" content="{metaData.description}" /&gt;</div>
                )}
                {metaData.keywords && (
                  <div>&lt;meta name="keywords" content="{metaData.keywords}" /&gt;</div>
                )}
                {metaData.canonical && (
                  <div>&lt;link rel="canonical" href="{metaData.canonical}" /&gt;</div>
                )}
                {(metaData.ogTitle || metaData.title) && (
                  <div>&lt;meta property="og:title" content="{metaData.ogTitle || metaData.title}" /&gt;</div>
                )}
                {(metaData.ogDescription || metaData.description) && (
                  <div>&lt;meta property="og:description" content="{metaData.ogDescription || metaData.description}" /&gt;</div>
                )}
                {metaData.ogImage && (
                  <div>&lt;meta property="og:image" content="{metaData.ogImage}" /&gt;</div>
                )}
                {(metaData.twitterTitle || metaData.title) && (
                  <div>&lt;meta name="twitter:title" content="{metaData.twitterTitle || metaData.title}" /&gt;</div>
                )}
                {(metaData.twitterDescription || metaData.description) && (
                  <div>&lt;meta name="twitter:description" content="{metaData.twitterDescription || metaData.description}" /&gt;</div>
                )}
                {metaData.twitterImage && (
                  <div>&lt;meta name="twitter:image" content="{metaData.twitterImage}" /&gt;</div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => copyToClipboard(
                [
                  metaData.title && `<title>${metaData.title}</title>`,
                  metaData.description && `<meta name="description" content="${metaData.description}" />`,
                  metaData.keywords && `<meta name="keywords" content="${metaData.keywords}" />`,
                  metaData.canonical && `<link rel="canonical" href="${metaData.canonical}" />`,
                  (metaData.ogTitle || metaData.title) && `<meta property="og:title" content="${metaData.ogTitle || metaData.title}" />`,
                  (metaData.ogDescription || metaData.description) && `<meta property="og:description" content="${metaData.ogDescription || metaData.description}" />`,
                  metaData.ogImage && `<meta property="og:image" content="${metaData.ogImage}" />`,
                  (metaData.twitterTitle || metaData.title) && `<meta name="twitter:title" content="${metaData.twitterTitle || metaData.title}" />`,
                  (metaData.twitterDescription || metaData.description) && `<meta name="twitter:description" content="${metaData.twitterDescription || metaData.description}" />`,
                  metaData.twitterImage && `<meta name="twitter:image" content="${metaData.twitterImage}" />`
                ].filter(Boolean).join('\n'),
                'html'
              )}
              className="mt-2 flex items-center space-x-2 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              {copied === 'html' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>Copy HTML</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
