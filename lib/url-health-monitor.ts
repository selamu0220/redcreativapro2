/**
 * URL Health Monitor Service
 * Monitors URL health and provides reporting
 */

import { URLValidator, ValidationReport, URLValidationResult } from './url-validator'
import fs from 'fs'
import path from 'path'

export interface HealthMetrics {
  totalUrls: number
  validUrls: number
  brokenUrls: number
  errorUrls: number
  healthScore: number
  lastChecked: Date
  trends: {
    previousHealthScore?: number
    improvement: number
    status: 'improving' | 'declining' | 'stable'
  }
}

export interface HealthAlert {
  type: 'broken_url' | 'health_decline' | 'error_threshold'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  urls?: string[]
  timestamp: Date
}

export interface MonitoringConfig {
  healthThreshold: number // Minimum health score (0-100)
  errorThreshold: number // Maximum number of errors before alert
  checkInterval: number // Minutes between checks
  alertsEnabled: boolean
  reportPath: string
  historyPath: string
}

export class URLHealthMonitor {
  private validator: URLValidator
  private config: MonitoringConfig

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.validator = new URLValidator()
    this.config = {
      healthThreshold: 95,
      errorThreshold: 5,
      checkInterval: 60,
      alertsEnabled: true,
      reportPath: path.join(process.cwd(), 'url-health-report.json'),
      historyPath: path.join(process.cwd(), 'url-health-history.json'),
      ...config
    }
  }

  /**
   * Perform health check and generate metrics
   */
  async performHealthCheck(): Promise<HealthMetrics> {
    const report = await this.validator.validateAllBlogUrls()
    const previousMetrics = await this.loadPreviousMetrics()
    
    const healthScore = report.totalUrls > 0 ? (report.validUrls / report.totalUrls) * 100 : 100
    const errorUrls = report.results.filter(r => r.status === 'error').length

    const metrics: HealthMetrics = {
      totalUrls: report.totalUrls,
      validUrls: report.validUrls,
      brokenUrls: report.brokenUrls,
      errorUrls,
      healthScore: Math.round(healthScore * 100) / 100,
      lastChecked: new Date(),
      trends: {
        previousHealthScore: previousMetrics?.healthScore,
        improvement: previousMetrics ? healthScore - previousMetrics.healthScore : 0,
        status: this.calculateTrendStatus(healthScore, previousMetrics?.healthScore)
      }
    }

    // Save current metrics
    await this.saveMetrics(metrics)
    
    // Update history
    await this.updateHistory(metrics)

    // Generate alerts if enabled
    if (this.config.alertsEnabled) {
      const alerts = this.generateAlerts(metrics, report.results)
      if (alerts.length > 0) {
        await this.saveAlerts(alerts)
      }
    }

    return metrics
  }

  /**
   * Calculate trend status
   */
  private calculateTrendStatus(current: number, previous?: number): 'improving' | 'declining' | 'stable' {
    if (!previous) return 'stable'
    
    const difference = current - previous
    if (Math.abs(difference) < 1) return 'stable'
    return difference > 0 ? 'improving' : 'declining'
  }

  /**
   * Generate health alerts
   */
  private generateAlerts(metrics: HealthMetrics, results: URLValidationResult[]): HealthAlert[] {
    const alerts: HealthAlert[] = []

    // Health score alert
    if (metrics.healthScore < this.config.healthThreshold) {
      const severity = this.getHealthSeverity(metrics.healthScore)
      alerts.push({
        type: 'health_decline',
        severity,
        message: `URL health score (${metrics.healthScore}%) is below threshold (${this.config.healthThreshold}%)`,
        timestamp: new Date()
      })
    }

    // Error threshold alert
    if (metrics.errorUrls > this.config.errorThreshold) {
      alerts.push({
        type: 'error_threshold',
        severity: 'high',
        message: `Error count (${metrics.errorUrls}) exceeds threshold (${this.config.errorThreshold})`,
        timestamp: new Date()
      })
    }

    // Broken URL alerts
    const brokenUrls = results.filter(r => r.status !== 'valid')
    if (brokenUrls.length > 0) {
      alerts.push({
        type: 'broken_url',
        severity: brokenUrls.length > 10 ? 'critical' : brokenUrls.length > 5 ? 'high' : 'medium',
        message: `Found ${brokenUrls.length} broken URLs`,
        urls: brokenUrls.map(r => r.url),
        timestamp: new Date()
      })
    }

    return alerts
  }

  /**
   * Get health severity based on score
   */
  private getHealthSeverity(score: number): HealthAlert['severity'] {
    if (score < 50) return 'critical'
    if (score < 70) return 'high'
    if (score < 85) return 'medium'
    return 'low'
  }

  /**
   * Load previous metrics
   */
  private async loadPreviousMetrics(): Promise<HealthMetrics | null> {
    try {
      const data = await fs.promises.readFile(this.config.reportPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      return null
    }
  }

  /**
   * Save current metrics
   */
  private async saveMetrics(metrics: HealthMetrics): Promise<void> {
    try {
      await fs.promises.writeFile(this.config.reportPath, JSON.stringify(metrics, null, 2))
    } catch (error) {
      console.error('Error saving health metrics:', error)
    }
  }

  /**
   * Update history
   */
  private async updateHistory(metrics: HealthMetrics): Promise<void> {
    try {
      let history: HealthMetrics[] = []
      
      try {
        const data = await fs.promises.readFile(this.config.historyPath, 'utf8')
        history = JSON.parse(data)
      } catch (error) {
        // File doesn't exist, start with empty history
      }

      history.push(metrics)
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history = history.slice(-100)
      }

      await fs.promises.writeFile(this.config.historyPath, JSON.stringify(history, null, 2))
    } catch (error) {
      console.error('Error updating health history:', error)
    }
  }

  /**
   * Save alerts
   */
  private async saveAlerts(alerts: HealthAlert[]): Promise<void> {
    const alertsPath = path.join(process.cwd(), 'url-health-alerts.json')
    
    try {
      let existingAlerts: HealthAlert[] = []
      
      try {
        const data = await fs.promises.readFile(alertsPath, 'utf8')
        existingAlerts = JSON.parse(data)
      } catch (error) {
        // File doesn't exist
      }

      const allAlerts = [...existingAlerts, ...alerts]
      
      // Keep only last 50 alerts
      const recentAlerts = allAlerts.slice(-50)

      await fs.promises.writeFile(alertsPath, JSON.stringify(recentAlerts, null, 2))
    } catch (error) {
      console.error('Error saving alerts:', error)
    }
  }

  /**
   * Get health history
   */
  async getHealthHistory(days = 30): Promise<HealthMetrics[]> {
    try {
      const data = await fs.promises.readFile(this.config.historyPath, 'utf8')
      const history: HealthMetrics[] = JSON.parse(data)
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      return history.filter(metric => new Date(metric.lastChecked) >= cutoffDate)
    } catch (error) {
      return []
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(hours = 24): Promise<HealthAlert[]> {
    const alertsPath = path.join(process.cwd(), 'url-health-alerts.json')
    
    try {
      const data = await fs.promises.readFile(alertsPath, 'utf8')
      const alerts: HealthAlert[] = JSON.parse(data)
      
      const cutoffDate = new Date()
      cutoffDate.setHours(cutoffDate.getHours() - hours)
      
      return alerts.filter(alert => new Date(alert.timestamp) >= cutoffDate)
    } catch (error) {
      return []
    }
  }

  /**
   * Generate health report
   */
  async generateHealthReport(): Promise<{
    currentMetrics: HealthMetrics
    history: HealthMetrics[]
    recentAlerts: HealthAlert[]
    recommendations: string[]
  }> {
    const currentMetrics = await this.performHealthCheck()
    const history = await this.getHealthHistory()
    const recentAlerts = await this.getRecentAlerts()
    const recommendations = this.generateRecommendations(currentMetrics, recentAlerts)

    return {
      currentMetrics,
      history,
      recentAlerts,
      recommendations
    }
  }

  /**
   * Generate recommendations based on metrics and alerts
   */
  private generateRecommendations(metrics: HealthMetrics, alerts: HealthAlert[]): string[] {
    const recommendations: string[] = []

    if (metrics.healthScore < 90) {
      recommendations.push('Consider reviewing and fixing broken URLs to improve health score')
    }

    if (metrics.brokenUrls > 0) {
      recommendations.push(`Fix ${metrics.brokenUrls} broken URLs to improve site reliability`)
    }

    if (metrics.errorUrls > 0) {
      recommendations.push(`Investigate ${metrics.errorUrls} URLs with errors`)
    }

    if (metrics.trends.status === 'declining') {
      recommendations.push('Health score is declining - investigate recent changes')
    }

    const criticalAlerts = alerts.filter(a => a.severity === 'critical')
    if (criticalAlerts.length > 0) {
      recommendations.push('Address critical alerts immediately to prevent service degradation')
    }

    if (recommendations.length === 0) {
      recommendations.push('URL health is good - continue monitoring')
    }

    return recommendations
  }
}

/**
 * Utility function to run health check
 */
export async function runHealthCheck(): Promise<HealthMetrics> {
  const monitor = new URLHealthMonitor()
  return await monitor.performHealthCheck()
}