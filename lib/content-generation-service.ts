/**
 * Automated Content Generation Service
 * Integrates AI-powered content creation with SEO optimization and internal linking
 */

import { ContentGenerator, ContentBrief } from './content-generator';
import { KeywordCluster, KeywordResearchService } from './keyword-research';
import { InternalLinkingService, LinkSuggestion } from './internal-linking';
import { OpenRouterClient } from '../app/lib/openrouter-client';

export interface ContentGenerationConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  language?: string;
}

export interface GeneratedArticle {
  id: string;
  title: string;
  content: string;
  metaDescription: string;
  targetKeywords: string[];
  primaryKeyword: string;
  qualityScore: number;
  internalLinks: Array<{
    position: number;
    anchorText: string;
    targetUrl: string;
    targetTitle: string;
  }>;
  seoOptimizations: {
    h1Tag: string;
    h2Tags: string[];
    h3Tags: string[];
    keywordDensity: number;
    readabilityScore: number;
  };
  createdAt: Date;
  wordCount: number;
}

export interface ContentQualityMetrics {
  overallScore: number;
  seoScore: number;
  readabilityScore: number;
  keywordOptimization: number;
  contentStructure: number;
  internalLinkingScore: number;
  suggestions: string[];
}

export interface ContentGenerationResult {
  success: boolean;
  article?: GeneratedArticle;
  error?: string;
  qualityMetrics?: ContentQualityMetrics;
}

export class ContentGenerationService {
  private contentGenerator: ContentGenerator;
  private keywordService: KeywordResearchService;
  private internalLinkingService: InternalLinkingService;
  private aiClient: OpenRouterClient;
  private config: ContentGenerationConfig;

  constructor(
    config: ContentGenerationConfig = {},
    blogPosts: any[] = []
  ) {
    this.config = {
      model: 'openai/gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 4000,
      language: 'es',
      ...config
    };

    this.contentGenerator = new ContentGenerator();
    this.keywordService = new KeywordResearchService(config.apiKey);
    this.internalLinkingService = new InternalLinkingService(blogPosts);
    this.aiClient = new OpenRouterClient({
      apiKey: config.apiKey,
      model: this.config.model!,
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 60000
    });
  }

