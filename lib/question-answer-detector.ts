/**
 * Question-Answer Pattern Detector for GEO Optimization
 * Identifies Q&A structures and suggests improvements for AI consumption
 */

import { QuestionPattern, OptimizationSuggestion } from './geo-optimization';

export interface QuestionAnswerAnalysis {
  explicitQuestions: QuestionPattern[];
  implicitQuestions: QuestionPattern[];
  suggestedQuestions: QuestionPattern[];
  faqOpportunities: FAQOpportunity[];
  longTailQuestions: LongTailQuestion[];
  qaStructureScore: number;
}

export interface FAQOpportunity {
  topic: string;
  suggestedQuestions: string[];
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface LongTailQuestion {
  question: string;
  intent: 'informational' | 'navigational' | 'transactional';
  difficulty: 'easy' | 'medium' | 'hard';
  searchVolume: 'low' | 'medium' | 'high';
  relevanceScore: number;
}

export interface QuestionContext {
  precedingText: string;
  followingText: string;
  hasAnswer: boolean;
  answerQuality: number;
}

/**
 * Advanced Question-Answer Pattern Detector
 */
export class QuestionAnswerDetector {
  private questionWords = [
    'what', 'how', 'why', 'when', 'where', 'who', 'which', 'whose',
    'can', 'could', 'should', 'would', 'will', 'do', 'does', 'did',
    'is', 'are', 'was', 'were', 'have', 'has', 'had'
  ];

  private longTailPatterns = [
    /how to \w+/gi,
    /what is the best way to \w+/gi,
    /why does \w+ \w+/gi,
    /when should I \w+/gi,
    /where can I find \w+/gi,
    /which \w+ is better/gi,
    /how much does \w+ cost/gi,
    /what are the benefits of \w+/gi,
    /how long does it take to \w+/gi,
    /what happens if \w+/gi
  ];

  private faqTopics = [
    'pricing', 'features', 'support', 'installation', 'troubleshooting',
    'compatibility', 'security', 'performance', 'customization', 'integration'
  ];

  /**
   * Analyze content for Q&A patterns and opportunities
   */
  analyzeQuestionAnswerPatterns(content: string): QuestionAnswerAnalysis {
    const sentences = this.splitIntoSentences(content);
    const paragraphs = content.split(/\n\s*\n/);

    const explicitQuestions = this.detectExplicitQuestions(sentences);
    const implicitQuestions = this.detectImplicitQuestions(sentences);
    const suggestedQuestions = this.generateSuggestedQuestions(content);
    const faqOpportunities = this.identifyFAQOpportunities(content, paragraphs);
    const longTailQuestions = this.generateLongTailQuestions(content);
    const qaStructureScore = this.calculateQAStructureScore(
      explicitQuestions,
      implicitQuestions,
      content
    );

    return {
      explicitQuestions,
      implicitQuestions,
      suggestedQuestions,
      faqOpportunities,
      longTailQuestions,
      qaStructureScore
    };
  }

