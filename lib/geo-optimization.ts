/**
 * GEO (Generative Engine Optimization) Core Infrastructure
 * Base interfaces and types for AI-powered search optimization
 */

import { geoLogger, geoPerformanceMonitor } from './geo-logger';
import { retryUtils } from './geo-retry';

// Core GEO Analysis Types
export interface GEOAnalysisResult {
  conversationalScore: number;
  semanticRichness: number;
  questionAnswerPatterns: QuestionPattern[];
  eeatSignals: EEATSignal[];
  improvementAreas: string[];
  overallScore: number;
}

export interface QuestionPattern {
  question: string;
  answer?: string;
  confidence: number;
  type: 'explicit' | 'implicit' | 'suggested';
  position: number;
}

export interface EEATSignal {
  type: 'experience' | 'expertise' | 'authoritativeness' | 'trustworthiness';
  strength: number;
  description: string;
  suggestions: string[];
}

export interface OptimizationSuggestion {
  id: string;
  type: 'conversational' | 'semantic' | 'structured' | 'eeat' | 'content' | 'structure' | 'schema' | 'technical';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
}

export interface GEOScore {
  overall: number;
  conversational: number;
  semantic: number;
  structure: number;
  eeat: number;
  breakdown: {
    [key: string]: number;
  };
}

// Content Analysis Engine Interface
export interface ContentAnalysisEngine {
  analyzeContent(content: string): Promise<GEOAnalysisResult>;
  getOptimizationSuggestions(analysis: GEOAnalysisResult): OptimizationSuggestion[];
  calculateGEOScore(content: string): Promise<GEOScore>;
}

// GEO Optimization Configuration
export interface GEOConfig {
  enableRealTimeAnalysis: boolean;
  analysisDebounceMs: number;
  scoringWeights: {
    conversational: number;
    semantic: number;
    structure: number;
    eeat: number;
  };
  platforms: {
    googleSGE: boolean;
    bingAI: boolean;
    chatGPT: boolean;
  };
}

// Performance Tracking Types
export interface GEOPerformance {
  contentId: string;
  platform: string;
  appearances: number;
  citations: number;
  semanticRelevance: number;
  trackingPeriod: {
    start: Date;
    end: Date;
  };
}

export interface PerformanceMetrics {
  generativeAppearances: number;
  semanticRelevanceScore: number;
  aiCitationCount: number;
  performanceComparison: {
    seoScore: number;
    geoScore: number;
    improvement: number;
  };
  improvementRecommendations: string[];
}

// Content Optimization Model
export interface GEOOptimization {
  id: string;
  contentId: string;
  optimizationType: 'conversational' | 'semantic' | 'structured' | 'eeat';
  suggestions: OptimizationSuggestion[];
  implementedSuggestions: string[];
  geoScore: number;
  lastUpdated: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

// Error Types
export class GEOAnalysisError extends Error {
  constructor(
    public analysisType: string,
    public partialResults: Partial<GEOAnalysisResult>,
    message: string
  ) {
    super(message);
    this.name = 'GEOAnalysisError';
  }
}

export class GEOConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GEOConfigurationError';
  }
}

/**
 * Core GEO Scoring Algorithms and Metrics
 */
export class GEOScorer {
  private config: GEOConfig;

  constructor(config: GEOConfig) {
    this.config = config;
  }

  /**
   * Calculate overall GEO score based on multiple factors
   */
  calculateOverallScore(analysis: GEOAnalysisResult): number {
    const weights = this.config.scoringWeights;
    
    const conversationalScore = this.normalizeScore(analysis.conversationalScore);
    const semanticScore = this.normalizeScore(analysis.semanticRichness);
    const structureScore = this.calculateStructureScore(analysis);
    const eeatScore = this.calculateEEATScore(analysis.eeatSignals);

    const weightedScore = 
      (conversationalScore * weights.conversational) +
      (semanticScore * weights.semantic) +
      (structureScore * weights.structure) +
      (eeatScore * weights.eeat);

    return Math.round(weightedScore * 100) / 100;
  }