  /**
   * Generate a complete SEO-optimized article from a keyword cluster
   */
  async generateArticle(
    cluster: KeywordCluster,
    contentType: 'blog' | 'landing' | 'product' | 'category' = 'blog'
  ): Promise<ContentGenerationResult> {
    try {
      console.log(`🚀 Generating article for keyword: ${cluster.primaryKeyword}`);

      // Step 1: Generate content brief
      const brief = await this.contentGenerator.generateContentBrief(cluster, contentType);
      console.log(`📋 Content brief generated: ${brief.title}`);

      // Step 2: Generate AI-powered content
      const contentResult = await this.generateAIContent(brief);
      if (!contentResult.success) {
        return {
          success: false,
          error: contentResult.error
        };
      }

      // Step 3: Optimize content for SEO
      const optimizedContent = await this.optimizeContentForSEO(
        contentResult.content!,
        brief
      );

      // Step 4: Generate internal links
      const internalLinks = this.internalLinkingService.generateAutomatedLinks(
        brief.id,
        optimizedContent.content,
        5
      );

      // Step 5: Calculate quality metrics
      const qualityMetrics = this.calculateContentQuality(
        optimizedContent,
        brief,
        internalLinks
      );

      // Step 6: Create final article
      const article: GeneratedArticle = {
        id: brief.id,
        title: brief.title,
        content: optimizedContent.content,
        metaDescription: brief.metaDescription,
        targetKeywords: brief.targetKeywords,
        primaryKeyword: brief.primaryKeyword,
        qualityScore: qualityMetrics.overallScore,
        internalLinks,
        seoOptimizations: optimizedContent.seoOptimizations,
        createdAt: new Date(),
        wordCount: optimizedContent.content.split(/\s+/).length
      };

      console.log(`✅ Article generated successfully: ${article.title} (Quality: ${qualityMetrics.overallScore}/100)`);

      return {
        success: true,
        article,
        qualityMetrics
      };

    } catch (error) {
      console.error('❌ Error generating article:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate multiple articles from keyword clusters
   */
  async generateMultipleArticles(
    clusters: KeywordCluster[],
    contentType: 'blog' | 'landing' | 'product' | 'category' = 'blog',
    maxConcurrent: number = 3
  ): Promise<ContentGenerationResult[]> {
    console.log(`🚀 Generating ${clusters.length} articles with max ${maxConcurrent} concurrent`);

    const results: ContentGenerationResult[] = [];
    
    // Process clusters in batches to avoid overwhelming the API
    for (let i = 0; i < clusters.length; i += maxConcurrent) {
      const batch = clusters.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(cluster => 
        this.generateArticle(cluster, contentType)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + maxConcurrent < clusters.length) {
        await this.sleep(2000);
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Generated ${successCount}/${clusters.length} articles successfully`);

    return results;
  }

  /**
   * Generate AI-powered content from a content brief
   */
  private async generateAIContent(brief: ContentBrief): Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }> {
    const prompt = this.buildContentPrompt(brief);

    const result = await this.aiClient.generateContent({
      prompt,
      temperature: this.config.temperature!,
      maxTokens: this.config.maxTokens!,
      topP: 0.9
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error?.message || 'Failed to generate content'
      };
    }

    return {
      success: true,
      content: result.content!
    };
  }

  /**
   * Build AI prompt for content generation
   */
  private buildContentPrompt(brief: ContentBrief): string {
    const languageInstructions = this.getLanguageInstructions();

    return `${languageInstructions.instructions}

INFORMACIÓN DEL ARTÍCULO:
- Título: ${brief.title}
- Palabra clave principal: ${brief.primaryKeyword}
- Palabras clave objetivo: ${brief.targetKeywords.join(', ')}
- Número de palabras objetivo: ${brief.wordCount}
- Meta descripción: ${brief.metaDescription}

ESTRUCTURA REQUERIDA:
${brief.outline.map((section, index) => `${index + 1}. ${section}`).join('\n')}

ENCABEZADOS SUGERIDOS:
H1: ${brief.headings.h1}
H2: ${brief.headings.h2.join(', ')}
H3: ${brief.headings.h3.join(', ')}

INSTRUCCIONES ESPECÍFICAS:
1. Escribe un artículo completo y bien estructurado en ${this.config.language?.toUpperCase()}
2. Usa la palabra clave principal "${brief.primaryKeyword}" de forma natural (densidad 1-2%)
3. Incluye las palabras clave objetivo de manera orgánica
4. Estructura el contenido con los encabezados H1, H2, H3 proporcionados
5. Mantén un tono profesional pero accesible
6. Incluye ejemplos prácticos y consejos útiles
7. Asegúrate de que el contenido sea original y valioso
8. Optimiza para SEO sin sacrificar la legibilidad
9. Incluye una introducción atractiva y una conclusión sólida
10. NO incluyas el título H1 en el contenido (se agregará automáticamente)

FORMATO DE SALIDA:
- Usa markdown para los encabezados (## para H2, ### para H3)
- Estructura el contenido en párrafos claros
- Incluye listas cuando sea apropiado
- NO incluyas meta información o comentarios sobre el proceso

Artículo:`;
  }

  /**
   * Get language-specific instructions
   */
  private getLanguageInstructions() {
    const configs = {
      es: {
        instructions: 'Genera un artículo completo y optimizado para SEO en ESPAÑOL.'
      },
      en: {
        instructions: 'Generate a complete SEO-optimized article in ENGLISH.'
      },
      fr: {
        instructions: 'Générez un article complet et optimisé pour le SEO en FRANÇAIS.'
      },
      de: {
        instructions: 'Erstellen Sie einen vollständigen SEO-optimierten Artikel auf DEUTSCH.'
      },
    