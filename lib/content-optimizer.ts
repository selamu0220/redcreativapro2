/**
 * Content Optimization Pipeline
 * Analyzes existing content and provides keyword optimization suggestions
 */

import { KeywordData } from './keyword-research';

export interface ContentAnalysis {
  url: string;
  title: string;
  metaDescription: string;
  headings: {
    level: number;
    text: string;
    hasKeyword: boolean;
  }[];
  content: string;
  wordCount: number;
  keywordDensity: Record<string, number>;
  semanticKeywords: string[];
  readabilityScore: number;
  seoScore: number;
  issues: ContentIssue[];
  suggestions: OptimizationSuggestion[];
}

export interface ContentIssue {
  type: 'keyword_density' | 'missing_keywords' | 'over_optimization' | 'readability' | 'structure';
  severity: 'low' | 'medium' | 'high';
  description: string;
  element?: string;
}

export interface OptimizationSuggestion {
  type: 'title' | 'meta_description' | 'headings' | 'content' | 'internal_links' | 'images' | 'geo' | 'conversational' | 'eeat';
  priority: number;
  description: string;
  currentValue?: string;
  suggestedValue: string;
  expectedImpact: 'low' | 'medium' | 'high';
  geoRelevant?: boolean;
}

export interface KeywordOptimizationPlan {
  targetKeywords: KeywordData[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  semanticKeywords: string[];
  targetDensity: Record<string, number>;
  contentStructure: {
    title: string;
    metaDescription: string;
    headings: string[];
    sections: {
      heading: string;
      keywords: string[];
      minWords: number;
    }[];
  };
}

export class ContentOptimizer {
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  /**
   * Analyze existing content for keyword optimization opportunities
   */
  async analyzeContent(url: string, html: string, targetKeywords: KeywordData[]): Promise<ContentAnalysis> {
    const parsedContent = this.parseHTML(html);
    const keywordDensity = this.calculateKeywordDensity(parsedContent.content, targetKeywords);
    const semanticKeywords = await this.extractSemanticKeywords(parsedContent.content);
    const readabilityScore = this.calculateReadabilityScore(parsedContent.content);
    const seoScore = this.calculateSEOScore(parsedContent, targetKeywords, keywordDensity);
    
    const issues = this.identifyIssues(parsedContent, targetKeywords, keywordDensity, readabilityScore);
    const suggestions = this.generateOptimizationSuggestions(parsedContent, targetKeywords, issues);

    return {
      url,
      title: parsedContent.title,
      metaDescription: parsedContent.metaDescription,
      headings: parsedContent.headings,
      content: parsedContent.content,
      wordCount: this.countWords(parsedContent.content),
      keywordDensity,
      semanticKeywords,
      readabilityScore,
      seoScore,
      issues,
      suggestions
    };
  }

  /**
   * Create optimization plan for target keywords
   */
  async createOptimizationPlan(targetKeywords: KeywordData[], contentType: 'blog' | 'product' | 'landing' = 'blog'): Promise<KeywordOptimizationPlan> {
    const primaryKeyword = targetKeywords[0];
    const secondaryKeywords = targetKeywords.slice(1, 4).map(k => k.keyword);
    const semanticKeywords = await this.generateSemanticKeywords(primaryKeyword.keyword);

    const targetDensity = this.calculateTargetDensity(targetKeywords);
    const contentStructure = this.generateContentStructure(primaryKeyword.keyword, secondaryKeywords, semanticKeywords, contentType);

    return {
      targetKeywords,
      primaryKeyword: primaryKeyword.keyword,
      secondaryKeywords,
      semanticKeywords,
      targetDensity,
      contentStructure
    };
  }

