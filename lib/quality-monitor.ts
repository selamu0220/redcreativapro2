/**
 * Quality Monitor Service
 * Monitors content quality across the blog and provides alerting
 */

import { ContentValidator, ContentQualityMetrics, ContentIssue } from './content-validator'
import { URLHealthMonitor, HealthMetrics } from './url-health-monitor'
import { blogPosts } from '@/lib/blog-data'
import fs from 'fs'
import path from 'path'

export interface QualityAlert {
  id: string
  type: 'quality_decline' | 'critical_issue' | 'threshold_breach' | 'url_health'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  affectedContent?: string[]
  metrics?: Partial<ContentQualityMetrics>
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

export interface QualityThresholds {
  minOverallScore: number
  minReadabilityScore: number
  minSeoScore: number
  minAccessibilityScore: number
  minPerformanceScore: number
  maxCriticalIssues: number
  maxHighIssues: number
  urlHealthThreshold: number
}

export interface QualityReport {
  summary: {
    totalContent: number
    averageScore: number
    contentAboveThreshold: number
    contentBelowThreshold: number
    criticalIssues: number
    highIssues: number
    mediumIssues: number
    lowIssues: number
  }
  contentMetrics: Array<{
    id: string
    title: string
    score: number
    issues: ContentIssue[]
    lastChecked: Date
  }>
  urlHealth: HealthMetrics
  alerts: QualityAlert[]
  trends: {
    scoreChange: number
    issueChange: number
    period: string
  }
  generatedAt: Date
}

export interface MonitoringConfig {
  thresholds: QualityThresholds
  checkInterval: number // minutes
  alertsEnabled: boolean
  emailAlerts: boolean
  slackAlerts: boolean
  reportPath: string
  alertsPath: string
  historyPath: string
}

export class QualityMonitor {
  private contentValidator: ContentValidator
  private urlHealthMonitor: URLHealthMonitor
  private config: MonitoringConfig

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.contentValidator = new ContentValidator()
    this.urlHealthMonitor = new URLHealthMonitor()
    this.config = {
      thresholds: {
        minOverallScore: 75,
        minReadabilityScore: 60,
        minSeoScore: 70,
        minAccessibilityScore: 80,
        minPerformanceScore: 70,
        maxCriticalIssues: 0,
        maxHighIssues: 2,
        urlHealthThreshold: 95
      },
      checkInterval: 60,
      alertsEnabled: true,
      emailAlerts: false,
      slackAlerts: false,
      reportPath: path.join(process.cwd(), 'quality-report.json'),
      alertsPath: path.join(process.cwd(), 'quality-alerts.json'),
      historyPath: path.join(process.cwd(), 'quality-history.json'),
      ...config
    }
  }

  /**
   * Run comprehensive quality assessment
   */
  async runQualityAssessment(): Promise<QualityReport> {
    console.log('🔍 Starting quality assessment...')
    
    const contentMetrics: QualityReport['contentMetrics'] = []
    const alerts: QualityAlert[] = []
    
    // Check URL health
    const urlHealth = await this.urlHealthMonitor.performHealthCheck()
    
    // Validate content for each blog post
    for (const post of blogPosts.slice(0, 10)) { // Limit for performance
      try {
        const content = await this.loadBlogPostContent(post.id)
        if (content) {
          const metrics = await this.contentValidator.validateContent(content, {
            title: post.title,
            description: post.excerpt
          })
          
          contentMetrics.push({
            id: post.id,
            title: post.title,
            score: metrics.overallScore,
            issues: metrics.issues,
            lastChecked: metrics.lastChecked
          })
          
          // Generate alerts for this content
          const contentAlerts = this.generateContentAlerts(post.id, post.title, metrics)
          alerts.push(...contentAlerts)
        }
      } catch (error) {
        console.error(`Error validating content for ${post.id}:`, error)
        alerts.push({
          id: `error-${post.id}-${Date.now()}`,
          type: 'critical_issue',
          severity: 'high',
          title: 'Content Validation Error',
          message: `Failed to validate content for "${post.title}"`,
          affectedContent: [post.id],
          timestamp: new Date(),
          resolved: false
        })
      }
    }
    
    // Generate URL health alerts
    if (urlHealth.healthScore < this.config.thresholds.urlHealthThreshold) {
      alerts.push({
        id: `url-health-${Date.now()}`,
        type: 'url_health',
        severity: urlHealth.healthScore < 80 ? 'critical' : 'high',
        title: 'URL Health Below Threshold',
        message: `URL health score (${urlHealth.healthScore}%) is below threshold (${this.config.thresholds.urlHealthThreshold}%)`,
        timestamp: new Date(),
        resolved: false
      })
    }
    
    // Calculate summary metrics
    const summary = this.calculateSummaryMetrics(contentMetrics, urlHealth)
    
    // Get trends
    const trends = await this.calculateTrends(summary)
    
    const report: QualityReport = {
      summary,
      contentMetrics,
      urlHealth,
      alerts,
      trends,
      generatedAt: new Date()
    }
    
    // Save report
    await this.saveReport(report)
    
    // Save alerts
    if (alerts.length > 0) {
      await this.saveAlerts(alerts)
    }
    
    // Update history
    await this.updateHistory(report)
    
    // Send notifications if enabled
    if (this.config.alertsEnabled && alerts.length > 0) {
      await this.sendNotifications(alerts)
    }
    
    console.log(`✅ Quality assessment complete. Found ${alerts.length} alerts.`)
    
    return report
  }

