'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'

interface InternalLink {
  position: number
  anchorText: string
  targetUrl: string
  targetTitle: string
}

interface ContentWithInternalLinksProps {
  content: string
  internalLinks: InternalLink[]
  className?: string
  linkClassName?: string
  enableTracking?: boolean
}

export default function ContentWithInternalLinks({
  content,
  internalLinks,
  className = '',
  linkClassName = 'text-blue-600 hover:text-blue-800 underline font-medium',
  enableTracking = true
}: ContentWithInternalLinksProps) {
  
  const processedContent = useMemo(() => {
    if (!content || internalLinks.length === 0) {
      return content
    }

    const words = content.split(/(\s+)/)
    const sortedLinks = [...internalLinks].sort((a, b) => b.position - a.position)
    
    let processedWords = [...words]

    for (const link of sortedLinks) {
      const { position, anchorText, targetUrl, targetTitle } = link
      
      // Find the best match for anchor text in the content
      const anchorWords = anchorText.toLowerCase().split(/\s+/)
      const searchText = anchorWords.join('\\s+')
      const regex = new RegExp(`\\b${searchText}\\b`, 'gi')
      
      // Convert words array back to text for regex matching
      const currentText = processedWords.join('')
      const match = currentText.match(regex)
      
      if (match) {
        const matchText = match[0]
        const matchIndex = currentText.toLowerCase().indexOf(matchText.toLowerCase())
        
        if (matchIndex !== -1) {
          // Split content at match position
          const beforeMatch = currentText.substring(0, matchIndex)
          const afterMatch = currentText.substring(matchIndex + matchText.length)
          
          // Create the link element
          const linkElement = `<a href="${targetUrl}" class="${linkClassName}" title="${targetTitle}" ${enableTracking ? `data-internal-link="${targetUrl}"` : ''}>${matchText}</a>`
          
          // Reconstruct the content
          const newContent = beforeMatch + linkElement + afterMatch
          processedWords = [newContent]
        }
      }
    }

    return processedWords.join('')
  }, [content, internalLinks, linkClassName, enableTracking])

  const handleLinkClick = (url: string) => {
    if (enableTracking && typeof window !== 'undefined') {
      // Track internal link clicks
      try {
        const w: any = window
        if (w.gtag) {
          w.gtag('event', 'internal_link_click', {
            link_url: url,
            link_text: 'internal_link'
          })
        }
        
        // Custom analytics event
        if (window.analytics) {
          window.analytics.track('Internal Link Clicked', {
            url: url,
            source: window.location.pathname
          })
        }
      } catch (error) {
        console.warn('Analytics tracking failed:', error)
      }
    }
  }

  // If we have processed HTML content, render it safely
  if (processedContent.includes('<a href=')) {
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: processedContent }}
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (target.tagName === 'A' && target.hasAttribute('data-internal-link')) {
            const url = target.getAttribute('data-internal-link')
            if (url) handleLinkClick(url)
          }
        }}
      />
    )
  }

  // Fallback to manual link insertion for complex cases
  return (
    <div className={className}>
      <ContentWithManualLinks 
        content={content}
        internalLinks={internalLinks}
        linkClassName={linkClassName}
        onLinkClick={handleLinkClick}
      />
    </div>
  )
}

// Component for manual link insertion when HTML parsing is not suitable
function ContentWithManualLinks({
  content,
  internalLinks,
  linkClassName,
  onLinkClick
}: {
  content: string
  internalLinks: InternalLink[]
  linkClassName: string
  onLinkClick: (url: string) => void
}) {
  const contentParts = useMemo(() => {
    if (!content || internalLinks.length === 0) {
      return [{ type: 'text', content }]
    }

    const parts: Array<{ type: 'text' | 'link', content: string, link?: InternalLink }> = []
    let currentIndex = 0
    
    // Sort links by position in content
    const sortedLinks = [...internalLinks].sort((a, b) => a.position - b.position)
    
    for (const link of sortedLinks) {
      const anchorText = link.anchorText.toLowerCase()
      const searchIndex = content.toLowerCase().indexOf(anchorText, currentIndex)
      
      if (searchIndex !== -1 && searchIndex >= currentIndex) {
        // Add text before the link
        if (searchIndex > currentIndex) {
          parts.push({
            type: 'text',
            content: content.substring(currentIndex, searchIndex)
          })
        }
        
        // Add the link
        parts.push({
          type: 'link',
          content: content.substring(searchIndex, searchIndex + anchorText.length),
          link
        })
        
        currentIndex = searchIndex + anchorText.length
      }
    }
    
    // Add remaining text
    if (currentIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(currentIndex)
      })
    }
    
    return parts
  }, [content, internalLinks])

  return (
    <>
      {contentParts.map((part, index) => {
        if (part.type === 'link' && part.link) {
          return (
            <Link
              key={index}
              href={part.link.targetUrl}
              className={linkClassName}
              title={part.link.targetTitle}
              onClick={() => onLinkClick(part.link!.targetUrl)}
            >
              {part.content}
            </Link>
          )
        }
        
        return (
          <span key={index}>
            {part.content.split('\n').map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </span>
        )
      })}
    </>
  )
}

// Hook for tracking internal link performance
export function useInternalLinkTracking() {
  const trackLinkClick = (linkUrl: string, sourcePageId: string) => {
    if (typeof window === 'undefined') return

    try {
      // Google Analytics 4
      const w: any = window
      if (w.gtag) {
        w.gtag('event', 'internal_link_click', {
          link_url: linkUrl,
          source_page: sourcePageId,
          event_category: 'Internal Navigation'
        })
      }

      // Custom analytics
      if (window.analytics) {
        window.analytics.track('Internal Link Clicked', {
          linkUrl,
          sourcePageId,
          timestamp: new Date().toISOString()
        })
      }

      // Store in localStorage for performance analysis
      const linkData = {
        url: linkUrl,
        source: sourcePageId,
        timestamp: Date.now()
      }

      const existingData = JSON.parse(localStorage.getItem('internal_link_clicks') || '[]')
      existingData.push(linkData)
      
      // Keep only last 100 clicks
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100)
      }
      
      localStorage.setItem('internal_link_clicks', JSON.stringify(existingData))
    } catch (error) {
      console.warn('Internal link tracking failed:', error)
    }
  }

  const getLinkPerformance = () => {
    if (typeof window === 'undefined') return []

    try {
      const data = JSON.parse(localStorage.getItem('internal_link_clicks') || '[]')
      
      // Aggregate by URL
      const performance = data.reduce((acc: any, click: any) => {
        if (!acc[click.url]) {
          acc[click.url] = {
            url: click.url,
            clicks: 0,
            sources: new Set(),
            lastClick: 0
          }
        }
        
        acc[click.url].clicks++
        acc[click.url].sources.add(click.source)
        acc[click.url].lastClick = Math.max(acc[click.url].lastClick, click.timestamp)
        
        return acc
      }, {})

      return Object.values(performance).map((item: any) => ({
        ...item,
        sources: Array.from(item.sources),
        lastClick: new Date(item.lastClick)
      }))
    } catch (error) {
      console.warn('Failed to get link performance:', error)
      return []
    }
  }

  return {
    trackLinkClick,
    getLinkPerformance
  }
}

// Declare global types for analytics
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties: any) => void
    }
  }
}
