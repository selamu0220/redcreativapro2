/**
 * AI Platform Compatibility Testing Suite
 * Tests content optimization for different AI platforms and measures improvements
 */

import { GEOOptimizationEngine, DEFAULT_GEO_CONFIG } from './lib/geo-optimization.ts';
import { GenerativeSearchTracker } from './lib/generative-search-tracker.ts';
import { LLMSManager, createDefaultLLMSConfig } from './lib/llms-manager.ts';

// Platform-specific test configurations
const AI_PLATFORMS = {
  'google-sge': {
    name: 'Google Search Generative Experience',
    userAgent: 'Google-Extended',
    preferences: {
      conversationalLanguage: 0.8,
      structuredData: 0.9,
      questionAnswerFormat: 0.9,
      semanticRichness: 0.7,
      citationFriendly: 0.8
    },
    testQueries: [
      'how to optimize content for search engines',
      'what is the best way to improve website performance',
      'why is SEO important for businesses',
      'when should you update your content strategy'
    ]
  },
  'bing-ai': {
    name: 'Microsoft Bing AI (Copilot)',
    userAgent: 'BingBot',
    preferences: {
      conversationalLanguage: 0.9,
      structuredData: 0.7,
      questionAnswerFormat: 0.8,
      semanticRichness: 0.8,
      citationFriendly: 0.9
    },
    testQueries: [
      'explain how artificial intelligence works',
      'compare different machine learning approaches',
      'what are the benefits of automation',
      'how can businesses use AI effectively'
    ]
  },
  'chatgpt': {
    name: 'OpenAI ChatGPT',
    userAgent: 'GPTBot',
    preferences: {
      conversationalLanguage: 0.9,
      structuredData: 0.6,
      questionAnswerFormat: 0.8,
      semanticRichness: 0.9,
      citationFriendly: 0.7
    },
    testQueries: [
      'teach me about web development fundamentals',
      'explain the difference between frontend and backend',
      'what programming languages should I learn first',
      'how do I become a software developer'
    ]
  },
  'claude': {
    name: 'Anthropic Claude',
    userAgent: 'ClaudeBot',
    preferences: {
      conversationalLanguage: 0.8,
      structuredData: 0.7,
      questionAnswerFormat: 0.9,
      semanticRichness: 0.9,
      citationFriendly: 0.8
    },
    testQueries: [
      'analyze the impact of digital transformation',
      'what are the ethical considerations in AI',
      'how do you ensure data privacy and security',
      'explain the principles of responsible AI development'
    ]
  },
  'perplexity': {
    name: 'Perplexity AI',
    userAgent: 'PerplexityBot',
    preferences: {
      conversationalLanguage: 0.7,
      structuredData: 0.8,
      questionAnswerFormat: 0.9,
      semanticRichness: 0.8,
      citationFriendly: 0.9
    },
    testQueries: [
      'research the latest trends in technology',
      'what are the current developments in renewable energy',
      'analyze market trends in e-commerce',
      'compare different cloud computing platforms'
    ]
  }
};

