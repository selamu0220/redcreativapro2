/**
 * LLMS.txt Manager
 * Manages AI access control through LLMS.txt files
 * Based on the LLMS.txt specification for AI system permissions
 */

export interface LLMSRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
  requestRate?: string;
  comment?: string;
}

export interface LLMSConfig {
  siteName: string;
  contactEmail: string;
  lastModified: Date;
  rules: LLMSRule[];
  globalSettings?: {
    defaultCrawlDelay?: number;
    defaultRequestRate?: string;
    allowDataMining?: boolean;
    allowCommercialUse?: boolean;
  };
}

export interface AISystemProfile {
  name: string;
  userAgent: string;
  description: string;
  respectsLLMSTxt: boolean;
  crawlPatterns: string[];
  recommendedSettings: {
    crawlDelay: number;
    requestRate: string;
    allowedPaths: string[];
    disallowedPaths: string[];
  };
}

export class LLMSManager {
  private config: LLMSConfig;
  private knownAISystems: Map<string, AISystemProfile>;

  constructor(config: LLMSConfig) {
    this.config = config;
    this.knownAISystems = new Map();
    this.initializeKnownAISystems();
  }

  /**
   * Generate LLMS.txt content based on current configuration
   */
  generateLLMSTxt(): string {
    const lines: string[] = [];
    
    // Header with metadata
    lines.push(`# LLMS.txt for ${this.config.siteName}`);
    lines.push(`# Generated on: ${new Date().toISOString()}`);
    lines.push(`# Contact: ${this.config.contactEmail}`);
    lines.push('');

    // Global settings
    if (this.config.globalSettings) {
      lines.push('# Global Settings');
      if (this.config.globalSettings.allowDataMining !== undefined) {
        lines.push(`# Allow Data Mining: ${this.config.globalSettings.allowDataMining}`);
      }
      if (this.config.globalSettings.allowCommercialUse !== undefined) {
        lines.push(`# Allow Commercial Use: ${this.config.globalSettings.allowCommercialUse}`);
      }
      lines.push('');
    }

    // Rules for each AI system
    for (const rule of this.config.rules) {
      lines.push(`User-agent: ${rule.userAgent}`);
      
      if (rule.comment) {
        lines.push(`# ${rule.comment}`);
      }

      if (rule.allow && rule.allow.length > 0) {
        rule.allow.forEach(path => {
          lines.push(`Allow: ${path}`);
        });
      }

      if (rule.disallow && rule.disallow.length > 0) {
        rule.disallow.forEach(path => {
          lines.push(`Disallow: ${path}`);
        });
      }

      if (rule.crawlDelay !== undefined) {
        lines.push(`Crawl-delay: ${rule.crawlDelay}`);
      }

      if (rule.requestRate) {
        lines.push(`Request-rate: ${rule.requestRate}`);
      }

      lines.push('');
    }

    // Footer
    lines.push('# For more information about LLMS.txt:');
    lines.push('# https://github.com/ai-robots-txt/ai.robots.txt');

    return lines.join('\n');
  }

  /**
   * Add or update a rule for a specific AI system
   */
  addRule(rule: LLMSRule): void {
    const existingIndex = this.config.rules.findIndex(r => r.userAgent === rule.userAgent);
    
    if (existingIndex >= 0) {
      this.config.rules[existingIndex] = rule;
    } else {
      this.config.rules.push(rule);
    }

    this.config.lastModified = new Date();
  }

  /**
   * Remove a rule for a specific AI system
   */
  removeRule(userAgent: string): boolean {
    const initialLength = this.config.rules.length;
    this.config.rules = this.config.rules.filter(rule => rule.userAgent !== userAgent);
    
    if (this.config.rules.length < initialLength) {
      this.config.lastModified = new Date();
      return true;
    }
    
    return false;
  }

  /**
   * Get recommended settings for a known AI system
   */
  getRecommendedSettings(aiSystemName: string): AISystemProfile | null {
    return this.knownAISystems.get(aiSystemName.toLowerCase()) || null;
  }

  /**
   * Apply recommended settings for a known AI system
   */
  applyRecommendedSettings(aiSystemName: string): boolean {
    const profile = this.getRecommendedSettings(aiSystemName);
    if (!profile) return false;

    const rule: LLMSRule = {
      userAgent: profile.userAgent,
      allow: profile.recommendedSettings.allowedPaths,
      disallow: profile.recommendedSettings.disallowedPaths,
      crawlDelay: profile.recommendedSettings.crawlDelay,
      requestRate: profile.recommendedSettings.requestRate,
      comment: `Settings for ${profile.name} - ${profile.description}`
    };

    this.addRule(rule);
    return true;
  }

