/**
 * GEO Analytics and Alerting System
 * 
 * Monitors GEO performance, detects drops, and provides optimization suggestions
 */

import { generativeSearchTracker, type GenerativeSearchAppearance, type PerformanceComparison } from './generative-search-tracker';

export interface GEOAlert {
  id: string;
  type: 'performance_drop' | 'citation_loss' | 'semantic_decline' | 'platform_change' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  contentId: string;
  title: string;
  description: string;
  metrics: {
    current: number;
    previous: number;
    change: number;
    threshold: number;
  };
  suggestions: OptimizationSuggestion[];
  createdAt: Date;
  acknowledged: boolean;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'content' | 'structure' | 'schema' | 'eeat' | 'technical';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: number; // 0-1 scale
  effort: 'low' | 'medium' | 'high';
}

export interface GEOAnalyticsReport {
  contentId: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalAppearances: number;
    averageSemanticRelevance: number;
    citationRate: number;
    performanceScore: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  platformBreakdown: Record<string, {
    appearances: number;
    citationRate: number;
    averageRelevance: number;
  }>;
  alerts: GEOAlert[];
  suggestions: OptimizationSuggestion[];
  competitorComparison?: {
    averagePerformance: number;
    ranking: number;
    totalCompetitors: number;
  };
}

export interface AlertThresholds {
  performanceDrop: number; // % drop that triggers alert
  citationLoss: number; // % citation rate drop
  semanticDecline: number; // semantic relevance drop
  minimumAppearances: number; // minimum appearances for reliable analysis
}

export class GEOAnalyticsAlerting {
  private alerts: Map<string, GEOAlert[]> = new Map();
  private thresholds: AlertThresholds = {
    performanceDrop: 20, // 20% drop
    citationLoss: 15, // 15% citation rate drop
    semanticDecline: 10, // 10% semantic relevance drop
    minimumAppearances: 5 // need at least 5 appearances
  };

  /**
   * Generate comprehensive GEO analytics report
   */
  async generateAnalyticsReport(
    contentId: string,
    startDate: Date,
    endDate: Date,
    previousPeriodStart?: Date,
    previousPeriodEnd?: Date
  ): Promise<GEOAnalyticsReport> {
    // Get current period data
    const currentComparison = await generativeSearchTracker.getPerformanceComparison(
      contentId,
      startDate,
      endDate
    );

    // Get previous period data for comparison
    let previousComparison: PerformanceComparison | null = null;
    if (previousPeriodStart && previousPeriodEnd) {
      previousComparison = await generativeSearchTracker.getPerformanceComparison(
        contentId,
        previousPeriodStart,
        previousPeriodEnd
      );
    }

    // Calculate summary metrics
    const summary = this.calculateSummaryMetrics(currentComparison, previousComparison);

    // Calculate platform breakdown
    const platformBreakdown = this.calculatePlatformBreakdown(contentId, startDate, endDate);

    // Generate alerts
    const alerts = await this.generateAlerts(contentId, currentComparison, previousComparison);

    // Generate optimization suggestions
    const suggestions = await this.generateOptimizationSuggestions(contentId, currentComparison, alerts);

    return {
      contentId,
      period: { start: startDate, end: endDate },
      summary,
      platformBreakdown,
      alerts,
      suggestions
    };
  }

