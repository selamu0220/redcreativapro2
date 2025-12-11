import { PromptTemplate, TemplateCategory } from '../data/promptTemplates';
import { SupportedLanguage } from '../types/language';

// Supported languages array
const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['es', 'en', 'fr', 'de', 'zh'];

// Extended interface for localized templates
interface LocalizedPromptTemplate {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  content: Record<string, string>;
  category: string;
  tags: Record<string, string[]>;
  variables?: string[];
  isBuiltIn?: boolean;
  usageCount?: number;
  createdAt?: string;
  icon?: string;
}

interface LocalizedTemplateCategory {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  icon: string;
  color: string;
}

// Localized template categories
const localizedTemplateCategories: LocalizedTemplateCategory[] = [
  {
    id: 'writing',
    name: {
      es: 'Escritura',
      en: 'Writing',
      fr: 'Rédaction',
      de: 'Schreiben',
      zh: '写作'
    },
    description: {
      es: 'Templates para creación de contenido y escritura',
      en: 'Templates for content creation and writing',
      fr: 'Modèles pour la création de contenu et la rédaction',
      de: 'Vorlagen für Content-Erstellung und Schreiben',
      zh: '内容创作和写作模板'
    },
    icon: 'PenTool',
    color: 'blue'
  }
];

// Localized prompt templates
const localizedPromptTemplates: LocalizedPromptTemplate[] = [
  {
    id: 'blog-post',
    name: {
      es: 'Artículo de Blog',
      en: 'Blog Article',
      fr: 'Article de Blog',
      de: 'Blog-Artikel',
      zh: '博客文章'
    },
    description: {
      es: 'Genera un artículo de blog completo sobre cualquier tema',
      en: 'Generate a complete blog article on any topic',
      fr: 'Générer un article de blog complet sur n\'importe quel sujet',
      de: 'Erstelle einen vollständigen Blog-Artikel zu jedem Thema',
      zh: '生成关于任何主题的完整博客文章'
    },
    content: {
      es: 'Escribe un artículo de blog completo sobre "{{topic}}".',
      en: 'Write a complete blog article about "{{topic}}".',
      fr: 'Rédigez un article de blog complet sur "{{topic}}".',
      de: 'Schreibe einen vollständigen Blog-Artikel über "{{topic}}".',
      zh: '写一篇关于"{{topic}}"的完整博客文章。'
    },
    category: 'writing',
    tags: {
      es: ['blog', 'contenido', 'SEO'],
      en: ['blog', 'content', 'SEO'],
      fr: ['blog', 'contenu', 'SEO'],
      de: ['Blog', 'Inhalt', 'SEO'],
      zh: ['博客', '内容', 'SEO']
    },
    variables: ['topic'],
    isBuiltIn: true
  }
];

// Utility functions
function getTemplateForLanguage(localizedTemplate: LocalizedPromptTemplate, language: SupportedLanguage = 'es'): PromptTemplate {
  return {
    id: localizedTemplate.id,
    name: localizedTemplate.name[language] || localizedTemplate.name['es'] || '',
    description: localizedTemplate.description[language] || localizedTemplate.description['es'] || '',
    content: localizedTemplate.content[language] || localizedTemplate.content['es'] || '',
    category: localizedTemplate.category,
    tags: localizedTemplate.tags[language] || localizedTemplate.tags['es'] || [],
    variables: localizedTemplate.variables,
    isBuiltIn: localizedTemplate.isBuiltIn,
    usageCount: localizedTemplate.usageCount,
    createdAt: localizedTemplate.createdAt,
    icon: localizedTemplate.icon
  };
}

function getCategoryForLanguage(localizedCategory: LocalizedTemplateCategory, language: SupportedLanguage = 'es'): TemplateCategory {
  return {
    id: localizedCategory.id,
    name: localizedCategory.name[language] || localizedCategory.name['es'] || '',
    description: localizedCategory.description[language] || localizedCategory.description['es'] || '',
    icon: localizedCategory.icon,
    color: localizedCategory.color
  };
}

function getAllTemplatesForLanguage(language: SupportedLanguage = 'es'): PromptTemplate[] {
  return localizedPromptTemplates.map(template => getTemplateForLanguage(template, language));
}

function getAllCategoriesForLanguage(language: SupportedLanguage = 'es'): TemplateCategory[] {
  return localizedTemplateCategories.map(category => getCategoryForLanguage(category, language));
}

export interface TemplateManagerConfig {
  defaultLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  enableCaching: boolean;
}

export class TemplateManager {
  private config: TemplateManagerConfig;
  private cache: Map<string, any> = new Map();