  /**
   * Validate LLMS.txt syntax and rules
   */
  validateConfig(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!this.config.siteName) {
      errors.push('Site name is required');
    }

    if (!this.config.contactEmail) {
      errors.push('Contact email is required');
    } else if (!this.isValidEmail(this.config.contactEmail)) {
      errors.push('Contact email format is invalid');
    }

    // Validate rules
    for (const rule of this.config.rules) {
      if (!rule.userAgent) {
        errors.push('User-agent is required for all rules');
        continue;
      }

      // Check for conflicting allow/disallow rules
      if (rule.allow && rule.disallow) {
        const conflicts = rule.allow.filter(allowPath => 
          rule.disallow!.some(disallowPath => 
            allowPath.startsWith(disallowPath) || disallowPath.startsWith(allowPath)
          )
        );
        
        if (conflicts.length > 0) {
          warnings.push(`Conflicting allow/disallow rules for ${rule.userAgent}: ${conflicts.join(', ')}`);
        }
      }

      // Validate crawl delay
      if (rule.crawlDelay !== undefined && (rule.crawlDelay < 0 || rule.crawlDelay > 86400)) {
        warnings.push(`Crawl delay for ${rule.userAgent} should be between 0 and 86400 seconds`);
      }

      // Validate request rate format
      if (rule.requestRate && !this.isValidRequestRate(rule.requestRate)) {
        errors.push(`Invalid request rate format for ${rule.userAgent}: ${rule.requestRate}`);
      }
    }

