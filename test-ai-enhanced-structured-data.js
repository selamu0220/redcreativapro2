/**
 * Test AI-Enhanced Structured Data Generation
 * Tests the new GEO-optimized structured data features
 */

import { StructuredDataManager } from './lib/structured-data.js';
import { GEOOptimizationEngine } from './lib/geo-optimization.js';

// Test content samples
const testArticleContent = `
# How to Optimize Content for AI Search Engines

AI search engines are changing how we approach SEO. This comprehensive guide will help you understand the key strategies for optimizing your content for generative AI systems like ChatGPT, Google SGE, and Bing AI.

## What is Generative Engine Optimization?

Generative Engine Optimization (GEO) is the practice of optimizing content specifically for AI-powered search systems. Unlike traditional SEO, GEO focuses on making content easily digestible by AI models.

## Why is GEO Important?

Because AI systems need structured, conversational content to provide accurate responses. Your content needs to answer questions directly and provide clear context.

## How to Get Started

1. Use conversational language
2. Structure content with clear headings
3. Include FAQ sections
4. Add semantic context
`;

const testFAQContent = `
Q: What is the difference between SEO and GEO?
A: SEO optimizes for traditional search engines, while GEO optimizes for AI-powered generative systems that create responses rather than just ranking pages.

Q: How do I make my content more conversational?
A: Use personal pronouns like "you" and "your", ask questions, and write in a natural speaking tone rather than formal business language.

Q: What are EEAT signals?
A: EEAT stands for Experience, Expertise, Authoritativeness, and Trustworthiness - key factors that AI systems use to evaluate content quality.
`;

const testHowToContent = `
# How to Set Up GEO Optimization

Step 1: Analyze your current content
Review your existing content to identify formal language patterns and technical jargon that could be made more conversational.

Step 2: Implement conversational language
Replace formal terms with natural alternatives. For example, use "help" instead of "facilitate" and "use" instead of "utilize".

Step 3: Add question-answer pairs
Include FAQ sections and structure content to directly answer common user questions.

Step 4: Enhance semantic context
Add related terms and synonyms to help AI systems understand the full context of your content.
`;