  /**
   * Load blog post content from file
   */
  private async loadBlogPostContent(postId: string): Promise<string | null> {
    try {
      const postPath = path.join(process.cwd(), 'app', 'blog', postId, 'page.tsx')
      const content = await fs.promises.readFile(postPath, 'utf8')
      
      // Extract JSX content (simplified)
      const jsxMatch = content.match(/return\s*\(([\s\S]*)\)/m)
      return jsxMatch ? jsxMatch[1] : content
    } catch (error) {
      console.error(`Error loading content for ${postId}:`, error)
      return null
    }
  }

  /**
   * Generate alerts for content issues
   */
  private generateContentAlerts(
    postId: string, 
    title: string, 
    metrics: ContentQualityMetrics
  ): QualityAlert[] {
    const alerts: QualityAlert[] = []
    
    // Overall score alert
    if (metrics.overallScore < this.config.thresholds.minOverallScore) {
      alerts.push({
        id: `score-${postId}-${Date.now()}`,
        type: 'quality_decline',
        severity: metrics.overallScore < 50 ? 'critical' : metrics.overallScore < 65 ? 'high' : 'medium',
        title: 'Content Quality Below Threshold',
        message: `"${title}" has quality score ${metrics.overallScore}% (threshold: ${this.config.thresholds.minOverallScore}%)`,
        affectedContent: [postId],
        metrics,
        timestamp: new Date(),
        resolved: false
      })
    }
    
    // Critical issues alert
    const criticalIssues = metrics.issues.filter(issue => issue.severity === 'critical')
    if (criticalIssues.length > this.config.thresholds.maxCriticalIssues) {
      alerts.push({
        id: `critical-${postId}-${Date.now()}`,
        type: 'critical_issue',
        severity: 'critical',
        title: 'Critical Content Issues Found',
        message: `"${title}" has ${criticalIssues.length} critical issues`,
        affectedContent: [postId],
        metrics,
        timestamp: new Date(),
        resolved: false
      })
    }
    
    // High issues alert
    const highIssues = metrics.issues.filter(issue => issue.severity === 'high')
    if (highIssues.length > this.config.thresholds.maxHighIssues) {
      alerts.push({
        id: `high-${postId}-${Date.now()}`,
        type: 'threshold_breach',
        severity: 'high',
        title: 'Multiple High-Priority Issues',
        message: `"${title}" has ${highIssues.length} high-priority issues`,
        affectedContent: [postId],
        metrics,
        timestamp: new Date(),
        resolved: false
      })
    }
    
    // Specific score thresholds
    if (metrics.accessibilityScore < this.config.thresholds.minAccessibilityScore) {
      alerts.push({
        id: `accessibility-${postId}-${Date.now()}`,
        type: 'threshold_breach',
        severity: 'high',
        title: 'Accessibility Score Below Threshold',
        message: `"${title}" accessibility score: ${metrics.accessibilityScore}% (threshold: ${this.config.thresholds.minAccessibilityScore}%)`,
        affectedContent: [postId],
        metrics,
        timestamp: new Date(),
        resolved: false
      })
    }
    
    return alerts
  }

