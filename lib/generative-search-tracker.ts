/**
 * Generative Search Appearance Tracker
 * 
 * Tracks content appearance in AI-generated responses and measures semantic relevance
 * for GEO performance monitoring.
 */

export interface GenerativeSearchAppearance {
  id: string;
  contentId: string;
  platform: 'google-sge' | 'bing-ai' | 'chatgpt' | 'claude' | 'perplexity' | 'other';
  query: string;
  response: string;
  citationFound: boolean;
  semanticRelevance: number;
  timestamp: Date;
  responseType: 'direct-citation' | 'paraphrase' | 'semantic-match' | 'no-match';
  confidence: number;
}

export interface SemanticRelevanceScore {
  contentId: string;
  query: string;
  relevanceScore: number; // 0-1 scale
  keywordMatches: string[];
  semanticMatches: string[];
  contextualRelevance: number;
  calculatedAt: Date;
}

export interface PerformanceComparison {
  contentId: string;
  period: {
    start: Date;
    end: Date;
  };
  geoMetrics: {
    generativeAppearances: number;
    averageSemanticRelevance: number;
    citationRate: number;
    platformDistribution: Record<string, number>;
  };
  traditionalSeoMetrics: {
    organicClicks: number;
    impressions: number;
    averagePosition: number;
    clickThroughRate: number;
  };
  performanceRatio: number; // GEO performance vs traditional SEO
}

export class GenerativeSearchTracker {
  private appearances: Map<string, GenerativeSearchAppearance[]> = new Map();
  private semanticScores: Map<string, SemanticRelevanceScore[]> = new Map();

  /**
   * Track a content appearance in generative search results
   */
  async trackAppearance(appearance: Omit<GenerativeSearchAppearance, 'id' | 'timestamp'>): Promise<string> {
    const id = this.generateId();
    const fullAppearance: GenerativeSearchAppearance = {
      ...appearance,
      id,
      timestamp: new Date()
    };

    const contentAppearances = this.appearances.get(appearance.contentId) || [];
    contentAppearances.push(fullAppearance);
    this.appearances.set(appearance.contentId, contentAppearances);

    // Calculate semantic relevance if not provided
    if (!appearance.semanticRelevance) {
      const semanticScore = await this.calculateSemanticRelevance(
        appearance.contentId,
        appearance.query,
        appearance.response
      );
      fullAppearance.semanticRelevance = semanticScore.relevanceScore;
    }

    return id;
  }

  /**
   * Calculate semantic relevance between content and AI response
   */
  async calculateSemanticRelevance(
    contentId: string,
    query: string,
    response: string
  ): Promise<SemanticRelevanceScore> {
    // Get content for comparison
    const content = await this.getContentById(contentId);
    
    // Calculate keyword matches
    const keywordMatches = this.findKeywordMatches(content, response);
    
    // Calculate semantic similarity using simple text analysis
    const semanticMatches = this.findSemanticMatches(content, response);
    
    // Calculate contextual relevance
    const contextualRelevance = this.calculateContextualRelevance(query, content, response);
    
    // Combine scores with weights
    const relevanceScore = this.combineRelevanceScores(
      keywordMatches.length,
      semanticMatches.length,
      contextualRelevance
    );

    const semanticScore: SemanticRelevanceScore = {
      contentId,
      query,
      relevanceScore,
      keywordMatches,
      semanticMatches,
      contextualRelevance,
      calculatedAt: new Date()
    };

    // Store the score
    const contentScores = this.semanticScores.get(contentId) || [];
    contentScores.push(semanticScore);
    this.semanticScores.set(contentId, contentScores);

    return semanticScore;
  }

  /**
   * Get performance comparison between GEO and traditional SEO metrics
   */
  async getPerformanceComparison(
    contentId: string,
    startDate: Date,
    endDate: Date,
    traditionalMetrics?: {
      organicClicks: number;
      impressions: number;
      averagePosition: number;
    }
  ): Promise<PerformanceComparison> {
    const appearances = this.getAppearancesInPeriod(contentId, startDate, endDate);
    const semanticScores = this.getSemanticScoresInPeriod(contentId, startDate, endDate);

    // Calculate GEO metrics
    const geoMetrics = {
      generativeAppearances: appearances.length,
      averageSemanticRelevance: this.calculateAverageSemanticRelevance(semanticScores),
      citationRate: this.calculateCitationRate(appearances),
      platformDistribution: this.calculatePlatformDistribution(appearances)
    };

    // Use provided traditional metrics or defaults
    const traditionalSeoMetrics = traditionalMetrics || {
      organicClicks: 0,
      impressions: 0,
      averagePosition: 0,
      clickThroughRate: 0
    };

    // Calculate performance ratio
    const performanceRatio = this.calculatePerformanceRatio(geoMetrics, traditionalSeoMetrics);

    return {
      contentId,
      period: { start: startDate, end: endDate },
      geoMetrics,
      traditionalSeoMetrics: {
        ...traditionalMetrics,
        clickThroughRate: traditionalMetrics?.impressions 
          ? (traditionalMetrics.organicClicks / traditionalMetrics.impressions) * 100 
          : 0
      },
      performanceRatio
    };
  }

  /**
   * Get all appearances for a content piece
   */
  getContentAppearances(contentId: string): GenerativeSearchAppearance[] {
    return this.appearances.get(contentId) || [];
  }

