import { PromptTemplate, TemplateCategory } from '../data/promptTemplates';
import { SupportedLanguage } from '../types/language';
import { 
  getRegionalBusinessExamples, 
  getCulturalAdaptationRules, 
  getRegionalBusinessContext,
  adaptTemplateForCountry,
  getCountrySpecificTemplateVariations,
  type CountryCode,
  type RegionalBusinessExample,
  type CulturalAdaptationRules
} from '../data/localizedTemplates';

// Supported languages array
const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['es', 'en', 'fr', 'de', 'zh', 'pt'];

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
      zh: '写作',
      pt: 'Escrita'
    },
    description: {
      es: 'Templates para creación de contenido y escritura',
      en: 'Templates for content creation and writing',
      fr: 'Modèles pour la création de contenu et la rédaction',
      de: 'Vorlagen für Content-Erstellung und Schreiben',
      zh: '内容创作和写作模板',
      pt: 'Modelos para criação de conteúdo e escrita'
    },
    icon: 'PenTool',
    color: 'blue'
  },
  {
    id: 'marketing',
    name: {
      es: 'Marketing',
      en: 'Marketing',
      fr: 'Marketing',
      de: 'Marketing',
      zh: '营销',
      pt: 'Marketing'
    },
    description: {
      es: 'Templates para campañas de marketing y promoción',
      en: 'Templates for marketing campaigns and promotion',
      fr: 'Modèles pour les campagnes marketing et la promotion',
      de: 'Vorlagen für Marketing-Kampagnen und Werbung',
      zh: '营销活动和推广模板',
      pt: 'Modelos para campanhas de marketing e promoção'
    },
    icon: 'Megaphone',
    color: 'green'
  },
  {
    id: 'regional',
    name: {
      es: 'Regional',
      en: 'Regional',
      fr: 'Régional',
      de: 'Regional',
      zh: '地区',
      pt: 'Regional'
    },
    description: {
      es: 'Templates adaptados para mercados específicos',
      en: 'Templates adapted for specific markets',
      fr: 'Modèles adaptés aux marchés spécifiques',
      de: 'Vorlagen für spezifische Märkte angepasst',
      zh: '针对特定市场的模板',
      pt: 'Modelos adaptados para mercados específicos'
    },
    icon: 'Globe',
    color: 'purple'
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
      zh: '博客文章',
      pt: 'Artigo de Blog'
    },
    description: {
      es: 'Genera un artículo de blog completo sobre cualquier tema',
      en: 'Generate a complete blog article on any topic',
      fr: 'Générer un article de blog complet sur n\'importe quel sujet',
      de: 'Erstelle einen vollständigen Blog-Artikel zu jedem Thema',
      zh: '生成关于任何主题的完整博客文章',
      pt: 'Gere um artigo de blog completo sobre qualquer tópico'
    },
    content: {
      es: 'Escribe un artículo de blog completo sobre "{{topic}}".',
      en: 'Write a complete blog article about "{{topic}}".',
      fr: 'Rédigez un article de blog complet sur "{{topic}}".',
      de: 'Schreibe einen vollständigen Blog-Artikel über "{{topic}}".',
      zh: '写一篇关于"{{topic}}"的完整博客文章。',
      pt: 'Escreva um artigo de blog completo sobre "{{topic}}".'
    },
    category: 'writing',
    tags: {
      es: ['blog', 'contenido', 'SEO'],
      en: ['blog', 'content', 'SEO'],
      fr: ['blog', 'contenu', 'SEO'],
      de: ['Blog', 'Inhalt', 'SEO'],
      zh: ['博客', '内容', 'SEO'],
      pt: ['blog', 'conteúdo', 'SEO']
    },
    variables: ['topic'],
    isBuiltIn: true
  },
  {
    id: 'email-marketing',
    name: {
      es: 'Email de Marketing',
      en: 'Marketing Email',
      fr: 'Email Marketing',
      de: 'Marketing-E-Mail',
      zh: '营销邮件',
      pt: 'Email de Marketing'
    },
    description: {
      es: 'Crea emails de marketing profesionales y persuasivos',
      en: 'Create professional and persuasive marketing emails',
      fr: 'Créer des emails marketing professionnels et persuasifs',
      de: 'Erstelle professionelle und überzeugende Marketing-E-Mails',
      zh: '创建专业且有说服力的营销邮件',
      pt: 'Crie emails de marketing profissionais e persuasivos'
    },
    content: {
      es: 'Crea un email de marketing profesional sobre "{{product}}" dirigido a {{audience}}. Incluye un asunto atractivo, contenido persuasivo y una llamada a la acción clara.',
      en: 'Create a professional marketing email about "{{product}}" targeted to {{audience}}. Include an attractive subject line, persuasive content, and a clear call to action.',
      fr: 'Créez un email marketing professionnel sur "{{product}}" ciblé vers {{audience}}. Incluez un objet attractif, un contenu persuasif et un appel à l\'action clair.',
      de: 'Erstelle eine professionelle Marketing-E-Mail über "{{product}}" für {{audience}}. Füge eine attraktive Betreffzeile, überzeugenden Inhalt und einen klaren Handlungsaufruf hinzu.',
      zh: '创建一封关于"{{product}}"的专业营销邮件，目标受众是{{audience}}。包括吸引人的主题行、有说服力的内容和明确的行动号召。',
      pt: 'Crie um email de marketing profissional sobre "{{product}}" direcionado para {{audience}}. Inclua um assunto atrativo, conteúdo persuasivo e uma chamada para ação clara.'
    },
    category: 'marketing',
    tags: {
      es: ['email', 'marketing', 'ventas', 'promoción'],
      en: ['email', 'marketing', 'sales', 'promotion'],
      fr: ['email', 'marketing', 'ventes', 'promotion'],
      de: ['E-Mail', 'Marketing', 'Verkauf', 'Werbung'],
      zh: ['邮件', '营销', '销售', '推广'],
      pt: ['email', 'marketing', 'vendas', 'promoção']
    },
    variables: ['product', 'audience'],
    isBuiltIn: true
  },
  {
    id: 'business-proposal',
    name: {
      es: 'Propuesta Comercial',
      en: 'Business Proposal',
      fr: 'Proposition Commerciale',
      de: 'Geschäftsvorschlag',
      zh: '商业提案',
      pt: 'Proposta Comercial'
    },
    description: {
      es: 'Genera propuestas comerciales profesionales y detalladas',
      en: 'Generate professional and detailed business proposals',
      fr: 'Générer des propositions commerciales professionnelles et détaillées',
      de: 'Erstelle professionelle und detaillierte Geschäftsvorschläge',
      zh: '生成专业详细的商业提案',
      pt: 'Gere propostas comerciais profissionais e detalhadas'
    },
    content: {
      es: 'Crea una propuesta comercial profesional para {{client}} sobre {{service}}. Incluye objetivos, metodología, cronograma, presupuesto y beneficios esperados.',
      en: 'Create a professional business proposal for {{client}} about {{service}}. Include objectives, methodology, timeline, budget, and expected benefits.',
      fr: 'Créez une proposition commerciale professionnelle pour {{client}} concernant {{service}}. Incluez les objectifs, la méthodologie, le calendrier, le budget et les avantages attendus.',
      de: 'Erstelle einen professionellen Geschäftsvorschlag für {{client}} über {{service}}. Füge Ziele, Methodik, Zeitplan, Budget und erwartete Vorteile hinzu.',
      zh: '为{{client}}创建关于{{service}}的专业商业提案。包括目标、方法论、时间表、预算和预期收益。',
      pt: 'Crie uma proposta comercial profissional para {{client}} sobre {{service}}. Inclua objetivos, metodologia, cronograma, orçamento e benefícios esperados.'
    },
    category: 'writing',
    tags: {
      es: ['propuesta', 'negocios', 'comercial', 'profesional'],
      en: ['proposal', 'business', 'commercial', 'professional'],
      fr: ['proposition', 'affaires', 'commercial', 'professionnel'],
      de: ['Vorschlag', 'Geschäft', 'kommerziell', 'professionell'],
      zh: ['提案', '商业', '商务', '专业'],
      pt: ['proposta', 'negócios', 'comercial', 'profissional']
    },
    variables: ['client', 'service'],
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

  /**
   * Get template adapted for specific country
   */
  getTemplateForCountry(
    templateId: string, 
    country: CountryCode, 
    language: SupportedLanguage = this.config.defaultLanguage
  ): PromptTemplate | null {
    const localizedTemplate = localizedPromptTemplates.find(t => t.id === templateId);
    
    if (!localizedTemplate) {
      return null;
    }

    return adaptTemplateForCountry(localizedTemplate, country, language);
  }

  /**
   * Get all templates adapted for a specific country
   */
  getTemplatesForCountry(
    country: CountryCode, 
    language: SupportedLanguage = this.config.defaultLanguage
  ): PromptTemplate[] {
    const cacheKey = `templates_${country}_${language}`;
    
    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Get base templates
    const baseTemplates = this.getTemplates(language);
    
    // Get country-specific variations
    const countryVariations = getCountrySpecificTemplateVariations(country);
    
    // Adapt base templates for country
    const adaptedTemplates = localizedPromptTemplates.map(template => 
      adaptTemplateForCountry(template, country, language)
    );
    
    // Convert country variations to PromptTemplate format
    const variationTemplates = countryVariations.map(variation => {
      const template: PromptTemplate = {
        id: variation.id || '',
        name: variation.name?.[language] || variation.name?.['es'] || '',
        description: variation.description?.[language] || variation.description?.['es'] || '',
        content: variation.content?.[language] || variation.content?.['es'] || '',
        category: variation.category || 'regional',
        tags: variation.tags?.[language] || variation.tags?.['es'] || [],
        variables: variation.variables,
        isBuiltIn: variation.isBuiltIn,
        usageCount: variation.usageCount,
        createdAt: variation.createdAt,
        icon: variation.icon
      };
      return template;
    });
    
    const allTemplates = [...adaptedTemplates, ...variationTemplates];
    
    if (this.config.enableCaching) {
      this.cache.set(cacheKey, allTemplates);
    }

    return allTemplates;
  }

  /**
   * Get regional business examples for a country
   */
  getRegionalBusinessExamples(country: CountryCode): RegionalBusinessExample {
    return getRegionalBusinessExamples(country);
  }

  /**
   * Get cultural adaptation rules for a country
   */
  getCulturalAdaptationRules(country: CountryCode): CulturalAdaptationRules {
    return getCulturalAdaptationRules(country);
  }

  /**
   * Get regional business context for a country
   */
  getRegionalBusinessContext(country: CountryCode): string {
    return getRegionalBusinessContext(country);
  }

  /**
   * Process template with regional adaptation
   */
  processTemplateForCountry(
    templateId: string, 
    variables: Record<string, string>, 
    country: CountryCode,
    language: SupportedLanguage = this.config.defaultLanguage
  ): string {
    const template = this.getTemplateForCountry(templateId, country, language);
    
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
   * Search templates by query with country adaptation
   */
  searchTemplatesForCountry(
    query: string, 
    country: CountryCode,
    language: SupportedLanguage = this.config.defaultLanguage
  ): PromptTemplate[] {
    const allTemplates = this.getTemplatesForCountry(country, language);
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
   * Get templates by category with country adaptation
   */
  getTemplatesByCategoryForCountry(
    categoryId: string, 
    country: CountryCode,
    language: SupportedLanguage = this.config.defaultLanguage
  ): PromptTemplate[] {
    const allTemplates = this.getTemplatesForCountry(country, language);
    return allTemplates.filter(template => template.category === categoryId);
  }

  /**
   * Get country-specific template variations only
   */
  getCountrySpecificTemplates(
    country: CountryCode,
    language: SupportedLanguage = this.config.defaultLanguage
  ): PromptTemplate[] {
    const variations = getCountrySpecificTemplateVariations(country);
    
    return variations.map(variation => ({
      id: variation.id || '',
      name: variation.name?.[language] || variation.name?.['es'] || '',
      description: variation.description?.[language] || variation.description?.['es'] || '',
      content: variation.content?.[language] || variation.content?.['es'] || '',
      category: variation.category || 'regional',
      tags: variation.tags?.[language] || variation.tags?.['es'] || [],
      variables: variation.variables,
      isBuiltIn: variation.isBuiltIn,
      usageCount: variation.usageCount,
      createdAt: variation.createdAt,
      icon: variation.icon
    }));
  }

  /**
   * Check if a country has specific template variations
   */
  hasCountrySpecificTemplates(country: CountryCode): boolean {
    const variations = getCountrySpecificTemplateVariations(country);
    return variations.length > 0;
  }

  /**
   * Get supported countries for regional adaptation
   */
  getSupportedCountries(): CountryCode[] {
    return ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR', 'US'];
  }

  /**
   * Check if a country is supported for regional adaptation
   */
  isCountrySupported(country: string): country is CountryCode {
    return this.getSupportedCountries().includes(country as CountryCode);
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