  /**
   * Optimize existing content based on target keywords
   */
  async optimizeContent(content: string, optimizationPlan: KeywordOptimizationPlan): Promise<{
    optimizedContent: string;
    changes: {
      type: string;
      original: string;
      optimized: string;
      reason: string;
    }[];
  }> {
    const changes: any[] = [];
    let optimizedContent = content;

    // Optimize title
    const titleOptimization = this.optimizeTitle(content, optimizationPlan.primaryKeyword);
    if (titleOptimization.changed) {
      optimizedContent = optimizedContent.replace(titleOptimization.original, titleOptimization.optimized);
      changes.push({
        type: 'title',
        original: titleOptimization.original,
        optimized: titleOptimization.optimized,
        reason: 'Include primary keyword in title'
      });
    }

    // Optimize headings
    const headingOptimizations = this.optimizeHeadings(optimizedContent, optimizationPlan);
    for (const opt of headingOptimizations) {
      optimizedContent = optimizedContent.replace(opt.original, opt.optimized);
      changes.push({
        type: 'heading',
        original: opt.original,
        optimized: opt.optimized,
        reason: opt.reason
      });
    }

    // Optimize content density
    const densityOptimization = await this.optimizeKeywordDensity(optimizedContent, optimizationPlan);
    optimizedContent = densityOptimization.content;
    changes.push(...densityOptimization.changes);

    return {
      optimizedContent,
      changes
    };
  }

  /**
   * Generate keyword-rich meta tags
   */
  generateMetaTags(primaryKeyword: string, secondaryKeywords: string[], contentSummary: string): {
    title: string;
    description: string;
    keywords: string;
  } {
    const title = this.generateOptimizedTitle(primaryKeyword, contentSummary);
    const description = this.generateOptimizedDescription(primaryKeyword, secondaryKeywords, contentSummary);
    const keywords = [primaryKeyword, ...secondaryKeywords].join(', ');

    return {
      title,
      description,
      keywords
    };
  }

  /**
   * Enhanced content analysis with GEO optimization
   */
  async analyzeContentWithGEO(url: string, html: string, targetKeywords: KeywordData[]): Promise<ContentAnalysis & {
    geoScore: number;
    geoSuggestions: OptimizationSuggestion[];
  }> {
    // Get traditional SEO analysis
    const analysis = await this.analyzeContent(url, html, targetKeywords);
    
    // Add GEO-specific analysis
    const geoAnalysis = await this.performGEOAnalysis(analysis.content);
    
    // Combine suggestions
    const combinedSuggestions = [
      ...analysis.suggestions,
      ...geoAnalysis.suggestions
    ].sort((a, b) => b.priority - a.priority);

    return {
      ...analysis,
      suggestions: combinedSuggestions,
      geoScore: geoAnalysis.score,
      geoSuggestions: geoAnalysis.suggestions
    };
  }

  /**
   * Perform GEO-specific analysis
   */
  private async performGEOAnalysis(content: string): Promise<{
    score: number;
    suggestions: OptimizationSuggestion[];
  }> {
    const suggestions: OptimizationSuggestion[] = [];
    let score = 0;

    // Conversational language analysis
    const conversationalScore = this.analyzeConversationalLanguage(content);
    score += conversationalScore * 0.3;

    if (conversationalScore < 60) {
      suggestions.push({
        type: 'conversational',
        priority: 85,
        description: 'Make content more conversational for AI consumption',
        suggestedValue: 'Use natural language patterns, questions, and direct answers',
        expectedImpact: 'high',
        geoRelevant: true
      });
    }

    // Question-answer pattern analysis
    const qaScore = this.analyzeQuestionAnswerPatterns(content);
    score += qaScore * 0.25;

    if (qaScore < 50) {
      suggestions.push({
        type: 'content',
        priority: 80,
        description: 'Add more question-answer patterns',
        suggestedValue: 'Include FAQ sections and direct answers to common questions',
        expectedImpact: 'high',
        geoRelevant: true
      });
    }

    // Semantic richness analysis
    const semanticScore = this.analyzeSemanticRichness(content);
    score += semanticScore * 0.25;

    if (semanticScore < 70) {
      suggestions.push({
        type: 'content',
        priority: 75,
        description: 'Enhance semantic context and related terms',
        suggestedValue: 'Add synonyms, related concepts, and contextual information',
        expectedImpact: 'medium',
        geoRelevant: true
      });
    }

    // E-E-A-T signals analysis
    const eeatScore = this.analyzeEEATSignals(content);
    score += eeatScore * 0.2;

    if (eeatScore < 60) {
      suggestions.push({
        type: 'eeat',
        priority: 70,
        description: 'Strengthen expertise and authority signals',
        suggestedValue: 'Add author credentials, citations, and authoritative sources',
        expectedImpact: 'medium',
        geoRelevant: true
      });
    }

    return {
      score: Math.round(score),
      suggestions
    };
  }

