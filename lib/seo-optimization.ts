interface OptimizedMetaDescription {
  description: string;
  length: number;
  emojis: string[];
  actionWords: string[];
  keywords: string[];
  score: number;
}

interface OptimizationConfig {
  targetLength: { min: number; max: number };
  maxEmojis: number;
  requiredActionWords: number;
  keywordDensity: { min: number; max: number };
}

class MetaDescriptionOptimizer {
  private config: OptimizationConfig = {
    targetLength: { min: 150, max: 160 },
    maxEmojis: 3,
    requiredActionWords: 2,
    keywordDensity: { min: 1, max: 3 }
  };

  private emojisByCategory = {
    technology: ['💻', '🚀', '⚡', '🔧', '💡', '🎯'],
    writing: ['✍️', '📝', '📚', '✨', '🎨', '📖'],
    business: ['💼', '📈', '💰', '🎯', '⭐', '🏆'],
    education: ['🎓', '📚', '💡', '🧠', '📖', '✅'],
    tools: ['🛠️', '⚙️', '🔧', '💻', '🚀', '⚡'],
    ai: ['🤖', '🧠', '⚡', '🚀', '💡', '🎯']
  };

  private actionWords = [
    'descubre', 'aprende', 'domina', 'mejora', 'optimiza', 'transforma',
    'acelera', 'potencia', 'maximiza', 'revoluciona', 'simplifica', 'automatiza',
    'consigue', 'logra', 'obtén', 'genera', 'crea', 'desarrolla'
  ];

  private urgencyWords = [
    'ahora', 'hoy', 'inmediatamente', 'rápidamente', 'en minutos',
    'paso a paso', 'fácilmente', 'sin complicaciones', 'garantizado'
  ];

  private symbols = ['★', '✓', '→', '▶', '◆', '⚡', '🎯', '💎'];

  generateOptimized(
    content: string, 
    primaryKeyword: string, 
    category: keyof typeof this.emojisByCategory = 'technology'
  ): OptimizedMetaDescription {
    const baseDescription = this.extractKeyPoints(content, primaryKeyword);
    let optimizedDescription = baseDescription;

    // Add action words
    const selectedActionWords = this.selectActionWords(2);
    optimizedDescription = this.incorporateActionWords(optimizedDescription, selectedActionWords);

    // Add emojis
    const selectedEmojis = this.selectEmojis(category, 2);
    optimizedDescription = this.addEmojis(optimizedDescription, selectedEmojis);

    // Add symbols for visual appeal
    optimizedDescription = this.addSymbols(optimizedDescription);

    // Optimize length
    optimizedDescription = this.optimizeLength(optimizedDescription, primaryKeyword);

    // Add urgency if space allows
    optimizedDescription = this.addUrgency(optimizedDescription);

    const result: OptimizedMetaDescription = {
      description: optimizedDescription,
      length: optimizedDescription.length,
      emojis: selectedEmojis,
      actionWords: selectedActionWords,
      keywords: this.extractKeywords(optimizedDescription, primaryKeyword),
      score: this.calculateScore(optimizedDescription, primaryKeyword)
    };

    return result;
  }

  private extractKeyPoints(content: string, primaryKeyword: string): string {
    // Extract first meaningful paragraph or summary
    const sentences = content.split('.').filter(s => s.trim().length > 20);
    let baseDescription = sentences[0]?.trim() || '';
    
    // Ensure primary keyword is included
    if (!baseDescription.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      baseDescription = `${primaryKeyword}: ${baseDescription}`;
    }

    return baseDescription;
  }