// Test content optimized for different platforms
const PLATFORM_TEST_CONTENT = {
  BASELINE: `
    Content optimization is the process of improving digital content to achieve better performance.
    This involves analyzing various metrics and implementing strategic changes.
    The goal is to enhance user engagement and search engine visibility.
    Content optimization requires understanding of target audience and platform requirements.
  `,
  
  GOOGLE_SGE_OPTIMIZED: `
    What is content optimization? Content optimization is the strategic process of improving digital content to achieve better performance across search engines and user engagement metrics.
    
    How does content optimization work? The process involves several key steps:
    1. Analyzing current content performance using data-driven insights
    2. Identifying optimization opportunities through keyword research and user behavior analysis
    3. Implementing strategic improvements to content structure, readability, and semantic richness
    4. Monitoring results and iterating based on performance metrics
    
    Why is content optimization important? Because it directly impacts your website's visibility in search results and user satisfaction. For example, optimized content can increase organic traffic by 50-200% and improve user engagement rates significantly.
    
    When should you optimize your content? The best practice is to optimize content continuously, with major reviews every 3-6 months and minor updates based on performance data and algorithm changes.
  `,
  
  BING_AI_OPTIMIZED: `
    Let's explore content optimization together! Are you wondering how to make your content more effective?
    
    Content optimization is like fine-tuning a musical instrument - you're adjusting various elements to create harmony between your content and your audience's needs. Here's what you need to know:
    
    **What makes content optimization effective?**
    - Understanding your audience's search intent and language patterns
    - Creating content that answers questions naturally and conversationally
    - Using structured data to help AI systems understand your content context
    - Balancing technical accuracy with accessible language
    
    **How can you measure optimization success?**
    Think of it as tracking multiple performance indicators: organic traffic growth, user engagement metrics, time spent on page, and most importantly, how often your content gets referenced by AI systems in their responses.
    
    **Real-world example:** A technology blog that shifted from formal, technical language to conversational explanations saw a 150% increase in AI citations and 80% improvement in user engagement within six months.
  `,
  
  CHATGPT_OPTIMIZED: `
    I'll help you understand content optimization in a way that's both comprehensive and practical.
    
    **Understanding Content Optimization**
    Content optimization is essentially the art and science of making your content work better for both humans and AI systems. Think of it as creating content that's not just informative, but also discoverable and useful.
    
    **The Core Elements:**
    
    *Semantic Richness:* Your content should include related terms, synonyms, and contextual information. Instead of just saying "SEO," also mention "search engine optimization," "organic traffic," "SERP rankings," and "keyword strategy."
    
    *Conversational Structure:* Write as if you're having a conversation with your reader. Use "you" and "your," ask questions, and provide clear, direct answers.
    
    *Question-Answer Format:* Structure your content to address common questions. This helps AI systems understand the purpose and context of your information.
    
    **Practical Implementation:**
    Start by identifying the main questions your audience asks. Then, create content sections that directly address these questions with clear, comprehensive answers. Include examples, explanations, and related concepts to provide depth and context.
    
    **Why This Matters:**
    AI systems are becoming increasingly sophisticated at understanding context and intent. Content that's optimized for AI consumption is also typically better for human readers - it's clearer, more comprehensive, and more useful.
  `,
  
  CLAUDE_OPTIMIZED: `
    Content optimization represents a fundamental shift in how we approach digital communication, requiring careful consideration of both technical requirements and human needs.
    
    **Analytical Framework for Content Optimization**
    
    When examining content optimization, we must consider multiple dimensions:
    
    1. **Semantic Depth and Context**
    Content should demonstrate comprehensive understanding of the topic through varied vocabulary, related concepts, and contextual connections. This involves not just keyword inclusion, but semantic relationship mapping.
    
    2. **Structural Clarity and Logic**
    Information architecture should follow logical progression, with clear hierarchies and relationships between concepts. This facilitates both human comprehension and AI parsing.
    
    3. **Evidence-Based Assertions**
    Claims should be supported by data, examples, or authoritative sources. This builds credibility and provides AI systems with reliable information to reference.
    
    **Ethical Considerations**
    Content optimization must balance effectiveness with responsibility. This means:
    - Ensuring accuracy and avoiding misleading information
    - Respecting user privacy and data protection principles
    - Considering the broader impact of AI-optimized content on information ecosystems
    
    **Measurement and Evaluation**
    Success metrics should encompass both quantitative measures (traffic, engagement, citations) and qualitative assessments (user satisfaction, information accuracy, ethical compliance).
    
    The goal is creating content that serves both immediate user needs and contributes positively to the broader information landscape.
  `,
  
  PERPLEXITY_OPTIMIZED: `
    **Content Optimization: A Research-Based Analysis**
    
    According to recent studies in digital marketing and information science, content optimization has evolved significantly with the rise of AI-powered search systems.
    
    **Current Research Findings:**
    - A 2024 study by Search Engine Journal found that AI-optimized content receives 3x more citations in generative search results
    - Research from MIT's Computer Science and Artificial Intelligence Laboratory indicates that conversational content structure improves AI comprehension by 40%
    - Data from Google's Search Quality team shows that semantically rich content performs 60% better in AI-generated summaries
    
    **Evidence-Based Best Practices:**
    
    1. **Question-Driven Structure:** Research shows that content structured around common user questions receives higher relevance scores from AI systems.
    
    2. **Semantic Clustering:** Studies indicate that including related terms and synonyms within content improves AI understanding and citation accuracy.
    
    3. **Authoritative Sourcing:** Content that references credible sources and provides proper attribution is more likely to be cited by AI systems.
    
    **Comparative Analysis:**
    When comparing traditional SEO-optimized content versus AI-optimized content:
    - Traditional: Focuses on keyword density and technical SEO factors
    - AI-Optimized: Emphasizes semantic understanding, conversational structure, and comprehensive topic coverage
    
    **Future Implications:**
    Research trends suggest that content optimization will increasingly focus on semantic understanding and contextual relevance rather than traditional ranking factors.
    
    Sources: Search Engine Journal (2024), MIT CSAIL Research Papers, Google Search Quality Guidelines
  `
};