  constructor(config: Partial<TemplateManagerConfig> = {}) {
    this.config = {
      defaultLanguage: 'es',
      fallbackLanguage: 'es',
      enableCaching: true,
      ...config
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TemplateManagerConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    // Clear cache when config changes
    this.cache.clear();
  }

  /**
   * Get all templates for a specific language
   */
  getTemplates(language: SupportedLanguage = this.config.defaultLanguage): PromptTemplate[] {
    const cacheKey = `templates_${language}`;
    
    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const templates = getAllTemplatesForLanguage(language);
    
    if (this.config.enableCaching) {
      this.cache.set(cacheKey, templates);
    }

    return templates;
  }

  /**
   * Get all categories for a specific language
   */
  getCategories(language: SupportedLanguage = this.config.defaultLanguage): TemplateCategory[] {
    const cacheKey = `categories_${language}`;
    
    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const categories = getAllCategoriesForLanguage(language);
    
    if (this.config.enableCaching) {
      this.cache.set(cacheKey, categories);
    }

    return categories;
  }

  /**
   * Get a specific template by ID for a language
   */
  getTemplate(templateId: string, language: SupportedLanguage = this.config.defaultLanguage): PromptTemplate | null {
    const localizedTemplate = localizedPromptTemplates.find(t => t.id === templateId);
    
    if (!localizedTemplate) {
      return null;
    }

    return getTemplateForLanguage(localizedTemplate, language);
  }

  /**
   * Get a specific category by ID for a language
   */
  getCategory(categoryId: string, language: SupportedLanguage = this.config.defaultLanguage): TemplateCategory | null {
    const localizedCategory = localizedTemplateCategories.find(c => c.id === categoryId);
    
    if (!localizedCategory) {
      return null;
    }

    return getCategoryForLanguage(localizedCategory, language);
  }

  /**
   * Get templates by category for a specific language
   */
  getTemplatesByCategory(categoryId: string, language: SupportedLanguage = this.config.defaultLanguage): PromptTemplate[] {
    const allTemplates = this.getTemplates(language);
    return allTemplates.filter(template => template.category === categoryId);
  }

  /**
   * Search templates by query in a specific language
   */
  searchTemplates(query: string, language: SupportedLanguage = this.config.defaultLanguage): PromptTemplate[] {
    const allTemplates = this.getTemplates(language);
    const lowercaseQuery = query.toLowerCase();

    return allTemplates.filter(template => {
      const name = template.name?.toLowerCase() || '';
      const description = template.description?.toLowerCase() || '';
      const tags = template.tags || [];

      return name.includes(lowercaseQuery) ||
             description.includes(lowercaseQuery) ||
             tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
    });
  }

  /**
   * Get template content with variables replaced
   */
  processTemplate(templateId: string, variables: Record<string, string>, language: SupportedLanguage = this.config.defaultLanguage): string {
    const template = this.getTemplate(templateId, language);
    
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    let content = template.content;

    // Replace variables in the format {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value);
    });

    return content;
  }

  /**
   * Extract variables from template content
   */
  extractVariables(templateId: string, language: SupportedLanguage = this.config.defaultLanguage): string[] {
    const template = this.getTemplate(templateId, language);
    
    if (!template) {
      return [];
    }

    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = variableRegex.exec(template.content)) !== null) {
      const variable = match[1].trim();
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }

    return variables;
  }

  /**
   * Validate template variables
   */
  validateTemplateVariables(templateId: string, variables: Record<string, string>, language: SupportedLanguage = this.config.defaultLanguage): { isValid: boolean; missingVariables: string[] } {
    const requiredVariables = this.extractVariables(templateId, language);
    const providedVariables = Object.keys(variables);
    const missingVariables = requiredVariables.filter(variable => !providedVariables.includes(variable));

    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }

  /**
   * Get popular templates (by usage count)
   */
  getPopularTemplates(limit: number = 10, language: SupportedLanguage = this.config.defaultLanguage): PromptTemplate[] {
    const allTemplates = this.getTemplates(language);
    return allTemplates
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit);
  }

  /**
   * Get recent templates (by creation date)
   */
  getRecentTemplates(limit: number = 10, language: SupportedLanguage = this.config.defaultLanguage): PromptTemplate[] {
    const allTemplates = this.getTemplates(language);
    return allTemplates
      .filter(template => template.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  /**
   * Get built-in templates
   */
  getBuiltInTemplates(language: SupportedLanguage = this.config.defaultLanguage): PromptTemplate[] {
    const allTemplates = this.getTemplates(language);
    return allTemplates.filter(template => template.isBuiltIn);
  }

  /**
   * Get custom templates
   */
  getCustomTemplates(language: SupportedLanguage = this.config.defaultLanguage): PromptTemplate[] {
    const allTemplates = this.getTemplates(language);
    return allTemplates.filter(template => !template.isBuiltIn);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [...SUPPORTED_LANGUAGES];
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(language: string): language is SupportedLanguage {
    return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
  }

  /**
   * Get template statistics
   */
  getTemplateStats(language: SupportedLanguage = this.config.defaultLanguage): {
    totalTemplates: number;
    builtInTemplates: number;
    customTemplates: number;
    categoriesCount: number;
    totalUsage: number;
  } {
    const templates = this.getTemplates(language);
    const categories = this.getCategories(language);
    
    return {
      totalTemplates: templates.length,
      builtInTemplates: templates.filter(t => t.isBuiltIn).length,
      customTemplates: templates.filter(t => !t.isBuiltIn).length,
      categoriesCount: categories.length,
      totalUsage: templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)
    };
  }
}

// Create a default instance
export const templateManager = new TemplateManager();

// Export utility functions for direct use
export const getTemplatesForLanguage = (language: SupportedLanguage = 'es') => templateManager.getTemplates(language);
export const getCategoriesForLanguage = (language: SupportedLanguage = 'es') => templateManager.getCategories(language);
export const getTemplateById = (templateId: string, language: SupportedLanguage = 'es') => templateManager.getTemplate(templateId, language);
export const searchTemplatesByQuery = (query: string, language: SupportedLanguage = 'es') => templateManager.searchTemplates(query, language);
export const processTemplateContent = (templateId: string, variables: Record<string, string>, language: SupportedLanguage = 'es') => templateManager.processTemplate(templateId, variables, language);