  /**
   * Calculate summary metrics
   */
  private calculateSummaryMetrics(
    contentMetrics: QualityReport['contentMetrics'], 
    urlHealth: HealthMetrics
  ): QualityReport['summary'] {
    const totalContent = contentMetrics.length
    const averageScore = totalContent > 0 
      ? contentMetrics.reduce((sum, content) => sum + content.score, 0) / totalContent 
      : 0
    
    const contentAboveThreshold = contentMetrics.filter(
      content => content.score >= this.config.thresholds.minOverallScore
    ).length
    
    const contentBelowThreshold = totalContent - contentAboveThreshold
    
    const allIssues = contentMetrics.flatMap(content => content.issues)
    const criticalIssues = allIssues.filter(issue => issue.severity === 'critical').length
    const highIssues = allIssues.filter(issue => issue.severity === 'high').length
    const mediumIssues = allIssues.filter(issue => issue.severity === 'medium').length
    const lowIssues = allIssues.filter(issue => issue.severity === 'low').length
    
    return {
      totalContent,
      averageScore: Math.round(averageScore * 100) / 100,
      contentAboveThreshold,
      contentBelowThreshold,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues
    }
  }

  /**
   * Calculate trends compared to previous report
   */
  private async calculateTrends(summary: QualityReport['summary']): Promise<QualityReport['trends']> {
    try {
      const previousReport = await this.loadPreviousReport()
      if (!previousReport) {
        return {
          scoreChange: 0,
          issueChange: 0,
          period: 'No previous data'
        }
      }
      
      const scoreChange = summary.averageScore - previousReport.summary.averageScore
      const currentTotalIssues = summary.criticalIssues + summary.highIssues + summary.mediumIssues + summary.lowIssues
      const previousTotalIssues = previousReport.summary.criticalIssues + previousReport.summary.highIssues + 
                                 previousReport.summary.mediumIssues + previousReport.summary.lowIssues
      const issueChange = currentTotalIssues - previousTotalIssues
      
      const timeDiff = new Date().getTime() - new Date(previousReport.generatedAt).getTime()
      const hoursDiff = Math.round(timeDiff / (1000 * 60 * 60))
      const period = hoursDiff < 24 ? `${hoursDiff} hours` : `${Math.round(hoursDiff / 24)} days`
      
      return {
        scoreChange: Math.round(scoreChange * 100) / 100,
        issueChange,
        period
      }
    } catch (error) {
      return {
        scoreChange: 0,
        issueChange: 0,
        period: 'Error calculating trends'
      }
    }
  }