class AIPlatformCompatibilityTester {
  constructor() {
    this.geoEngine = new GEOOptimizationEngine(DEFAULT_GEO_CONFIG);
    this.searchTracker = new GenerativeSearchTracker();
    this.llmsManager = new LLMSManager(createDefaultLLMSConfig('test-platform.com', 'test@platform.com'));
    
    this.testResults = {
      platformTests: {},
      overallResults: {
        passed: 0,
        failed: 0,
        errors: []
      }
    };
  }

  /**
   * Run all AI platform compatibility tests
   */
  async runAllTests() {
    console.log('🤖 Starting AI Platform Compatibility Testing Suite...\n');

    try {
      await this.testGoogleSGECompatibility();
      await this.testBingAICompatibility();
      await this.testChatGPTCompatibility();
      await this.testClaudeCompatibility();
      await this.testPerplexityCompatibility();
      await this.testCrossplatformOptimization();
      await this.testSemanticRelevanceImprovements();
      await this.testCitationAccuracyImprovements();
      await this.testPlatformSpecificLLMSConfiguration();

      this.printTestSummary();
    } catch (error) {
      console.error('❌ Platform compatibility test suite failed:', error);
      this.testResults.overallResults.errors.push(`Test suite error: ${error.message}`);
    }
  }

  /**
   * Test Google SGE compatibility
   */
  async testGoogleSGECompatibility() {
    console.log('🔍 Testing Google SGE Compatibility...');
    
    const platform = 'google-sge';
    const platformConfig = AI_PLATFORMS[platform];
    
    try {
      const results = await this.testPlatformOptimization(
        platform,
        PLATFORM_TEST_CONTENT.GOOGLE_SGE_OPTIMIZED,
        PLATFORM_TEST_CONTENT.BASELINE,
        platformConfig
      );

      // Google SGE specific tests
      this.assert(results.optimized.questionAnswerPatterns.length > results.baseline.questionAnswerPatterns.length,
        'Google SGE optimized content should have more Q&A patterns');

      this.assert(results.optimized.structuredDataScore > results.baseline.structuredDataScore,
        'Google SGE optimized content should have better structured data score');

      // Test FAQ schema generation potential
      const qaAnalysis = results.optimized.questionAnswerPatterns;
      const faqOpportunities = qaAnalysis.filter(qa => qa.type === 'explicit').length;
      this.assert(faqOpportunities >= 3,
        'Google SGE content should have multiple FAQ opportunities');

      console.log('    ✅ Google SGE compatibility test passed');
      this.testResults.overallResults.passed++;

    } catch (error) {
      console.log(`    ❌ Google SGE compatibility test failed: ${error.message}`);
      this.testResults.overallResults.failed++;
      this.testResults.overallResults.errors.push(`Google SGE test: ${error.message}`);
    }
  }

