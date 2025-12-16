/**
 * Content Quality Validator
 * Validates blog content quality and provides optimization suggestions
 */

export interface ContentQualityMetrics {
  readabilityScore: number
  seoScore: number
  accessibilityScore: number
  performanceScore: number
  overallScore: number
  wordCount: number
  readingTime: number
  issues: ContentIssue[]
  suggestions: ContentSuggestion[]
  lastChecked: Date
}

export interface ContentIssue {
  type: 'readability' | 'seo' | 'accessibility' | 'performance' | 'formatting'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  location?: string
  suggestion?: string
}

export interface ContentSuggestion {
  type: 'improvement' | 'optimization' | 'enhancement'
  category: 'readability' | 'seo' | 'accessibility' | 'performance'
  message: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
}

export interface ValidationConfig {
  minWordCount: number
  maxWordCount: number
  minReadabilityScore: number
  minSeoScore: number
  minAccessibilityScore: number
  checkImages: boolean
  checkLinks: boolean
  checkHeadings: boolean
  checkMetadata: boolean
}

export class ContentValidator {
  private config: ValidationConfig

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      minWordCount: 300,
      maxWordCount: 5000,
      minReadabilityScore: 60,
      minSeoScore: 70,
      minAccessibilityScore: 80,
      checkImages: true,
      checkLinks: true,
      checkHeadings: true,
      checkMetadata: true,
      ...config
    }
  }

  /**
   * Validate content quality
   */
  async validateContent(content: string, metadata?: any): Promise<ContentQualityMetrics> {
    const issues: ContentIssue[] = []
    const suggestions: ContentSuggestion[] = []

    // Basic metrics
    const wordCount = this.getWordCount(content)
    const readingTime = this.calculateReadingTime(wordCount)

    // Individual scores
    const readabilityScore = this.calculateReadabilityScore(content, issues, suggestions)
    const seoScore = this.calculateSeoScore(content, metadata, issues, suggestions)
    const accessibilityScore = this.calculateAccessibilityScore(content, issues, suggestions)
    const performanceScore = this.calculatePerformanceScore(content, issues, suggestions)

    // Overall score (weighted average)
    const overallScore = Math.round(
      (readabilityScore * 0.25 + 
       seoScore * 0.35 + 
       accessibilityScore * 0.25 + 
       performanceScore * 0.15) * 100
    ) / 100

    return {
      readabilityScore,
      seoScore,
      accessibilityScore,
      performanceScore,
      overallScore,
      wordCount,
      readingTime,
      issues,
      suggestions,
      lastChecked: new Date()
    }
  }

  /**
   * Calculate word count
   */
  private getWordCount(content: string): number {
    // Remove HTML tags and count words
    const textContent = content.replace(/<[^>]*>/g, ' ')
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0)
    return words.length
  }

  /**
   * Calculate reading time (average 200 words per minute)
   */
  private calculateReadingTime(wordCount: number): number {
    return Math.ceil(wordCount / 200)
  }

  /**
   * Calculate readability score
   */
  private calculateReadabilityScore(
    content: string, 
    issues: ContentIssue[], 
    suggestions: ContentSuggestion[]
  ): number {
    let score = 100
    const textContent = content.replace(/<[^>]*>/g, ' ')
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0)
    
    if (sentences.length === 0 || words.length === 0) {
      issues.push({
        type: 'readability',
        severity: 'critical',
        message: 'Content appears to be empty or invalid',
        suggestion: 'Add meaningful content with proper sentences'
      })
      return 0
    }

    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = this.estimateAvgSyllables(words)

    // Flesch Reading Ease approximation
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    
    // Convert to 0-100 scale
    score = Math.max(0, Math.min(100, fleschScore))

    // Check for readability issues
    if (avgWordsPerSentence > 20) {
      issues.push({
        type: 'readability',
        severity: 'medium',
        message: `Average sentence length (${Math.round(avgWordsPerSentence)} words) is too long`,
        suggestion: 'Break long sentences into shorter ones (aim for 15-20 words per sentence)'
      })
      score -= 10
    }

    if (score < this.config.minReadabilityScore) {
      suggestions.push({
        type: 'improvement',
        category: 'readability',
        message: 'Improve readability by using shorter sentences and simpler words',
        impact: 'high',
        effort: 'medium'
      })
    }

    // Check paragraph structure
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const avgWordsPerParagraph = words.length / paragraphs.length
    
    if (avgWordsPerParagraph > 150) {
      issues.push({
        type: 'readability',
        severity: 'medium',
        message: 'Paragraphs are too long',
        suggestion: 'Break long paragraphs into smaller chunks (aim for 50-100 words per paragraph)'
      })
      score -= 5
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Estimate average syllables per word
   */
  private estimateAvgSyllables(words: string[]): number {
    const totalSyllables = words.reduce((sum, word) => {
      return sum + this.countSyllables(word.toLowerCase())
    }, 0)
    return totalSyllables / words.length
  }

  /**
   * Count syllables in a word (approximation)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    const vowels = 'aeiouy'
    let syllableCount = 0
    let previousWasVowel = false
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i])
      if (isVowel && !previousWasVowel) {
        syllableCount++
      }
      previousWasVowel = isVowel
    }
    
    // Adjust for silent 'e'
    if (word.endsWith('e')) {
      syllableCount--
    }
    
    return Math.max(1, syllableCount)
  }

  /**
   * Calculate SEO score
   */
  private calculateSeoScore(
    content: string, 
    metadata: any, 
    issues: ContentIssue[], 
    suggestions: ContentSuggestion[]
  ): number {
    let score = 100

    // Check title
    if (!metadata?.title || metadata.title.length < 30) {
      issues.push({
        type: 'seo',
        severity: 'high',
        message: 'Title is missing or too short',
        suggestion: 'Add a descriptive title of 30-60 characters'
      })
      score -= 20
    } else if (metadata.title.length > 60) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        message: 'Title is too long',
        suggestion: 'Keep title under 60 characters for better search results'
      })
      score -= 10
    }

    // Check description
    if (!metadata?.description || metadata.description.length < 120) {
      issues.push({
        type: 'seo',
        severity: 'high',
        message: 'Meta description is missing or too short',
        suggestion: 'Add a meta description of 120-160 characters'
      })
      score -= 20
    } else if (metadata.description.length > 160) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        message: 'Meta description is too long',
        suggestion: 'Keep meta description under 160 characters'
      })
      score -= 10
    }

    // Check headings structure
    const headings = this.extractHeadings(content)
    if (headings.h1.length === 0) {
      issues.push({
        type: 'seo',
        severity: 'high',
        message: 'Missing H1 heading',
        suggestion: 'Add exactly one H1 heading to the content'
      })
      score -= 15
    } else if (headings.h1.length > 1) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        message: 'Multiple H1 headings found',
        suggestion: 'Use only one H1 heading per page'
      })
      score -= 10
    }

    if (headings.h2.length === 0 && this.getWordCount(content) > 500) {
      suggestions.push({
        type: 'improvement',
        category: 'seo',
        message: 'Add H2 headings to structure longer content',
        impact: 'medium',
        effort: 'low'
      })
      score -= 5
    }

    // Check images
    const images: string[] = content.match(/<img[^>]*>/g) || []
    const imagesWithoutAlt = images.filter(img => !img.includes('alt='))
    
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        message: `${imagesWithoutAlt.length} images missing alt text`,
        suggestion: 'Add descriptive alt text to all images'
      })
      score -= imagesWithoutAlt.length * 5
    }

    // Check internal links
    const internalLinks = content.match(/<a[^>]*href="\/[^"]*"[^>]*>/g) || []
    if (internalLinks.length === 0 && this.getWordCount(content) > 800) {
      suggestions.push({
        type: 'improvement',
        category: 'seo',
        message: 'Add internal links to related content',
        impact: 'medium',
        effort: 'low'
      })
      score -= 5
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Extract headings from content
   */
  private extractHeadings(content: string): { h1: string[], h2: string[], h3: string[] } {
    const h1Matches = content.match(/<h1[^>]*>(.*?)<\/h1>/gi) || []
    const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || []
    const h3Matches = content.match(/<h3[^>]*>(.*?)<\/h3>/gi) || []

    return {
      h1: h1Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
      h2: h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
      h3: h3Matches.map(h => h.replace(/<[^>]*>/g, '').trim())
    }
  }

  /**
   * Calculate accessibility score
   */
  private calculateAccessibilityScore(
    content: string, 
    issues: ContentIssue[], 
    suggestions: ContentSuggestion[]
  ): number {
    let score = 100

    // Check for proper heading hierarchy
    const headings = this.extractHeadings(content)
    if (headings.h2.length > 0 && headings.h1.length === 0) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        message: 'H2 headings without H1',
        suggestion: 'Ensure proper heading hierarchy (H1 → H2 → H3)'
      })
      score -= 15
    }

    // Check for alt text on images
    const images: string[] = content.match(/<img[^>]*>/g) || []
    const imagesWithoutAlt = images.filter(img => !img.includes('alt='))
    
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        message: `${imagesWithoutAlt.length} images missing alt text`,
        suggestion: 'Add descriptive alt text for screen readers'
      })
      score -= imagesWithoutAlt.length * 10
    }

    // Check for proper link text
    const links: string[] = content.match(/<a[^>]*>(.*?)<\/a>/gi) || []
    const genericLinks = links.filter(link => {
      const text = link.replace(/<[^>]*>/g, '').trim().toLowerCase()
      return ['click here', 'read more', 'here', 'more'].includes(text)
    })

    if (genericLinks.length > 0) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        message: `${genericLinks.length} links with generic text`,
        suggestion: 'Use descriptive link text instead of "click here" or "read more"'
      })
      score -= genericLinks.length * 5
    }

    // Check for proper button types
    const buttons: string[] = content.match(/<button[^>]*>/g) || []
    const buttonsWithoutType = buttons.filter(btn => !btn.includes('type='))
    
    if (buttonsWithoutType.length > 0) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        message: `${buttonsWithoutType.length} buttons missing type attribute`,
        suggestion: 'Add type="button" to all buttons'
      })
      score -= buttonsWithoutType.length * 3
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(
    content: string, 
    issues: ContentIssue[], 
    suggestions: ContentSuggestion[]
  ): number {
    let score = 100

    // Check content length
    const wordCount = this.getWordCount(content)
    if (wordCount < this.config.minWordCount) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: `Content too short (${wordCount} words)`,
        suggestion: `Aim for at least ${this.config.minWordCount} words for better engagement`
      })
      score -= 20
    } else if (wordCount > this.config.maxWordCount) {
      suggestions.push({
        type: 'optimization',
        category: 'performance',
        message: 'Consider breaking long content into multiple pages',
        impact: 'medium',
        effort: 'high'
      })
      score -= 10
    }

    // Check for large images (basic check)
    const images = content.match(/<img[^>]*>/g) || []
    if (images.length > 10) {
      suggestions.push({
        type: 'optimization',
        category: 'performance',
        message: 'Consider lazy loading for pages with many images',
        impact: 'medium',
        effort: 'medium'
      })
      score -= 5
    }

    // Check for inline styles (performance impact)
    const inlineStyles = content.match(/style\s*=/gi) || []
    if (inlineStyles.length > 5) {
      suggestions.push({
        type: 'optimization',
        category: 'performance',
        message: 'Reduce inline styles for better performance',
        impact: 'low',
        effort: 'medium'
      })
      score -= 5
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Generate quality report
   */
  generateQualityReport(metrics: ContentQualityMetrics): string {
    const report = []
    
    report.push('# Content Quality Report')
    report.push(`Generated: ${metrics.lastChecked.toISOString()}`)
    report.push('')
    
    report.push('## Overall Score')
    report.push(`**${metrics.overallScore}/100** ${this.getScoreGrade(metrics.overallScore)}`)
    report.push('')
    
    report.push('## Individual Scores')
    report.push(`- Readability: ${metrics.readabilityScore}/100`)
    report.push(`- SEO: ${metrics.seoScore}/100`)
    report.push(`- Accessibility: ${metrics.accessibilityScore}/100`)
    report.push(`- Performance: ${metrics.performanceScore}/100`)
    report.push('')
    
    report.push('## Content Metrics')
    report.push(`- Word Count: ${metrics.wordCount}`)
    report.push(`- Reading Time: ${metrics.readingTime} minutes`)
    report.push('')
    
    if (metrics.issues.length > 0) {
      report.push('## Issues Found')
      metrics.issues.forEach((issue, index) => {
        report.push(`${index + 1}. **${issue.severity.toUpperCase()}**: ${issue.message}`)
        if (issue.suggestion) {
          report.push(`   *Suggestion: ${issue.suggestion}*`)
        }
      })
      report.push('')
    }
    
    if (metrics.suggestions.length > 0) {
      report.push('## Optimization Suggestions')
      metrics.suggestions.forEach((suggestion, index) => {
        report.push(`${index + 1}. **${suggestion.category}** (${suggestion.impact} impact, ${suggestion.effort} effort): ${suggestion.message}`)
      })
    }
    
    return report.join('\n')
  }

  /**
   * Get score grade
   */
  private getScoreGrade(score: number): string {
    if (score >= 90) return '🟢 Excellent'
    if (score >= 80) return '🟡 Good'
    if (score >= 70) return '🟠 Fair'
    if (score >= 60) return '🔴 Poor'
    return '⚫ Critical'
  }
}

/**
 * Utility function to validate content
 */
export async function validateContent(content: string, metadata?: any): Promise<ContentQualityMetrics> {
  const validator = new ContentValidator()
  return await validator.validateContent(content, metadata)
}