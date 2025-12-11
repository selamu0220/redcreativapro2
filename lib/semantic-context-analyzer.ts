import { SemanticAnalysisResult, SynonymSuggestion } from './geo-content-analysis';

export class SemanticContextAnalyzer {
  private readonly semanticFields = {
    technology: ['software', 'hardware', 'system', 'platform', 'tool', 'application', 'program', 'code', 'development', 'programming'],
    business: ['strategy', 'marketing', 'sales', 'revenue', 'profit', 'customer', 'client', 'market', 'industry', 'company'],
    education: ['learning', 'teaching', 'student', 'course', 'training', 'skill', 'knowledge', 'education', 'tutorial', 'guide'],
    health: ['medical', 'health', 'wellness', 'fitness', 'nutrition', 'exercise', 'therapy', 'treatment', 'diagnosis', 'prevention'],
    finance: ['money', 'investment', 'banking', 'loan', 'credit', 'debt', 'savings', 'budget', 'financial', 'economy']
  };

  private readonly synonymDatabase: Record<string, string[]> = {
    // Technology synonyms
    'software': ['application', 'program', 'tool', 'system', 'platform'],
    'development': ['programming', 'coding', 'building', 'creation', 'implementation'],
    'optimization': ['improvement', 'enhancement', 'refinement', 'tuning', 'streamlining'],
    'implementation': ['deployment', 'execution', 'installation', 'setup', 'integration'],
    'framework': ['structure', 'foundation', 'architecture', 'system', 'platform'],
    
    // Business synonyms
    'strategy': ['plan', 'approach', 'method', 'tactic', 'scheme'],
    'customer': ['client', 'user', 'consumer', 'buyer', 'patron'],
    'revenue': ['income', 'earnings', 'profit', 'sales', 'turnover'],
    'marketing': ['promotion', 'advertising', 'branding', 'publicity', 'outreach'],
    'analysis': ['examination', 'evaluation', 'assessment', 'review', 'study'],
    
    // General synonyms
    'improve': ['enhance', 'better', 'upgrade', 'optimize', 'refine'],
    'create': ['build', 'develop', 'make', 'generate', 'produce'],
    'understand': ['comprehend', 'grasp', 'realize', 'recognize', 'know'],
    'important': ['crucial', 'vital', 'essential', 'significant', 'key'],
    'effective': ['efficient', 'successful', 'productive', 'powerful', 'impactful']
  };

  private readonly relatedTermsDatabase: Record<string, string[]> = {
    'SEO': ['search engine optimization', 'SERP', 'keywords', 'ranking', 'organic traffic', 'backlinks', 'meta tags'],
    'AI': ['artificial intelligence', 'machine learning', 'neural networks', 'deep learning', 'automation', 'algorithms'],
    'content': ['articles', 'blog posts', 'copy', 'text', 'writing', 'material', 'information'],
    'optimization': ['performance', 'efficiency', 'speed', 'improvement', 'enhancement', 'tuning'],
    'analytics': ['data', 'metrics', 'statistics', 'tracking', 'measurement', 'insights', 'reporting'],
    'marketing': ['advertising', 'promotion', 'branding', 'campaigns', 'outreach', 'engagement'],
    'website': ['site', 'web page', 'domain', 'URL', 'online presence', 'digital platform'],
    'user experience': ['UX', 'usability', 'interface', 'navigation', 'accessibility', 'user journey']
  };

  analyzeSemanticContext(content: string): SemanticAnalysisResult {
    const words = this.tokenizeContent(content);
    const semanticRichness = this.calculateSemanticRichness(words, content);
    const relatedTerms = this.findRelatedTerms(words);
    const synonymSuggestions = this.generateSynonymSuggestions(words);
    const topicalGaps = this.identifyTopicalCoverageGaps(words, content);
    const contextDepth = this.calculateContextDepth(content);

    return {
      semanticRichness,
      relatedTerms,
      synonymSuggestions,
      topicalCoverageGaps: topicalGaps,
      contextDepth
    };
  }