  /**
   * Test Bing AI compatibility
   */
  async testBingAICompatibility() {
    console.log('🔷 Testing Bing AI Compatibility...');
    
    const platform = 'bing-ai';
    const platformConfig = AI_PLATFORMS[platform];
    
    try {
      const results = await this.testPlatformOptimization(
        platform,
        PLATFORM_TEST_CONTENT.BING_AI_OPTIMIZED,
        PLATFORM_TEST_CONTENT.BASELINE,
        platformConfig
      );

      // Bing AI specific tests - prefers conversational tone
      this.assert(results.optimized.conversationalScore > results.baseline.conversationalScore + 20,
        'Bing AI optimized content should have significantly higher conversational score');

      // Test for engaging language patterns
      const optimizedContent = PLATFORM_TEST_CONTENT.BING_AI_OPTIMIZED;
      const hasEngagingPatterns = /let's|you're|here's|what's/gi.test(optimizedContent);
      this.assert(hasEngagingPatterns,
        'Bing AI content should use engaging conversational patterns');

      // Test citation-friendly structure
      const hasCitationMarkers = optimizedContent.includes('**') || optimizedContent.includes('*');
      this.assert(hasCitationMarkers,
        'Bing AI content should have clear citation markers');

      console.log('    ✅ Bing AI compatibility test passed');
      this.testResults.overallResults.passed++;

    } catch (error) {
      console.log(`    ❌ Bing AI compatibility test failed: ${error.message}`);
      this.testResults.overallResults.failed++;
      this.testResults.overallResults.errors.push(`Bing AI test: ${error.message}`);
    }
  }

  /**
   * Test ChatGPT compatibility
   */
  async testChatGPTCompatibility() {
    console.log('💬 Testing ChatGPT Compatibility...');
    
    const platform = 'chatgpt';
    const platformConfig = AI_PLATFORMS[platform];
    
    try {
      const results = await this.testPlatformOptimization(
        platform,
        PLATFORM_TEST_CONTENT.CHATGPT_OPTIMIZED,
        PLATFORM_TEST_CONTENT.BASELINE,
        platformConfig
      );

      // ChatGPT specific tests - high semantic richness
      this.assert(results.optimized.semanticRichness > results.baseline.semanticRichness + 15,
        'ChatGPT optimized content should have higher semantic richness');

      // Test for educational structure
      const optimizedContent = PLATFORM_TEST_CONTENT.CHATGPT_OPTIMIZED;
      const hasEducationalStructure = optimizedContent.includes('**') && optimizedContent.includes('*');
      this.assert(hasEducationalStructure,
        'ChatGPT content should have clear educational structure');

      // Test for comprehensive explanations
      const hasExplanations = /think of it|essentially|for example|this means/gi.test(optimizedContent);
      this.assert(hasExplanations,
        'ChatGPT content should include comprehensive explanations');

      console.log('    ✅ ChatGPT compatibility test passed');
      this.testResults.overallResults.passed++;

    } catch (error) {
      console.log(`    ❌ ChatGPT compatibility test failed: ${error.message}`);
      this.testResults.overallResults.failed++;
      this.testResults.overallResults.errors.push(`ChatGPT test: ${error.message}`);
    }
  }

  /**
   * Test Claude compatibility
   */
  async testClaudeCompatibility() {
    console.log('🎭 Testing Claude Compatibility...');
    
    const platform = 'claude';
    const platformConfig = AI_PLATFORMS[platform];
    
    try {
      const results = await this.testPlatformOptimization(
        platform,
        PLATFORM_TEST_CONTENT.CLAUDE_OPTIMIZED,
        PLATFORM_TEST_CONTENT.BASELINE,
        platformConfig
      );

      // Claude specific tests - analytical and structured
      this.assert(results.optimized.eeatSignals.length > results.baseline.eeatSignals.length,
        'Claude optimized content should have more EEAT signals');

      // Test for analytical framework
      const optimizedContent = PLATFORM_TEST_CONTENT.CLAUDE_OPTIMIZED;
      const hasAnalyticalStructure = /framework|analysis|consideration|evaluation/gi.test(optimizedContent);
      this.assert(hasAnalyticalStructure,
        'Claude content should have analytical framework');

      // Test for ethical considerations
      const hasEthicalContent = /ethical|responsibility|principles/gi.test(optimizedContent);
      this.assert(hasEthicalContent,
        'Claude content should address ethical considerations');

      console.log('    ✅ Claude compatibility test passed');
      this.testResults.overallResults.passed++;

    } catch (error) {
      console.log(`    ❌ Claude compatibility test failed: ${error.message}`);
      this.testResults.overallResults.failed++;
      this.testResults.overallResults.errors.push(`Claude test: ${error.message}`);
    }
  }

