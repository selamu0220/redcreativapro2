/**
 * Keyword Research and Discovery Service
 * Handles competitor analysis, search volume tracking, and opportunity scoring
 */

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  opportunityScore: number;
  relatedKeywords: string[];
  competitorUrls: string[];
  currentRanking?: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface KeywordCluster {
  id: string;
  primaryKeyword: string;
  keywords: KeywordData[];
  theme: string;
  totalSearchVolume: number;
  averageDifficulty: number;
  opportunityScore: number;
  contentGaps: string[];
}

export interface CompetitorAnalysis {
  domain: string;
  keywords: KeywordData[];
  topPages: {
    url: string;
    keywords: string[];
    estimatedTraffic: number;
  }[];
  keywordGaps: string[];
}

export class KeywordResearchService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.KEYWORD_RESEARCH_API_KEY || '';
    this.baseUrl = 'https://api.semrush.com'; // Can be configured for different providers
  }

  /**
   * Discover keywords from seed terms using multiple sources
   */
  async discoverKeywords(seedKeywords: string[], options: {
    includeRelated?: boolean;
    includeSuggestions?: boolean;
    includeQuestions?: boolean;
    maxResults?: number;
  } = {}): Promise<KeywordData[]> {
    const {
      includeRelated = true,
      includeSuggestions = true,
      includeQuestions = true,
      maxResults = 1000
    } = options;

    const discoveredKeywords: KeywordData[] = [];

    for (const seed of seedKeywords) {
      // Get related keywords
      if (includeRelated) {
        const related = await this.getRelatedKeywords(seed);
        discoveredKeywords.push(...related);
      }

      // Get search suggestions
      if (includeSuggestions) {
        const suggestions = await this.getSearchSuggestions(seed);
        discoveredKeywords.push(...suggestions);
      }

      // Get question-based keywords
      if (includeQuestions) {
        const questions = await this.getQuestionKeywords(seed);
        discoveredKeywords.push(...questions);
      }
    }

    // Remove duplicates and calculate opportunity scores
    const uniqueKeywords = this.deduplicateKeywords(discoveredKeywords);
    const scoredKeywords = await this.calculateOpportunityScores(uniqueKeywords);

    return scoredKeywords
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, maxResults);
  }

  /**
   * Analyze competitor keywords and find gaps
   */
  async analyzeCompetitors(competitors: string[], targetDomain: string): Promise<CompetitorAnalysis[]> {
    const analyses: CompetitorAnalysis[] = [];

    for (const competitor of competitors) {
      try {
        const competitorKeywords = await this.getCompetitorKeywords(competitor);
        const targetKeywords = await this.getCompetitorKeywords(targetDomain);
        
        const keywordGaps = this.findKeywordGaps(competitorKeywords, targetKeywords);
        const topPages = await this.getTopPages(competitor);

        analyses.push({
          domain: competitor,
          keywords: competitorKeywords,
          topPages,
          keywordGaps
        });
      } catch (error) {
        console.error(`Error analyzing competitor ${competitor}:`, error);
      }
    }

    return analyses;
  }

  /**
   * Create keyword clusters based on semantic similarity
   */
  async createKeywordClusters(keywords: KeywordData[]): Promise<KeywordCluster[]> {
    const clusters: KeywordCluster[] = [];
    const processed = new Set<string>();

    for (const keyword of keywords) {
      if (processed.has(keyword.keyword)) continue;

      const relatedKeywords = keywords.filter(k => 
        !processed.has(k.keyword) && 
        this.areKeywordsRelated(keyword.keyword, k.keyword)
      );

      if (relatedKeywords.length > 0) {
        const cluster: KeywordCluster = {
          id: this.generateClusterId(keyword.keyword),
          primaryKeyword: keyword.keyword,
          keywords: relatedKeywords,
          theme: this.extractTheme(relatedKeywords.map(k => k.keyword)),
          totalSearchVolume: relatedKeywords.reduce((sum, k) => sum + k.searchVolume, 0),
          averageDifficulty: relatedKeywords.reduce((sum, k) => sum + k.difficulty, 0) / relatedKeywords.length,
          opportunityScore: this.calculateClusterOpportunityScore(relatedKeywords),
          contentGaps: await this.identifyContentGaps(relatedKeywords)
        };

        clusters.push(cluster);
        relatedKeywords.forEach(k => processed.add(k.keyword));
      }
    }

    return clusters.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  /**
   * Calculate opportunity score based on search volume, difficulty, and competition
   */
  private async calculateOpportunityScores(keywords: KeywordData[]): Promise<KeywordData[]> {
    return keywords.map(keyword => ({
      ...keyword,
      opportunityScore: this.calculateOpportunityScore(keyword)
    }));
  }

  private calculateOpportunityScore(keyword: KeywordData): number {
    // Normalize search volume (0-100)
    const volumeScore = Math.min(keyword.searchVolume / 10000 * 100, 100);
    
    // Invert difficulty (easier = higher score)
    const difficultyScore = 100 - keyword.difficulty;
    
    // Competition score
    const competitionScore = keyword.competition === 'low' ? 100 : 
                           keyword.competition === 'medium' ? 60 : 30;
    
    // Intent multiplier (commercial intent = higher value)
    const intentMultiplier = keyword.intent === 'commercial' ? 1.5 :
                           keyword.intent === 'transactional' ? 1.3 :
                           keyword.intent === 'informational' ? 1.1 : 1.0;

    // Trend multiplier
    const trendMultiplier = keyword.trend === 'rising' ? 1.2 :
                          keyword.trend === 'stable' ? 1.0 : 0.8;

    const baseScore = (volumeScore * 0.4 + difficultyScore * 0.3 + competitionScore * 0.3);
    return Math.round(baseScore * intentMultiplier * trendMultiplier);
  }

  private async getRelatedKeywords(seed: string): Promise<KeywordData[]> {
    // Simulate API call - replace with actual API integration
    const mockKeywords: KeywordData[] = [
      {
        keyword: `${seed} guide`,
        searchVolume: 1200,
        difficulty: 45,
        cpc: 2.50,
        competition: 'medium',
        intent: 'informational',
        opportunityScore: 0,
        relatedKeywords: [],
        competitorUrls: [],
        trend: 'stable'
      },
      {
        keyword: `best ${seed}`,
        searchVolume: 2100,
        difficulty: 65,
        cpc: 3.20,
        competition: 'high',
        intent: 'commercial',
        opportunityScore: 0,
        relatedKeywords: [],
        competitorUrls: [],
        trend: 'rising'
      }
    ];

    return mockKeywords;
  }

  private async getSearchSuggestions(seed: string): Promise<KeywordData[]> {
    // Simulate Google Suggest API - replace with actual implementation
    const suggestions = [
      `${seed} tips`,
      `${seed} tutorial`,
      `${seed} examples`,
      `${seed} vs`,
      `how to ${seed}`,
      `${seed} for beginners`
    ];

    return suggestions.map(suggestion => ({
      keyword: suggestion,
      searchVolume: Math.floor(Math.random() * 5000) + 100,
      difficulty: Math.floor(Math.random() * 100),
      cpc: Math.random() * 5,
      competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      intent: 'informational' as const,
      opportunityScore: 0,
      relatedKeywords: [],
      competitorUrls: [],
      trend: 'stable' as const
    }));
  }

  private async getQuestionKeywords(seed: string): Promise<KeywordData[]> {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'which', 'who'];
    const questions = questionWords.map(q => `${q} is ${seed}`);

    return questions.map(question => ({
      keyword: question,
      searchVolume: Math.floor(Math.random() * 2000) + 50,
      difficulty: Math.floor(Math.random() * 60) + 20,
      cpc: Math.random() * 3,
      competition: 'low' as const,
      intent: 'informational' as const,
      opportunityScore: 0,
      relatedKeywords: [],
      competitorUrls: [],
      trend: 'stable' as const
    }));
  }

  private async getCompetitorKeywords(domain: string): Promise<KeywordData[]> {
    // Simulate competitor keyword analysis
    return [];
  }

  private async getTopPages(domain: string): Promise<{ url: string; keywords: string[]; estimatedTraffic: number; }[]> {
    // Simulate top pages analysis
    return [];
  }

  private findKeywordGaps(competitorKeywords: KeywordData[], targetKeywords: KeywordData[]): string[] {
    const targetKeywordSet = new Set(targetKeywords.map(k => k.keyword));
    return competitorKeywords
      .filter(k => !targetKeywordSet.has(k.keyword) && k.opportunityScore > 60)
      .map(k => k.keyword);
  }

  private deduplicateKeywords(keywords: KeywordData[]): KeywordData[] {
    const seen = new Map<string, KeywordData>();
    
    for (const keyword of keywords) {
      const existing = seen.get(keyword.keyword);
      if (!existing || keyword.searchVolume > existing.searchVolume) {
        seen.set(keyword.keyword, keyword);
      }
    }

    return Array.from(seen.values());
  }

  private areKeywordsRelated(keyword1: string, keyword2: string): boolean {
    // Simple similarity check - can be enhanced with NLP
    const words1 = keyword1.toLowerCase().split(' ');
    const words2 = keyword2.toLowerCase().split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length >= Math.min(words1.length, words2.length) * 0.5;
  }

  private extractTheme(keywords: string[]): string {
    // Extract common theme from keyword cluster
    const words = keywords.flatMap(k => k.split(' '));
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word)
      .join(' ');
  }

  private calculateClusterOpportunityScore(keywords: KeywordData[]): number {
    const avgScore = keywords.reduce((sum, k) => sum + k.opportunityScore, 0) / keywords.length;
    const volumeBonus = Math.min(keywords.length * 5, 50); // Bonus for cluster size
    return Math.round(avgScore + volumeBonus);
  }

  private async identifyContentGaps(keywords: KeywordData[]): Promise<string[]> {
    // Identify missing content opportunities within the cluster
    const gaps: string[] = [];
    
    for (const keyword of keywords) {
      if (keyword.intent === 'informational' && keyword.opportunityScore > 70) {
        gaps.push(`Create comprehensive guide for "${keyword.keyword}"`);
      }
      if (keyword.intent === 'commercial' && keyword.opportunityScore > 60) {
        gaps.push(`Develop comparison content for "${keyword.keyword}"`);
      }
    }

    return gaps;
  }

  private generateClusterId(primaryKeyword: string): string {
    return primaryKeyword.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}