  /**
   * Get semantic scores for a content piece
   */
  getContentSemanticScores(contentId: string): SemanticRelevanceScore[] {
    return this.semanticScores.get(contentId) || [];
  }

  /**
   * Get appearances within a date range
   */
  private getAppearancesInPeriod(contentId: string, start: Date, end: Date): GenerativeSearchAppearance[] {
    const appearances = this.appearances.get(contentId) || [];
    return appearances.filter(app => 
      app.timestamp >= start && app.timestamp <= end
    );
  }

  /**
   * Get semantic scores within a date range
   */
  private getSemanticScoresInPeriod(contentId: string, start: Date, end: Date): SemanticRelevanceScore[] {
    const scores = this.semanticScores.get(contentId) || [];
    return scores.filter(score => 
      score.calculatedAt >= start && score.calculatedAt <= end
    );
  }

  /**
   * Find keyword matches between content and response
   */
  private findKeywordMatches(content: string, response: string): string[] {
    const contentWords = this.extractKeywords(content);
    const responseWords = this.extractKeywords(response);
    
    return contentWords.filter(word => 
      responseWords.some(respWord => 
        respWord.toLowerCase().includes(word.toLowerCase()) ||
        word.toLowerCase().includes(respWord.toLowerCase())
      )
    );
  }

  /**
   * Find semantic matches using simple similarity
   */
  private findSemanticMatches(content: string, response: string): string[] {
    // Simple semantic matching based on sentence similarity
    const contentSentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const responseSentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    const matches: string[] = [];
    
    for (const contentSent of contentSentences) {
      for (const responseSent of responseSentences) {
        const similarity = this.calculateTextSimilarity(contentSent, responseSent);
        if (similarity > 0.3) { // 30% similarity threshold
          matches.push(contentSent.trim());
          break;
        }
      }
    }
    
    return matches;
  }

  /**
   * Calculate contextual relevance between query, content, and response
   */
  private calculateContextualRelevance(query: string, content: string, response: string): number {
    const queryKeywords = this.extractKeywords(query);
    const contentKeywords = this.extractKeywords(content);
    const responseKeywords = this.extractKeywords(response);
    
    // Calculate how well the content matches the query context
    const queryContentMatch = queryKeywords.filter(keyword =>
      contentKeywords.some(ck => ck.toLowerCase().includes(keyword.toLowerCase()))
    ).length / queryKeywords.length;
    
    // Calculate how well the response uses content context
    const contentResponseMatch = contentKeywords.filter(keyword =>
      responseKeywords.some(rk => rk.toLowerCase().includes(keyword.toLowerCase()))
    ).length / Math.max(contentKeywords.length, 1);
    
    return (queryContentMatch + contentResponseMatch) / 2;
  }

  /**
   * Combine relevance scores with appropriate weights
   */
  private combineRelevanceScores(
    keywordMatchCount: number,
    semanticMatchCount: number,
    contextualRelevance: number
  ): number {
    // Normalize keyword matches (assume max 10 meaningful matches)
    const normalizedKeywords = Math.min(keywordMatchCount / 10, 1);
    
    // Normalize semantic matches (assume max 5 meaningful matches)
    const normalizedSemantic = Math.min(semanticMatchCount / 5, 1);
    
    // Weighted combination
    return (
      normalizedKeywords * 0.3 +
      normalizedSemantic * 0.4 +
      contextualRelevance * 0.3
    );
  }

  /**
   * Calculate average semantic relevance from scores
   */
  private calculateAverageSemanticRelevance(scores: SemanticRelevanceScore[]): number {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score.relevanceScore, 0);
    return sum / scores.length;
  }

  /**
   * Calculate citation rate from appearances
   */
  private calculateCitationRate(appearances: GenerativeSearchAppearance[]): number {
    if (appearances.length === 0) return 0;
    const citations = appearances.filter(app => app.citationFound).length;
    return citations / appearances.length;
  }

  /**
   * Calculate platform distribution
   */
  private calculatePlatformDistribution(appearances: GenerativeSearchAppearance[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const appearance of appearances) {
      distribution[appearance.platform] = (distribution[appearance.platform] || 0) + 1;
    }
    
    return distribution;
  }

  /**
   * Calculate performance ratio between GEO and traditional SEO
   */
  private calculatePerformanceRatio(
    geoMetrics: any,
    traditionalMetrics: any
  ): number {
    // Simple ratio calculation - can be enhanced with more sophisticated algorithms
    const geoScore = (
      geoMetrics.generativeAppearances * 0.4 +
      geoMetrics.averageSemanticRelevance * 100 * 0.3 +
      geoMetrics.citationRate * 100 * 0.3
    );
    
    const traditionalScore = (
      traditionalMetrics.organicClicks * 0.4 +
      (traditionalMetrics.impressions / 100) * 0.3 +
      (100 - traditionalMetrics.averagePosition) * 0.3
    );
    
    return traditionalScore > 0 ? geoScore / traditionalScore : geoScore;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - remove common words and short words
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 20); // Limit to top 20 keywords
  }

  /**
   * Calculate text similarity using simple Jaccard similarity
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.extractKeywords(text1));
    const words2 = new Set(this.extractKeywords(text2));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Get content by ID (placeholder - should integrate with actual content system)
   */
  private async getContentById(contentId: string): Promise<string> {
    // This should integrate with your actual content management system
    // For now, return a placeholder
    return `Content for ${contentId}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `gst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const generativeSearchTracker = new GenerativeSearchTracker();