  /**
   * Test Perplexity compatibility
   */
  async testPerplexityCompatibility() {
    console.log('🔍 Testing Perplexity AI Compatibility...');
    
    const platform = 'perplexity';
    const platformConfig = AI_PLATFORMS[platform];
    
    try {
      const results = await this.testPlatformOptimization(
        platform,
        PLATFORM_TEST_CONTENT.PERPLEXITY_OPTIMIZED,
        PLATFORM_TEST_CONTENT.BASELINE,
        platformConfig
      );

      // Perplexity specific tests - research-focused
      const optimizedContent = PLATFORM_TEST_CONTENT.PERPLEXITY_OPTIMIZED;
      
      // Test for research citations
      const hasCitations = /according to|research|study|data from/gi.test(optimizedContent);
      this.assert(hasCitations,
        'Perplexity content should include research citations');

      // Test for comparative analysis
      const hasComparisons = /compared|versus|analysis|findings/gi.test(optimizedContent);
      this.assert(hasComparisons,
        'Perplexity content should include comparative analysis');

      // Test for authoritative sources
      const hasSources = optimizedContent.includes('Sources:') || /MIT|Google|Journal/gi.test(optimizedContent);
      this.assert(hasSources,
        'Perplexity content should reference authoritative sources');

      console.log('    ✅ Perplexity AI compatibility test passed');
      this.testResults.overallResults.passed++;

    } catch (error) {
      console.log(`    ❌ Perplexity AI compatibility test failed: ${error.message}`);
      this.testResults.overallResults.failed++;
      this.testResults.overallResults.errors.push(`Perplexity AI test: ${error.message}`);
    }
  }

  /**
   * Test cross-platform optimization
   */
  async testCrossplatformOptimization() {
    console.log('🌐 Testing Cross-platform Optimization...');

    try {
      // Test content that should work well across all platforms
      const universalContent = `
        What is content optimization and why does it matter?
        
        Content optimization is the strategic process of improving digital content to perform better across search engines and AI systems. Here's what you need to know:
        
        **Key Benefits:**
        - Increased visibility in search results and AI-generated responses
        - Better user engagement and satisfaction
        - Higher conversion rates and business outcomes
        
        **How it works:**
        1. Analyze current content performance using data-driven insights
        2. Identify optimization opportunities through research and testing
        3. Implement improvements based on best practices and platform requirements
        4. Monitor results and iterate for continuous improvement
        
        **Research shows** that optimized content can increase organic traffic by 50-200% and improve AI citation rates by up to 300%.
        
        **For example,** a technology company that implemented comprehensive content optimization saw:
        - 150% increase in organic search traffic
        - 200% improvement in AI system citations
        - 80% better user engagement metrics
        
        The key is understanding that different AI platforms have varying preferences, but certain principles work universally: clear structure, conversational tone, comprehensive coverage, and authoritative sourcing.
      `;

      const analysis = await this.geoEngine.analyzeContent(universalContent);
      
      // Test that universal content meets minimum thresholds for all platforms
      this.assert(analysis.conversationalScore >= 60,
        'Universal content should have good conversational score');
      
      this.assert(analysis.semanticRichness >= 60,
        'Universal content should have good semantic richness');
      
      this.assert(analysis.questionAnswerPatterns.length >= 2,
        'Universal content should have multiple Q&A patterns');
      
      this.assert(analysis.eeatSignals.length >= 1,
        'Universal content should have EEAT signals');

      // Test platform-specific LLMS.txt configurations
      for (const [platformKey, platformConfig] of Object.entries(AI_PLATFORMS)) {
        this.llmsManager.addRule({
          userAgent: platformConfig.userAgent,
          allow: ['/blog/', '/docs/'],
          crawlDelay: 2,
          requestRate: '1/15s',
          comment: `Optimized for ${platformConfig.name}`
        });
      }

      const llmsTxt = this.llmsManager.generateLLMSTxt();
      this.assert(llmsTxt.includes('GPTBot') && llmsTxt.includes('Google-Extended'),
        'LLMS.txt should include multiple AI platform user agents');

      console.log('    ✅ Cross-platform optimization test passed');
      this.testResults.overallResults.passed++;

    } catch (error) {
      console.log(`    ❌ Cross-platform optimization test failed: ${error.message}`);
      this.testResults.overallResults.failed++;
      this.testResults.overallResults.errors.push(`Cross-platform test: ${error.message}`);
    }
  }

