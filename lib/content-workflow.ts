/**
 * Content Workflow Integration
 * Integrates quality validation into content creation and publishing workflow
 */

import { ContentValidator, ContentQualityMetrics } from './content-validator'
import { QualityMonitor } from './quality-monitor'
import fs from 'fs'
import path from 'path'

export interface WorkflowConfig {
  minQualityScore: number
  requireManualApproval: boolean
  autoFixEnabled: boolean
  prePublishChecks: boolean
  postPublishMonitoring: boolean
  qualityGates: {
    draft: number
    review: number
    publish: number
  }
}

export interface ContentWorkflowResult {
  passed: boolean
  score: number
  stage: 'draft' | 'review' | 'publish'
  issues: Array<{
    type: string
    severity: string
    message: string
    autoFixable: boolean
  }>
  suggestions: Array<{
    message: string
    impact: string
    effort: string
  }>
  nextSteps: string[]
  canPublish: boolean
  requiresReview: boolean
}

export interface PublishingGate {
  name: string
  description: string
  threshold: number
  required: boolean
  autoFix: boolean
}

export class ContentWorkflow {
  private validator: ContentValidator
  private monitor: QualityMonitor
  private config: WorkflowConfig

  constructor(config: Partial<WorkflowConfig> = {}) {
    this.validator = new ContentValidator()
    this.monitor = new QualityMonitor()
    this.config = {
      minQualityScore: 75,
      requireManualApproval: false,
      autoFixEnabled: true,
      prePublishChecks: true,
      postPublishMonitoring: true,
      qualityGates: {
        draft: 50,
        review: 70,
        publish: 80
      },
      ...config
    }
  }

  /**
   * Validate content for specific workflow stage
   */
  async validateForStage(
    content: string, 
    metadata: any, 
    stage: 'draft' | 'review' | 'publish'
  ): Promise<ContentWorkflowResult> {
    const metrics = await this.validator.validateContent(content, metadata)
    const threshold = this.config.qualityGates[stage]
    const passed = metrics.overallScore >= threshold
    
    // Determine next steps
    const nextSteps = this.generateNextSteps(metrics, stage, passed)
    
    // Check if content can be published
    const canPublish = metrics.overallScore >= this.config.qualityGates.publish
    const requiresReview = metrics.overallScore < this.config.qualityGates.review || 
                          metrics.issues.some(issue => issue.severity === 'critical')

    return {
      passed,
      score: metrics.overallScore,
      stage,
      issues: metrics.issues.map(issue => ({
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
        autoFixable: this.isAutoFixable(issue)
      })),
      suggestions: metrics.suggestions.map(suggestion => ({
        message: suggestion.message,
        impact: suggestion.impact,
        effort: suggestion.effort
      })),
      nextSteps,
      canPublish,
      requiresReview
    }
  }

  /**
   * Pre-publish quality check
   */
  async prePublishCheck(content: string, metadata: any): Promise<{
    approved: boolean
    blockers: string[]
    warnings: string[]
    metrics: ContentQualityMetrics
  }> {
    const metrics = await this.validator.validateContent(content, metadata)
    const blockers: string[] = []
    const warnings: string[] = []

    // Check critical issues
    const criticalIssues = metrics.issues.filter(issue => issue.severity === 'critical')
    if (criticalIssues.length > 0) {
      blockers.push(`${criticalIssues.length} critical issues must be fixed before publishing`)
    }

    // Check minimum score
    if (metrics.overallScore < this.config.qualityGates.publish) {
      blockers.push(`Quality score (${metrics.overallScore}%) below publish threshold (${this.config.qualityGates.publish}%)`)
    }

    // Check high priority issues
    const highIssues = metrics.issues.filter(issue => issue.severity === 'high')
    if (highIssues.length > 2) {
      warnings.push(`${highIssues.length} high-priority issues should be addressed`)
    }

    // Check accessibility
    if (metrics.accessibilityScore < 80) {
      warnings.push(`Accessibility score (${metrics.accessibilityScore}%) could be improved`)
    }

    // Check SEO
    if (metrics.seoScore < 70) {
      warnings.push(`SEO score (${metrics.seoScore}%) needs improvement`)
    }

    const approved = blockers.length === 0

    return {
      approved,
      blockers,
      warnings,
      metrics
    }
  }

