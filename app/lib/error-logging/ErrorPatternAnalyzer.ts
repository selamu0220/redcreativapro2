/**
 * Error Pattern Analysis System
 * Analyzes error patterns to prevent recurring issues and provide intelligent suggestions
 */

import ErrorLogger, { AppError, ErrorType, ErrorSeverity } from './ErrorLogger';

export interface ErrorPattern {
  id: string;
  type: ErrorType;
  frequency: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  commonContext: Record<string, any>;
  affectedUsers: Set<string>;
  resolutionSuccess: number; // Percentage of successful resolutions
  averageResolutionTime: number; // In milliseconds
  preventionSuggestions: string[];
  relatedPatterns: string[];
}

export interface ErrorTrend {
  period: 'hour' | 'day' | 'week';
  errorCount: number;
  timestamp: Date;
  types: Record<ErrorType, number>;
  severity: Record<ErrorSeverity, number>;
}

export interface PreventionSuggestion {
  id: string;
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'user_action' | 'system_config' | 'code_change' | 'infrastructure';
  estimatedImpact: number; // 1-10 scale
  implementationComplexity: number; // 1-10 scale
}

export interface AnalysisReport {
  generatedAt: Date;
  timeRange: { start: Date; end: Date };
  totalErrors: number;
  uniquePatterns: number;
  topPatterns: ErrorPattern[];
  trends: ErrorTrend[];
  suggestions: PreventionSuggestion[];
  riskScore: number; // 1-100 scale
  healthScore: number; // 1-100 scale
}

class ErrorPatternAnalyzer {
  private static instance: ErrorPatternAnalyzer;
  private errorLogger: ErrorLogger;
  private patterns: Map<string, ErrorPattern> = new Map();
  private trends: ErrorTrend[] = [];
  private analysisInterval: NodeJS.Timeout | null = null;
  private readonly maxPatterns = 100;
  private readonly maxTrends = 168; // 1 week of hourly data

  private constructor() {
    this.errorLogger = ErrorLogger.getInstance();
    this.initializeAnalysis();
  }

  public static getInstance(): ErrorPatternAnalyzer {
    if (!ErrorPatternAnalyzer.instance) {
      ErrorPatternAnalyzer.instance = new ErrorPatternAnalyzer();
    }
    return ErrorPatternAnalyzer.instance;
  }

  private initializeAnalysis(): void {
    // Load existing patterns from storage
    this.loadPatternsFromStorage();
    
    // Listen for new errors
    this.errorLogger.onError((error) => {
      this.analyzeError(error);
    });

    // Start periodic analysis
    this.startPeriodicAnalysis();
  }

  private loadPatternsFromStorage(): void {
    try {
      const storedPatterns = localStorage.getItem('error_patterns');
      const storedTrends = localStorage.getItem('error_trends');
      
      if (storedPatterns) {
        const patterns = JSON.parse(storedPatterns);
        patterns.forEach((pattern: any) => {
          this.patterns.set(pattern.id, {
            ...pattern,
            firstOccurrence: new Date(pattern.firstOccurrence),
            lastOccurrence: new Date(pattern.lastOccurrence),
            affectedUsers: new Set(pattern.affectedUsers)
          });
        });
      }
      
      if (storedTrends) {
        this.trends = JSON.parse(storedTrends).map((trend: any) => ({
          ...trend,
          timestamp: new Date(trend.timestamp)
        }));
      }
    } catch (e) {
      console.error('Failed to load error patterns from storage:', e);
    }
  }

  private savePatternsToStorage(): void {
    try {
      const patternsArray = Array.from(this.patterns.values()).map(pattern => ({
        ...pattern,
        affectedUsers: Array.from(pattern.affectedUsers)
      }));
      
      localStorage.setItem('error_patterns', JSON.stringify(patternsArray));
      localStorage.setItem('error_trends', JSON.stringify(this.trends));
    } catch (e) {
      console.error('Failed to save error patterns to storage:', e);
    }
  }

  private startPeriodicAnalysis(): void {
    // Run analysis every 5 minutes
    this.analysisInterval = setInterval(() => {
      this.updateTrends();
      this.cleanupOldData();
      this.savePatternsToStorage();
    }, 5 * 60 * 1000);
  }

