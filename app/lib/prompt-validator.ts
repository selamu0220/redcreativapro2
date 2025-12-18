/**
 * Custom Prompt Validation Service
 * Validates and sanitizes custom prompts with error recovery
 */

export interface PromptValidationResult {
  isValid: boolean;
  sanitizedPrompt?: string;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PromptValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowedLanguages?: string[];
  forbiddenPatterns?: RegExp[];
  requiresContext?: boolean;
}

export class PromptValidator {
  private static readonly DEFAULT_OPTIONS: Required<PromptValidationOptions> = {
    maxLength: 2000,
    minLength: 10,
    allowedLanguages: ['es', 'en', 'fr', 'de', 'zh'],
    forbiddenPatterns: [
      /\b(hack|exploit|bypass|jailbreak)\b/i,
      /\b(ignore|forget|disregard)\s+(previous|above|system)\b/i,
      /\b(act\s+as|pretend\s+to\s+be|roleplay)\b/i,
    ],
    requiresContext: false
  };

  private static readonly PROMPT_TEMPLATES = {
    improve: 'Mejora este texto manteniendo su significado original y haciéndolo más claro y profesional.',
    formal: 'Convierte este texto a un tono más formal y profesional.',
    casual: 'Convierte este texto a un tono más casual y amigable.',
    concise: 'Haz este texto más conciso sin perder información importante.',
    expand: 'Expande este texto con más detalles y ejemplos relevantes.',
    grammar: 'Corrige únicamente los errores gramaticales y ortográficos de este texto.',
    seo: 'Optimiza este texto para SEO manteniendo su naturalidad y legibilidad.'
  };

  static validatePrompt(
    prompt: string, 
    options: Partial<PromptValidationOptions> = {}
  ): PromptValidationResult {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!prompt || typeof prompt !== 'string') {
      errors.push('El prompt no puede estar vacío');
      return { isValid: false, errors, warnings, suggestions };
    }

    const trimmedPrompt = prompt.trim();

    // Length validation
    if (trimmedPrompt.length < opts.minLength) {
      errors.push(`El prompt debe tener al menos ${opts.minLength} caracteres`);
    }

    if (trimmedPrompt.length > opts.maxLength) {
      errors.push(`El prompt no puede exceder ${opts.maxLength} caracteres`);
    }

    // Security validation
    for (const pattern of opts.forbiddenPatterns) {
      if (pattern.test(trimmedPrompt)) {
        errors.push('El prompt contiene patrones no permitidos por seguridad');
        break;
      }
    }

    // Content quality validation
    if (trimmedPrompt.split(' ').length < 3) {
      warnings.push('El prompt es muy corto, considera ser más específico');
    }

    // Check for common issues
    if (!/[.!?]$/.test(trimmedPrompt)) {
      warnings.push('Considera terminar el prompt con puntuación para mayor claridad');
    }

    if (trimmedPrompt.toLowerCase().includes('texto')) {
      suggestions.push('El prompt ya incluye "texto", no es necesario repetirlo');
    }

    // Language detection (basic)
    const hasSpanish = /[ñáéíóúü]/i.test(trimmedPrompt);
    const hasEnglish = /\b(the|and|or|but|with|for|from|to|in|on|at)\b/i.test(trimmedPrompt);
    
    if (hasSpanish && hasEnglish) {
      warnings.push('El prompt parece mezclar idiomas, considera usar un solo idioma');
    }

    // Provide suggestions for improvement
    if (trimmedPrompt.length < 50) {
      suggestions.push('Considera ser más específico sobre el tipo de mejora que deseas');
    }

    const isValid = errors.length === 0;
    const sanitizedPrompt = isValid ? this.sanitizePrompt(trimmedPrompt) : undefined;

    return {
      isValid,
      sanitizedPrompt,
      errors,
      warnings,
      suggestions
    };
  }

  static sanitizePrompt(prompt: string): string {
    return prompt
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?¿¡áéíóúüñÁÉÍÓÚÜÑ-]/g, '') // Remove special chars except basic punctuation
      .substring(0, this.DEFAULT_OPTIONS.maxLength);
  }

  static getPromptTemplate(type: keyof typeof PromptValidator.PROMPT_TEMPLATES): string {
    return this.PROMPT_TEMPLATES[type] || this.PROMPT_TEMPLATES.improve;
  }

  static getAllTemplates(): Record<string, string> {
    return { ...this.PROMPT_TEMPLATES };
  }

  static recoverFromInvalidPrompt(
    invalidPrompt: string,
    fallbackType: keyof typeof PromptValidator.PROMPT_TEMPLATES = 'improve'
  ): string {
    // Try to extract meaningful parts from invalid prompt
    const words = invalidPrompt.trim().split(/\s+/).filter(word => 
      word.length > 2 && !/[^\w\sáéíóúüñ]/i.test(word)
    );

    if (words.length >= 3) {
      // Try to construct a basic prompt from valid words
      const reconstructed = words.slice(0, 10).join(' ');
      const validation = this.validatePrompt(reconstructed);
      
      if (validation.isValid) {
        return validation.sanitizedPrompt!;
      }
    }

    // Fall back to template
    return this.getPromptTemplate(fallbackType);
  }

  static validateAndRecover(
    prompt: string,
    options: Partial<PromptValidationOptions> = {}
  ): { prompt: string; wasRecovered: boolean; validation: PromptValidationResult } {
    const validation = this.validatePrompt(prompt, options);
    
    if (validation.isValid) {
      return {
        prompt: validation.sanitizedPrompt!,
        wasRecovered: false,
        validation
      };
    }

    // Attempt recovery
    const recoveredPrompt = this.recoverFromInvalidPrompt(prompt);
    
    return {
      prompt: recoveredPrompt,
      wasRecovered: true,
      validation
    };
  }
}