  private selectActionWords(count: number): string[] {
    return this.actionWords
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  private selectEmojis(category: keyof typeof this.emojisByCategory, count: number): string[] {
    const categoryEmojis = this.emojisByCategory[category] || this.emojisByCategory.technology;
    return categoryEmojis
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  private incorporateActionWords(description: string, actionWords: string[]): string {
    // Replace passive verbs with action words where appropriate
    let result = description;
    
    if (actionWords.length > 0) {
      // Add action word at the beginning if it doesn't start with one
      const startsWithAction = this.actionWords.some(word => 
        result.toLowerCase().startsWith(word.toLowerCase())
      );
      
      if (!startsWithAction) {
        result = `${actionWords[0]} ${result.toLowerCase()}`;
      }
    }

    return result;
  }

  private addEmojis(description: string, emojis: string[]): string {
    if (emojis.length === 0) return description;
    
    // Add emoji at the beginning and end
    let result = description;
    if (emojis[0]) {
      result = `${emojis[0]} ${result}`;
    }
    if (emojis[1] && result.length < this.config.targetLength.max - 10) {
      result = `${result} ${emojis[1]}`;
    }
    
    return result;
  }

  private addSymbols(description: string): string {
    // Add symbols to highlight key benefits
    const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
    
    // Look for lists or benefits to highlight
    if (description.includes(',') || description.includes('y ')) {
      return description.replace(/,/g, ` ${symbol}`).replace(/ y /g, ` ${symbol} `);
    }
    
    return description;
  }

  private optimizeLength(description: string, primaryKeyword: string): string {
    const { min, max } = this.config.targetLength;
    
    if (description.length < min) {
      // Add more descriptive content
      const urgencyWord = this.urgencyWords[Math.floor(Math.random() * this.urgencyWords.length)];
      description += ` ${urgencyWord}`;
    } else if (description.length > max) {
      // Trim while preserving meaning
      description = description.substring(0, max - 3) + '...';
    }
    
    return description;
  }

  private addUrgency(description: string): string {
    if (description.length < this.config.targetLength.max - 20) {
      const urgencyWord = this.urgencyWords[Math.floor(Math.random() * this.urgencyWords.length)];
      return `${description} ${urgencyWord}`;
    }
    return description;
  }

  private extractKeywords(description: string, primaryKeyword: string): string[] {
    const words = description.toLowerCase().split(/\s+/);
    const keywords = [primaryKeyword.toLowerCase()];
    
    // Add related keywords found in description
    const commonKeywords = ['ia', 'inteligencia artificial', 'escritura', 'contenido', 'seo', 'marketing'];
    commonKeywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword) && !keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  }

  private calculateScore(description: string, primaryKeyword: string): number {
    let score = 0;
    
    // Length score (0-25 points)
    const length = description.length;
    if (length >= this.config.targetLength.min && length <= this.config.targetLength.max) {
      score += 25;
    } else {
      score += Math.max(0, 25 - Math.abs(length - 155) * 2);
    }
    
    // Keyword presence (0-20 points)
    if (description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      score += 20;
    }
    
    // Action words (0-20 points)
    const actionWordCount = this.actionWords.filter(word => 
      description.toLowerCase().includes(word)
    ).length;
    score += Math.min(20, actionWordCount * 10);
    
    // Emojis (0-15 points)
    const emojiCount = (description.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    score += Math.min(15, emojiCount * 7.5);
    
    // Symbols (0-10 points)
    const symbolCount = this.symbols.filter(symbol => description.includes(symbol)).length;
    score += Math.min(10, symbolCount * 5);
    
    // Urgency words (0-10 points)
    const urgencyCount = this.urgencyWords.filter(word => 
      description.toLowerCase().includes(word)
    ).length;
    score += Math.min(10, urgencyCount * 5);
    
    return Math.round(score);
  }

  validateLength(description: string): boolean {
    const length = description.length;
    return length >= this.config.targetLength.min && length <= this.config.targetLength.max;
  }

  analyzeExistingDescription(description: string, primaryKeyword: string): {
    issues: string[];
    suggestions: string[];
    score: number;
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check length
    if (description.length < this.config.targetLength.min) {
      issues.push('Descripción muy corta');
      suggestions.push('Agregar más detalles y beneficios específicos');
    } else if (description.length > this.config.targetLength.max) {
      issues.push('Descripción muy larga');
      suggestions.push('Reducir texto manteniendo los puntos clave');
    }
    
    // Check keyword presence
    if (!description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      issues.push('Palabra clave principal no encontrada');
      suggestions.push(`Incluir "${primaryKeyword}" de forma natural`);
    }
    
    // Check for action words
    const hasActionWords = this.actionWords.some(word => 
      description.toLowerCase().includes(word)
    );
    if (!hasActionWords) {
      issues.push('Faltan palabras de acción');
      suggestions.push('Agregar verbos que generen acción como "descubre", "aprende", "mejora"');
    }
    
    // Check for emojis
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu.test(description);
    if (!hasEmojis) {
      issues.push('Sin emojis para llamar la atención');
      suggestions.push('Agregar 1-2 emojis relevantes al tema');
    }
    
    const score = this.calculateScore(description, primaryKeyword);
    
    return { issues, suggestions, score };
  }
}

export { MetaDescriptionOptimizer, type OptimizedMetaDescription };