  /**
   * Calculate conversational language score
   */
  calculateConversationalScore(content: string): number {
    const indicators = {
      questions: (content.match(/\?/g) || []).length,
      personalPronouns: (content.match(/\b(you|your|we|our|I|my)\b/gi) || []).length,
      contractions: (content.match(/\b\w+[''](?:re|ve|ll|d|t|s)\b/gi) || []).length,
      conversationalPhrases: (content.match(/\b(let's|here's|that's|what's|how to|why)\b/gi) || []).length,
    };

    const wordCount = content.split(/\s+/).length;
    const conversationalDensity = 
      (indicators.questions * 2 + 
       indicators.personalPronouns + 
       indicators.contractions + 
       indicators.conversationalPhrases * 1.5) / wordCount;

    return Math.min(conversationalDensity * 100, 100);
  }

  /**
   * Calculate semantic richness score
   */
  calculateSemanticScore(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;
    
    // Check for semantic indicators
    const semanticIndicators = {
      synonyms: this.detectSynonymUsage(content),
      relatedTerms: this.detectRelatedTerms(content),
      contextualDepth: this.assessContextualDepth(content),
    };

    const semanticScore = 
      (lexicalDiversity * 30) +
      (semanticIndicators.synonyms * 25) +
      (semanticIndicators.relatedTerms * 25) +
      (semanticIndicators.contextualDepth * 20);

    return Math.min(semanticScore, 100);
  }

  /**
   * Calculate structure score based on Q&A patterns and organization
   */
  private calculateStructureScore(analysis: GEOAnalysisResult): number {
    const questionPatterns = analysis.questionAnswerPatterns;
    const explicitQA = questionPatterns.filter(p => p.type === 'explicit').length;
    const implicitQA = questionPatterns.filter(p => p.type === 'implicit').length;
    
    const structureScore = 
      (explicitQA * 15) +
      (implicitQA * 10) +
      (analysis.improvementAreas.length > 0 ? 0 : 25);

    return Math.min(structureScore, 100);
  }

  /**
   * Calculate EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) score
   */
  private calculateEEATScore(signals: EEATSignal[]): number {
    if (signals.length === 0) return 0;

    const typeScores = {
      experience: 0,
      expertise: 0,
      authoritativeness: 0,
      trustworthiness: 0,
    };

    signals.forEach(signal => {
      typeScores[signal.type] = Math.max(typeScores[signal.type], signal.strength);
    });

    return (typeScores.experience + typeScores.expertise + 
            typeScores.authoritativeness + typeScores.trustworthiness) / 4;
  }

  /**
   * Normalize score to 0-100 range
   */
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect synonym usage in content
   */
  private detectSynonymUsage(content: string): number {
    // Simplified synonym detection - in production, use NLP library
    const commonSynonymPairs = [
      ['big', 'large', 'huge', 'massive'],
      ['small', 'tiny', 'little', 'minor'],
      ['good', 'great', 'excellent', 'outstanding'],
      ['bad', 'poor', 'terrible', 'awful'],
    ];

    let synonymScore = 0;
    const lowerContent = content.toLowerCase();

    commonSynonymPairs.forEach(synonyms => {
      const foundSynonyms = synonyms.filter(word => 
        lowerContent.includes(word)
      );
      if (foundSynonyms.length > 1) {
        synonymScore += foundSynonyms.length * 5;
      }
    });

    return Math.min(synonymScore, 100);
  }

