interface Article {
  title: string;
  description: string;
  content: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  imageUrl?: string;
  category: string;
  keywords: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// AI-Enhanced interfaces for GEO optimization
interface AIEnhancedArticle extends Article {
  semanticKeywords?: string[];
  relatedQuestions?: string[];
  conversationalTone?: boolean;
  eeatSignals?: {
    authorExpertise?: string;
    authorCredentials?: string[];
    sources?: string[];
    lastFactCheck?: string;
  };
  aiOptimizations?: {
    questionAnswerPairs?: { question: string; answer: string }[];
    semanticContext?: string[];
    conversationalAlternatives?: Record<string, string>;
  };
}

interface AIEnhancedFAQ extends FAQ {
  semanticVariations?: string[];
  conversationalContext?: string;
  relatedQuestions?: string[];
  confidence?: number;
}

interface AIEnhancedHowToStep extends HowToStep {
  conversationalDescription?: string;
  semanticContext?: string[];
  commonQuestions?: string[];
  troubleshooting?: string[];
}

class StructuredDataManager {
  private baseContext = 'https://schema.org';

  /**
   * Generate AI-enhanced Article schema with GEO optimizations
   */
  generateAIEnhancedArticleSchema(article: AIEnhancedArticle): StructuredData {
    // Start with base article schema
    const schema = this.generateArticleSchema(article);

    // Add AI-specific enhancements
    if (article.semanticKeywords && article.semanticKeywords.length > 0) {
      // Combine original keywords with semantic keywords
      const allKeywords = [...article.keywords, ...article.semanticKeywords];
      schema.keywords = [...new Set(allKeywords)].join(', ');
    }

    // Add related questions as potential FAQ references
    if (article.relatedQuestions && article.relatedQuestions.length > 0) {
      schema.mentions = article.relatedQuestions.map(question => ({
        '@type': 'Question',
        name: question
      }));
    }

    // Enhance author information with EEAT signals
    if (article.eeatSignals) {
      if (article.eeatSignals.authorExpertise) {
        schema.author.description = article.eeatSignals.authorExpertise;
      }
      
      if (article.eeatSignals.authorCredentials && article.eeatSignals.authorCredentials.length > 0) {
        schema.author.hasCredential = article.eeatSignals.authorCredentials.map(credential => ({
          '@type': 'EducationalOccupationalCredential',
          name: credential
        }));
      }
    }

    // Add semantic context for AI understanding
    if (article.aiOptimizations?.semanticContext && article.aiOptimizations.semanticContext.length > 0) {
      schema.about = article.aiOptimizations.semanticContext.map(context => ({
        '@type': 'Thing',
        name: context
      }));
    }

    // Add Q&A pairs as structured data
    if (article.aiOptimizations?.questionAnswerPairs && article.aiOptimizations.questionAnswerPairs.length > 0) {
      schema.mainEntity = {
        '@type': 'FAQPage',
        mainEntity: article.aiOptimizations.questionAnswerPairs.map(qa => ({
          '@type': 'Question',
          name: qa.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: qa.answer
          }
        }))
      };
    }

    // Add conversational tone indicator for AI systems
    if (article.conversationalTone) {
      schema.genre = 'conversational';
      schema.audience = {
        '@type': 'Audience',
        audienceType: 'general public'
      };
    }

    return schema;
  }