  public analyzeError(error: AppError): void {
    const patternId = this.generatePatternId(error);
    const existingPattern = this.patterns.get(patternId);

    if (existingPattern) {
      // Update existing pattern
      existingPattern.frequency++;
      existingPattern.lastOccurrence = error.timestamp;
      if (error.userId) {
        existingPattern.affectedUsers.add(error.userId);
      }
      
      // Update common context
      this.updateCommonContext(existingPattern, error);
    } else {
      // Create new pattern
      const newPattern: ErrorPattern = {
        id: patternId,
        type: error.type,
        frequency: 1,
        firstOccurrence: error.timestamp,
        lastOccurrence: error.timestamp,
        commonContext: this.extractContext(error),
        affectedUsers: new Set(error.userId ? [error.userId] : []),
        resolutionSuccess: 0,
        averageResolutionTime: 0,
        preventionSuggestions: this.generatePreventionSuggestions(error),
        relatedPatterns: []
      };
      
      this.patterns.set(patternId, newPattern);
    }

    // Update trends
    this.updateCurrentTrend(error);
    
    // Find related patterns
    this.findRelatedPatterns(patternId);
    
    // Cleanup if we have too many patterns
    if (this.patterns.size > this.maxPatterns) {
      this.cleanupOldPatterns();
    }
  }

  private generatePatternId(error: AppError): string {
    // Create a pattern ID based on error type and key characteristics
    const keyFactors = [
      error.type,
      this.normalizeMessage(error.message),
      error.context?.component || 'unknown',
      error.context?.action || 'unknown'
    ];
    
    return keyFactors.join('|');
  }