  /**
   * Detect explicit questions (sentences ending with ?)
   */
  private detectExplicitQuestions(sentences: string[]): QuestionPattern[] {
    const questions: QuestionPattern[] = [];

    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.endsWith('?')) {
        const context = this.getQuestionContext(sentences, index);
        questions.push({
          question: trimmed,
          answer: context.hasAnswer ? context.followingText : undefined,
          confidence: 0.95,
          type: 'explicit',
          position: index
        });
      }
    });

    return questions;
  }

  /**
   * Detect implicit questions (statements that could be questions)
   */
  private detectImplicitQuestions(sentences: string[]): QuestionPattern[] {
    const questions: QuestionPattern[] = [];

    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim().toLowerCase();
      
      // Check if sentence starts with question words but doesn't end with ?
      const startsWithQuestionWord = this.questionWords.some(word => 
        trimmed.startsWith(word + ' ')
      );

      if (startsWithQuestionWord && !trimmed.endsWith('?')) {
        const context = this.getQuestionContext(sentences, index);
        questions.push({
          question: sentence.trim() + '?',
          answer: context.hasAnswer ? context.followingText : undefined,
          confidence: 0.7,
          type: 'implicit',
          position: index
        });
      }

      // Detect statements that imply questions
      if (this.isImpliedQuestion(trimmed)) {
        const impliedQuestion = this.convertToQuestion(sentence.trim());
        questions.push({
          question: impliedQuestion,
          confidence: 0.6,
          type: 'implicit',
          position: index
        });
      }
    });

    return questions;
  }

  /**
   * Generate suggested questions based on content analysis
   */
  private generateSuggestedQuestions(content: string): QuestionPattern[] {
    const suggestions: QuestionPattern[] = [];
    const words = content.toLowerCase().split(/\s+/);
    const topics = this.extractTopics(content);

    // Generate questions based on detected topics
    topics.forEach((topic, index) => {
      const questionTemplates = this.getQuestionTemplatesForTopic(topic);
      questionTemplates.forEach(template => {
        suggestions.push({
          question: template.replace('{topic}', topic),
          confidence: 0.8,
          type: 'suggested',
          position: -1 // Suggested questions don't have a position in original content
        });
      });
    });

    // Generate questions based on long-tail patterns
    this.longTailPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          suggestions.push({
            question: this.capitalizeFirst(match) + '?',
            confidence: 0.75,
            type: 'suggested',
            position: -1
          });
        });
      }
    });

    return suggestions.slice(0, 10); // Limit to top 10 suggestions
  }

  /**
   * Identify FAQ section opportunities
   */
  private identifyFAQOpportunities(content: string, paragraphs: string[]): FAQOpportunity[] {
    const opportunities: FAQOpportunity[] = [];
    const contentLower = content.toLowerCase();

    // Check for FAQ-worthy topics
    this.faqTopics.forEach(topic => {
      if (contentLower.includes(topic)) {
        const questions = this.generateFAQQuestionsForTopic(topic);
        opportunities.push({
          topic: this.capitalizeFirst(topic),
          suggestedQuestions: questions,
          priority: this.calculateFAQPriority(topic, content),
          reasoning: `Content mentions ${topic}, which commonly generates user questions`
        });
      }
    });

    // Identify sections that could benefit from FAQ format
    paragraphs.forEach((paragraph, index) => {
      if (this.shouldBeFAQSection(paragraph)) {
        opportunities.push({
          topic: `Section ${index + 1}`,
          suggestedQuestions: this.extractPotentialQuestions(paragraph),
          priority: 'medium',
          reasoning: 'This section contains information that could be formatted as Q&A'
        });
      }
    });

    return opportunities;
  }

  /**
   * Generate long-tail question recommendations
   */
  private generateLongTailQuestions(content: string): LongTailQuestion[] {
    const questions: LongTailQuestion[] = [];
    const topics = this.extractTopics(content);
    const mainKeywords = this.extractMainKeywords(content);

    // Generate long-tail questions combining topics and keywords
    topics.forEach(topic => {
      mainKeywords.forEach(keyword => {
        const longTailTemplates = [
          `How to ${keyword} for ${topic}?`,
          `What is the best ${keyword} for ${topic}?`,
          `Why is ${keyword} important for ${topic}?`,
          `When should you use ${keyword} in ${topic}?`,
          `How much does ${keyword} cost for ${topic}?`
        ];

        longTailTemplates.forEach(template => {
          questions.push({
            question: template,
            intent: this.determineSearchIntent(template),
            difficulty: this.assessQuestionDifficulty(template),
            searchVolume: this.estimateSearchVolume(template),
            relevanceScore: this.calculateRelevanceScore(template, content)
          });
        });
      });
    });

    // Sort by relevance and return top questions
    return questions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 15);
  }

  /**
   * Calculate Q&A structure score
   */
  private calculateQAStructureScore(
    explicitQuestions: QuestionPattern[],
    implicitQuestions: QuestionPattern[],
    content: string
  ): number {
    const wordCount = content.split(/\s+/).length;
    const questionDensity = (explicitQuestions.length + implicitQuestions.length) / wordCount * 1000;
    
    const answeredQuestions = explicitQuestions.filter(q => q.answer).length;
    const answerRatio = explicitQuestions.length > 0 ? answeredQuestions / explicitQuestions.length : 0;
    
    const structureBonus = this.hasGoodQAStructure(content) ? 20 : 0;
    
    const score = Math.min(
      (questionDensity * 30) + (answerRatio * 50) + structureBonus,
      100
    );

    return Math.round(score * 100) / 100;
  }

  /**
   * Generate optimization suggestions for Q&A patterns
   */
  generateOptimizationSuggestions(analysis: QuestionAnswerAnalysis): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Suggest adding more questions if density is low
    if (analysis.qaStructureScore < 40) {
      suggestions.push({
        id: 'qa-density',
        type: 'conversational',
        priority: 'high',
        title: 'Add more question-answer patterns',
        description: 'Content lacks sufficient Q&A structure for AI consumption',
        implementation: 'Add questions throughout the content and provide clear answers',
        expectedImpact: 35,
        effort: 'medium'
      });
    }

    // Suggest FAQ section if opportunities exist
    if (analysis.faqOpportunities.length > 0) {
      const highPriorityFAQs = analysis.faqOpportunities.filter(f => f.priority === 'high');
      if (highPriorityFAQs.length > 0) {
        suggestions.push({
          id: 'faq-section',
          type: 'structured',
          priority: 'high',
          title: 'Add FAQ section',
          description: `Create FAQ section for ${highPriorityFAQs.map(f => f.topic).join(', ')}`,
          implementation: 'Add a dedicated FAQ section with common questions and answers',
          expectedImpact: 40,
          effort: 'high'
        });
      }
    }

    // Suggest long-tail question integration
    const highRelevanceLongTail = analysis.longTailQuestions.filter(q => q.relevanceScore > 0.7);
    if (highRelevanceLongTail.length > 0) {
      suggestions.push({
        id: 'longtail-questions',
        type: 'semantic',
        priority: 'medium',
        title: 'Address long-tail questions',
        description: `Add content addressing ${highRelevanceLongTail.length} relevant long-tail questions`,
        implementation: 'Integrate answers to long-tail questions throughout the content',
        expectedImpact: 25,
        effort: 'medium'
      });
    }

    // Suggest improving existing questions
    const unansweredQuestions = analysis.explicitQuestions.filter(q => !q.answer);
    if (unansweredQuestions.length > 0) {
      suggestions.push({
        id: 'answer-questions',
        type: 'conversational',
        priority: 'medium',
        title: 'Provide answers to existing questions',
        description: `${unansweredQuestions.length} questions lack clear answers`,
        implementation: 'Add clear, comprehensive answers following each question',
        expectedImpact: 30,
        effort: 'low'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : b.expectedImpact - a.expectedImpact;
    });
  }

  // Helper methods
  private splitIntoSentences(content: string): string[] {
    return content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private getQuestionContext(sentences: string[], index: number): QuestionContext {
    const precedingText = index > 0 ? sentences[index - 1] : '';
    const followingText = index < sentences.length - 1 ? sentences[index + 1] : '';
    
    // Simple heuristic to determine if following text is an answer
    const hasAnswer = followingText.length > 20 && 
                     !this.startsWithQuestionWord(followingText);
    
    const answerQuality = hasAnswer ? this.assessAnswerQuality(followingText) : 0;

    return {
      precedingText,
      followingText,
      hasAnswer,
      answerQuality
    };
  }

  private isImpliedQuestion(sentence: string): boolean {
    const impliedPatterns = [
      /let's explore/i,
      /consider the following/i,
      /you might wonder/i,
      /many people ask/i,
      /a common concern is/i,
      /you may be thinking/i
    ];

    return impliedPatterns.some(pattern => pattern.test(sentence));
  }

  private convertToQuestion(statement: string): string {
    // Simple conversion rules - could be enhanced with NLP
    if (statement.toLowerCase().includes('let\'s explore')) {
      return statement.replace(/let's explore/i, 'How can we explore') + '?';
    }
    if (statement.toLowerCase().includes('consider')) {
      return 'What should we ' + statement.toLowerCase() + '?';
    }
    return 'What about ' + statement.toLowerCase() + '?';
  }

  private extractTopics(content: string): string[] {
    // Simplified topic extraction - in production, use NLP libraries
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      const cleaned = word.replace(/[^\w]/g, '');
      if (cleaned.length > 3 && !stopWords.has(cleaned)) {
        wordFreq.set(cleaned, (wordFreq.get(cleaned) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private getQuestionTemplatesForTopic(topic: string): string[] {
    return [
      `What is ${topic}?`,
      `How does ${topic} work?`,
      `Why is ${topic} important?`,
      `When should you use ${topic}?`,
      `What are the benefits of ${topic}?`
    ];
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateFAQQuestionsForTopic(topic: string): string[] {
    return [
      `What is ${topic}?`,
      `How does ${topic} work?`,
      `Why is ${topic} important?`,
      `When should you use ${topic}?`,
      `What are the benefits of ${topic}?`
    ];
  }

  private calculateFAQPriority(topic: string, content: string): 'high' | 'medium' | 'low' {
    const mentions = (content.toLowerCase().match(new RegExp(topic, 'g')) || []).length;
    if (mentions > 3) return 'high';
    if (mentions > 1) return 'medium';
    return 'low';
  }

  private shouldBeFAQSection(paragraph: string): boolean {
    const questionIndicators = (paragraph.match(/\?/g) || []).length;
    const listIndicators = (paragraph.match(/^\s*[-*•]/gm) || []).length;
    return questionIndicators > 1 || listIndicators > 2;
  }

  private extractPotentialQuestions(paragraph: string): string[] {
    const sentences = this.splitIntoSentences(paragraph);
    return sentences
      .filter(s => s.length > 10)
      .map(s => this.convertStatementToQuestion(s))
      .slice(0, 3);
  }

  private convertStatementToQuestion(statement: string): string {
    // Simple conversion - could be enhanced
    if (statement.toLowerCase().includes('benefit')) {
      return `What are the benefits of ${statement.split(' ').slice(-3).join(' ')}?`;
    }
    if (statement.toLowerCase().includes('important')) {
      return `Why is ${statement.split(' ').slice(-3).join(' ')} important?`;
    }
    return `How does ${statement.split(' ').slice(0, 3).join(' ')} work?`;
  }

  private extractMainKeywords(content: string): string[] {
    // Simplified keyword extraction
    return this.extractTopics(content).slice(0, 3);
  }

  private determineSearchIntent(question: string): 'informational' | 'navigational' | 'transactional' {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('buy') || lowerQuestion.includes('cost') || lowerQuestion.includes('price')) {
      return 'transactional';
    }
    if (lowerQuestion.includes('where') || lowerQuestion.includes('find')) {
      return 'navigational';
    }
    return 'informational';
  }

  private assessQuestionDifficulty(question: string): 'easy' | 'medium' | 'hard' {
    const complexWords = ['implementation', 'optimization', 'configuration', 'integration'];
    const hasComplexWords = complexWords.some(word => question.toLowerCase().includes(word));
    
    if (hasComplexWords) return 'hard';
    if (question.split(' ').length > 8) return 'medium';
    return 'easy';
  }

  private estimateSearchVolume(question: string): 'low' | 'medium' | 'high' {
    // Simplified estimation based on question patterns
    const highVolumePatterns = ['how to', 'what is', 'best way'];
    const hasHighVolumePattern = highVolumePatterns.some(pattern => 
      question.toLowerCase().includes(pattern)
    );
    
    return hasHighVolumePattern ? 'high' : 'medium';
  }

  private calculateRelevanceScore(question: string, content: string): number {
    const questionWords = question.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    const commonWords = questionWords.filter(word => 
      contentWords.includes(word) && word.length > 3
    );
    
    return commonWords.length / questionWords.length;
  }

  private hasGoodQAStructure(content: string): boolean {
    // Check for structured Q&A patterns
    const hasHeaders = /^#+\s/gm.test(content);
    const hasQuestions = /\?/g.test(content);
    const hasAnswers = content.includes('\n') && hasQuestions;
    
    return hasHeaders && hasQuestions && hasAnswers;
  }

  private startsWithQuestionWord(sentence: string): boolean {
    const firstWord = sentence.trim().toLowerCase().split(' ')[0];
    return this.questionWords.includes(firstWord);
  }

  private assessAnswerQuality(answer: string): number {
    // Simple answer quality assessment
    const wordCount = answer.split(/\s+/).length;
    const hasExamples = /for example|such as|like/i.test(answer);
    const hasExplanation = /because|since|due to/i.test(answer);
    
    let quality = Math.min(wordCount / 20, 1) * 0.5; // Length component
    if (hasExamples) quality += 0.25;
    if (hasExplanation) quality += 0.25;
    
    return quality;
  }
}

// Export instance for use in hooks
export const questionAnswerDetector = new QuestionAnswerDetector();