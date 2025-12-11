import { ConversationalAnalysisResult, NaturalLanguageSuggestion, QuestionPattern } from './geo-content-analysis';

export class ConversationalLanguageAnalyzer {
  private readonly formalWords = [
    'utilize', 'implement', 'facilitate', 'demonstrate', 'subsequently', 
    'furthermore', 'nevertheless', 'consequently', 'therefore', 'however',
    'moreover', 'additionally', 'accordingly', 'thus', 'hence'
  ];

  private readonly conversationalWords = [
    'use', 'do', 'help', 'show', 'then', 'also', 'but', 'so', 'because',
    'and', 'plus', 'like', 'really', 'actually', 'basically', 'simply'
  ];

  private readonly technicalJargon = [
    'API', 'SDK', 'framework', 'implementation', 'architecture', 'infrastructure',
    'optimization', 'algorithm', 'methodology', 'paradigm', 'scalability',
    'integration', 'configuration', 'deployment', 'authentication'
  ];

  private readonly conversationalReplacements: Record<string, string[]> = {
    'utilize': ['use', 'work with'],
    'implement': ['set up', 'add', 'create'],
    'facilitate': ['help', 'make easier', 'enable'],
    'demonstrate': ['show', 'explain'],
    'subsequently': ['then', 'next', 'after that'],
    'furthermore': ['also', 'plus', 'and'],
    'nevertheless': ['but', 'however', 'still'],
    'consequently': ['so', 'as a result'],
    'therefore': ['so', 'that\'s why'],
    'moreover': ['also', 'plus', 'what\'s more'],
    'additionally': ['also', 'plus', 'and'],
    'accordingly': ['so', 'therefore'],
    'thus': ['so', 'this way'],
    'hence': ['so', 'that\'s why']
  };

  analyzeContent(content: string): ConversationalAnalysisResult {
    const words = this.tokenizeContent(content);
    const sentences = this.splitIntoSentences(content);
    
    const formalityScore = this.calculateFormalityScore(words);
    const conversationalScore = 100 - formalityScore;
    const technicalJargonCount = this.countTechnicalJargon(words);
    const questionOpportunities = this.findQuestionBasedHeadingOpportunities(content);
    const naturalLanguageSuggestions = this.generateNaturalLanguageSuggestions(content);
    const readabilityScore = this.calculateReadabilityScore(sentences, words);

    return {
      formalityScore,
      conversationalScore,
      technicalJargonCount,
      questionBasedHeadingOpportunities: questionOpportunities,
      naturalLanguageSuggestions,
      overallReadabilityScore: readabilityScore
    };
  }

  private tokenizeContent(content: string): string[] {
    return content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private splitIntoSentences(content: string): string[] {
    return content.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private calculateFormalityScore(words: string[]): number {
    const totalWords = words.length;
    if (totalWords === 0) return 0;

    const formalWordCount = words.filter(word => 
      this.formalWords.includes(word)
    ).length;

    const conversationalWordCount = words.filter(word => 
      this.conversationalWords.includes(word)
    ).length;

    // Calculate formality based on ratio of formal to conversational words
    const formalRatio = formalWordCount / totalWords;
    const conversationalRatio = conversationalWordCount / totalWords;
    
    // Higher formal ratio = higher formality score
    const baseScore = (formalRatio * 100) + ((1 - conversationalRatio) * 50);
    
    return Math.min(100, Math.max(0, baseScore));
  }

  private countTechnicalJargon(words: string[]): number {
    return words.filter(word => 
      this.technicalJargon.some(jargon => 
        word.includes(jargon.toLowerCase())
      )
    ).length;
  }

  private findQuestionBasedHeadingOpportunities(content: string): string[] {
    const opportunities: string[] = [];
    const sentences = this.splitIntoSentences(content);
    
    // Look for statements that could be turned into questions
    const questionStarters = [
      'how to', 'what is', 'why does', 'when should', 'where can',
      'which one', 'who should', 'how can', 'what are', 'how do'
    ];

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence explains a process (could be "How to...")
      if (lowerSentence.includes('first') || lowerSentence.includes('step') || 
          lowerSentence.includes('process') || lowerSentence.includes('method')) {
        opportunities.push(`How to ${this.extractMainConcept(sentence)}`);
      }
      
      // Check if sentence defines something (could be "What is...")
      if (lowerSentence.includes('is a') || lowerSentence.includes('refers to') ||
          lowerSentence.includes('means') || lowerSentence.includes('defined as')) {
        opportunities.push(`What is ${this.extractMainConcept(sentence)}`);
      }
      
      // Check if sentence explains reasons (could be "Why does...")
      if (lowerSentence.includes('because') || lowerSentence.includes('reason') ||
          lowerSentence.includes('due to') || lowerSentence.includes('causes')) {
        opportunities.push(`Why does ${this.extractMainConcept(sentence)}`);
      }
    });

    return [...new Set(opportunities)].slice(0, 5); // Remove duplicates, limit to 5
  }

  private extractMainConcept(sentence: string): string {
    // Simple extraction of main concept from sentence
    const words = sentence.split(' ').filter(word => word.length > 3);
    return words.slice(0, 3).join(' ').toLowerCase();
  }

  private generateNaturalLanguageSuggestions(content: string): NaturalLanguageSuggestion[] {
    const suggestions: NaturalLanguageSuggestion[] = [];
    
    // Find formal words and suggest conversational alternatives
    Object.entries(this.conversationalReplacements).forEach(([formal, alternatives]) => {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      const matches = content.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const suggestion = alternatives[0]; // Use first alternative
          suggestions.push({
            originalText: match,
            suggestedText: suggestion,
            reason: 'Make language more conversational and accessible',
            confidence: 0.8
          });
        });
      }
    });

    // Suggest breaking up long sentences
    const sentences = this.splitIntoSentences(content);
    sentences.forEach(sentence => {
      if (sentence.split(' ').length > 25) {
        suggestions.push({
          originalText: sentence.substring(0, 50) + '...',
          suggestedText: 'Break into shorter sentences',
          reason: 'Long sentences are harder for AI to parse and users to understand',
          confidence: 0.9
        });
      }
    });

    return suggestions.slice(0, 10); // Limit to top 10 suggestions
  }

  private calculateReadabilityScore(sentences: string[], words: string[]): number {
    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = this.calculateAverageSyllables(words);
    
    // Simplified Flesch Reading Ease formula
    const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    // Convert to 0-100 scale where higher is better
    return Math.min(100, Math.max(0, readabilityScore));
  }

  private calculateAverageSyllables(words: string[]): number {
    const totalSyllables = words.reduce((sum, word) => {
      return sum + this.countSyllables(word);
    }, 0);
    
    return totalSyllables / words.length;
  }

  private countSyllables(word: string): number {
    // Simple syllable counting algorithm
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  }
}

// Export instance for use in hooks
export const conversationalAnalyzer = new ConversationalLanguageAnalyzer();