async function testAIEnhancedStructuredData() {
  console.log('🧪 Testing AI-Enhanced Structured Data Generation...\n');

  const manager = new StructuredDataManager();
  const geoEngine = new GEOOptimizationEngine();

  try {
    // Test 1: AI-Enhanced Article Schema
    console.log('📄 Test 1: AI-Enhanced Article Schema Generation');
    const articleSchema = await manager.generateAIOptimizedSchemaFromContent(
      testArticleContent,
      'article',
      geoEngine
    );
    
    console.log('✅ Article schema generated successfully');
    console.log('Schema type:', articleSchema['@type']);
    console.log('Has semantic context:', !!articleSchema.about);
    console.log('Has conversational indicators:', !!articleSchema.genre);
    console.log('Has Q&A integration:', !!articleSchema.mainEntity);
    
    // Validate AI optimization
    const articleValidation = manager.validateAIOptimizedSchema(articleSchema);
    console.log('AI Optimization Score:', articleValidation.aiOptimizationScore);
    console.log('Suggestions:', articleValidation.suggestions.length);
    console.log('');

    // Test 2: AI-Enhanced FAQ Schema
    console.log('❓ Test 2: AI-Enhanced FAQ Schema Generation');
    const faqSchema = await manager.generateAIOptimizedSchemaFromContent(
      testFAQContent,
      'faq',
      geoEngine
    );
    
    console.log('✅ FAQ schema generated successfully');
    console.log('Schema type:', faqSchema['@type']);
    console.log('Number of questions:', faqSchema.mainEntity?.length || 0);
    
    // Check for AI enhancements
    const firstQuestion = faqSchema.mainEntity?.[0];
    console.log('Has semantic variations:', !!firstQuestion?.alternateName);
    console.log('Has conversational context:', !!firstQuestion?.description);
    console.log('Has confidence scores:', !!firstQuestion?.additionalProperty);
    
    const faqValidation = manager.validateAIOptimizedSchema(faqSchema);
    console.log('AI Optimization Score:', faqValidation.aiOptimizationScore);
    console.log('');

    // Test 3: AI-Enhanced How-To Schema
    console.log('📋 Test 3: AI-Enhanced How-To Schema Generation');
    const howToSchema = await manager.generateAIOptimizedSchemaFromContent(
      testHowToContent,
      'howto',
      geoEngine
    );
    
    console.log('✅ How-To schema generated successfully');
    console.log('Schema type:', howToSchema['@type']);
    console.log('Number of steps:', howToSchema.step?.length || 0);
    
    // Check for AI enhancements
    const firstStep = howToSchema.step?.[0];
    console.log('Has conversational descriptions:', !!firstStep?.description);
    console.log('Has semantic context:', !!firstStep?.about);
    console.log('Has common questions:', !!firstStep?.potentialAction);
    
    const howToValidation = manager.validateAIOptimizedSchema(howToSchema);
    console.log('AI Optimization Score:', howToValidation.aiOptimizationScore);
    console.log('');

    // Test 4: Manual AI-Enhanced Article Creation
    console.log('🎯 Test 4: Manual AI-Enhanced Article Creation');
    const enhancedArticle = {
      title: 'Complete Guide to GEO Optimization',
      description: 'Learn how to optimize your content for AI-powered search engines',
      content: testArticleContent,
      author: 'Red Creativa AI Team',
      datePublished: new Date().toISOString(),
      url: 'https://redcreativa.pro/geo-guide',
      category: 'AI Optimization',
      keywords: ['GEO', 'AI optimization', 'content strategy'],
      semanticKeywords: ['generative search', 'conversational content', 'AI-friendly'],
      conversationalTone: true,
      eeatSignals: {
        authorExpertise: 'AI content optimization specialist with 5+ years experience',
        authorCredentials: ['Google AI Certified', 'Content Strategy Expert'],
        sources: ['Google AI Research', 'OpenAI Documentation'],
        lastFactCheck: new Date().toISOString()
      },
      aiOptimizations: {
        questionAnswerPairs: [
          { question: 'What is GEO?', answer: 'Generative Engine Optimization for AI systems' },
          { question: 'How does GEO differ from SEO?', answer: 'GEO focuses on AI consumption rather than search ranking' }
        ],
        semanticContext: ['artificial intelligence', 'search optimization', 'content strategy'],
        conversationalAlternatives: {
          'utilize': 'use',
          'implement': 'set up',
          'facilitate': 'help'
        }
      }
    };

    const manualSchema = manager.generateAIEnhancedArticleSchema(enhancedArticle);
    console.log('✅ Manual AI-enhanced article schema created');
    console.log('Has author credentials:', !!manualSchema.author?.hasCredential);
    console.log('Has semantic keywords:', manualSchema.keywords.includes('generative search'));
    console.log('Has related questions:', !!manualSchema.mentions);
    console.log('Has conversational tone:', manualSchema.genre === 'conversational');
    
    const manualValidation = manager.validateAIOptimizedSchema(manualSchema);
    console.log('AI Optimization Score:', manualValidation.aiOptimizationScore);
    console.log('');

    // Test 5: Schema Validation and Suggestions
    console.log('🔍 Test 5: Schema Validation and AI Suggestions');
    
    // Test with basic schema (should have low AI optimization score)
    const basicArticle = {
      title: 'Basic Article',
      description: 'A simple article',
      content: 'Basic content',
      author: 'Author',
      datePublished: new Date().toISOString(),
      url: 'https://example.com',
      category: 'General',
      keywords: ['basic']
    };
    
    const basicSchema = manager.generateArticleSchema(basicArticle);
    const basicValidation = manager.validateAIOptimizedSchema(basicSchema);
    
    console.log('Basic schema AI score:', basicValidation.aiOptimizationScore);
    console.log('Number of suggestions:', basicValidation.suggestions.length);
    console.log('Sample suggestions:');
    basicValidation.suggestions.slice(0, 3).forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion}`);
    });
    console.log('');

    // Test 6: Content Extraction and Enhancement
    console.log('🔧 Test 6: Content Extraction and Enhancement');
    
    const extractedFAQs = manager.extractFAQsFromContent(testFAQContent);
    console.log('Extracted FAQs:', extractedFAQs.length);
    
    const extractedSteps = manager.extractHowToStepsFromContent(testHowToContent);
    console.log('Extracted How-To steps:', extractedSteps.length);
    
    // Test semantic variations generation
    const testQuestion = "What is artificial intelligence?";
    const variations = manager.generateSemanticVariations(testQuestion);
    console.log('Semantic variations for "' + testQuestion + '":');
    variations.forEach((variation, index) => {
      console.log(`  ${index + 1}. ${variation}`);
    });
    console.log('');

    console.log('🎉 All AI-Enhanced Structured Data tests completed successfully!');
    
    return {
      success: true,
      results: {
        articleSchema,
        faqSchema,
        howToSchema,
        manualSchema,
        validations: {
          article: articleValidation,
          faq: faqValidation,
          howTo: howToValidation,
          manual: manualValidation,
          basic: basicValidation
        }
      }
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAIEnhancedStructuredData()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Tests failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { testAIEnhancedStructuredData };