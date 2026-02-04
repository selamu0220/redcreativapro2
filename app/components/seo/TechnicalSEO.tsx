'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'

interface SEOCheck {
  id: string
  name: string
  description: string
  status: 'pass' | 'fail' | 'warning' | 'loading'
  value?: string | number
  recommendation?: string
  priority: 'high' | 'medium' | 'low'
}

interface TechnicalSEOProps {
  url?: string
  onAuditComplete?: (results: SEOCheck[]) => void
}

export default function TechnicalSEO({ url, onAuditComplete }: TechnicalSEOProps) {
  const [checks, setChecks] = useState<SEOCheck[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallScore, setOverallScore] = useState(0)

  const initialChecks: SEOCheck[] = [
    {
      id: 'title-tag',
      name: 'Title Tag',
      description: 'Page has a unique, descriptive title tag',
      status: 'loading',
      priority: 'high'
    },
    {
      id: 'meta-description',
      name: 'Meta Description',
      description: 'Page has a compelling meta description',
      status: 'loading',
      priority: 'high'
    },
    {
      id: 'heading-structure',
      name: 'Heading Structure',
      description: 'Proper H1-H6 heading hierarchy',
      status: 'loading',
      priority: 'high'
    },
    {
      id: 'canonical-url',
      name: 'Canonical URL',
      description: 'Page has a canonical URL specified',
      status: 'loading',
      priority: 'medium'
    },
    {
      id: 'robots-meta',
      name: 'Robots Meta Tag',
      description: 'Robots meta tag is properly configured',
      status: 'loading',
      priority: 'medium'
    },
    {
      id: 'open-graph',
      name: 'Open Graph Tags',
      description: 'Social media sharing tags are present',
      status: 'loading',
      priority: 'medium'
    },
    {
      id: 'twitter-cards',
      name: 'Twitter Cards',
      description: 'Twitter card meta tags are configured',
      status: 'loading',
      priority: 'medium'
    },
    {
      id: 'schema-markup',
      name: 'Schema Markup',
      description: 'Structured data is implemented',
      status: 'loading',
      priority: 'medium'
    },
    {
      id: 'image-alt-tags',
      name: 'Image Alt Tags',
      description: 'All images have descriptive alt attributes',
      status: 'loading',
      priority: 'medium'
    },
    {
      id: 'internal-links',
      name: 'Internal Links',
      description: 'Page has appropriate internal linking',
      status: 'loading',
      priority: 'low'
    },
    {
      id: 'page-speed',
      name: 'Page Speed',
      description: 'Page loads quickly (< 3 seconds)',
      status: 'loading',
      priority: 'high'
    },
    {
      id: 'mobile-friendly',
      name: 'Mobile Friendly',
      description: 'Page is optimized for mobile devices',
      status: 'loading',
      priority: 'high'
    }
  ]

  useEffect(() => {
    if (url) {
      runSEOAudit(url)
    } else {
      // Run audit on current page
      runSEOAudit(window.location.href)
    }
  }, [url])

  const runSEOAudit = async (targetUrl: string) => {
    setIsRunning(true)
    setChecks(initialChecks)

    // Simulate audit process with delays
    const updatedChecks = [...initialChecks]

    for (let i = 0; i < updatedChecks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate processing time
      
      const check = updatedChecks[i]
      const result = await performSEOCheck(check.id, targetUrl)
      
      updatedChecks[i] = { ...check, ...result }
      setChecks([...updatedChecks])
    }

    // Calculate overall score
    const passedChecks = updatedChecks.filter(check => check.status === 'pass').length
    const totalChecks = updatedChecks.length
    const score = Math.round((passedChecks / totalChecks) * 100)
    setOverallScore(score)

    setIsRunning(false)
    onAuditComplete?.(updatedChecks)
  }

  const performSEOCheck = async (checkId: string, targetUrl: string): Promise<Partial<SEOCheck>> => {
    // In a real implementation, these would make actual HTTP requests or use APIs
    // For demo purposes, we'll simulate the checks
    
    switch (checkId) {
      case 'title-tag':
        const titleElement = document.querySelector('title')
        const title = titleElement?.textContent || ''
        return {
          status: title.length > 0 && title.length <= 60 ? 'pass' : 'fail',
          value: title.length,
          recommendation: title.length === 0 ? 'Add a title tag' : 
                        title.length > 60 ? 'Shorten title to under 60 characters' : undefined
        }

      case 'meta-description':
        const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
        return {
          status: metaDesc.length > 0 && metaDesc.length <= 160 ? 'pass' : 'fail',
          value: metaDesc.length,
          recommendation: metaDesc.length === 0 ? 'Add a meta description' :
                        metaDesc.length > 160 ? 'Shorten meta description to under 160 characters' : undefined
        }

      case 'heading-structure':
        const h1Elements = document.querySelectorAll('h1')
        return {
          status: h1Elements.length === 1 ? 'pass' : h1Elements.length === 0 ? 'fail' : 'warning',
          value: h1Elements.length,
          recommendation: h1Elements.length === 0 ? 'Add an H1 tag' :
                        h1Elements.length > 1 ? 'Use only one H1 tag per page' : undefined
        }

      case 'canonical-url':
        const canonical = document.querySelector('link[rel="canonical"]')
        return {
          status: canonical ? 'pass' : 'warning',
          value: canonical?.getAttribute('href') || 'Not set',
          recommendation: !canonical ? 'Add a canonical URL to prevent duplicate content issues' : undefined
        }

      case 'robots-meta':
        const robotsMeta = document.querySelector('meta[name="robots"]')
        return {
          status: robotsMeta ? 'pass' : 'warning',
          value: robotsMeta?.getAttribute('content') || 'Not set',
          recommendation: !robotsMeta ? 'Add robots meta tag to control indexing' : undefined
        }

      case 'open-graph':
        const ogTitle = document.querySelector('meta[property="og:title"]')
        const ogDescription = document.querySelector('meta[property="og:description"]')
        const ogImage = document.querySelector('meta[property="og:image"]')
        const hasOG = ogTitle && ogDescription && ogImage
        return {
          status: hasOG ? 'pass' : 'warning',
          recommendation: !hasOG ? 'Add Open Graph tags for better social media sharing' : undefined
        }

      case 'twitter-cards':
        const twitterCard = document.querySelector('meta[name="twitter:card"]')
        return {
          status: twitterCard ? 'pass' : 'warning',
          recommendation: !twitterCard ? 'Add Twitter Card meta tags' : undefined
        }

      case 'schema-markup':
        const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]')
        return {
          status: schemaScripts.length > 0 ? 'pass' : 'warning',
          value: schemaScripts.length,
          recommendation: schemaScripts.length === 0 ? 'Add structured data markup' : undefined
        }

      case 'image-alt-tags':
        const images = document.querySelectorAll('img')
        const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt'))
        const percentage = images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 100) : 100
        return {
          status: percentage >= 90 ? 'pass' : percentage >= 70 ? 'warning' : 'fail',
          value: `${percentage}%`,
          recommendation: percentage < 90 ? 'Add alt attributes to all images' : undefined
        }

      case 'internal-links':
        const internalLinks = document.querySelectorAll('a[href^="/"], a[href*="' + window.location.hostname + '"]')
        return {
          status: internalLinks.length >= 3 ? 'pass' : 'warning',
          value: internalLinks.length,
          recommendation: internalLinks.length < 3 ? 'Add more internal links to improve site navigation' : undefined
        }

      case 'page-speed':
        // Simulate page speed check
        const loadTime = Math.random() * 5 + 1 // Random between 1-6 seconds
        return {
          status: loadTime < 3 ? 'pass' : loadTime < 5 ? 'warning' : 'fail',
          value: `${loadTime.toFixed(1)}s`,
          recommendation: loadTime >= 3 ? 'Optimize images and reduce JavaScript to improve page speed' : undefined
        }

      case 'mobile-friendly':
        const viewport = document.querySelector('meta[name="viewport"]')
        return {
          status: viewport ? 'pass' : 'fail',
          recommendation: !viewport ? 'Add viewport meta tag for mobile optimization' : undefined
        }

      default:
        return { status: 'warning' }
    }
  }

  const getStatusIcon = (status: SEOCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'loading':
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  const sortedChecks = [...checks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Technical SEO Audit
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive analysis of on-page SEO factors
          </p>
        </div>
        
        {!isRunning && overallScore > 0 && (
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              SEO Score
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(checks.filter(c => c.status !== 'loading').length / checks.length) * 100}%` 
            }}
          />
        </div>
      )}

      {/* SEO Checks */}
      <div className="space-y-3">
        {sortedChecks.map((check) => (
          <div
            key={check.id}
            className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(check.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {check.name}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    check.priority === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : check.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {check.priority}
                  </span>
                  {check.value && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {check.value}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {check.description}
              </p>
              
              {check.recommendation && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Recommendation:</strong> {check.recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {!isRunning && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => runSEOAudit(url || window.location.href)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Run Audit Again
          </button>
          
          <a
            href="https://developers.google.com/speed/pagespeed/insights/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>PageSpeed Insights</span>
          </a>
        </div>
      )}
    </div>
  )
}