    // Check for duplicate user agents
    const userAgents = this.config.rules.map(r => r.userAgent);
    const duplicates = userAgents.filter((ua, index) => userAgents.indexOf(ua) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate user agents found: ${[...new Set(duplicates)].join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMSConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LLMSConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.config.lastModified = new Date();
  }

  /**
   * Get all known AI systems
   */
  getKnownAISystems(): AISystemProfile[] {
    return Array.from(this.knownAISystems.values());
  }

  /**
   * Create a restrictive configuration (block most AI systems)
   */
  createRestrictiveConfig(): void {
    this.config.rules = [
      {
        userAgent: '*',
        disallow: ['/'],
        comment: 'Block all AI systems by default'
      },
      {
        userAgent: 'GoogleBot',
        allow: ['/'],
        comment: 'Allow Google for search indexing'
      }
    ];
    this.config.lastModified = new Date();
  }

  /**
   * Create a permissive configuration (allow most AI systems with rate limiting)
   */
  createPermissiveConfig(): void {
    this.config.rules = [
      {
        userAgent: '*',
        allow: ['/'],
        crawlDelay: 1,
        requestRate: '1/10s',
        comment: 'Allow all AI systems with rate limiting'
      },
      {
        userAgent: 'GPTBot',
        allow: ['/blog/', '/docs/'],
        disallow: ['/private/', '/admin/'],
        crawlDelay: 2,
        requestRate: '1/15s',
        comment: 'OpenAI GPT with specific access'
      }
    ];
    this.config.lastModified = new Date();
  }

  /**
   * Create a balanced configuration (selective AI access)
   */
  createBalancedConfig(): void {
    this.config.rules = [
      {
        userAgent: 'GPTBot',
        allow: ['/blog/', '/docs/', '/public/'],
        disallow: ['/private/', '/admin/', '/user/'],
        crawlDelay: 2,
        requestRate: '1/15s',
        comment: 'OpenAI GPT - Educational and public content only'
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/blog/', '/docs/'],
        disallow: ['/private/', '/admin/'],
        crawlDelay: 1,
        requestRate: '1/10s',
        comment: 'Google AI - Limited access'
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/blog/', '/docs/'],
        crawlDelay: 3,
        requestRate: '1/20s',
        comment: 'Anthropic Claude - Research content'
      },
      {
        userAgent: '*',
        disallow: ['/'],
        comment: 'Block unknown AI systems'
      }
    ];
    this.config.lastModified = new Date();
  }

  private initializeKnownAISystems(): void {
    const systems: AISystemProfile[] = [
      {
        name: 'OpenAI GPT',
        userAgent: 'GPTBot',
        description: 'OpenAI\'s web crawler for ChatGPT and GPT models',
        respectsLLMSTxt: true,
        crawlPatterns: ['*'],
        recommendedSettings: {
          crawlDelay: 2,
          requestRate: '1/15s',
          allowedPaths: ['/blog/', '/docs/', '/public/'],
          disallowedPaths: ['/private/', '/admin/', '/user/']
        }
      },
      {
        name: 'Google Bard/Gemini',
        userAgent: 'Google-Extended',
        description: 'Google\'s AI training crawler',
        respectsLLMSTxt: true,
        crawlPatterns: ['*'],
        recommendedSettings: {
          crawlDelay: 1,
          requestRate: '1/10s',
          allowedPaths: ['/blog/', '/docs/'],
          disallowedPaths: ['/private/', '/admin/']
        }
      },
      {
        name: 'Anthropic Claude',
        userAgent: 'ClaudeBot',
        description: 'Anthropic\'s web crawler for Claude AI',
        respectsLLMSTxt: true,
        crawlPatterns: ['*'],
        recommendedSettings: {
          crawlDelay: 3,
          requestRate: '1/20s',
          allowedPaths: ['/blog/', '/docs/'],
          disallowedPaths: ['/private/', '/admin/', '/user/']
        }
      },
      {
        name: 'Microsoft Bing AI',
        userAgent: 'BingBot',
        description: 'Microsoft\'s crawler for Bing AI and Copilot',
        respectsLLMSTxt: true,
        crawlPatterns: ['*'],
        recommendedSettings: {
          crawlDelay: 1,
          requestRate: '1/10s',
          allowedPaths: ['/blog/', '/docs/', '/public/'],
          disallowedPaths: ['/private/', '/admin/']
        }
      },
      {
        name: 'Perplexity AI',
        userAgent: 'PerplexityBot',
        description: 'Perplexity\'s web crawler for AI search',
        respectsLLMSTxt: true,
        crawlPatterns: ['*'],
        recommendedSettings: {
          crawlDelay: 2,
          requestRate: '1/15s',
          allowedPaths: ['/blog/', '/docs/'],
          disallowedPaths: ['/private/', '/admin/']
        }
      },
      {
        name: 'Meta AI',
        userAgent: 'Meta-ExternalAgent',
        description: 'Meta\'s AI training crawler',
        respectsLLMSTxt: false,
        crawlPatterns: ['*'],
        recommendedSettings: {
          crawlDelay: 5,
          requestRate: '1/30s',
          allowedPaths: ['/public/'],
          disallowedPaths: ['/private/', '/admin/', '/user/', '/blog/']
        }
      }
    ];

    systems.forEach(system => {
      this.knownAISystems.set(system.name.toLowerCase(), system);
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidRequestRate(rate: string): boolean {
    // Format: number/time (e.g., "1/10s", "5/1m", "100/1h")
    const rateRegex = /^\d+\/\d+[smh]$/;
    return rateRegex.test(rate);
  }
}

/**
 * Default LLMS configuration factory
 */
export function createDefaultLLMSConfig(siteName: string, contactEmail: string): LLMSConfig {
  return {
    siteName,
    contactEmail,
    lastModified: new Date(),
    rules: [],
    globalSettings: {
      defaultCrawlDelay: 1,
      defaultRequestRate: '1/10s',
      allowDataMining: false,
      allowCommercialUse: false
    }
  };
}

/**
 * LLMS.txt file server utility
 */
export class LLMSFileServer {
  private manager: LLMSManager;
  private filePath: string;

  constructor(manager: LLMSManager, filePath: string = '/llms.txt') {
    this.manager = manager;
    this.filePath = filePath;
  }

  /**
   * Generate HTTP response for LLMS.txt request
   */
  generateResponse(): {
    content: string;
    headers: Record<string, string>;
    statusCode: number;
  } {
    const validation = this.manager.validateConfig();
    
    if (!validation.isValid) {
      return {
        content: '# LLMS.txt configuration error\n# Please check server logs',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache'
        },
        statusCode: 500
      };
    }

    const content = this.manager.generateLLMSTxt();
    const config = this.manager.getConfig();

    return {
      content,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Last-Modified': config.lastModified.toUTCString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Robots-Tag': 'noindex'
      },
      statusCode: 200
    };
  }

  /**
   * Get file path
   */
  getFilePath(): string {
    return this.filePath;
  }
}