  /**
   * Monitor performance and trigger alerts
   */
  async monitorPerformance(contentId: string): Promise<GEOAlert[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const previousEndDate = new Date(startDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Previous 30 days

    const currentComparison = await generativeSearchTracker.getPerformanceComparison(
      contentId,
      startDate,
      endDate
    );

    const previousComparison = await generativeSearchTracker.getPerformanceComparison(
      contentId,
      previousStartDate,
      previousEndDate
    );

    const alerts = await this.generateAlerts(contentId, currentComparison, previousComparison);
    
    // Store alerts
    const existingAlerts = this.alerts.get(contentId) || [];
    this.alerts.set(contentId, [...existingAlerts, ...alerts]);

    return alerts;
  }

  /**
   * Get all alerts for content
   */
  getContentAlerts(contentId: string, unacknowledgedOnly: boolean = false): GEOAlert[] {
    const alerts = this.alerts.get(contentId) || [];
    return unacknowledgedOnly ? alerts.filter(alert => !alert.acknowledged) : alerts;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    for (const [contentId, alerts] of this.alerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Update alert thresholds
   */
  updateThresholds(newThresholds: Partial<AlertThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Calculate summary metrics
   */
  private calculateSummaryMetrics(
    current: PerformanceComparison,
    previous: PerformanceComparison | null
  ) {
    const performanceScore = this.calculatePerformanceScore(current);
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (previous) {
      const previousScore = this.calculatePerformanceScore(previous);
      const change = ((performanceScore - previousScore) / previousScore) * 100;
      
      if (change > 5) trend = 'improving';
      else if (change < -5) trend = 'declining';
    }

    return {
      totalAppearances: current.geoMetrics.generativeAppearances,
      averageSemanticRelevance: current.geoMetrics.averageSemanticRelevance,
      citationRate: current.geoMetrics.citationRate,
      performanceScore,
      trend
    };
  }

  /**
   * Calculate platform breakdown
   */
  private calculatePlatformBreakdown(contentId: string, startDate: Date, endDate: Date) {
    const appearances = generativeSearchTracker.getContentAppearances(contentId)
      .filter(app => app.timestamp >= startDate && app.timestamp <= endDate);

    const breakdown: Record<string, any> = {};

    for (const appearance of appearances) {
      if (!breakdown[appearance.platform]) {
        breakdown[appearance.platform] = {
          appearances: 0,
          citationCount: 0,
          relevanceSum: 0
        };
      }

      breakdown[appearance.platform].appearances++;
      if (appearance.citationFound) {
        breakdown[appearance.platform].citationCount++;
      }
      breakdown[appearance.platform].relevanceSum += appearance.semanticRelevance;
    }

    // Calculate rates and averages
    for (const platform in breakdown) {
      const data = breakdown[platform];
      breakdown[platform] = {
        appearances: data.appearances,
        citationRate: data.appearances > 0 ? data.citationCount / data.appearances : 0,
        averageRelevance: data.appearances > 0 ? data.relevanceSum / data.appearances : 0
      };
    }

    return breakdown;
  }

  /**
   * Generate alerts based on performance comparison
   */
  private async generateAlerts(
    contentId: string,
    current: PerformanceComparison,
    previous: PerformanceComparison | null
  ): Promise<GEOAlert[]> {
    const alerts: GEOAlert[] = [];

    if (!previous || current.geoMetrics.generativeAppearances < this.thresholds.minimumAppearances) {
      return alerts;
    }

    // Performance drop alert
    const currentScore = this.calculatePerformanceScore(current);
    const previousScore = this.calculatePerformanceScore(previous);
    const performanceChange = ((currentScore - previousScore) / previousScore) * 100;

    if (performanceChange < -this.thresholds.performanceDrop) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'performance_drop',
        severity: performanceChange < -50 ? 'critical' : performanceChange < -30 ? 'high' : 'medium',
        contentId,
        title: 'GEO Performance Drop Detected',
        description: `Overall GEO performance has dropped by ${Math.abs(performanceChange).toFixed(1)}%`,
        metrics: {
          current: currentScore,
          previous: previousScore,
          change: performanceChange,
          threshold: -this.thresholds.performanceDrop
        },
        suggestions: [],
        createdAt: new Date(),
        acknowledged: false
      });
    }

    // Citation loss alert
    const citationChange = ((current.geoMetrics.citationRate - previous.geoMetrics.citationRate) / previous.geoMetrics.citationRate) * 100;
    
    if (citationChange < -this.thresholds.citationLoss) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'citation_loss',
        severity: citationChange < -40 ? 'high' : 'medium',
        contentId,
        title: 'Citation Rate Decline',
        description: `Citation rate has decreased by ${Math.abs(citationChange).toFixed(1)}%`,
        metrics: {
          current: current.geoMetrics.citationRate,
          previous: previous.geoMetrics.citationRate,
          change: citationChange,
          threshold: -this.thresholds.citationLoss
        },
        suggestions: [],
        createdAt: new Date(),
        acknowledged: false
      });
    }

    // Semantic relevance decline alert
    const semanticChange = ((current.geoMetrics.averageSemanticRelevance - previous.geoMetrics.averageSemanticRelevance) / previous.geoMetrics.averageSemanticRelevance) * 100;
    
    if (semanticChange < -this.thresholds.semanticDecline) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'semantic_decline',
        severity: semanticChange < -25 ? 'high' : 'medium',
        contentId,
        title: 'Semantic Relevance Decline',
        description: `Semantic relevance has decreased by ${Math.abs(semanticChange).toFixed(1)}%`,
        metrics: {
          current: current.geoMetrics.averageSemanticRelevance,
          previous: previous.geoMetrics.averageSemanticRelevance,
          change: semanticChange,
          threshold: -this.thresholds.semanticDecline
        },
        suggestions: [],
        createdAt: new Date(),
        acknowledged: false
      });
    }

    return alerts;
  }

  /**
   * Generate optimization suggestions
   */
  private async generateOptimizationSuggestions(
    contentId: string,
    comparison: PerformanceComparison,
    alerts: GEOAlert[]
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // Low citation rate suggestions
    if (comparison.geoMetrics.citationRate < 0.3) {
      suggestions.push({
        id: this.generateSuggestionId(),
        type: 'content',
        priority: 'high',
        title: 'Improve Content Authority',
        description: 'Add more authoritative sources and expert quotes to increase citation likelihood',
        implementation: 'Include 2-3 expert quotes, add statistics from reputable sources, and cite recent studies',
        expectedImpact: 0.7,
        effort: 'medium'
      });

      suggestions.push({
        id: this.generateSuggestionId(),
        type: 'structure',
        priority: 'medium',
        title: 'Add FAQ Section',
        description: 'Create a comprehensive FAQ section to capture more conversational queries',
        implementation: 'Add 5-10 common questions with detailed answers at the end of the content',
        expectedImpact: 0.6,
        effort: 'low'
      });
    }

    // Low semantic relevance suggestions
    if (comparison.geoMetrics.averageSemanticRelevance < 0.5) {
      suggestions.push({
        id: this.generateSuggestionId(),
        type: 'content',
        priority: 'high',
        title: 'Enhance Semantic Context',
        description: 'Add more related terms, synonyms, and contextual information',
        implementation: 'Include semantic variations of key terms, add related concepts, and improve topic coverage',
        expectedImpact: 0.8,
        effort: 'medium'
      });

      suggestions.push({
        id: this.generateSuggestionId(),
        type: 'structure',
        priority: 'medium',
        title: 'Improve Content Structure',
        description: 'Use more conversational headings and natural language patterns',
        implementation: 'Convert formal headings to question-based format, use conversational transitions',
        expectedImpact: 0.5,
        effort: 'low'
      });
    }

    // Schema enhancement suggestions
    suggestions.push({
      id: this.generateSuggestionId(),
      type: 'schema',
      priority: 'medium',
      title: 'Optimize Structured Data',
      description: 'Enhance structured data markup for better AI understanding',
      implementation: 'Add FAQ schema, improve Article schema with more semantic context',
      expectedImpact: 0.4,
      effort: 'low'
    });

    // EEAT improvement suggestions
    if (alerts.some(alert => alert.type === 'citation_loss')) {
      suggestions.push({
        id: this.generateSuggestionId(),
        type: 'eeat',
        priority: 'high',
        title: 'Strengthen EEAT Signals',
        description: 'Improve expertise, authoritativeness, and trustworthiness indicators',
        implementation: 'Add author bio, include credentials, link to authoritative sources, update publication date',
        expectedImpact: 0.7,
        effort: 'medium'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(comparison: PerformanceComparison): number {
    const { geoMetrics } = comparison;
    
    // Normalize metrics to 0-100 scale
    const appearanceScore = Math.min(geoMetrics.generativeAppearances * 5, 100); // 20 appearances = 100
    const relevanceScore = geoMetrics.averageSemanticRelevance * 100;
    const citationScore = geoMetrics.citationRate * 100;
    
    // Weighted combination
    return (
      appearanceScore * 0.4 +
      relevanceScore * 0.35 +
      citationScore * 0.25
    );
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique suggestion ID
   */
  private generateSuggestionId(): string {
    return `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const geoAnalyticsAlerting = new GEOAnalyticsAlerting();