  /**
   * Detect related terms and topical coverage
   */
  private detectRelatedTerms(content: string): number {
    // Simplified related terms detection
    const topicalClusters = [
      ['technology', 'digital', 'software', 'computer', 'online'],
      ['business', 'company', 'market', 'customer', 'revenue'],
      ['health', 'medical', 'treatment', 'patient', 'wellness'],
    ];

    let relatedTermsScore = 0;
    const lowerContent = content.toLowerCase();

    topicalClusters.forEach(cluster => {
      const foundTerms = cluster.filter(term => 
        lowerContent.includes(term)
      );
      if (foundTerms.length > 2) {
        relatedTermsScore += foundTerms.length * 8;
      }
    });

    return Math.min(relatedTermsScore, 100);
  }

  /**
   * Assess contextual depth of content
   */
  private assessContextualDepth(content: string): number {
    const depthIndicators = {
      examples: (content.match(/\b(for example|such as|like|including)\b/gi) || []).length,
      explanations: (content.match(/\b(because|since|due to|as a result)\b/gi) || []).length,
      comparisons: (content.match(/\b(compared to|versus|unlike|similar to)\b/gi) || []).length,
      details: (content.match(/\b(specifically|particularly|especially|notably)\b/gi) || []).length,
    };

    const totalIndicators = Object.values(depthIndicators).reduce((sum, count) => sum + count, 0);
    const wordCount = content.split(/\s+/).length;
    
    return Math.min((totalIndicators / wordCount) * 1000, 100);
  }
}

/**
 * Default GEO Configuration
 */
export const DEFAULT_GEO_CONFIG: GEOConfig = {
  enableRealTimeAnalysis: true,
  analysisDebounceMs: 500,
  scoringWeights: {
    conversational: 0.3,
    semantic: 0.25,
    structure: 0.25,
    eeat: 0.2,
  },
  platforms: {
    googleSGE: true,
    bingAI: true,
    chatGPT: true,
  },
};/**

 * Modular GEO Optimization Architecture
 * Independent components that can work together or separately
 */

/**
 * Base class for all GEO optimization modules
 */
export abstract class GEOModule {
  protected config: GEOConfig;
  protected name: string;

  constructor(name: string, config: GEOConfig) {
    this.name = name;
    this.config = config;
  }

  abstract analyze(content: string): Promise<any>;
  abstract getSuggestions(analysis: any): OptimizationSuggestion[];
  
  getName(): string {
    return this.name;
  }

  isEnabled(): boolean {
    return true; // Override in specific modules if needed
  }
}

/**
 * Conversational Language Optimization Module
 */
export class ConversationalModule extends GEOModule {
  constructor(config: GEOConfig) {
    super('conversational', config);
  }

  async analyze(content: string): Promise<{
    score: number;
    patterns: string[];
    opportunities: string[];
  }> {
    const scorer = new GEOScorer(this.config);
    const score = scorer.calculateConversationalScore(content);
    
    const patterns = this.identifyConversationalPatterns(content);
    const opportunities = this.findConversationalOpportunities(content);

    return { score, patterns, opportunities };
  }

  getSuggestions(analysis: any): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (analysis.score < 50) {
      suggestions.push({
        id: 'conv-1',
        type: 'conversational',
        priority: 'high',
        title: 'Add more conversational language',
        description: 'Use personal pronouns, questions, and natural speech patterns',
        implementation: 'Replace formal language with conversational alternatives',
        expectedImpact: 25,
        effort: 'medium',
      });
    }

    analysis.opportunities.forEach((opportunity: string, index: number) => {
      suggestions.push({
        id: `conv-opp-${index}`,
        type: 'conversational',
        priority: 'medium',
        title: 'Conversational opportunity',
        description: opportunity,
        implementation: 'Implement suggested conversational improvement',
        expectedImpact: 15,
        effort: 'low',
      });
    });