  /**
   * Auto-fix content issues where possible
   */
  async autoFixContent(content: string): Promise<{
    fixedContent: string
    appliedFixes: string[]
    remainingIssues: string[]
  }> {
    let fixedContent = content
    const appliedFixes: string[] = []
    const remainingIssues: string[] = []

    if (!this.config.autoFixEnabled) {
      return {
        fixedContent: content,
        appliedFixes: [],
        remainingIssues: ['Auto-fix disabled']
      }
    }

    // Fix missing button types
    const buttonTypeRegex = /<button(?![^>]*type=)([^>]*)>/g
    if (buttonTypeRegex.test(fixedContent)) {
      fixedContent = fixedContent.replace(buttonTypeRegex, '<button type="button"$1>')
      appliedFixes.push('Added missing button type attributes')
    }

    // Fix missing alt text (placeholder)
    const imgWithoutAltRegex = /<img(?![^>]*alt=)([^>]*)>/g
    if (imgWithoutAltRegex.test(fixedContent)) {
      fixedContent = fixedContent.replace(imgWithoutAltRegex, '<img alt="Image"$1>')
      appliedFixes.push('Added placeholder alt text to images')
      remainingIssues.push('Review and update image alt text with descriptive content')
    }

    // Fix missing aria-labels on form elements
    const selectWithoutAriaRegex = /<select(?![^>]*aria-label)([^>]*)>/g
    if (selectWithoutAriaRegex.test(fixedContent)) {
      fixedContent = fixedContent.replace(selectWithoutAriaRegex, '<select aria-label="Select option"$1>')
      appliedFixes.push('Added aria-labels to select elements')
    }

    // Fix long paragraphs (basic)
    const paragraphs = fixedContent.split(/\n\s*\n/)
    const longParagraphs = paragraphs.filter(p => {
      const wordCount = p.replace(/<[^>]*>/g, '').split(/\s+/).length
      return wordCount > 150
    })

    if (longParagraphs.length > 0) {
      remainingIssues.push(`${longParagraphs.length} paragraphs are too long (>150 words)`)
    }

    // Check for generic link text
    const genericLinkRegex = /<a[^>]*>(click here|read more|here|more)<\/a>/gi
    if (genericLinkRegex.test(fixedContent)) {
      remainingIssues.push('Replace generic link text with descriptive text')
    }

    return {
      fixedContent,
      appliedFixes,
      remainingIssues
    }
  }

  /**
   * Generate content optimization suggestions
   */
  async generateOptimizationSuggestions(content: string, metadata: any): Promise<{
    priority: 'high' | 'medium' | 'low'
    category: string
    suggestions: Array<{
      title: string
      description: string
      impact: string
      effort: string
      example?: string
    }>
  }[]> {
    const metrics = await this.validator.validateContent(content, metadata)
    const suggestions: Array<{
      priority: 'high' | 'medium' | 'low'
      category: string
      suggestions: Array<{
        title: string
        description: string
        impact: string
        effort: string
        example?: string
      }>
    }> = []

    // SEO Suggestions
    if (metrics.seoScore < 80) {
      const seoSuggestions = []
      
      if (!metadata?.title || metadata.title.length < 30) {
        seoSuggestions.push({
          title: 'Optimize Title Length',
          description: 'Create a compelling title between 30-60 characters',
          impact: 'high',
          effort: 'low',
          example: 'Current: "Blog Post" → Suggested: "Complete Guide to Blog Content Quality in 2024"'
        })
      }

      if (!metadata?.description || metadata.description.length < 120) {
        seoSuggestions.push({
          title: 'Add Meta Description',
          description: 'Write a compelling meta description of 120-160 characters',
          impact: 'high',
          effort: 'low'
        })
      }

      const headings = content.match(/<h[1-6][^>]*>/g) || []
      if (headings.length < 3) {
        seoSuggestions.push({
          title: 'Improve Content Structure',
          description: 'Add more headings to break up content and improve readability',
          impact: 'medium',
          effort: 'medium'
        })
      }

      if (seoSuggestions.length > 0) {
        suggestions.push({
          priority: 'high',
          category: 'SEO',
          suggestions: seoSuggestions
        })
      }
    }

    // Readability Suggestions
    if (metrics.readabilityScore < 70) {
      suggestions.push({
        priority: 'medium',
        category: 'Readability',
        suggestions: [
          {
            title: 'Simplify Language',
            description: 'Use shorter sentences and simpler words to improve readability',
            impact: 'high',
            effort: 'medium'
          },
          {
            title: 'Break Up Long Paragraphs',
            description: 'Split paragraphs longer than 100 words into smaller chunks',
            impact: 'medium',
            effort: 'low'
          }
        ]
      })
    }

    // Accessibility Suggestions
    if (metrics.accessibilityScore < 85) {
      const accessibilitySuggestions = []
      
      const imagesWithoutAlt = (content.match(/<img[^>]*>/g) || [])
        .filter((img: string) => !img.includes('alt='))
      
      if (imagesWithoutAlt.length > 0) {
        accessibilitySuggestions.push({
          title: 'Add Alt Text to Images',
          description: `${imagesWithoutAlt.length} images are missing descriptive alt text`,
          impact: 'high',
          effort: 'low'
        })
      }

      const genericLinks = (content.match(/<a[^>]*>.*?<\/a>/g) || [])
        .filter(link => />(click here|read more|here|more)</i.test(link))
      
      if (genericLinks.length > 0) {
        accessibilitySuggestions.push({
          title: 'Improve Link Text',
          description: 'Replace generic link text with descriptive text',
          impact: 'medium',
          effort: 'low',
          example: 'Instead of "click here", use "download the complete guide"'
        })
      }

      if (accessibilitySuggestions.length > 0) {
        suggestions.push({
          priority: 'high',
          category: 'Accessibility',
          suggestions: accessibilitySuggestions
        })
      }
    }

    return suggestions
  }