  private tokenizeContent(content: string): string[] {
    return content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private calculateSemanticRichness(words: string[], content: string): number {
    const uniqueWords = new Set(words);
    const totalWords = words.length;
    
    if (totalWords === 0) return 0;

    // Calculate lexical diversity (unique words / total words)
    const lexicalDiversity = uniqueWords.size / totalWords;
    
    // Calculate semantic field coverage
    const semanticFieldCoverage = this.calculateSemanticFieldCoverage(words);
    
    // Calculate synonym usage diversity
    const synonymDiversity = this.calculateSynonymDiversity(words);
    
    // Calculate contextual depth indicators
    const contextualDepth = this.calculateContextualDepthIndicators(content);
    
    // Weighted combination of factors
    const richness = (
      lexicalDiversity * 0.3 +
      semanticFieldCoverage * 0.25 +
      synonymDiversity * 0.25 +
      contextualDepth * 0.2
    ) * 100;

    return Math.min(100, Math.max(0, richness));
  }

  private calculateSemanticFieldCoverage(words: string[]): number {
    const fieldsFound = new Set<string>();
    
    Object.entries(this.semanticFields).forEach(([field, fieldWords]) => {
      const hasFieldWords = fieldWords.some(fieldWord => 
        words.some(word => word.includes(fieldWord) || fieldWord.includes(word))
      );
      if (hasFieldWords) {
        fieldsFound.add(field);
      }
    });

    return fieldsFound.size / Object.keys(this.semanticFields).length;
  }

  private calculateSynonymDiversity(words: string[]): number {
    let synonymPairsFound = 0;
    let totalPossiblePairs = 0;

    Object.entries(this.synonymDatabase).forEach(([baseWord, synonyms]) => {
      const hasBaseWord = words.includes(baseWord);
      const synonymsFound = synonyms.filter(synonym => words.includes(synonym));
      
      if (hasBaseWord || synonymsFound.length > 0) {
        totalPossiblePairs++;
        if (hasBaseWord && synonymsFound.length > 0) {
          synonymPairsFound++;
        }
      }
    });

    return totalPossiblePairs > 0 ? synonymPairsFound / totalPossiblePairs : 0;
  }

  private calculateContextualDepthIndicators(content: string): number {
    let depthScore = 0;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Check for examples and explanations
    const exampleIndicators = ['for example', 'such as', 'like', 'including', 'specifically'];
    const explanationIndicators = ['because', 'since', 'due to', 'as a result', 'therefore'];
    const comparisonIndicators = ['compared to', 'versus', 'unlike', 'similar to', 'different from'];
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      if (exampleIndicators.some(indicator => lowerSentence.includes(indicator))) {
        depthScore += 0.1;
      }
      if (explanationIndicators.some(indicator => lowerSentence.includes(indicator))) {
        depthScore += 0.15;
      }
      if (comparisonIndicators.some(indicator => lowerSentence.includes(indicator))) {
        depthScore += 0.1;
      }
    });