  private normalizeMessage(message: string): string {
    // Normalize error messages to group similar errors
    return message
      .toLowerCase()
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/['"]/g, '') // Remove quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  }

  private extractContext(error: AppError): Record<string, any> {
    const context: Record<string, any> = {};
    
    if (error.context) {
      // Extract relevant context fields
      const relevantFields = ['component', 'action', 'url', 'userAgent', 'viewport'];
      relevantFields.forEach(field => {
        if (error.context[field]) {
          context[field] = error.context[field];
        }
      });
    }
    
    // Add browser info
    context.browser = this.getBrowserInfo();
    context.timestamp_hour = error.timestamp.getHours();
    context.timestamp_day = error.timestamp.getDay();
    
    return context;
  }

  private updateCommonContext(pattern: ErrorPattern, error: AppError): void {
    const newContext = this.extractContext(error);
    
    // Update common context by finding intersection
    Object.keys(pattern.commonContext).forEach(key => {
      if (newContext[key] !== pattern.commonContext[key]) {
        // If values differ, remove from common context or make it a list
        if (Array.isArray(pattern.commonContext[key])) {
          if (!pattern.commonContext[key].includes(newContext[key])) {
            pattern.commonContext[key].push(newContext[key]);
          }
        } else {
          pattern.commonContext[key] = [pattern.commonContext[key], newContext[key]];
        }
      }
    });
  }

  private generatePreventionSuggestions(error: AppError): string[] {
    const suggestions: string[] = [];
    
    switch (error.type) {
      case 'network':
        suggestions.push(
          'Implementar retry automático con backoff exponencial',
          'Agregar indicadores de estado de conexión',
          'Cachear datos críticos localmente',
          'Optimizar timeouts de red'
        );
        break;
        
      case 'auth':
        suggestions.push(
          'Implementar renovación automática de tokens',
          'Agregar validación de sesión antes de operaciones críticas',
          'Mejorar manejo de expiración de sesión',
          'Implementar logout automático en caso de errores de auth'
        );
        break;
        
      case 'validation':
        suggestions.push(
          'Agregar validación en tiempo real',
          'Mejorar mensajes de error específicos',
          'Implementar validación del lado del cliente',
          'Agregar ejemplos de formato correcto'
        );
        break;
        
      case 'ai':
        suggestions.push(
          'Implementar fallback a modelos alternativos',
          'Agregar límites de rate limiting más inteligentes',
          'Optimizar prompts para reducir errores',
          'Implementar caché de respuestas de IA'
        );
        break;
        
      case 'storage':
        suggestions.push(
          'Implementar limpieza automática de datos antiguos',
          'Agregar compresión de datos',
          'Implementar backup automático',
          'Monitorear uso de almacenamiento'
        );
        break;
    }
    
    return suggestions;
  }

  private updateCurrentTrend(error: AppError): void {
    const now = new Date();
    const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    
    let currentTrend = this.trends.find(trend => 
      trend.timestamp.getTime() === currentHour.getTime()
    );
    
    if (!currentTrend) {
      currentTrend = {
        period: 'hour',
        errorCount: 0,
        timestamp: currentHour,
        types: {
          network: 0,
          auth: 0,
          validation: 0,
          ai: 0,
          storage: 0
        },
        severity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        }
      };
      this.trends.push(currentTrend);
    }
    
    currentTrend.errorCount++;
    currentTrend.types[error.type]++;
    currentTrend.severity[error.severity]++;
    
    // Keep only recent trends
    if (this.trends.length > this.maxTrends) {
      this.trends.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.trends = this.trends.slice(0, this.maxTrends);
    }
  }

  private findRelatedPatterns(patternId: string): void {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return;
    
    // Find patterns with similar characteristics
    const relatedPatterns: string[] = [];
    
    this.patterns.forEach((otherPattern, otherId) => {
      if (otherId === patternId) return;
      
      // Check for similarity
      const similarity = this.calculatePatternSimilarity(pattern, otherPattern);
      if (similarity > 0.7) { // 70% similarity threshold
        relatedPatterns.push(otherId);
      }
    });
    
    pattern.relatedPatterns = relatedPatterns;
  }

  private calculatePatternSimilarity(pattern1: ErrorPattern, pattern2: ErrorPattern): number {
    let similarity = 0;
    let factors = 0;
    
    // Type similarity
    if (pattern1.type === pattern2.type) {
      similarity += 0.4;
    }
    factors++;
    
    // Context similarity
    const commonContextKeys = Object.keys(pattern1.commonContext).filter(key =>
      Object.keys(pattern2.commonContext).includes(key)
    );
    
    if (commonContextKeys.length > 0) {
      const contextSimilarity = commonContextKeys.length / 
        Math.max(Object.keys(pattern1.commonContext).length, Object.keys(pattern2.commonContext).length);
      similarity += contextSimilarity * 0.3;
    }
    factors++;
    
    // Time proximity
    const timeDiff = Math.abs(pattern1.lastOccurrence.getTime() - pattern2.lastOccurrence.getTime());
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    if (hoursDiff < 24) { // Within 24 hours
      similarity += 0.3 * (1 - hoursDiff / 24);
    }
    factors++;
    
    return similarity / factors;
  }

  private updateTrends(): void {
    // This method can be expanded to create daily/weekly trends from hourly data
    // For now, we just maintain the hourly trends
  }

  private cleanupOldData(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Remove old trends
    this.trends = this.trends.filter(trend => trend.timestamp > oneWeekAgo);
    
    // Remove old patterns that haven't occurred recently
    const patternsToRemove: string[] = [];
    this.patterns.forEach((pattern, id) => {
      if (pattern.lastOccurrence < oneWeekAgo && pattern.frequency < 5) {
        patternsToRemove.push(id);
      }
    });
    
    patternsToRemove.forEach(id => this.patterns.delete(id));
  }

  private cleanupOldPatterns(): void {
    // Remove least frequent patterns
    const sortedPatterns = Array.from(this.patterns.entries())
      .sort((a, b) => a[1].frequency - b[1].frequency);
    
    const toRemove = sortedPatterns.slice(0, 20); // Remove 20 least frequent
    toRemove.forEach(([id]) => this.patterns.delete(id));
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  public generateAnalysisReport(timeRange?: { start: Date; end: Date }): AnalysisReport {
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    const range = timeRange || { start: defaultStart, end: now };
    
    // Filter patterns and trends within time range
    const relevantPatterns = Array.from(this.patterns.values()).filter(pattern =>
      pattern.lastOccurrence >= range.start && pattern.lastOccurrence <= range.end
    );
    
    const relevantTrends = this.trends.filter(trend =>
      trend.timestamp >= range.start && trend.timestamp <= range.end
    );
    
    // Calculate metrics
    const totalErrors = relevantTrends.reduce((sum, trend) => sum + trend.errorCount, 0);
    const topPatterns = relevantPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
    
    // Generate suggestions
    const suggestions = this.generateSystemSuggestions(relevantPatterns);
    
    // Calculate scores
    const riskScore = this.calculateRiskScore(relevantPatterns, relevantTrends);
    const healthScore = Math.max(0, 100 - riskScore);
    
    return {
      generatedAt: now,
      timeRange: range,
      totalErrors,
      uniquePatterns: relevantPatterns.length,
      topPatterns,
      trends: relevantTrends,
      suggestions,
      riskScore,
      healthScore
    };
  }

  private generateSystemSuggestions(patterns: ErrorPattern[]): PreventionSuggestion[] {
    const suggestions: PreventionSuggestion[] = [];
    
    // Analyze patterns to generate system-wide suggestions
    const typeFrequency = patterns.reduce((acc, pattern) => {
      acc[pattern.type] = (acc[pattern.type] || 0) + pattern.frequency;
      return acc;
    }, {} as Record<ErrorType, number>);
    
    // Generate suggestions based on most frequent error types
    Object.entries(typeFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([type, frequency], index) => {
        const suggestion = this.createSystemSuggestion(type as ErrorType, frequency, index);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      });
    
    return suggestions;
  }

  private createSystemSuggestion(type: ErrorType, frequency: number, priority: number): PreventionSuggestion | null {
    const baseSuggestions = {
      network: {
        title: 'Mejorar Manejo de Errores de Red',
        description: 'Implementar estrategias más robustas para manejar problemas de conectividad',
        category: 'system_config' as const,
        estimatedImpact: 8,
        implementationComplexity: 6
      },
      auth: {
        title: 'Optimizar Sistema de Autenticación',
        description: 'Mejorar la gestión de sesiones y renovación automática de tokens',
        category: 'code_change' as const,
        estimatedImpact: 9,
        implementationComplexity: 7
      },
      validation: {
        title: 'Mejorar Validación de Datos',
        description: 'Implementar validación más estricta y mensajes de error más claros',
        category: 'code_change' as const,
        estimatedImpact: 7,
        implementationComplexity: 4
      },
      ai: {
        title: 'Optimizar Integración con IA',
        description: 'Implementar fallbacks y mejor manejo de límites de API',
        category: 'system_config' as const,
        estimatedImpact: 8,
        implementationComplexity: 5
      },
      storage: {
        title: 'Optimizar Gestión de Almacenamiento',
        description: 'Implementar limpieza automática y mejor manejo de cuotas',
        category: 'system_config' as const,
        estimatedImpact: 6,
        implementationComplexity: 3
      }
    };
    
    const base = baseSuggestions[type];
    if (!base) return null;
    
    const priorityLevel = priority === 0 ? 'critical' : priority === 1 ? 'high' : 'medium';
    
    return {
      id: `suggestion_${type}_${Date.now()}`,
      title: base.title,
      description: `${base.description} (${frequency} errores detectados)`,
      actionable: true,
      priority: priorityLevel as 'low' | 'medium' | 'high' | 'critical',
      category: base.category,
      estimatedImpact: base.estimatedImpact,
      implementationComplexity: base.implementationComplexity
    };
  }

  private calculateRiskScore(patterns: ErrorPattern[], trends: ErrorTrend[]): number {
    let riskScore = 0;
    
    // Factor 1: Error frequency
    const totalErrors = trends.reduce((sum, trend) => sum + trend.errorCount, 0);
    riskScore += Math.min(40, totalErrors / 10); // Max 40 points for frequency
    
    // Factor 2: Critical errors
    const criticalErrors = trends.reduce((sum, trend) => sum + trend.severity.critical, 0);
    riskScore += criticalErrors * 5; // 5 points per critical error
    
    // Factor 3: Pattern diversity (more diverse = higher risk)
    const uniquePatterns = patterns.length;
    riskScore += Math.min(20, uniquePatterns); // Max 20 points for diversity
    
    // Factor 4: Recent error trend
    const recentTrends = trends.slice(-6); // Last 6 hours
    if (recentTrends.length >= 2) {
      const recentAvg = recentTrends.reduce((sum, trend) => sum + trend.errorCount, 0) / recentTrends.length;
      const olderTrends = trends.slice(-12, -6); // 6-12 hours ago
      if (olderTrends.length >= 2) {
        const olderAvg = olderTrends.reduce((sum, trend) => sum + trend.errorCount, 0) / olderTrends.length;
        if (recentAvg > olderAvg * 1.5) { // 50% increase
          riskScore += 20; // Increasing trend penalty
        }
      }
    }
    
    return Math.min(100, Math.round(riskScore));
  }

  public getTopPatterns(limit: number = 10): ErrorPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  public getPatternById(id: string): ErrorPattern | undefined {
    return this.patterns.get(id);
  }

  public getRecentTrends(hours: number = 24): ErrorTrend[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.trends
      .filter(trend => trend.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  public clearAnalysisData(): void {
    this.patterns.clear();
    this.trends = [];
    localStorage.removeItem('error_patterns');
    localStorage.removeItem('error_trends');
  }

  public exportAnalysisData(): string {
    const data = {
      patterns: Array.from(this.patterns.entries()).map(([id, pattern]) => ({
        id,
        ...pattern,
        affectedUsers: Array.from(pattern.affectedUsers)
      })),
      trends: this.trends,
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

export default ErrorPatternAnalyzer;