  /**
   * Create quality gate for deployment pipeline
   */
  async createQualityGate(content: string, metadata: any): Promise<{
    passed: boolean
    gate: string
    score: number
    threshold: number
    blockers: string[]
    canProceed: boolean
  }> {
    const prePublishResult = await this.prePublishCheck(content, metadata)
    
    return {
      passed: prePublishResult.approved,
      gate: 'pre-publish',
      score: prePublishResult.metrics.overallScore,
      threshold: this.config.qualityGates.publish,
      blockers: prePublishResult.blockers,
      canProceed: prePublishResult.approved
    }
  }

  /**
   * Post-publish monitoring setup
   */
  async setupPostPublishMonitoring(contentId: string): Promise<void> {
    if (!this.config.postPublishMonitoring) {
      return
    }

    // Schedule monitoring check
    console.log(`📊 Setting up post-publish monitoring for content: ${contentId}`)
    
    // This would typically integrate with a job scheduler
    // For now, we'll just log the setup
    const monitoringConfig = {
      contentId,
      checkInterval: '24h',
      alertThresholds: {
        qualityScore: this.config.minQualityScore,
        criticalIssues: 0,
        highIssues: 2
      },
      setupAt: new Date()
    }

    // Save monitoring configuration
    const configPath = path.join(process.cwd(), 'monitoring-configs', `${contentId}.json`)
    await fs.promises.mkdir(path.dirname(configPath), { recursive: true })
    await fs.promises.writeFile(configPath, JSON.stringify(monitoringConfig, null, 2))
  }

  /**
   * Generate next steps based on validation results
   */
  private generateNextSteps(
    metrics: ContentQualityMetrics, 
    stage: string, 
    passed: boolean
  ): string[] {
    const steps: string[] = []

    if (!passed) {
      steps.push(`Improve quality score to meet ${stage} threshold`)
    }

    const criticalIssues = metrics.issues.filter(issue => issue.severity === 'critical')
    if (criticalIssues.length > 0) {
      steps.push(`Fix ${criticalIssues.length} critical issues`)
    }

    const highIssues = metrics.issues.filter(issue => issue.severity === 'high')
    if (highIssues.length > 2) {
      steps.push(`Address ${highIssues.length} high-priority issues`)
    }

    if (metrics.accessibilityScore < 80) {
      steps.push('Improve accessibility (add alt text, fix heading structure)')
    }

    if (metrics.seoScore < 70) {
      steps.push('Optimize for SEO (improve title, meta description, headings)')
    }

    if (metrics.readabilityScore < 60) {
      steps.push('Improve readability (shorter sentences, simpler language)')
    }

    if (steps.length === 0) {
      if (stage === 'draft') {
        steps.push('Ready for review stage')
      } else if (stage === 'review') {
        steps.push('Ready for publishing')
      } else {
        steps.push('Content meets quality standards')
      }
    }

    return steps
  }

  /**
   * Check if an issue can be auto-fixed
   */
  private isAutoFixable(issue: any): boolean {
    const autoFixableTypes = [
      'missing button type',
      'missing aria-label',
      'basic formatting',
      'simple accessibility'
    ]

    return autoFixableTypes.some(type => 
      issue.message.toLowerCase().includes(type) ||
      issue.type === 'formatting'
    )
  }
}

/**
 * Utility function to validate content for workflow
 */
export async function validateContentWorkflow(
  content: string, 
  metadata: any, 
  stage: 'draft' | 'review' | 'publish'
): Promise<ContentWorkflowResult> {
  const workflow = new ContentWorkflow()
  return await workflow.validateForStage(content, metadata, stage)
}