  /**
   * Generate AI-enhanced FAQ schema with conversational language support
   */
  generateAIEnhancedFAQSchema(faqs: AIEnhancedFAQ[]): StructuredData {
    return {
      '@context': this.baseContext,
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => {
        const questionEntity: any = {
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        };

        // Add semantic variations for better AI understanding
        if (faq.semanticVariations && faq.semanticVariations.length > 0) {
          questionEntity.alternateName = faq.semanticVariations;
        }

        // Add conversational context
        if (faq.conversationalContext) {
          questionEntity.description = faq.conversationalContext;
        }

        // Add related questions for AI context
        if (faq.relatedQuestions && faq.relatedQuestions.length > 0) {
          questionEntity.suggestedAnswer = faq.relatedQuestions.map(relatedQ => ({
            '@type': 'Answer',
            text: `Related: ${relatedQ}`
          }));
        }

        // Add confidence score for AI systems
        if (faq.confidence !== undefined) {
          questionEntity.additionalProperty = {
            '@type': 'PropertyValue',
            name: 'confidence',
            value: faq.confidence
          };
        }

        return questionEntity;
      })
    };
  }

  /**
   * Generate AI-enhanced How-To schema with conversational descriptions
   */
  generateAIEnhancedHowToSchema(
    title: string,
    description: string,
    steps: AIEnhancedHowToStep[],
    totalTime?: string,
    estimatedCost?: string
  ): StructuredData {
    const schema: StructuredData = {
      '@context': this.baseContext,
      '@type': 'HowTo',
      name: title,
      description: description,
      step: steps.map((step, index) => {
        const stepEntity: any = {
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text
        };

        // Add conversational description for AI understanding
        if (step.conversationalDescription) {
          stepEntity.description = step.conversationalDescription;
        }

        // Add semantic context
        if (step.semanticContext && step.semanticContext.length > 0) {
          stepEntity.about = step.semanticContext.map(context => ({
            '@type': 'Thing',
            name: context
          }));
        }

        // Add common questions for this step
        if (step.commonQuestions && step.commonQuestions.length > 0) {
          stepEntity.potentialAction = step.commonQuestions.map(question => ({
            '@type': 'AskAction',
            query: question
          }));
        }

        // Add troubleshooting information
        if (step.troubleshooting && step.troubleshooting.length > 0) {
          stepEntity.supply = step.troubleshooting.map(tip => ({
            '@type': 'HowToSupply',
            name: tip
          }));
        }

        // Add image if available
        if (step.image) {
          stepEntity.image = {
            '@type': 'ImageObject',
            url: step.image
          };
        }

        // Add URL if available
        if (step.url) {
          stepEntity.url = step.url;
        }

        return stepEntity;
      })
    };

    if (totalTime) {
      schema.totalTime = totalTime;
    }

    if (estimatedCost) {
      schema.estimatedCost = {
        '@type': 'MonetaryAmount',
        currency: 'EUR',
        value: estimatedCost
      };
    }

    return schema;
  }

  generateArticleSchema(article: Article): StructuredData {
    const schema: StructuredData = {
      '@context': this.baseContext,
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      author: {
        '@type': 'Person',
        name: article.author,
        url: 'https://redcreativa.pro'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Red Creativa',
        logo: {
          '@type': 'ImageObject',
          url: 'https://redcreativa.pro/logo.png'
        }
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      url: article.url,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.url
      },
      articleSection: article.category,
      keywords: article.keywords.join(', ')
    };

    if (article.imageUrl) {
      schema.image = {
        '@type': 'ImageObject',
        url: article.imageUrl,
        width: 1200,
        height: 630
      };
    }

    return schema;
  }

  generateFAQSchema(faqs: FAQ[]): StructuredData {
    return {
      '@context': this.baseContext,
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  generateHowToSchema(
    title: string, 
    description: string, 
    steps: HowToStep[],
    totalTime?: string,
    estimatedCost?: string
  ): StructuredData {
    const schema: StructuredData = {
      '@context': this.baseContext,
      '@type': 'HowTo',
      name: title,
      description: description,
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        ...(step.image && {
          image: {
            '@type': 'ImageObject',
            url: step.image
          }
        }),
        ...(step.url && { url: step.url })
      }))
    };

    if (totalTime) {
      schema.totalTime = totalTime; // ISO 8601 duration format (e.g., "PT30M")
    }

    if (estimatedCost) {
      schema.estimatedCost = {
        '@type': 'MonetaryAmount',
        currency: 'EUR',
        value: estimatedCost
      };
    }

    return schema;
  }

  generateBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]): StructuredData {
    return {
      '@context': this.baseContext,
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };
  }

  generateOrganizationSchema(): StructuredData {
    return {
      '@context': this.baseContext,
      '@type': 'Organization',
      name: 'Red Creativa',
      url: 'https://redcreativa.pro',
      logo: 'https://redcreativa.pro/logo.png',
      description: 'Plataforma especializada en inteligencia artificial, escritura y marketing digital',
      sameAs: [
        'https://twitter.com/redcreativa',
        'https://linkedin.com/company/redcreativa'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'contacto@redcreativa.pro'
      }
    };
  }

  generateWebsiteSchema(): StructuredData {
    return {
      '@context': this.baseContext,
      '@type': 'WebSite',
      name: 'Red Creativa',
      url: 'https://redcreativa.pro',
      description: 'Recursos y herramientas de IA para escritores y creadores de contenido',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://redcreativa.pro/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    };
  }

  generateProductSchema(product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    availability: string;
    rating?: number;
    reviewCount?: number;
    imageUrl?: string;
  }): StructuredData {
    const schema: StructuredData = {
      '@context': this.baseContext,
      '@type': 'Product',
      name: product.name,
      description: product.description,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: `https://schema.org/${product.availability}`,
        seller: {
          '@type': 'Organization',
          name: 'Red Creativa'
        }
      }
    };

    if (product.imageUrl) {
      schema.image = product.imageUrl;
    }

    if (product.rating && product.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1
      };
    }

    return schema;
  }

  generateCourseSchema(course: {
    name: string;
    description: string;
    provider: string;
    url: string;
    price?: number;
    currency?: string;
    duration?: string;
    courseMode?: string;
    level?: string;
  }): StructuredData {
    const schema: StructuredData = {
      '@context': this.baseContext,
      '@type': 'Course',
      name: course.name,
      description: course.description,
      provider: {
        '@type': 'Organization',
        name: course.provider
      },
      url: course.url
    };

    if (course.price && course.currency) {
      schema.offers = {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: course.currency
      };
    }

    if (course.duration) {
      schema.timeRequired = course.duration;
    }

    if (course.courseMode) {
      schema.courseMode = course.courseMode;
    }

    if (course.level) {
      schema.educationalLevel = course.level;
    }

    return schema;
  }

  combineSchemas(schemas: StructuredData[]): string {
    if (schemas.length === 1) {
      return JSON.stringify(schemas[0], null, 2);
    }

    return JSON.stringify(schemas, null, 2);
  }

  injectSchemaIntoHead(schemas: StructuredData[]): string {
    const combinedSchema = this.combineSchemas(schemas);
    return `<script type="application/ld+json">${combinedSchema}</script>`;
  }

  validateSchema(schema: StructuredData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!schema['@context']) {
      errors.push('Missing @context');
    }

    if (!schema['@type']) {
      errors.push('Missing @type');
    }

    // Type-specific validation
    switch (schema['@type']) {
      case 'Article':
        if (!schema.headline) errors.push('Article missing headline');
        if (!schema.author) errors.push('Article missing author');
        if (!schema.datePublished) errors.push('Article missing datePublished');
        break;

      case 'FAQPage':
        if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
          errors.push('FAQPage missing mainEntity array');
        }
        break;

      case 'HowTo':
        if (!schema.name) errors.push('HowTo missing name');
        if (!schema.step || !Array.isArray(schema.step)) {
          errors.push('HowTo missing step array');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Enhanced validation for AI-optimized schemas
   */
  validateAIOptimizedSchema(schema: StructuredData): { 
    isValid: boolean; 
    errors: string[]; 
    aiOptimizationScore: number;
    suggestions: string[];
  } {
    const baseValidation = this.validateSchema(schema);
    const suggestions: string[] = [];
    let aiOptimizationScore = 0;

    // Check for AI-friendly enhancements
    if (schema['@type'] === 'Article') {
      // Check for semantic context
      if (schema.about && Array.isArray(schema.about)) {
        aiOptimizationScore += 20;
      } else {
        suggestions.push('Add semantic context with "about" property for better AI understanding');
      }

      // Check for conversational indicators
      if (schema.genre === 'conversational') {
        aiOptimizationScore += 15;
      } else {
        suggestions.push('Consider adding conversational tone indicator for AI systems');
      }

      // Check for Q&A integration
      if (schema.mainEntity && schema.mainEntity['@type'] === 'FAQPage') {
        aiOptimizationScore += 25;
      } else {
        suggestions.push('Add FAQ section for better question-answer coverage');
      }

      // Check for author credentials
      if (schema.author?.hasCredential) {
        aiOptimizationScore += 20;
      } else {
        suggestions.push('Add author credentials to enhance EEAT signals');
      }

      // Check for related questions
      if (schema.mentions && Array.isArray(schema.mentions)) {
        aiOptimizationScore += 20;
      } else {
        suggestions.push('Add related questions to improve semantic coverage');
      }
    }

    if (schema['@type'] === 'FAQPage') {
      // Check for semantic variations
      const hasSemanticVariations = schema.mainEntity?.some((entity: any) => 
        entity.alternateName && Array.isArray(entity.alternateName)
      );
      if (hasSemanticVariations) {
        aiOptimizationScore += 30;
      } else {
        suggestions.push('Add semantic variations to questions for better AI matching');
      }

      // Check for confidence scores
      const hasConfidenceScores = schema.mainEntity?.some((entity: any) => 
        entity.additionalProperty?.name === 'confidence'
      );
      if (hasConfidenceScores) {
        aiOptimizationScore += 20;
      } else {
        suggestions.push('Add confidence scores to answers for AI systems');
      }
    }

    if (schema['@type'] === 'HowTo') {
      // Check for conversational descriptions
      const hasConversationalDescriptions = schema.step?.some((step: any) => 
        step.description
      );
      if (hasConversationalDescriptions) {
        aiOptimizationScore += 25;
      } else {
        suggestions.push('Add conversational descriptions to steps for better AI understanding');
      }

      // Check for common questions
      const hasCommonQuestions = schema.step?.some((step: any) => 
        step.potentialAction && Array.isArray(step.potentialAction)
      );
      if (hasCommonQuestions) {
        aiOptimizationScore += 25;
      } else {
        suggestions.push('Add common questions for each step to improve AI coverage');
      }
    }

    return {
      isValid: baseValidation.isValid,
      errors: baseValidation.errors,
      aiOptimizationScore: Math.min(aiOptimizationScore, 100),
      suggestions
    };
  }

  /**
   * Generate AI-optimized schema from content using GEO analysis
   */
  async generateAIOptimizedSchemaFromContent(
    content: string,
    contentType: 'article' | 'faq' | 'howto',
    geoAnalyzer?: any // GEOOptimizationEngine instance
  ): Promise<StructuredData> {
    let schema: StructuredData;

    if (geoAnalyzer) {
      // Use GEO analysis to enhance content understanding
      const analysis = await geoAnalyzer.analyzeContent(content);
      
      switch (contentType) {
        case 'article':
          const articleData: AIEnhancedArticle = {
            title: this.extractTitleFromContent(content),
            description: this.extractDescriptionFromContent(content),
            content: content,
            author: 'Red Creativa',
            datePublished: new Date().toISOString(),
            url: '',
            category: 'AI Content',
            keywords: this.extractKeywordsFromContent(content),
            semanticKeywords: analysis.questionAnswerPatterns.map(q => q.question),
            conversationalTone: analysis.conversationalScore > 60,
            eeatSignals: {
              authorExpertise: 'AI and content optimization specialist',
              sources: analysis.eeatSignals.map(signal => signal.description)
            },
            aiOptimizations: {
              questionAnswerPairs: analysis.questionAnswerPatterns.map(q => ({
                question: q.question,
                answer: q.answer || 'Answer extracted from content'
              })),
              semanticContext: analysis.improvementAreas
            }
          };
          schema = this.generateAIEnhancedArticleSchema(articleData);
          break;

        case 'faq':
          const extractedFAQs = this.extractFAQsFromContent(content);
          const enhancedFAQs: AIEnhancedFAQ[] = extractedFAQs.map(faq => ({
            ...faq,
            semanticVariations: this.generateSemanticVariations(faq.question),
            conversationalContext: `This question addresses common concerns about ${faq.question.toLowerCase()}`,
            confidence: 0.8
          }));
          schema = this.generateAIEnhancedFAQSchema(enhancedFAQs);
          break;

        case 'howto':
          const extractedSteps = this.extractHowToStepsFromContent(content);
          const enhancedSteps: AIEnhancedHowToStep[] = extractedSteps.map(step => ({
            ...step,
            conversationalDescription: `Here's how to ${step.name.toLowerCase()}`,
            semanticContext: [step.name, 'tutorial', 'guide'],
            commonQuestions: [`How do I ${step.name.toLowerCase()}?`, `What if ${step.name.toLowerCase()} doesn't work?`]
          }));
          schema = this.generateAIEnhancedHowToSchema(
            this.extractTitleFromContent(content),
            this.extractDescriptionFromContent(content),
            enhancedSteps
          );
          break;

        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }
    } else {
      // Fallback to basic schema generation
      switch (contentType) {
        case 'faq':
          schema = this.generateFAQSchema(this.extractFAQsFromContent(content));
          break;
        case 'howto':
          schema = this.generateHowToSchema(
            this.extractTitleFromContent(content),
            this.extractDescriptionFromContent(content),
            this.extractHowToStepsFromContent(content)
          );
          break;
        default:
          throw new Error(`Basic schema generation not supported for type: ${contentType}`);
      }
    }

    return schema;
  }

  /**
   * Helper methods for content extraction
   */
  private extractTitleFromContent(content: string): string {
    const lines = content.split('\n');
    const titleLine = lines.find(line => line.startsWith('#') || line.trim().length > 10);
    return titleLine ? titleLine.replace(/^#+\s*/, '').trim() : 'Untitled Content';
  }

  private extractDescriptionFromContent(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences[0]?.trim() || 'Content description';
  }

  private extractKeywordsFromContent(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);
    
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private generateSemanticVariations(question: string): string[] {
    const variations: string[] = [];
    const lowerQuestion = question.toLowerCase();

    // Generate common variations
    if (lowerQuestion.startsWith('what')) {
      variations.push(question.replace(/^what/i, 'Which'));
      variations.push(question.replace(/^what/i, 'How'));
    }
    
    if (lowerQuestion.startsWith('how')) {
      variations.push(question.replace(/^how/i, 'What is the way'));
      variations.push(question.replace(/^how/i, 'What are the steps'));
    }

    if (lowerQuestion.startsWith('why')) {
      variations.push(question.replace(/^why/i, 'What is the reason'));
      variations.push(question.replace(/^why/i, 'What causes'));
    }

    return variations.slice(0, 3); // Limit to 3 variations
  }

  extractFAQsFromContent(content: string): FAQ[] {
    const faqs: FAQ[] = [];
    
    // Look for question patterns
    const questionPatterns = [
      /¿([^?]+)\?/g,
      /Pregunta:?\s*([^\n]+)/gi,
      /Q:?\s*([^\n]+)/gi
    ];

    // Look for answer patterns after questions
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line contains a question
      const isQuestion = questionPatterns.some(pattern => {
        pattern.lastIndex = 0; // Reset regex
        return pattern.test(line);
      });

      if (isQuestion) {
        const question = line.replace(/^(Pregunta:?|Q:?)\s*/i, '');
        
        // Look for answer in next few lines
        let answer = '';
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !questionPatterns.some(p => { p.lastIndex = 0; return p.test(nextLine); })) {
            answer += nextLine + ' ';
          } else {
            break;
          }
        }

        if (answer.trim()) {
          faqs.push({
            question: question.trim(),
            answer: answer.trim()
          });
        }
      }
    }

    return faqs;
  }

  extractHowToStepsFromContent(content: string): HowToStep[] {
    const steps: HowToStep[] = [];
    
    // Look for numbered steps or step indicators
    const stepPatterns = [
      /(\d+)\.\s*([^\n]+)/g,
      /Paso\s*(\d+):?\s*([^\n]+)/gi,
      /Step\s*(\d+):?\s*([^\n]+)/gi
    ];

    const lines = content.split('\n');
    
    stepPatterns.forEach(pattern => {
      pattern.lastIndex = 0;
      let match;
      
      while ((match = pattern.exec(content)) !== null) {
        const stepNumber = parseInt(match[1]);
        const stepTitle = match[2].trim();
        
        // Find the full step description
        const stepIndex = lines.findIndex(line => line.includes(match[0]));
        let stepText = stepTitle;
        
        if (stepIndex !== -1) {
          // Look for additional description in following lines
          for (let i = stepIndex + 1; i < Math.min(stepIndex + 3, lines.length); i++) {
            const line = lines[i].trim();
            if (line && !stepPatterns.some(p => { p.lastIndex = 0; return p.test(line); })) {
              stepText += ' ' + line;
            } else {
              break;
            }
          }
        }

        steps.push({
          name: stepTitle,
          text: stepText.trim()
        });
      }
    });

    // Remove duplicates and sort by step number if possible
    const uniqueSteps = steps.filter((step, index, self) => 
      index === self.findIndex(s => s.name === step.name)
    );

    return uniqueSteps;
  }
}

export { 
  StructuredDataManager, 
  type StructuredData, 
  type Article, 
  type FAQ, 
  type HowToStep,
  type AIEnhancedArticle,
  type AIEnhancedFAQ,
  type AIEnhancedHowToStep
};