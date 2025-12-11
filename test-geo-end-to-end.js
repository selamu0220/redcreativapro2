/**
 * End-to-End GEO Optimization Testing Suite
 * Tests complete optimization pipeline from content input to performance tracking
 */

import { GEOOptimizationEngine, DEFAULT_GEO_CONFIG } from './lib/geo-optimization.ts';
import { ConversationalLanguageAnalyzer } from './lib/conversational-analyzer.ts';
import { SemanticContextAnalyzer } from './lib/semantic-context-analyzer.ts';
import { QuestionAnswerDetector } from './lib/question-answer-detector.ts';
import { LLMSManager, createDefaultLLMSConfig } from './lib/llms-manager.ts';
import { GenerativeSearchTracker } from './lib/generative-search-tracker.ts';

// Test content samples
const TEST_CONTENT = {
  BASIC: `
    This is a basic article about web development. 
    Web development involves creating websites and applications.
    It requires knowledge of HTML, CSS, and JavaScript.
  `,
  
  CONVERSATIONAL: `
    Are you wondering how to get started with web development? 
    Let's explore the basics together! First, you'll need to understand HTML.
    What is HTML? It's the markup language that structures web content.
    Why is this important? Because HTML forms the foundation of every website.
  `,
  
  TECHNICAL: `
    The implementation of microservices architecture facilitates scalability.
    Subsequently, the utilization of containerization technologies demonstrates
    enhanced deployment methodologies. Furthermore, the optimization of
    database queries necessitates comprehensive performance analysis.
  `,
  
  SEMANTIC_RICH: `
    Search engine optimization (SEO) involves improving website visibility.
    This includes keyword research, content optimization, and link building.
    Related concepts include SERP rankings, organic traffic, and user experience.
    For example, meta tags help search engines understand page content.
    Because of this, proper SEO implementation increases website discoverability.
  `,
  
  QUESTION_HEAVY: `
    What is artificial intelligence? AI refers to machine learning systems.
    How does machine learning work? It uses algorithms to analyze data patterns.
    Why is AI important for businesses? It automates processes and improves efficiency.
    When should companies implement AI? When they have sufficient data and clear objectives.
    Where can AI be applied? In customer service, data analysis, and automation.
  `
};