  /**
   * Load previous report
   */
  private async loadPreviousReport(): Promise<QualityReport | null> {
    try {
      const data = await fs.promises.readFile(this.config.reportPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      return null
    }
  }

  /**
   * Save quality report
   */
  private async saveReport(report: QualityReport): Promise<void> {
    try {
      await fs.promises.writeFile(this.config.reportPath, JSON.stringify(report, null, 2))
    } catch (error) {
      console.error('Error saving quality report:', error)
    }
  }

  /**
   * Save alerts
   */
  private async saveAlerts(newAlerts: QualityAlert[]): Promise<void> {
    try {
      let existingAlerts: QualityAlert[] = []
      
      try {
        const data = await fs.promises.readFile(this.config.alertsPath, 'utf8')
        existingAlerts = JSON.parse(data)
      } catch (error) {
        // File doesn't exist
      }
      
      const allAlerts = [...existingAlerts, ...newAlerts]
      
      // Keep only last 100 alerts
      const recentAlerts = allAlerts.slice(-100)
      
      await fs.promises.writeFile(this.config.alertsPath, JSON.stringify(recentAlerts, null, 2))
    } catch (error) {
      console.error('Error saving alerts:', error)
    }
  }

  /**
   * Update history
   */
  private async updateHistory(report: QualityReport): Promise<void> {
    try {
      let history: Array<{ timestamp: Date, summary: QualityReport['summary'] }> = []
      
      try {
        const data = await fs.promises.readFile(this.config.historyPath, 'utf8')
        history = JSON.parse(data)
      } catch (error) {
        // File doesn't exist
      }
      
      history.push({
        timestamp: report.generatedAt,
        summary: report.summary
      })
      
      // Keep only last 30 entries
      if (history.length > 30) {
        history = history.slice(-30)
      }
      
      await fs.promises.writeFile(this.config.historyPath, JSON.stringify(history, null, 2))
    } catch (error) {
      console.error('Error updating history:', error)
    }
  }

  /**
   * Send notifications for alerts
   */
  private async sendNotifications(alerts: QualityAlert[]): Promise<void> {
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
    const highAlerts = alerts.filter(alert => alert.severity === 'high')
    
    if (criticalAlerts.length > 0) {
      console.log(`🚨 CRITICAL: ${criticalAlerts.length} critical quality alerts`)
      criticalAlerts.forEach(alert => {
        console.log(`   - ${alert.title}: ${alert.message}`)
      })
    }
    
    if (highAlerts.length > 0) {
      console.log(`⚠️  HIGH: ${highAlerts.length} high-priority quality alerts`)
      highAlerts.forEach(alert => {
        console.log(`   - ${alert.title}: ${alert.message}`)
      })
    }
    
    // TODO: Implement email/Slack notifications
    if (this.config.emailAlerts) {
      // await this.sendEmailNotifications(alerts)
    }
    
    if (this.config.slackAlerts) {
      // await this.sendSlackNotifications(alerts)
    }
  }

  /**
   * Get quality dashboard data
   */
  async getQualityDashboard(): Promise<{
    currentReport: QualityReport
    recentAlerts: QualityAlert[]
    history: Array<{ timestamp: Date, summary: QualityReport['summary'] }>
    recommendations: string[]
  }> {
    const currentReport = await this.runQualityAssessment()
    
    // Get recent alerts
    let recentAlerts: QualityAlert[] = []
    try {
      const data = await fs.promises.readFile(this.config.alertsPath, 'utf8')
      const allAlerts: QualityAlert[] = JSON.parse(data)
      const cutoffDate = new Date()
      cutoffDate.setHours(cutoffDate.getHours() - 24)
      recentAlerts = allAlerts.filter(alert => new Date(alert.timestamp) >= cutoffDate)
    } catch (error) {
      // No alerts file
    }
    
    // Get history
    let history: Array<{ timestamp: Date, summary: QualityReport['summary'] }> = []
    try {
      const data = await fs.promises.readFile(this.config.historyPath, 'utf8')
      history = JSON.parse(data)
    } catch (error) {
      // No history file
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(currentReport, recentAlerts)
    
    return {
      currentReport,
      recentAlerts,
      history,
      recommendations
    }
  }

  /**
   * Generate recommendations based on report and alerts
   */
  private generateRecommendations(report: QualityReport, alerts: QualityAlert[]): string[] {
    const recommendations: string[] = []
    
    if (report.summary.averageScore < this.config.thresholds.minOverallScore) {
      recommendations.push(`Improve overall content quality - current average: ${report.summary.averageScore}%`)
    }
    
    if (report.summary.criticalIssues > 0) {
      recommendations.push(`Address ${report.summary.criticalIssues} critical issues immediately`)
    }
    
    if (report.summary.contentBelowThreshold > 0) {
      recommendations.push(`${report.summary.contentBelowThreshold} articles need quality improvements`)
    }
    
    if (report.urlHealth.healthScore < this.config.thresholds.urlHealthThreshold) {
      recommendations.push(`Fix URL health issues - current score: ${report.urlHealth.healthScore}%`)
    }
    
    const criticalAlerts = alerts.filter(a => a.severity === 'critical')
    if (criticalAlerts.length > 0) {
      recommendations.push(`Resolve ${criticalAlerts.length} critical alerts`)
    }
    
    if (report.trends.scoreChange < -5) {
      recommendations.push('Quality scores are declining - investigate recent changes')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Content quality is good - continue monitoring')
    }
    
    return recommendations
  }
}

/**
 * Utility function to run quality monitoring
 */
export async function runQualityMonitoring(): Promise<QualityReport> {
  const monitor = new QualityMonitor()
  return await monitor.runQualityAssessment()
}