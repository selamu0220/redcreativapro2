import { NextRequest, NextResponse } from 'next/server';
import { LLMSManager, createDefaultLLMSConfig, LLMSRule } from './llms-manager';

/**
 * AI Crawler Permission Handler Middleware
 * Handles AI crawler access control based on LLMS.txt rules
 */

export interface AIRequestInfo {
  userAgent: string;
  path: string;
  ip: string;
  timestamp: Date;
  isAICrawler: boolean;
  aiSystem?: string;
}

export interface PermissionResult {
  allowed: boolean;
  reason: string;
  crawlDelay?: number;
  requestRate?: string;
  shouldThrottle: boolean;
}

export class AICrawlerMiddleware {
  private llmsManager: LLMSManager;
  private requestLog: Map<string, number[]> = new Map();
  private readonly cleanupInterval = 60000; // 1 minute
  
  // Known AI crawler user agents
  private readonly aiCrawlerPatterns = [
    /GPTBot/i,
    /Google-Extended/i,
    /ClaudeBot/i,
    /BingBot/i,
    /PerplexityBot/i,
    /Meta-ExternalAgent/i,
    /ChatGPT-User/i,
    /CCBot/i,
    /anthropic-ai/i,
    /Claude-Web/i
  ];

  constructor(llmsManager?: LLMSManager) {
    if (llmsManager) {
      this.llmsManager = llmsManager;
    } else {
      // Initialize with default configuration
      const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Content Platform';
      const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@example.com';
      const config = createDefaultLLMSConfig(siteName, contactEmail);
      
      this.llmsManager = new LLMSManager(config);
      this.llmsManager.createBalancedConfig();
    }

    // Start cleanup interval
    setInterval(() => this.cleanupRequestLog(), this.cleanupInterval);
  }

  /**
   * Process incoming request and check AI crawler permissions
   */
  processRequest(request: NextRequest): {
    requestInfo: AIRequestInfo;
    permission: PermissionResult;
    response?: NextResponse;
  } {
    const userAgent = request.headers.get('user-agent') || '';
    const path = request.nextUrl.pathname;
    const ip = this.getClientIP(request);
    
    const requestInfo: AIRequestInfo = {
      userAgent,
      path,
      ip,
      timestamp: new Date(),
      isAICrawler: this.isAICrawler(userAgent),
      aiSystem: this.identifyAISystem(userAgent)
    };

    const permission = this.checkPermission(requestInfo);
    
    // Generate response if request should be blocked or throttled
    let response: NextResponse | undefined;
    
    if (!permission.allowed) {
      response = this.createBlockedResponse(permission.reason);
    } else if (permission.shouldThrottle) {
      response = this.createThrottledResponse(permission);
    }

    // Log the request
    this.logRequest(requestInfo, permission);

    return { requestInfo, permission, response };
  }

  /**
   * Check if request is allowed based on LLMS.txt rules
   */
  private checkPermission(requestInfo: AIRequestInfo): PermissionResult {
    if (!requestInfo.isAICrawler) {
      return {
        allowed: true,
        reason: 'Not an AI crawler',
        shouldThrottle: false
      };
    }

    const config = this.llmsManager.getConfig();
    const matchingRule = this.findMatchingRule(requestInfo.userAgent, config.rules);

    if (!matchingRule) {
      // No specific rule found, check for wildcard rule
      const wildcardRule = config.rules.find(rule => rule.userAgent === '*');
      if (wildcardRule) {
        return this.evaluateRule(wildcardRule, requestInfo);
      }
      
      // No rules found, default to allow with basic throttling
      return {
        allowed: true,
        reason: 'No specific rules, default allow',
        shouldThrottle: true,
        crawlDelay: 1,
        requestRate: '1/10s'
      };
    }

    return this.evaluateRule(matchingRule, requestInfo);
  }

  /**
   * Evaluate a specific LLMS rule against the request
   */
  private evaluateRule(rule: LLMSRule, requestInfo: AIRequestInfo): PermissionResult {
    const path = requestInfo.path;

    // Check disallow rules first
    if (rule.disallow) {
      for (const disallowPath of rule.disallow) {
        if (this.pathMatches(path, disallowPath)) {
          return {
            allowed: false,
            reason: `Path ${path} is disallowed for ${rule.userAgent}`,
            shouldThrottle: false
          };
        }
      }
    }

    // Check allow rules
    if (rule.allow) {
      let pathAllowed = false;
      for (const allowPath of rule.allow) {
        if (this.pathMatches(path, allowPath)) {
          pathAllowed = true;
          break;
        }
      }
      
      if (!pathAllowed) {
        return {
          allowed: false,
          reason: `Path ${path} is not explicitly allowed for ${rule.userAgent}`,
          shouldThrottle: false
        };
      }
    }

    // Check rate limiting
    const shouldThrottle = this.shouldThrottleRequest(requestInfo, rule);

    return {
      allowed: true,
      reason: `Request allowed for ${rule.userAgent}`,
      crawlDelay: rule.crawlDelay,
      requestRate: rule.requestRate,
      shouldThrottle
    };
  }