    return Math.min(1, depthScore);
  }

  private findRelatedTerms(words: string[]): string[] {
    const relatedTerms = new Set<string>();
    
    words.forEach(word => {
      // Find exact matches in related terms database
      if (this.relatedTermsDatabase[word]) {
        this.relatedTermsDatabase[word].forEach(term => relatedTerms.add(term));
      }
      
      // Find partial matches
      Object.entries(this.relatedTermsDatabase).forEach(([key, terms]) => {
        if (key.includes(word) || word.includes(key)) {
          terms.forEach(term => relatedTerms.add(term));
        }
      });
    });

    // Remove terms that are already in the content
    const contentLower = words.join(' ');
    const filteredTerms = Array.from(relatedTerms).filter(term => 
      !contentLower.includes(term.toLowerCase())
    );

    return filteredTerms.slice(0, 10); // Return top 10 related terms
  }

  private generateSynonymSuggestions(words: string[]): SynonymSuggestion[] {
    const suggestions: SynonymSuggestion[] = [];
    const wordFrequency = this.calculateWordFrequency(words);
    
    // Find overused words that have synonyms
    Object.entries(wordFrequency).forEach(([word, frequency]) => {
      if (frequency > 3 && this.synonymDatabase[word]) {
        const synonyms = this.synonymDatabase[word];
        const contextRelevance = this.calculateContextRelevance(word, words);
        
        suggestions.push({
          originalTerm: word,
          synonyms: synonyms.slice(0, 3), // Top 3 synonyms
          contextRelevance
        });
      }
    });

    // Sort by frequency (most overused first) and context relevance
    return suggestions
      .sort((a, b) => {
        const freqA = wordFrequency[a.originalTerm] || 0;
        const freqB = wordFrequency[b.originalTerm] || 0;
        return (freqB * b.contextRelevance) - (freqA * a.contextRelevance);
      })
      .slice(0, 5);
  }

  private calculateWordFrequency(words: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    return frequency;
  }

  private calculateContextRelevance(word: string, words: string[]): number {
    // Calculate how relevant the word is in the current context
    let relevanceScore = 0.5; // Base relevance
    
    // Check if word appears in semantic fields present in content
    Object.entries(this.semanticFields).forEach(([field, fieldWords]) => {
      if (fieldWords.includes(word)) {
        const fieldPresence = fieldWords.filter(fw => words.includes(fw)).length;
        if (fieldPresence > 0) {
          relevanceScore += 0.2;
        }
      }
    });

    return Math.min(1, relevanceScore);
  }

  private identifyTopicalCoverageGaps(words: string[], content: string): string[] {
    const gaps: string[] = [];
    const contentLower = content.toLowerCase();
    
    // Identify main topics in content
    const mainTopics = this.identifyMainTopics(words);
    
    // For each main topic, check for missing related concepts
    mainTopics.forEach(topic => {
      if (this.relatedTermsDatabase[topic]) {
        const relatedTerms = this.relatedTermsDatabase[topic];
        const missingTerms = relatedTerms.filter(term => 
          !contentLower.includes(term.toLowerCase())
        );
        
        if (missingTerms.length > 0) {
          gaps.push(`Consider adding context about: ${missingTerms.slice(0, 3).join(', ')}`);
        }
      }
    });

    // Check for missing explanatory elements
    if (!contentLower.includes('example') && !contentLower.includes('such as')) {
      gaps.push('Add concrete examples to illustrate key points');
    }
    
    if (!contentLower.includes('because') && !contentLower.includes('reason')) {
      gaps.push('Include explanations of why/how things work');
    }
    
    if (!contentLower.includes('benefit') && !contentLower.includes('advantage')) {
      gaps.push('Explain benefits and advantages to readers');
    }

    return gaps.slice(0, 5); // Return top 5 gaps
  }

  private identifyMainTopics(words: string[]): string[] {
    const topicScores: Record<string, number> = {};
    
    // Score topics based on related term presence
    Object.keys(this.relatedTermsDatabase).forEach(topic => {
      const relatedTerms = this.relatedTermsDatabase[topic];
      const matchingTerms = relatedTerms.filter(term => 
        words.some(word => word.includes(term.toLowerCase()) || term.toLowerCase().includes(word))
      );
      
      if (matchingTerms.length > 0) {
        topicScores[topic] = matchingTerms.length;
      }
    });

    // Return topics sorted by relevance score
    return Object.entries(topicScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  private calculateContextDepth(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let depthScore = 0;
    
    // Check for depth indicators
    const depthIndicators = {
      examples: ['for example', 'such as', 'like', 'including'],
      explanations: ['because', 'since', 'due to', 'as a result'],
      comparisons: ['compared to', 'versus', 'unlike', 'similar to'],
      details: ['specifically', 'in particular', 'namely', 'that is'],
      processes: ['first', 'then', 'next', 'finally', 'step']
    };

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      Object.values(depthIndicators).forEach(indicators => {
        if (indicators.some(indicator => lowerSentence.includes(indicator))) {
          depthScore += 1;
        }
      });
    });

    // Normalize by content length
    const normalizedScore = (depthScore / sentences.length) * 100;
    return Math.min(100, Math.max(0, normalizedScore));
  }
}

// Export instance for use in hooks
export const semanticContextAnalyzer = new SemanticContextAnalyzer();