  /**
   * Test semantic relevance improvements across platforms
   */
  async testSemanticRelevanceImprovements() {
    console.log('🧠 Testing Semantic Relevance Improvements...');

    try {
      const testCases = [
        {
          query: 'how to improve website performance',
          baselineContent: 'Website performance is important for user experience.',
          optimizedContent: `
            How can you improve website performance? Website performance optimization involves several key strategies:
            
            **Core Web Vitals Optimization:**
            - Largest Contentful Paint (LCP): Optimize images and server response times
            - First Input Delay (FID): Minimize JavaScript execution time
            - Cumulative Layout Shift (CLS): Ensure stable page layouts
            
            **Related techniques include:**
            - Image compression and lazy loading
            - Code minification and bundling
            - Content delivery network (CDN) implementation
            - Browser caching optimization
            
            For example, implementing these optimizations can reduce page load times by 40-60% and improve user satisfaction scores significantly.
          `
        },
        {
          query: 'what is machine learning',
          baselineContent: 'Machine learning is a type of artificial intelligence.',
          optimizedContent: `
            What is machine learning and how does it work?
            
            Machine learning is a subset of artificial intelligence (AI) that enables computers to learn and improve from experience without being explicitly programmed. Here's how it works:
            
            **Core Concepts:**
            - Algorithms analyze data patterns to make predictions
            - Models improve accuracy through training on large datasets
            - Different types include supervised, unsupervised, and reinforcement learning
            
            **Real-world applications:**
            - Recommendation systems (Netflix, Amazon)
            - Image recognition and computer vision
            - Natural language processing and chatbots
            - Predictive analytics and fraud detection
            
            **Related technologies:** Deep learning, neural networks, data science, artificial intelligence, automation, and predictive modeling all work together in the machine learning ecosystem.
          `
        }
      ];

      for (const testCase of testCases) {
        // Test baseline semantic relevance
        const baselineScore = await this.searchTracker.calculateSemanticRelevance(
          'baseline-content',
          testCase.query,
          testCase.baselineContent
        );

        // Test optimized semantic relevance
        const optimizedScore = await this.searchTracker.calculateSemanticRelevance(
          'optimized-content',
          testCase.query,
          testCase.optimizedContent
        );

        this.assert(optimizedScore.relevanceScore > baselineScore.relevanceScore,
          `Optimized content should have higher semantic relevance for query: "${testCase.query}"`);

        this.assert(optimizedScore.keywordMatches.length > baselineScore.keywordMatches.length,
          `Optimized content should have more keyword matches for query: "${testCase.query}"`);

        this.assert(optimizedScore.contextualRelevance > baselineScore.contextualRelevance,
          `Optimized content should have higher contextual relevance for query: "${testCase.query}"`);
      }

      console.log('    ✅ Semantic relevance improvements test passed');
      this.testResults.overallResults.passed++;

    } catch (error) {
      console.log(`    ❌ Semantic relevance improvements test failed: ${error.message}`);
      this.testResults.overallResults.failed++;
      this.testResults.overallResults.errors.push(`Semantic relevance test: ${error.message}`);
    }
  }