    return suggestions;
  }

  private identifyConversationalPatterns(content: string): string[] {
    const patterns: string[] = [];
    
    if (content.includes('?')) patterns.push('Questions present');
    if (/\b(you|your)\b/gi.test(content)) patterns.push('Direct address');
    if (/\b\w+[''](?:re|ve|ll|d|t|s)\b/gi.test(content)) patterns.push('Contractions used');
    
    return patterns;
  }

  private findConversationalOpportunities(content: string): string[] {
    const opportunities: string[] = [];
    
    if (!/\?/.test(content)) {
      opportunities.push('Add questions to engage readers');
    }
    
    if (!/\b(you|your)\b/gi.test(content)) {
      opportunities.push('Use direct address (you, your) to connect with readers');
    }
    
    if (content.split('.').length > 5 && !/\b(let\'s|here\'s|what\'s)\b/gi.test(content)) {
      opportunities.push('Add conversational phrases to break up formal tone');
    }

    return opportunities;
  }
}

/**
 * Semantic Richness Optimization Module
 */
export class SemanticModule extends GEOModule {
  constructor(config: GEOConfig) {
    super('semantic', config);
  }

  async analyze(content: string): Promise<{
    score: number;
    diversity: number;
    relatedTerms: string[];
    missingContext: string[];
  }> {
    const scorer = new GEOScorer(this.config);
    const score = scorer.calculateSemanticScore(content);
    
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const diversity = uniqueWords.size / words.length;
    
    const relatedTerms = this.extractRelatedTerms(content);
    const missingContext = this.identifyMissingContext(content);

    return { score, diversity, relatedTerms, missingContext };
  }

  getSuggestions(analysis: any): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (analysis.score < 60) {
      suggestions.push({
        id: 'sem-1',
        type: 'semantic',
        priority: 'high',
        title: 'Improve semantic richness',
        description: 'Add related terms, synonyms, and contextual information',
        implementation: 'Include more varied vocabulary and related concepts',
        expectedImpact: 30,
        effort: 'medium',
      });
    }

    if (analysis.diversity < 0.5) {
      suggestions.push({
        id: 'sem-2',
        type: 'semantic',
        priority: 'medium',
        title: 'Increase lexical diversity',
        description: 'Use more varied vocabulary to avoid repetition',
        implementation: 'Replace repeated words with synonyms',
        expectedImpact: 20,
        effort: 'low',
      });
    }

    return suggestions;
  }

  private extractRelatedTerms(content: string): string[] {
    // Simplified related terms extraction
    const terms: string[] = [];
    const lowerContent = content.toLowerCase();
    
    // This would be enhanced with NLP libraries in production
    const commonRelations = [
      { term: 'technology', related: ['digital', 'software', 'innovation'] },
      { term: 'business', related: ['company', 'market', 'strategy'] },
    ];

    commonRelations.forEach(relation => {
      if (lowerContent.includes(relation.term)) {
        terms.push(...relation.related);
      }
    });

    return terms;
  }

  private identifyMissingContext(content: string): string[] {
    const missing: string[] = [];
    
    if (!/\b(for example|such as)\b/gi.test(content)) {
      missing.push('Examples to illustrate points');
    }
    
    if (!/\b(because|since|due to)\b/gi.test(content)) {
      missing.push('Explanatory context for claims');
    }

    return missing;
  }
}

/**
 * Main GEO Optimization Engine
 * Coordinates all modules and provides unified interface
 */
export class GEOOptimizationEngine implements ContentAnalysisEngine {
  private modules: Map<string, GEOModule>;
  private scorer: GEOScorer;
  private config: GEOConfig;

  constructor(config: GEOConfig = DEFAULT_GEO_CONFIG) {
    this.config = config;
    this.scorer = new GEOScorer(config);
    this.modules = new Map();
    
    // Initialize core modules
    this.registerModule(new ConversationalModule(config));
    this.registerModule(new SemanticModule(config));
  }

  registerModule(module: GEOModule): void {
    this.modules.set(module.getName(), module);
  }