class GEOEndToEndTester {
  constructor() {
    this.geoEngine = new GEOOptimizationEngine(DEFAULT_GEO_CONFIG);
    this.conversationalAnalyzer = new ConversationalLanguageAnalyzer();
    this.semanticAnalyzer = new SemanticContextAnalyzer();
    this.questionDetector = new QuestionAnswerDetector();
    this.llmsManager = new LLMSManager(createDefaultLLMSConfig('test-site.com', 'test@example.com'));
    this.searchTracker = new GenerativeSearchTracker();
    
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * Run all end-to-end tests
   */
  async runAllTests() {
    console.log('🚀 Starting GEO End-to-End Testing Suite...\n');

    try {
      await this.testCompleteOptimizationPipeline();
      await this.testLLMSTxtGeneration();
      await this.testRealTimeOptimizationSuggestions();
      await this.testPerformanceMonitoring();
      await this.testAISystemIntegration();
      await this.testErrorHandlingAndRecovery();
      await this.testContentVariations();
      await this.testOptimizationAccuracy();

      this.printTestSummary();
    } catch (error) {
      console.error('❌ Test suite failed with error:', error);
      this.testResults.errors.push(`Test suite error: ${error.message}`);
    }
  }

  /**
   * Test complete optimization pipeline from content input to performance tracking
   */
  async testCompleteOptimizationPipeline() {
    console.log('📋 Testing Complete Optimization Pipeline...');

    for (const [contentType, content] of Object.entries(TEST_CONTENT)) {
      try {
        console.log(`  Testing ${contentType} content...`);

        // Step 1: Content Analysis
        const analysis = await this.geoEngine.analyzeContent(content);
        this.assert(analysis.overallScore >= 0 && analysis.overallScore <= 100, 
          `${contentType}: Overall score should be 0-100, got ${analysis.overallScore}`);
        
        this.assert(Array.isArray(analysis.questionAnswerPatterns), 
          `${contentType}: Should return question patterns array`);
        
        this.assert(Array.isArray(analysis.eeatSignals), 
          `${contentType}: Should return EEAT signals array`);

        // Step 2: Optimization Suggestions
        const suggestions = this.geoEngine.getOptimizationSuggestions(analysis);
        this.assert(Array.isArray(suggestions), 
          `${contentType}: Should return suggestions array`);
        
        suggestions.forEach(suggestion => {
          this.assert(['conversational', 'semantic', 'structured', 'eeat'].includes(suggestion.type),
            `${contentType}: Invalid suggestion type: ${suggestion.type}`);
          this.assert(['high', 'medium', 'low'].includes(suggestion.priority),
            `${contentType}: Invalid priority: ${suggestion.priority}`);
        });

        // Step 3: GEO Score Calculation
        const geoScore = await this.geoEngine.calculateGEOScore(content);
        this.assert(geoScore.overall >= 0 && geoScore.overall <= 100,
          `${contentType}: GEO score should be 0-100, got ${geoScore.overall}`);

        // Step 4: Individual Component Analysis
        const conversationalAnalysis = this.conversationalAnalyzer.analyzeContent(content);
        this.assert(typeof conversationalAnalysis.conversationalScore === 'number',
          `${contentType}: Conversational analysis should return numeric score`);

        const semanticAnalysis = this.semanticAnalyzer.analyzeSemanticContext(content);
        this.assert(typeof semanticAnalysis.semanticRichness === 'number',
          `${contentType}: Semantic analysis should return numeric richness score`);

        const qaAnalysis = this.questionDetector.analyzeQuestionAnswerPatterns(content);
        this.assert(typeof qaAnalysis.qaStructureScore === 'number',
          `${contentType}: Q&A analysis should return numeric structure score`);

        console.log(`    ✅ ${contentType} pipeline test passed`);
        this.testResults.passed++;

      } catch (error) {
        console.log(`    ❌ ${contentType} pipeline test failed: ${error.message}`);
        this.testResults.failed++;
        this.testResults.errors.push(`Pipeline test ${contentType}: ${error.message}`);
      }
    }
  }

  /**
   * Test LLMS.txt generation and AI system integration
   */
  async testLLMSTxtGeneration() {
    console.log('🤖 Testing LLMS.txt Generation and AI Integration...');

    try {
      // Test basic LLMS.txt generation
      const llmsTxt = this.llmsManager.generateLLMSTxt();
      this.assert(typeof llmsTxt === 'string' && llmsTxt.length > 0,
        'LLMS.txt should generate non-empty string');
      
      this.assert(llmsTxt.includes('User-agent:'),
        'LLMS.txt should contain User-agent directives');

      // Test rule management
      this.llmsManager.addRule({
        userAgent: 'GPTBot',
        allow: ['/blog/', '/docs/'],
        disallow: ['/private/'],
        crawlDelay: 2,
        comment: 'Test rule for OpenAI'
      });

      const updatedLlmsTxt = this.llmsManager.generateLLMSTxt();
      this.assert(updatedLlmsTxt.includes('GPTBot'),
        'Updated LLMS.txt should contain added rule');

      // Test validation
      const validation = this.llmsManager.validateConfig();
      this.assert(validation.isValid === true,
        `LLMS.txt validation should pass, errors: ${validation.errors.join(', ')}`);

      // Test known AI systems
      const knownSystems = this.llmsManager.getKnownAISystems();
      this.assert(knownSystems.length > 0,
        'Should have known AI systems');

      // Test recommended settings application
      const applied = this.llmsManager.applyRecommendedSettings('OpenAI GPT');
      this.assert(applied === true,
        'Should successfully apply recommended settings');

      console.log('    ✅ LLMS.txt generation test passed');
      this.testResults.passed++;

    } catch (error) {
      console.log(`    ❌ LLMS.txt generation test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`LLMS.txt test: ${error.message}`);
    }
  }

  /**
   * Test real-time optimization suggestion accuracy
   */
  async testRealTimeOptimizationSuggestions() {
    console.log('⚡ Testing Real-time Optimization Suggestions...');

    try {
      // Test suggestions for different content types
      const testCases = [
        {
          content: TEST_CONTENT.TECHNICAL,
          expectedSuggestionTypes: ['conversational'],
          description: 'Technical content should suggest conversational improvements'
        },
        {
          content: TEST_CONTENT.BASIC,
          expectedSuggestionTypes: ['semantic', 'conversational'],
          description: 'Basic content should suggest semantic and conversational improvements'
        },
        {
          content: TEST_CONTENT.CONVERSATIONAL,
          expectedSuggestionTypes: ['semantic'],
          description: 'Conversational content should focus on semantic improvements'
        }
      ];

      for (const testCase of testCases) {
        const analysis = await this.geoEngine.analyzeContent(testCase.content);
        const suggestions = this.geoEngine.getOptimizationSuggestions(analysis);

        // Check if expected suggestion types are present
        const suggestionTypes = suggestions.map(s => s.type);
        const hasExpectedTypes = testCase.expectedSuggestionTypes.some(type => 
          suggestionTypes.includes(type)
        );

        this.assert(hasExpectedTypes,
          `${testCase.description}: Expected types ${testCase.expectedSuggestionTypes.join(', ')}, got ${suggestionTypes.join(', ')}`);

        // Test suggestion quality
        suggestions.forEach(suggestion => {
          this.assert(suggestion.title && suggestion.title.length > 0,
            'Suggestion should have non-empty title');
          this.assert(suggestion.description && suggestion.description.length > 0,
            'Suggestion should have non-empty description');
          this.assert(suggestion.expectedImpact > 0,
            'Suggestion should have positive expected impact');
        });
      }

      console.log('    ✅ Real-time optimization suggestions test passed');
      this.testResults.passed++;

    } catch (error) {
      console.log(`    ❌ Real-time optimization suggestions test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Real-time suggestions test: ${error.message}`);
    }
  }

  /**
   * Test performance monitoring data collection
   */
  async testPerformanceMonitoring() {
    console.log('📊 Testing Performance Monitoring...');

    try {
      const contentId = 'test-content-123';
      const testQuery = 'how to optimize content for AI';
      const testResponse = 'To optimize content for AI, focus on conversational language and clear structure.';

      // Test appearance tracking
      const appearanceId = await this.searchTracker.trackAppearance({
        contentId,
        platform: 'google-sge',
        query: testQuery,
        response: testResponse,
        citationFound: true,
        semanticRelevance: 0.8,
        responseType: 'direct-citation',
        confidence: 0.9
      });

      this.assert(typeof appearanceId === 'string' && appearanceId.length > 0,
        'Should return valid appearance ID');

      // Test semantic relevance calculation
      const semanticScore = await this.searchTracker.calculateSemanticRelevance(
        contentId,
        testQuery,
        testResponse
      );

      this.assert(semanticScore.relevanceScore >= 0 && semanticScore.relevanceScore <= 1,
        `Semantic relevance should be 0-1, got ${semanticScore.relevanceScore}`);
      
      this.assert(Array.isArray(semanticScore.keywordMatches),
        'Should return keyword matches array');

      // Test performance comparison
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      const comparison = await this.searchTracker.getPerformanceComparison(
        contentId,
        startDate,
        endDate,
        {
          organicClicks: 100,
          impressions: 1000,
          averagePosition: 5
        }
      );

      this.assert(comparison.geoMetrics.generativeAppearances >= 0,
        'Should track generative appearances');
      
      this.assert(typeof comparison.performanceRatio === 'number',
        'Should calculate performance ratio');

      // Test data retrieval
      const appearances = this.searchTracker.getContentAppearances(contentId);
      this.assert(appearances.length > 0,
        'Should retrieve tracked appearances');

      console.log('    ✅ Performance monitoring test passed');
      this.testResults.passed++;

    } catch (error) {
      console.log(`    ❌ Performance monitoring test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Performance monitoring test: ${error.message}`);
    }
  }

  /**
   * Test AI system integration
   */
  async testAISystemIntegration() {
    console.log('🔗 Testing AI System Integration...');

    try {
      // Test different AI system configurations
      const aiSystems = ['OpenAI GPT', 'Google Bard/Gemini', 'Anthropic Claude'];
      
      for (const system of aiSystems) {
        const profile = this.llmsManager.getRecommendedSettings(system);
        this.assert(profile !== null,
          `Should have profile for ${system}`);
        
        this.assert(profile.userAgent && profile.userAgent.length > 0,
          `${system} should have user agent`);
        
        this.assert(typeof profile.respectsLLMSTxt === 'boolean',
          `${system} should have LLMS.txt respect flag`);

        // Test applying recommended settings
        const applied = this.llmsManager.applyRecommendedSettings(system);
        this.assert(applied === true,
          `Should apply settings for ${system}`);
      }

      // Test configuration presets
      this.llmsManager.createRestrictiveConfig();
      let validation = this.llmsManager.validateConfig();
      this.assert(validation.isValid,
        'Restrictive config should be valid');

      this.llmsManager.createPermissiveConfig();
      validation = this.llmsManager.validateConfig();
      this.assert(validation.isValid,
        'Permissive config should be valid');

      this.llmsManager.createBalancedConfig();
      validation = this.llmsManager.validateConfig();
      this.assert(validation.isValid,
        'Balanced config should be valid');

      console.log('    ✅ AI system integration test passed');
      this.testResults.passed++;

    } catch (error) {
      console.log(`    ❌ AI system integration test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`AI system integration test: ${error.message}`);
    }
  }

  /**
   * Test error handling and recovery
   */
  async testErrorHandlingAndRecovery() {
    console.log('🛡️ Testing Error Handling and Recovery...');

    try {
      // Test empty content handling
      try {
        const analysis = await this.geoEngine.analyzeContent('');
        this.assert(analysis.overallScore >= 0,
          'Should handle empty content gracefully');
      } catch (error) {
        // Expected behavior - should handle gracefully
        this.assert(error.name === 'GEOAnalysisError',
          'Should throw GEOAnalysisError for empty content');
      }

      // Test invalid LLMS configuration
      const invalidConfig = createDefaultLLMSConfig('', ''); // Empty required fields
      const invalidManager = new LLMSManager(invalidConfig);
      const validation = invalidManager.validateConfig();
      
      this.assert(validation.isValid === false,
        'Should detect invalid configuration');
      this.assert(validation.errors.length > 0,
        'Should report configuration errors');

      // Test malformed content
      const malformedContent = 'a'.repeat(10000); // Very long repetitive content
      const analysis = await this.geoEngine.analyzeContent(malformedContent);
      this.assert(typeof analysis.overallScore === 'number',
        'Should handle malformed content');

      // Test partial analysis results
      const partialContent = 'Short content.';
      const partialAnalysis = await this.geoEngine.analyzeContent(partialContent);
      this.assert(partialAnalysis.improvementAreas.length >= 0,
        'Should provide improvement areas for partial content');

      console.log('    ✅ Error handling and recovery test passed');
      this.testResults.passed++;

    } catch (error) {
      console.log(`    ❌ Error handling and recovery test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Error handling test: ${error.message}`);
    }
  }

  /**
   * Test different content variations
   */
  async testContentVariations() {
    console.log('📝 Testing Content Variations...');

    try {
      const variations = [
        { name: 'Short content', content: 'Brief article about AI.' },
        { name: 'Long content', content: TEST_CONTENT.SEMANTIC_RICH.repeat(5) },
        { name: 'Question-heavy', content: TEST_CONTENT.QUESTION_HEAVY },
        { name: 'Technical jargon', content: TEST_CONTENT.TECHNICAL },
        { name: 'Mixed content', content: TEST_CONTENT.CONVERSATIONAL + TEST_CONTENT.SEMANTIC_RICH }
      ];

      for (const variation of variations) {
        const analysis = await this.geoEngine.analyzeContent(variation.content);
        
        this.assert(typeof analysis.overallScore === 'number',
          `${variation.name}: Should return numeric overall score`);
        
        this.assert(analysis.overallScore >= 0 && analysis.overallScore <= 100,
          `${variation.name}: Score should be 0-100, got ${analysis.overallScore}`);

        const suggestions = this.geoEngine.getOptimizationSuggestions(analysis);
        this.assert(Array.isArray(suggestions),
          `${variation.name}: Should return suggestions array`);

        // Verify suggestions are relevant to content type
        if (variation.name === 'Technical jargon') {
          const hasConversationalSuggestion = suggestions.some(s => s.type === 'conversational');
          this.assert(hasConversationalSuggestion,
            'Technical content should suggest conversational improvements');
        }

        if (variation.name === 'Question-heavy') {
          this.assert(analysis.questionAnswerPatterns.length > 0,
            'Question-heavy content should detect question patterns');
        }
      }

      console.log('    ✅ Content variations test passed');
      this.testResults.passed++;

    } catch (error) {
      console.log(`    ❌ Content variations test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Content variations test: ${error.message}`);
    }
  }

  /**
   * Test optimization accuracy
   */
  async testOptimizationAccuracy() {
    console.log('🎯 Testing Optimization Accuracy...');

    try {
      // Test that optimized content scores higher than original
      const originalContent = TEST_CONTENT.TECHNICAL;
      const originalAnalysis = await this.geoEngine.analyzeContent(originalContent);
      
      // Simulate applying optimization suggestions
      const optimizedContent = originalContent
        .replace(/utilize/g, 'use')
        .replace(/implement/g, 'set up')
        .replace(/facilitate/g, 'help')
        + ' What are the benefits? This approach helps you understand the concepts better.';

      const optimizedAnalysis = await this.geoEngine.analyzeContent(optimizedContent);
      
      this.assert(optimizedAnalysis.conversationalScore > originalAnalysis.conversationalScore,
        'Optimized content should have higher conversational score');

      // Test semantic improvements
      const basicContent = TEST_CONTENT.BASIC;
      const basicAnalysis = await this.geoEngine.analyzeContent(basicContent);
      
      const semanticallyEnhanced = basicContent + 
        ' For example, HTML provides structure, CSS handles styling, and JavaScript adds interactivity. ' +
        'These technologies work together to create modern web applications. ' +
        'Related concepts include responsive design, accessibility, and performance optimization.';

      const enhancedAnalysis = await this.geoEngine.analyzeContent(semanticallyEnhanced);
      
      this.assert(enhancedAnalysis.semanticRichness > basicAnalysis.semanticRichness,
        'Semantically enhanced content should have higher semantic richness');

      // Test question-answer improvements
      const statementContent = 'Web development is important for businesses.';
      const statementAnalysis = await this.geoEngine.analyzeContent(statementContent);
      
      const qaContent = 'Why is web development important for businesses? ' +
        'Web development helps businesses reach customers online and provide digital services.';
      const qaAnalysis = await this.geoEngine.analyzeContent(qaContent);
      
      this.assert(qaAnalysis.questionAnswerPatterns.length > statementAnalysis.questionAnswerPatterns.length,
        'Q&A content should have more question patterns');

      console.log('    ✅ Optimization accuracy test passed');
      this.testResults.passed++;

    } catch (error) {
      console.log(`    ❌ Optimization accuracy test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`Optimization accuracy test: ${error.message}`);
    }
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
   * Print test summary
   */
  printTestSummary() {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎉 End-to-End Testing Complete!');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new GEOEndToEndTester();
  tester.runAllTests().catch(console.error);
}

export { GEOEndToEndTester };