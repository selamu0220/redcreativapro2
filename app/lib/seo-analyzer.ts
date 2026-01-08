// Analizador SEO para el escritor IA
export interface SEOAnalysis {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  sentenceCount: number;
  readabilityScore: number;
  keywords: { word: string; count: number; density: number }[];
  metaKeywords: string[];
  headings: { level: number; text: string }[];
  readingTime: number; // en minutos
  seoScore: number;
  suggestions: string[];
}

export class SEOAnalyzer {
  static analyze(text: string): SEOAnalysis {
    if (!text.trim()) {
      return {
        wordCount: 0,
        characterCount: 0,
        paragraphCount: 0,
        sentenceCount: 0,
        readabilityScore: 0,
        keywords: [],
        metaKeywords: [],
        headings: [],
        readingTime: 0,
        seoScore: 0,
        suggestions: ['Añade contenido para comenzar el análisis SEO']
      };
    }

    const wordCount = this.getWordCount(text);
    const characterCount = text.length;
    const paragraphCount = this.getParagraphCount(text);
    const sentenceCount = this.getSentenceCount(text);
    const readabilityScore = this.calculateReadabilityScore(text);
    const keywords = this.extractKeywords(text);
    const metaKeywords = this.generateMetaKeywords(keywords);
    const headings = this.extractHeadings(text);
    const readingTime = Math.ceil(wordCount / 200); // 200 palabras por minuto
    const seoScore = this.calculateSEOScore({
      wordCount,
      paragraphCount,
      sentenceCount,
      readabilityScore,
      keywords,
      headings
    });
    const suggestions = this.generateSuggestions({
      wordCount,
      paragraphCount,
      sentenceCount,
      readabilityScore,
      keywords,
      headings
    });

    return {
      wordCount,
      characterCount,
      paragraphCount,
      sentenceCount,
      readabilityScore,
      keywords,
      metaKeywords,
      headings,
      readingTime,
      seoScore,
      suggestions
    };
  }

  private static getWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private static getParagraphCount(text: string): number {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  }

  private static getSentenceCount(text: string): number {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }

  private static calculateReadabilityScore(text: string): number {
    const words = this.getWordCount(text);
    const sentences = this.getSentenceCount(text);
    const syllables = this.countSyllables(text);

    if (sentences === 0 || words === 0) return 0;

    // Fórmula de Flesch simplificada
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static countSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let syllableCount = 0;

    words.forEach(word => {
      // Contar vocales consecutivas como una sílaba
      const vowelGroups = word.match(/[aeiouáéíóúü]+/g) || [];
      syllableCount += vowelGroups.length;
      
      // Ajustes para español
      if (word.endsWith('e') && vowelGroups.length > 1) {
        syllableCount -= 0.5;
      }
    });

    return Math.max(1, Math.round(syllableCount));
  }

  private static extractKeywords(text: string): { word: string; count: number; density: number }[] {
    const words = text.toLowerCase()
      .replace(/[^\w\sáéíóúüñ]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Palabras vacías en español
    const stopWords = new Set([
      'que', 'para', 'con', 'por', 'una', 'como', 'más', 'pero', 'sus', 'les',
      'muy', 'fue', 'son', 'está', 'todo', 'esta', 'ser', 'son', 'tiene',
      'todos', 'puede', 'hacer', 'cuando', 'donde', 'como', 'sobre', 'entre',
      'desde', 'hasta', 'durante', 'antes', 'después', 'mientras', 'aunque'
    ]);

    const wordCount = words.filter(word => !stopWords.has(word));
    const totalWords = wordCount.length;
    
    const frequency: { [key: string]: number } = {};
    wordCount.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / totalWords) * 100 * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private static generateMetaKeywords(keywords: { word: string; count: number; density: number }[]): string[] {
    return keywords
      .filter(k => k.density >= 1) // Solo keywords con densidad >= 1%
      .slice(0, 5)
      .map(k => k.word);
  }

  private static extractHeadings(text: string): { level: number; text: string }[] {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: { level: number; text: string }[] = [];
    let match;

    while ((match = headingRegex.exec(text)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2].trim()
      });
    }

    return headings;
  }

  private static calculateSEOScore(data: any): number {
    let score = 0;
    const maxScore = 100;

    // Longitud del contenido (30 puntos)
    if (data.wordCount >= 300) score += 30;
    else if (data.wordCount >= 150) score += 20;
    else if (data.wordCount >= 50) score += 10;

    // Estructura (25 puntos)
    if (data.paragraphCount >= 3) score += 15;
    else if (data.paragraphCount >= 2) score += 10;
    
    if (data.headings.length >= 2) score += 10;
    else if (data.headings.length >= 1) score += 5;

    // Legibilidad (25 puntos)
    if (data.readabilityScore >= 60) score += 25;
    else if (data.readabilityScore >= 40) score += 15;
    else if (data.readabilityScore >= 20) score += 10;

    // Densidad de keywords (20 puntos)
    const goodKeywords = data.keywords.filter((k: any) => k.density >= 1 && k.density <= 3);
    if (goodKeywords.length >= 3) score += 20;
    else if (goodKeywords.length >= 2) score += 15;
    else if (goodKeywords.length >= 1) score += 10;

    return Math.min(maxScore, score);
  }

  private static generateSuggestions(data: any): string[] {
    const suggestions: string[] = [];

    if (data.wordCount < 150) {
      suggestions.push('Añade más contenido. Se recomiendan al menos 150 palabras.');
    }

    if (data.paragraphCount < 2) {
      suggestions.push('Divide el contenido en más párrafos para mejorar la legibilidad.');
    }

    if (data.headings.length === 0) {
      suggestions.push('Añade encabezados (H1, H2, H3) para estructurar mejor el contenido.');
    }

    if (data.readabilityScore < 40) {
      suggestions.push('Simplifica las oraciones para mejorar la legibilidad.');
    }

    const highDensityKeywords = data.keywords.filter((k: any) => k.density > 3);
    if (highDensityKeywords.length > 0) {
      suggestions.push(`Reduce la repetición de: ${highDensityKeywords.map((k: any) => k.word).join(', ')}`);
    }

    if (data.keywords.length < 3) {
      suggestions.push('Incluye más palabras clave relevantes en el contenido.');
    }

    if (suggestions.length === 0) {
      suggestions.push('¡Excelente! Tu contenido está bien optimizado para SEO.');
    }

    return suggestions;
  }
}