  /**
   * Test citation accuracy improvements
   */
  async testCitationAccuracyImprovements() {
    console.log('📚 Testing Citation Accuracy Improvements...');

    try {
      const citationTestCases = [
        {
          platform: 'google-sge',
          query: 'benefits of content optimization',
          response: 'Content optimization can increase organic traffic by 50-200% according to recent studies. It also improves user engagement and AI citation rates.',
          expectedCitation: true,
          expectedRelevance: 0.8
        },
        {
          platform: 'bing-ai',
          query: 'how to write conversational content',
          response: 'To write conversational content, use personal pronouns like "you" and "your", ask questions, and provide clear answers. This approach helps AI systems understand and reference your content better.',
          expectedCitation: true,
          expectedRelevance: 0.7
        },
        {
          platform: 'chatgpt',
          query: 'explain semantic richness in content',
          response: 'Semantic richness involves using varied vocabulary, related terms, and contextual information. This includes synonyms, related concepts, and comprehensive topic coverage.',
          expectedCitation: true,
          expectedRelevance: 0.8
        }
      ];

      for (const testCase of citationTestCases) {
        // Track the appearance
        const appearanceId = await this.searchTracker.trackAppearance({
          contentId: `citation-test-${testCase.platform}`,
          platform: testCase.platform,
          query: testCase.query,
          response: testCase.response,
          citationFound: testCase.expectedCitation,
          semanticRelevance: testCase.expectedRelevance,
          responseType: 'direct-citation',
          confidence: 0.9
        });

        this.assert(typeof appearanceId === 'string' && appearanceId.length > 0,
          `Should track citation appearance for ${testCase.platform}`);

        // Calculate semantic relevance
        const semanticScore = await this.searchTracker.calculateSemanticRelevance(
          `citation-test-${testCase.platform}`,
          testCase.query,
          testCase.response
        );

        this.assert(semanticScore.relevanceScore >= testCase.expectedRelevance - 0.1,
          `Citation relevance should meet expected threshold for ${testCase.platform}`);
      }

      // Test citation rate calculation
      const appearances = this.searchTracker.getContentAppearances('citation-test-google-sge');
      this.assert(appearances.length > 0,
        'Should have tracked citation appearances');

      console.log('    ✅ Citation accuracy improvements test passed');
      this.testResults.overallResults.passed++;

    } catch (error) {
      console.log(`    ❌ Citation accuracy improvements test failed: ${error.message}`);
      this.testResults.overallResults.failed++;
      this.testResults.overallResults.errors.push(`Citation accuracy test: ${error.message}`);
    }
  }

  /**
   * Test platform-specific LLMS configuration
   */
  async testPlatformSpecificLLMSConfiguration() {
    console.log('⚙️ Testing Platform-specific LLMS Configuration...');

    try {
      // Test different configuration strategies for different platforms
      const configStrategies = [
        {
          name: 'Research-friendly',
          platforms: ['google-sge', 'perplexity'],
          config: {
            allow: ['/research/', '/studies/', '/data/', '/blog/'],
            disallow: ['/private/', '/internal/'],
            crawlDelay: 1,
            requestRate: '1/10s'
          }
        },
        {
          name: 'Educational-focused',
          platforms: ['chatgpt', 'claude'],
          config: {
            allow: ['/tutorials/', '/guides/', '/docs/', '/examples/'],
            disallow: ['/private/', '/admin/', '/user/'],
            crawlDelay: 2,
            requestRate: '1/15s'
          }
        },
        {
          name: 'Conversational-optimized',
          platforms: ['bing-ai'],
          config: {
            allow: ['/blog/', '/faq/', '/help/', '/community/'],
            disallow: ['/technical/', '/api/', '/private/'],
            crawlDelay: 1,
            requestRate: '1/12s'
          }
        }
      ];

      for (const strategy of configStrategies) {
        // Clear existing rules
        const currentConfig = this.llmsManager.getConfig();
        currentConfig.rules = [];
        this.llmsManager.updateConfig(currentConfig);

        // Apply strategy-specific rules
        for (const platformKey of strategy.platforms) {
          const platformConfig = AI_PLATFORMS[platformKey];
          if (platformConfig) {
            this.llmsManager.addRule({
              userAgent: platformConfig.userAgent,
              allow: strategy.config.allow,
              disallow: strategy.config.disallow,
              crawlDelay: strategy.config.crawlDelay,
              requestRate: strategy.config.requestRate,
              comment: `${strategy.name} strategy for ${platformConfig.name}`
            });
          }
        }

        // Validate configuration
        const validation = this.llmsManager.validateConfig();
        this.assert(validation.isValid,
          `${strategy.name} configuration should be valid: ${validation.errors.join(', ')}`);

        // Test LLMS.txt generation
        const llmsTxt = this.llmsManager.generateLLMSTxt();
        this.assert(llmsTxt.length > 0,
          `${strategy.name} should generate valid LLMS.txt`);

        // Verify platform-specific rules are included
        for (const platformKey of strategy.platforms) {
          const platformConfig = AI_PLATFORMS[platformKey];
          if (platformConfig) {
            this.assert(llmsTxt.includes(platformConfig.userAgent),
              `LLMS.txt should include ${platformConfig.userAgent} for ${strategy.name}`);
          }
        }
      }

      console.log('    ✅ Platform-specific LLMS configuration test passed');
      this.testResults.overallResults.passed++;

    } catch (error) {
      console.log(`    ❌ Platform-specific LLMS configuration test failed: ${error.message}`);
      this.testResults.overallResults.failed++;
      this.testResults.overallResults.errors.push(`LLMS configuration test: ${error.message}`);
    }
  }