  async analyzeContent(content: string): Promise<GEOAnalysisResult> {
    const startTime = Date.now();
    
    geoLogger.info('GEOOptimizationEngine', 'analyzeContent', 'Starting content analysis', {
      contentLength: content.length,
      moduleCount: this.modules.size
    });

    try {
      // Validate input
      if (!content || content.trim().length === 0) {
        throw new GEOAnalysisError('validation', {}, 'Content cannot be empty');
      }

      if (content.length > 100000) {
        geoLogger.warn('GEOOptimizationEngine', 'analyzeContent', 'Content length exceeds recommended limit', {
          contentLength: content.length,
          limit: 100000
        });
      }

      const conversationalModule = this.modules.get('conversational') as ConversationalModule;
      const semanticModule = this.modules.get('semantic') as SemanticModule;

      // Execute analysis with retry logic and performance monitoring
      const [conversationalAnalysis, semanticAnalysis] = await retryUtils.analysisOperation(
        async () => {
          return Promise.all([
            geoLogger.timeOperation('ConversationalModule', 'analyze', async () => {
              return conversationalModule?.analyze(content) || { score: 0, patterns: [], opportunities: [] };
            }),
            geoLogger.timeOperation('SemanticModule', 'analyze', async () => {
              return semanticModule?.analyze(content) || { score: 0, diversity: 0, relatedTerms: [], missingContext: [] };
            })
          ]);
        },
        'module_analysis'
      );

      // Basic question pattern detection with error handling
      const questionPatterns = await geoLogger.timeOperation('GEOOptimizationEngine', 'extractQuestionPatterns', async () => {
        return this.extractQuestionPatterns(content);
      });
      
      // Basic EEAT signal detection with error handling
      const eeatSignals = await geoLogger.timeOperation('GEOOptimizationEngine', 'detectEEATSignals', async () => {
        return this.detectEEATSignals(content);
      });
      
      // Identify improvement areas
      const improvementAreas = this.identifyImprovementAreas(
        conversationalAnalysis,
        semanticAnalysis
      );

      const overallScore = this.scorer.calculateOverallScore({
        conversationalScore: conversationalAnalysis.score,
        semanticRichness: semanticAnalysis.score,
        questionAnswerPatterns: questionPatterns,
        eeatSignals,
        improvementAreas,
        overallScore: 0, // Will be calculated
      });

      const duration = Date.now() - startTime;
      
      // Record performance metrics
      geoPerformanceMonitor.recordMetric('analysis_duration', duration);
      geoPerformanceMonitor.recordMetric('content_length', content.length);
      geoPerformanceMonitor.recordMetric('overall_score', overallScore);

      geoLogger.info('GEOOptimizationEngine', 'analyzeContent', 'Content analysis completed successfully', {
        duration: `${duration}ms`,
        overallScore,
        questionPatterns: questionPatterns.length,
        eeatSignals: eeatSignals.length,
        improvementAreas: improvementAreas.length
      });

      return {
        conversationalScore: conversationalAnalysis.score,
        semanticRichness: semanticAnalysis.score,
        questionAnswerPatterns: questionPatterns,
        eeatSignals,
        improvementAreas,
        overallScore,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      geoLogger.error('GEOOptimizationEngine', 'analyzeContent', 'Content analysis failed', error as Error, {
        duration: `${duration}ms`,
        contentLength: content.length
      });

      // Record failure metrics
      geoPerformanceMonitor.recordMetric('analysis_failures', 1);

      throw new GEOAnalysisError(
        'full_analysis',
        { conversationalScore: 0, semanticRichness: 0, questionAnswerPatterns: [], eeatSignals: [], improvementAreas: [] },
        `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getOptimizationSuggestions(analysis: GEOAnalysisResult): OptimizationSuggestion[] {
    const allSuggestions: OptimizationSuggestion[] = [];

    // Get suggestions from all modules
    this.modules.forEach(module => {
      try {
        const moduleSuggestions = module.getSuggestions(analysis);
        allSuggestions.push(...moduleSuggestions);
      } catch (error) {
        console.warn(`Module ${module.getName()} failed to generate suggestions:`, error);
      }
    });

    // Sort by priority and expected impact
    return allSuggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.expectedImpact - a.expectedImpact;
    });
  }

  async calculateGEOScore(content: string): Promise<GEOScore> {
    const analysis = await this.analyzeContent(content);
    
    return {
      overall: analysis.overallScore,
      conversational: analysis.conversationalScore,
      semantic: analysis.semanticRichness,
      structure: this.calculateStructureScore(analysis.questionAnswerPatterns),
      eeat: this.calculateEEATScore(analysis.eeatSignals),
      breakdown: {
        'Question Patterns': analysis.questionAnswerPatterns.length * 10,
        'EEAT Signals': analysis.eeatSignals.length * 15,
        'Improvement Areas': Math.max(0, 100 - (analysis.improvementAreas.length * 20)),
      },
    };
  }

  private extractQuestionPatterns(content: string): QuestionPattern[] {
    const patterns: QuestionPattern[] = [];
    const sentences = content.split(/[.!?]+/);
    
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.includes('?')) {
        patterns.push({
          question: trimmed + '?',
          confidence: 0.9,
          type: 'explicit',
          position: index,
        });
      } else if (trimmed.toLowerCase().startsWith('how') || 
                 trimmed.toLowerCase().startsWith('what') ||
                 trimmed.toLowerCase().startsWith('why')) {
        patterns.push({
          question: trimmed + '?',
          confidence: 0.7,
          type: 'implicit',
          position: index,
        });
      }
    });

    return patterns;
  }

  private detectEEATSignals(content: string): EEATSignal[] {
    const signals: EEATSignal[] = [];
    
    // Experience signals
    if (/\b(I have|my experience|in my|years of)\b/gi.test(content)) {
      signals.push({
        type: 'experience',
        strength: 70,
        description: 'Personal experience mentioned',
        suggestions: ['Add more specific examples of your experience'],
      });
    }

    // Expertise signals
    if (/\b(expert|certified|qualified|professional)\b/gi.test(content)) {
      signals.push({
        type: 'expertise',
        strength: 80,
        description: 'Expertise credentials mentioned',
        suggestions: ['Include specific certifications or qualifications'],
      });
    }

    // Authority signals
    if (/\b(according to|research shows|studies indicate)\b/gi.test(content)) {
      signals.push({
        type: 'authoritativeness',
        strength: 75,
        description: 'Authoritative sources referenced',
        suggestions: ['Add links to the referenced sources'],
      });
    }

    // Trust signals
    if (/\b(guarantee|promise|commitment|reliable)\b/gi.test(content)) {
      signals.push({
        type: 'trustworthiness',
        strength: 60,
        description: 'Trust-building language used',
        suggestions: ['Add testimonials or reviews to strengthen trust'],
      });
    }

    return signals;
  }

  private identifyImprovementAreas(conversationalAnalysis: any, semanticAnalysis: any): string[] {
    const areas: string[] = [];
    
    if (conversationalAnalysis.score < 50) {
      areas.push('Conversational language needs improvement');
    }
    
    if (semanticAnalysis.score < 60) {
      areas.push('Semantic richness could be enhanced');
    }
    
    if (semanticAnalysis.diversity < 0.5) {
      areas.push('Lexical diversity is low');
    }

    return areas;
  }

  private calculateStructureScore(patterns: QuestionPattern[]): number {
    const explicitCount = patterns.filter(p => p.type === 'explicit').length;
    const implicitCount = patterns.filter(p => p.type === 'implicit').length;
    
    return Math.min((explicitCount * 15) + (implicitCount * 10), 100);
  }

  private calculateEEATScore(signals: EEATSignal[]): number {
    if (signals.length === 0) return 0;
    
    const avgStrength = signals.reduce((sum, signal) => sum + signal.strength, 0) / signals.length;
    return avgStrength;
  }
}

// Export default instance for use in hooks
export const geoOptimizer = new GEOOptimizationEngine();