  /**
   * Analyze conversational language patterns
   */
  private analyzeConversationalLanguage(content: string): number {
    let score = 0;
    
    // Check for question patterns
    const questionCount = (content.match(/\?/g) || []).length;
    const sentences = content.split(/[.!?]+/).length;
    const questionRatio = questionCount / sentences;
    
    if (questionRatio > 0.1) score += 30; // Good question usage
    
    // Check for conversational words
    const conversationalWords = ['you', 'your', 'we', 'our', 'let\'s', 'here\'s', 'simply', 'easily'];
    const wordCount = content.toLowerCase().split(/\s+/).length;
    const conversationalCount = conversationalWords.reduce((count, word) => {
      return count + (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    
    const conversationalRatio = conversationalCount / wordCount;
    if (conversationalRatio > 0.02) score += 40; // Good conversational tone
    
    // Check for direct answers
    const directAnswers = ['yes', 'no', 'absolutely', 'definitely', 'exactly', 'simply put'];
    const hasDirectAnswers = directAnswers.some(answer => 
      content.toLowerCase().includes(answer)
    );
    
    if (hasDirectAnswers) score += 30;
    
    return Math.min(score, 100);
  }

  /**
   * Analyze question-answer patterns
   */
  private analyzeQuestionAnswerPatterns(content: string): number {
    let score = 0;
    
    // Look for FAQ patterns
    const faqPatterns = [
      /what is/gi,
      /how to/gi,
      /why does/gi,
      /when should/gi,
      /where can/gi,
      /which/gi
    ];
    
    const faqMatches = faqPatterns.reduce((count, pattern) => {
      return count + (content.match(pattern) || []).length;
    }, 0);
    
    if (faqMatches > 3) score += 50;
    else if (faqMatches > 1) score += 30;
    
    // Look for direct answer patterns
    const answerPatterns = [
      /the answer is/gi,
      /simply put/gi,
      /in short/gi,
      /to summarize/gi,
      /the key is/gi
    ];
    
    const answerMatches = answerPatterns.reduce((count, pattern) => {
      return count + (content.match(pattern) || []).length;
    }, 0);
    
    if (answerMatches > 0) score += 50;
    
    return Math.min(score, 100);
  }

  /**
   * Analyze semantic richness
   */
  private analyzeSemanticRichness(content: string): number {
    let score = 0;
    
    // Vocabulary diversity
    const words = this.tokenizeContent(content);
    const uniqueWords = new Set(words);
    const diversityRatio = uniqueWords.size / words.length;
    
    if (diversityRatio > 0.6) score += 40;
    else if (diversityRatio > 0.4) score += 25;
    
    // Semantic relationships (simple heuristic)
    const semanticConnectors = ['because', 'therefore', 'however', 'moreover', 'furthermore', 'additionally'];
    const connectorCount = semanticConnectors.reduce((count, connector) => {
      return count + (content.toLowerCase().match(new RegExp(`\\b${connector}\\b`, 'g')) || []).length;
    }, 0);
    
    if (connectorCount > 5) score += 30;
    else if (connectorCount > 2) score += 20;
    
    // Topic coverage depth
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);
    if (paragraphs.length > 5) score += 30;
    else if (paragraphs.length > 3) score += 20;
    
    return Math.min(score, 100);
  }

  /**
   * Analyze E-E-A-T signals
   */
  private analyzeEEATSignals(content: string): number {
    let score = 0;
    
    // Author mentions
    const authorPatterns = ['author', 'written by', 'by ', 'expert', 'specialist'];
    const hasAuthor = authorPatterns.some(pattern => 
      content.toLowerCase().includes(pattern)
    );
    if (hasAuthor) score += 25;
    
    // Citations and sources
    const citationCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (citationCount > 3) score += 25;
    else if (citationCount > 0) score += 15;
    
    // Expertise indicators
    const expertiseWords = ['research', 'study', 'analysis', 'data', 'statistics', 'proven'];
    const expertiseCount = expertiseWords.reduce((count, word) => {
      return count + (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    
    if (expertiseCount > 5) score += 25;
    else if (expertiseCount > 2) score += 15;
    
    // Freshness indicators
    const currentYear = new Date().getFullYear();
    const hasCurrentYear = content.includes(currentYear.toString());
    if (hasCurrentYear) score += 25;
    
    return Math.min(score, 100);
  }

  /**
   * Analyze keyword cannibalization across pages
   */
  async analyzeKeywordCannibalization(pages: { url: string; keywords: string[]; }[]): Promise<{
    cannibalizedKeywords: {
      keyword: string;
      pages: string[];
      severity: 'low' | 'medium' | 'high';
    }[];
    recommendations: string[];
  }> {
    const keywordPages = new Map<string, string[]>();

    // Group pages by keyword
    for (const page of pages) {
      for (const keyword of page.keywords) {
        if (!keywordPages.has(keyword)) {
          keywordPages.set(keyword, []);
        }
        keywordPages.get(keyword)!.push(page.url);
      }
    }

    const cannibalizedKeywords = Array.from(keywordPages.entries())
      .filter(([, urls]) => urls.length > 1)
      .map(([keyword, urls]) => ({
        keyword,
        pages: urls,
        severity: urls.length > 3 ? 'high' : urls.length > 2 ? 'medium' : 'low' as 'low' | 'medium' | 'high'
      }));

    const recommendations = this.generateCannibalizationRecommendations(cannibalizedKeywords);

    return {
      cannibalizedKeywords,
      recommendations
    };
  }

  private parseHTML(html: string): {
    title: string;
    metaDescription: string;
    headings: { level: number; text: string; hasKeyword: boolean; }[];
    content: string;
  } {
    // Simulate HTML parsing - replace with actual HTML parser
    const title = this.extractBetweenTags(html, 'title') || '';
    const metaDescription = this.extractMetaDescription(html) || '';
    const headings = this.extractHeadings(html);
    const content = this.extractTextContent(html);

    return {
      title,
      metaDescription,
      headings,
      content
    };
  }

  private calculateKeywordDensity(content: string, targetKeywords: KeywordData[]): Record<string, number> {
    const words = this.tokenizeContent(content);
    const totalWords = words.length;
    const density: Record<string, number> = {};

    for (const keywordData of targetKeywords) {
      const keyword = keywordData.keyword.toLowerCase();
      const keywordWords = keyword.split(' ');
      
      let count = 0;
      if (keywordWords.length === 1) {
        count = words.filter(word => word === keyword).length;
      } else {
        // Multi-word keyword matching
        for (let i = 0; i <= words.length - keywordWords.length; i++) {
          const phrase = words.slice(i, i + keywordWords.length).join(' ');
          if (phrase === keyword) {
            count++;
          }
        }
      }

      density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
    }

    return density;
  }

  private async extractSemanticKeywords(content: string): Promise<string[]> {
    // Simulate semantic keyword extraction using NLP
    const words = this.tokenizeContent(content);
    const wordFreq = words.reduce((acc, word) => {
      if (!this.stopWords.has(word) && word.length > 3) {
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  private calculateReadabilityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenizeContent(content);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
  }

  private calculateSEOScore(parsedContent: any, targetKeywords: KeywordData[], keywordDensity: Record<string, number>): number {
    let score = 0;
    const primaryKeyword = targetKeywords[0]?.keyword.toLowerCase();

    // Title optimization (20 points)
    if (parsedContent.title.toLowerCase().includes(primaryKeyword)) {
      score += 20;
    }

    // Meta description optimization (15 points)
    if (parsedContent.metaDescription.toLowerCase().includes(primaryKeyword)) {
      score += 15;
    }

    // Heading optimization (20 points)
    const hasKeywordInHeadings = parsedContent.headings.some((h: any) => 
      h.text.toLowerCase().includes(primaryKeyword)
    );
    if (hasKeywordInHeadings) {
      score += 20;
    }

    // Keyword density optimization (25 points)
    const primaryDensity = keywordDensity[primaryKeyword] || 0;
    if (primaryDensity >= 0.5 && primaryDensity <= 3) {
      score += 25;
    } else if (primaryDensity > 0) {
      score += 10;
    }

    // Content length (10 points)
    const wordCount = this.countWords(parsedContent.content);
    if (wordCount >= 300) {
      score += 10;
    }

    // Multiple keywords (10 points)
    const keywordsFound = Object.values(keywordDensity).filter(d => d > 0).length;
    if (keywordsFound >= 3) {
      score += 10;
    }

    return score;
  }

  private identifyIssues(parsedContent: any, targetKeywords: KeywordData[], keywordDensity: Record<string, number>, readabilityScore: number): ContentIssue[] {
    const issues: ContentIssue[] = [];
    const primaryKeyword = targetKeywords[0]?.keyword.toLowerCase();

    // Keyword density issues
    for (const [keyword, density] of Object.entries(keywordDensity)) {
      if (density > 5) {
        issues.push({
          type: 'over_optimization',
          severity: 'high',
          description: `Keyword "${keyword}" density is ${density.toFixed(1)}% (over-optimized, should be 1-3%)`
        });
      } else if (density < 0.5 && keyword === primaryKeyword) {
        issues.push({
          type: 'keyword_density',
          severity: 'medium',
          description: `Primary keyword "${keyword}" density is too low (${density.toFixed(1)}%, should be 1-3%)`
        });
      }
    }

    // Missing keywords in important elements
    if (!parsedContent.title.toLowerCase().includes(primaryKeyword)) {
      issues.push({
        type: 'missing_keywords',
        severity: 'high',
        description: `Primary keyword "${primaryKeyword}" not found in title`,
        element: 'title'
      });
    }

    if (!parsedContent.metaDescription.toLowerCase().includes(primaryKeyword)) {
      issues.push({
        type: 'missing_keywords',
        severity: 'medium',
        description: `Primary keyword "${primaryKeyword}" not found in meta description`,
        element: 'meta_description'
      });
    }

    // Readability issues
    if (readabilityScore < 30) {
      issues.push({
        type: 'readability',
        severity: 'high',
        description: `Content readability is very difficult (score: ${readabilityScore.toFixed(1)})`
      });
    } else if (readabilityScore < 50) {
      issues.push({
        type: 'readability',
        severity: 'medium',
        description: `Content readability could be improved (score: ${readabilityScore.toFixed(1)})`
      });
    }

    // Structure issues
    if (parsedContent.headings.length === 0) {
      issues.push({
        type: 'structure',
        severity: 'medium',
        description: 'No headings found - add H1, H2, H3 tags for better structure'
      });
    }

    const wordCount = this.countWords(parsedContent.content);
    if (wordCount < 300) {
      issues.push({
        type: 'structure',
        severity: 'medium',
        description: `Content is too short (${wordCount} words, recommended: 300+ words)`
      });
    }

    return issues;
  }

  private generateOptimizationSuggestions(parsedContent: any, targetKeywords: KeywordData[], issues: ContentIssue[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const primaryKeyword = targetKeywords[0]?.keyword;

    // Title optimization
    if (issues.some(i => i.element === 'title')) {
      suggestions.push({
        type: 'title',
        priority: 90,
        description: `Include primary keyword "${primaryKeyword}" in the title`,
        currentValue: parsedContent.title,
        suggestedValue: this.generateOptimizedTitle(primaryKeyword, parsedContent.title),
        expectedImpact: 'high'
      });
    }

    // Meta description optimization
    if (issues.some(i => i.element === 'meta_description')) {
      suggestions.push({
        type: 'meta_description',
        priority: 80,
        description: `Include primary keyword "${primaryKeyword}" in meta description`,
        currentValue: parsedContent.metaDescription,
        suggestedValue: this.generateOptimizedDescription(primaryKeyword, targetKeywords.slice(1, 3).map(k => k.keyword), parsedContent.content.substring(0, 200)),
        expectedImpact: 'high'
      });
    }

    // Heading optimization
    const hasKeywordInHeadings = parsedContent.headings.some((h: any) => 
      h.text.toLowerCase().includes(primaryKeyword.toLowerCase())
    );
    if (!hasKeywordInHeadings) {
      suggestions.push({
        type: 'headings',
        priority: 70,
        description: `Add primary keyword "${primaryKeyword}" to at least one heading`,
        suggestedValue: `Consider adding an H2 like "Complete Guide to ${primaryKeyword}"`,
        expectedImpact: 'medium'
      });
    }

    // Content optimization
    const keywordDensityIssues = issues.filter(i => i.type === 'keyword_density' || i.type === 'over_optimization');
    if (keywordDensityIssues.length > 0) {
      suggestions.push({
        type: 'content',
        priority: 60,
        description: 'Adjust keyword density to optimal range (1-3%)',
        suggestedValue: 'Naturally integrate keywords throughout the content',
        expectedImpact: 'medium'
      });
    }

    // Internal linking
    suggestions.push({
      type: 'internal_links',
      priority: 50,
      description: 'Add internal links with keyword-rich anchor text',
      suggestedValue: `Link to related pages using "${primaryKeyword}" and related terms as anchor text`,
      expectedImpact: 'medium'
    });

    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  private generateContentStructure(primaryKeyword: string, secondaryKeywords: string[], semanticKeywords: string[], contentType: string) {
    const title = this.generateOptimizedTitle(primaryKeyword, '');
    const metaDescription = this.generateOptimizedDescription(primaryKeyword, secondaryKeywords, '');
    
    const headings = [
      `What is ${primaryKeyword}?`,
      `Benefits of ${primaryKeyword}`,
      `How to ${primaryKeyword}`,
      `Best Practices for ${primaryKeyword}`,
      `Common ${primaryKeyword} Mistakes to Avoid`,
      `${primaryKeyword} vs Alternatives`,
      `Conclusion`
    ];

    const sections = headings.map((heading, index) => ({
      heading,
      keywords: index === 0 ? [primaryKeyword, ...semanticKeywords.slice(0, 2)] :
                index < 3 ? [secondaryKeywords[index - 1] || primaryKeyword] :
                [primaryKeyword],
      minWords: index === 0 ? 200 : 150
    }));

    return {
      title,
      metaDescription,
      headings,
      sections
    };
  }

  private calculateTargetDensity(targetKeywords: KeywordData[]): Record<string, number> {
    const density: Record<string, number> = {};
    
    targetKeywords.forEach((keyword, index) => {
      if (index === 0) {
        // Primary keyword: 1-3%
        density[keyword.keyword] = 2;
      } else if (index < 4) {
        // Secondary keywords: 0.5-1.5%
        density[keyword.keyword] = 1;
      } else {
        // Supporting keywords: 0.2-0.8%
        density[keyword.keyword] = 0.5;
      }
    });

    return density;
  }

  private optimizeTitle(content: string, primaryKeyword: string): { original: string; optimized: string; changed: boolean; } {
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
    if (!titleMatch) {
      return { original: '', optimized: '', changed: false };
    }

    const original = titleMatch[1];
    if (original.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      return { original, optimized: original, changed: false };
    }

    const optimized = this.generateOptimizedTitle(primaryKeyword, original);
    return { original, optimized, changed: true };
  }

  private optimizeHeadings(content: string, plan: KeywordOptimizationPlan): { original: string; optimized: string; reason: string; }[] {
    const optimizations: { original: string; optimized: string; reason: string; }[] = [];
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2];
      const hasKeyword = plan.targetKeywords.some(k => 
        text.toLowerCase().includes(k.keyword.toLowerCase())
      );

      if (!hasKeyword && level <= 3) {
        const keywordToAdd = level === 1 ? plan.primaryKeyword : 
                           plan.secondaryKeywords[0] || plan.primaryKeyword;
        
        const optimized = `${text} - ${keywordToAdd}`;
        optimizations.push({
          original: text,
          optimized,
          reason: `Add ${level === 1 ? 'primary' : 'secondary'} keyword to H${level}`
        });
      }
    }

    return optimizations;
  }

  private async optimizeKeywordDensity(content: string, plan: KeywordOptimizationPlan): Promise<{
    content: string;
    changes: { type: string; original: string; optimized: string; reason: string; }[];
  }> {
    // Simulate keyword density optimization
    const changes: { type: string; original: string; optimized: string; reason: string; }[] = [];
    
    // This would involve NLP processing to naturally integrate keywords
    // For now, return the original content
    return {
      content,
      changes
    };
  }

  private generateOptimizedTitle(primaryKeyword: string, existingTitle: string): string {
    if (existingTitle && existingTitle.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      return existingTitle;
    }

    const templates = [
      `Complete Guide to ${primaryKeyword} | 2024`,
      `${primaryKeyword}: Everything You Need to Know`,
      `Best ${primaryKeyword} Practices and Tips`,
      `How to Master ${primaryKeyword} in 2024`,
      `${primaryKeyword} Guide: Tips, Tricks, and Best Practices`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateOptimizedDescription(primaryKeyword: string, secondaryKeywords: string[], contentSummary: string): string {
    const keywords = [primaryKeyword, ...secondaryKeywords.slice(0, 2)].join(', ');
    
    return `Discover everything about ${primaryKeyword}. Learn ${secondaryKeywords[0] || 'best practices'}, ${secondaryKeywords[1] || 'tips'}, and more. Complete guide with actionable insights.`.substring(0, 160);
  }

  private generateCannibalizationRecommendations(cannibalizedKeywords: any[]): string[] {
    const recommendations: string[] = [];

    for (const item of cannibalizedKeywords) {
      if (item.severity === 'high') {
        recommendations.push(`Consolidate content for "${item.keyword}" - merge ${item.pages.length} competing pages into one authoritative page`);
      } else if (item.severity === 'medium') {
        recommendations.push(`Differentiate content for "${item.keyword}" - focus each page on different aspects or user intents`);
      } else {
        recommendations.push(`Monitor "${item.keyword}" - ensure pages target different long-tail variations`);
      }
    }

    return recommendations;
  }

  // Utility methods
  private extractBetweenTags(html: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'i');
    const match = html.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractMetaDescription(html: string): string {
    const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    return match ? match[1] : '';
  }

  private extractHeadings(html: string): { level: number; text: string; hasKeyword: boolean; }[] {
    const headings: { level: number; text: string; hasKeyword: boolean; }[] = [];
    const regex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, '').trim(),
        hasKeyword: false // Will be set during analysis
      });
    }

    return headings;
  }

  private extractTextContent(html: string): string {
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private tokenizeContent(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0 && !this.stopWords.has(word));
  }

  private countWords(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllables = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllables++;
      }
      previousWasVowel = isVowel;
    }

    if (word.endsWith('e')) syllables--;
    return Math.max(1, syllables);
  }

  private async generateSemanticKeywords(primaryKeyword: string): Promise<string[]> {
    // Simulate semantic keyword generation
    const base = primaryKeyword.split(' ')[0];
    return [
      `${base} tips`,
      `${base} guide`,
      `${base} best practices`,
      `${base} tutorial`,
      `${base} examples`,
      `how to ${base}`,
      `${base} benefits`,
      `${base} strategies`
    ];
  }
}