  /**
   * Test platform optimization with baseline comparison
   */
  async testPlatformOptimization(platform, optimizedContent, baselineContent, platformConfig) {
    // Analyze baseline content
    const baselineAnalysis = await this.geoEngine.analyzeContent(baselineContent);
    
    // Analyze optimized content
    const optimizedAnalysis = await this.geoEngine.analyzeContent(optimizedContent);
    
    // Calculate platform-specific scores
    const baselineScore = this.calculatePlatformScore(baselineAnalysis, platformConfig.preferences);
    const optimizedScore = this.calculatePlatformScore(optimizedAnalysis, platformConfig.preferences);
    
    // Store results
    this.testResults.platformTests[platform] = {
      baseline: {
        ...baselineAnalysis,
        platformScore: baselineScore,
        structuredDataScore: this.calculateStructuredDataScore(baselineContent)
      },
      optimized: {
        ...optimizedAnalysis,
        platformScore: optimizedScore,
        structuredDataScore: this.calculateStructuredDataScore(optimizedContent)
      },
      improvement: optimizedScore - baselineScore
    };
    
    // Assert improvement
    this.assert(optimizedScore > baselineScore,
      `${platform} optimized content should score higher than baseline`);
    
    return this.testResults.platformTests[platform];
  }

  /**
   * Calculate platform-specific score based on preferences
   */
  calculatePlatformScore(analysis, preferences) {
    return (
      analysis.conversationalScore * preferences.conversationalLanguage +
      analysis.semanticRichness * preferences.semanticRichness +
      (analysis.questionAnswerPatterns.length * 10) * preferences.questionAnswerFormat +
      (analysis.eeatSignals.length * 15) * preferences.citationFriendly
    ) / 4;
  }

  /**
   * Calculate structured data score (simplified)
   */
  calculateStructuredDataScore(content) {
    let score = 0;
    
    // Check for structured elements
    if (content.includes('**') || content.includes('*')) score += 20; // Headings/emphasis
    if (/\d+\./g.test(content)) score += 15; // Numbered lists
    if (content.includes('?') && content.includes('\n')) score += 25; // Q&A structure
    if (/for example|such as|including/gi.test(content)) score += 20; // Examples
    if (/according to|research|study/gi.test(content)) score += 20; // Citations
    
    return Math.min(score, 100);
  }

  /**
   * Assert helper function
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Print comprehensive test summary
   */
  printTestSummary() {
    console.log('\n📊 AI Platform Compatibility Test Summary:');
    console.log(`✅ Passed: ${this.testResults.overallResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.overallResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.overallResults.passed / (this.testResults.overallResults.passed + this.testResults.overallResults.failed)) * 100).toFixed(1)}%`);
    
    // Platform-specific results
    if (Object.keys(this.testResults.platformTests).length > 0) {
      console.log('\n🎯 Platform-specific Results:');
      for (const [platform, results] of Object.entries(this.testResults.platformTests)) {
        console.log(`  ${platform.toUpperCase()}:`);
        console.log(`    Baseline Score: ${results.baseline.platformScore.toFixed(1)}`);
        console.log(`    Optimized Score: ${results.optimized.platformScore.toFixed(1)}`);
        console.log(`    Improvement: +${results.improvement.toFixed(1)} points`);
      }
    }
    
    if (this.testResults.overallResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.overallResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎉 AI Platform Compatibility Testing Complete!');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AIPlatformCompatibilityTester();
  tester.runAllTests().catch(console.error);
}

export { AIPlatformCompatibilityTester };