  /**
   * Check if request should be throttled based on rate limits
   */
  private shouldThrottleRequest(requestInfo: AIRequestInfo, rule: LLMSRule): boolean {
    if (!rule.requestRate) return false;

    const key = `${requestInfo.ip}-${requestInfo.aiSystem}`;
    const now = Date.now();
    const requests = this.requestLog.get(key) || [];

    // Parse request rate (e.g., "1/10s" = 1 request per 10 seconds)
    const rateMatch = rule.requestRate.match(/^(\d+)\/(\d+)([smh])$/);
    if (!rateMatch) return false;

    const [, maxRequests, timeValue, timeUnit] = rateMatch;
    const maxReq = parseInt(maxRequests);
    const timeVal = parseInt(timeValue);
    
    let timeWindow: number;
    switch (timeUnit) {
      case 's': timeWindow = timeVal * 1000; break;
      case 'm': timeWindow = timeVal * 60 * 1000; break;
      case 'h': timeWindow = timeVal * 60 * 60 * 1000; break;
      default: return false;
    }

    // Filter requests within the time window
    const recentRequests = requests.filter(timestamp => now - timestamp < timeWindow);
    
    // Update request log
    recentRequests.push(now);
    this.requestLog.set(key, recentRequests);

    return recentRequests.length > maxReq;
  }

  /**
   * Find matching rule for user agent
   */
  private findMatchingRule(userAgent: string, rules: LLMSRule[]): LLMSRule | null {
    // First try exact match
    for (const rule of rules) {
      if (rule.userAgent !== '*' && userAgent.includes(rule.userAgent)) {
        return rule;
      }
    }
    return null;
  }

  /**
   * Check if path matches pattern (supports wildcards)
   */
  private pathMatches(path: string, pattern: string): boolean {
    if (pattern === '/') return path === '/';
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return path.startsWith(prefix);
    }
    return path === pattern || path.startsWith(pattern + '/');
  }

  /**
   * Check if user agent is an AI crawler
   */
  private isAICrawler(userAgent: string): boolean {
    return this.aiCrawlerPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Identify specific AI system from user agent
   */
  private identifyAISystem(userAgent: string): string | undefined {
    if (/GPTBot/i.test(userAgent)) return 'OpenAI GPT';
    if (/Google-Extended/i.test(userAgent)) return 'Google Bard/Gemini';
    if (/ClaudeBot/i.test(userAgent)) return 'Anthropic Claude';
    if (/BingBot/i.test(userAgent)) return 'Microsoft Bing AI';
    if (/PerplexityBot/i.test(userAgent)) return 'Perplexity AI';
    if (/Meta-ExternalAgent/i.test(userAgent)) return 'Meta AI';
    if (/CCBot/i.test(userAgent)) return 'Common Crawl';
    return undefined;
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    
    return 'unknown';
  }

  /**
   * Create blocked response
   */
  private createBlockedResponse(reason: string): NextResponse {
    return new NextResponse(
      `Access denied: ${reason}\n\nPlease check /llms.txt for access rules.`,
      {
        status: 403,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }

  /**
   * Create throttled response
   */
  private createThrottledResponse(permission: PermissionResult): NextResponse {
    const retryAfter = permission.crawlDelay || 60;
    
    return new NextResponse(
      `Rate limit exceeded. Please respect the crawl delay specified in /llms.txt`,
      {
        status: 429,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': permission.requestRate || 'unknown',
          'X-Robots-Tag': 'noindex, nofollow',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }

  /**
   * Log request for monitoring and analytics
   */
  private logRequest(requestInfo: AIRequestInfo, permission: PermissionResult): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Crawler Request:', {
        aiSystem: requestInfo.aiSystem,
        path: requestInfo.path,
        allowed: permission.allowed,
        reason: permission.reason,
        throttled: permission.shouldThrottle
      });
    }
  }

  /**
   * Clean up old request log entries
   */
  private cleanupRequestLog(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    for (const [key, timestamps] of this.requestLog.entries()) {
      const recentTimestamps = timestamps.filter(timestamp => now - timestamp < maxAge);
      if (recentTimestamps.length === 0) {
        this.requestLog.delete(key);
      } else {
        this.requestLog.set(key, recentTimestamps);
      }
    }
  }

  /**
   * Get request statistics
   */
  getStats(): {
    totalRequests: number;
    aiCrawlerRequests: number;
    blockedRequests: number;
    throttledRequests: number;
  } {
    // This would typically be stored in a database or cache
    // For now, return basic stats from memory
    return {
      totalRequests: 0,
      aiCrawlerRequests: 0,
      blockedRequests: 0,
      throttledRequests: 0
    };
  }
}

/**
 * Create middleware function for Next.js
 */
export function createAICrawlerMiddleware(llmsManager?: LLMSManager) {
  const middleware = new AICrawlerMiddleware(llmsManager);
  
  return (request: NextRequest): NextResponse | undefined => {
    const { response } = middleware.processRequest(request);
    return response;
  };
}

/**
 * Default AI crawler middleware instance
 */
export const aiCrawlerMiddleware = new AICrawlerMiddleware();