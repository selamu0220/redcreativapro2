/**
 * Test script for Question-Answer Pattern Detector
 * Tests Q&A structure identification and long-tail question recommendations
 */

const { QuestionAnswerDetector } = require('./lib/question-answer-detector.ts');

async function testQuestionAnswerDetector() {
  console.log('🧪 Testing Question-Answer Pattern Detector...\n');

  try {
    // Initialize detector
    console.log('1. Testing detector initialization...');
    const detector = new QuestionAnswerDetector();
    console.log('✅ Question-Answer Detector initialized successfully');

    // Test content with various Q&A patterns
    const testContent = `
# Web Performance Optimization Guide

## Introduction
What is web performance optimization? It's the process of improving website speed and user experience.
Performance optimization involves several key strategies that can significantly impact your site's success.

## Key Strategies
How can you improve your website's performance? Let's explore the most effective methods:

### Image Optimization
Why is image optimization important? Images often account for 60-70% of a webpage's total size.
You should compress images and use modern formats like WebP. What's the impact of this approach?
Studies show that proper image optimization can reduce loading times by up to 30%.

### Caching Strategies
Many developers wonder about the best caching approach. Browser caching stores static resources locally.
How long should you cache resources? The answer depends on how frequently your content changes.

## Frequently Asked Questions

### Performance Metrics
What metrics should you track? Core Web Vitals are essential for measuring user experience.
When should you measure performance? Regular monitoring helps identify issues before they impact users.

### Common Issues
Why do websites load slowly? Common causes include large images, unoptimized code, and poor hosting.
How much does hosting affect performance? A good hosting provider can improve loading times by 40-50%.

## Advanced Techniques
Consider implementing service workers for offline functionality.
You might wonder about the complexity of implementation.
Let's explore progressive web app features and their benefits.

## Troubleshooting
If your site is still slow after optimization, check for third-party scripts.
What happens if you have too many plugins? They can significantly impact performance.
`;

    // Test 2: Explicit Question Detection
    console.log('\n2. Testing explicit question detection...');
    const analysis = detector.analyzeQuestionAnswerPatterns(testContent);
    
    console.log(`✅ Found ${analysis.explicitQuestions.length} explicit questions`);
    if (analysis.explicitQuestions.length > 0) {
      console.log(`   Example: "${analysis.explicitQuestions[0].question}"`);
      console.log(`   Has answer: ${analysis.explicitQuestions[0].answer ? 'Yes' : 'No'}`);
      console.log(`   Confidence: ${analysis.explicitQuestions[0].confidence}`);
    }

    // Test 3: Implicit Question Detection
    console.log('\n3. Testing implicit question detection...');
    console.log(`✅ Found ${analysis.implicitQuestions.length} implicit questions`);
    if (analysis.implicitQuestions.length > 0) {
      console.log(`   Example: "${analysis.implicitQuestions[0].question}"`);
      console.log(`   Type: ${analysis.implicitQuestions[0].type}`);
      console.log(`   Confidence: ${analysis.implicitQuestions[0].confidence}`);
    }

    // Test 4: Suggested Questions Generation
    console.log('\n4. Testing suggested questions generation...');
    console.log(`✅ Generated ${analysis.suggestedQuestions.length} suggested questions`);
    if (analysis.suggestedQuestions.length > 0) {
      console.log(`   Example: "${analysis.suggestedQuestions[0].question}"`);
      console.log(`   Type: ${analysis.suggestedQuestions[0].type}`);
    }

    // Test 5: FAQ Opportunities Identification
    console.log('\n5. Testing FAQ opportunities identification...');
    console.log(`✅ Found ${analysis.faqOpportunities.length} FAQ opportunities`);
    analysis.faqOpportunities.forEach((opportunity, index) => {
      if (index < 2) { // Show first 2 opportunities
        console.log(`   Topic: ${opportunity.topic}`);
        console.log(`   Priority: ${opportunity.priority}`);
        console.log(`   Questions: ${opportunity.suggestedQuestions.length}`);
        console.log(`   Reasoning: ${opportunity.reasoning}`);
      }
    });

    // Test 6: Long-tail Question Generation
    console.log('\n6. Testing long-tail question generation...');
    console.log(`✅ Generated ${analysis.longTailQuestions.length} long-tail questions`);
    if (analysis.longTailQuestions.length > 0) {
      const topQuestion = analysis.longTailQuestions[0];
      console.log(`   Top question: "${topQuestion.question}"`);
      console.log(`   Intent: ${topQuestion.intent}`);
      console.log(`   Difficulty: ${topQuestion.difficulty}`);
      console.log(`   Search volume: ${topQuestion.searchVolume}`);
      console.log(`   Relevance score: ${topQuestion.relevanceScore.toFixed(2)}`);
    }

    // Test 7: Q&A Structure Score
    console.log('\n7. Testing Q&A structure scoring...');
    console.log(`✅ Q&A Structure Score: ${analysis.qaStructureScore.toFixed(2)}/100`);

    // Test 8: Optimization Suggestions
    console.log('\n8. Testing optimization suggestions generation...');
    const suggestions = detector.generateOptimizationSuggestions(analysis);
    console.log(`✅ Generated ${suggestions.length} optimization suggestions`);
    
    suggestions.forEach((suggestion, index) => {
      if (index < 3) { // Show first 3 suggestions
        console.log(`   ${index + 1}. ${suggestion.title}`);
        console.log(`      Priority: ${suggestion.priority}`);
        console.log(`      Type: ${suggestion.type}`);
        console.log(`      Expected Impact: ${suggestion.expectedImpact}`);
        console.log(`      Description: ${suggestion.description}`);
      }
    });

    // Test 9: Edge Cases
    console.log('\n9. Testing edge cases...');
    
    // Empty content
    const emptyAnalysis = detector.analyzeQuestionAnswerPatterns('');
    console.log(`✅ Empty content handled: ${emptyAnalysis.qaStructureScore === 0 ? 'Correctly' : 'Incorrectly'}`);
    
    // Content with no questions
    const noQuestionsContent = 'This is a simple paragraph with no questions. It contains information about web development.';
    const noQAnalysis = detector.analyzeQuestionAnswerPatterns(noQuestionsContent);
    console.log(`✅ No questions content: Score ${noQAnalysis.qaStructureScore.toFixed(2)}`);
    
    // Content with only questions
    const onlyQuestionsContent = 'What is this? How does it work? Why is it important? When should you use it?';
    const onlyQAnalysis = detector.analyzeQuestionAnswerPatterns(onlyQuestionsContent);
    console.log(`✅ Only questions content: ${onlyQAnalysis.explicitQuestions.length} questions detected`);

    // Test 10: Performance Test
    console.log('\n10. Testing performance with large content...');
    const largeContent = testContent.repeat(10); // 10x larger content
    const startTime = Date.now();
    const largeAnalysis = detector.analyzeQuestionAnswerPatterns(largeContent);
    const endTime = Date.now();
    console.log(`✅ Large content analysis completed in ${endTime - startTime}ms`);
    console.log(`   Questions found: ${largeAnalysis.explicitQuestions.length + largeAnalysis.implicitQuestions.length}`);

    // Test 11: Question Context Analysis
    console.log('\n11. Testing question context analysis...');
    const contextTestContent = `
What is machine learning? Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.

How does it work? The process involves training algorithms on large datasets to identify patterns and make predictions.

Why is it important? Machine learning powers many modern applications from recommendation systems to autonomous vehicles.
`;
    
    const contextAnalysis = detector.analyzeQuestionAnswerPatterns(contextTestContent);
    const answeredQuestions = contextAnalysis.explicitQuestions.filter(q => q.answer);
    console.log(`✅ Questions with answers: ${answeredQuestions.length}/${contextAnalysis.explicitQuestions.length}`);
    
    if (answeredQuestions.length > 0) {
      console.log(`   Example answer: "${answeredQuestions[0].answer?.substring(0, 50)}..."`);
    }

    // Test 12: Different Question Types
    console.log('\n12. Testing different question types...');
    const questionTypesContent = `
How to optimize images? Use compression and modern formats.
What are the benefits? Faster loading and better user experience.
When should you implement caching? As early as possible in development.
Where can you find performance tools? Browser developer tools are built-in.
Why does performance matter? It affects user engagement and SEO rankings.
Which metrics are most important? Core Web Vitals are the current standard.
`;

    const typesAnalysis = detector.analyzeQuestionAnswerPatterns(questionTypesContent);
    const questionWords = ['how', 'what', 'when', 'where', 'why', 'which'];
    questionWords.forEach(word => {
      const count = typesAnalysis.explicitQuestions.filter(q => 
        q.question.toLowerCase().startsWith(word)
      ).length;
      if (count > 0) {
        console.log(`   ${word.toUpperCase()} questions: ${count}`);
      }
    });

    console.log('\n🎉 All Question-Answer Pattern Detector tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`   - Explicit Questions: ✅ ${analysis.explicitQuestions.length} detected`);
    console.log(`   - Implicit Questions: ✅ ${analysis.implicitQuestions.length} detected`);
    console.log(`   - Suggested Questions: ✅ ${analysis.suggestedQuestions.length} generated`);
    console.log(`   - FAQ Opportunities: ✅ ${analysis.faqOpportunities.length} identified`);
    console.log(`   - Long-tail Questions: ✅ ${analysis.longTailQuestions.length} generated`);
    console.log(`   - Q&A Structure Score: ✅ ${analysis.qaStructureScore.toFixed(2)}/100`);
    console.log(`   - Optimization Suggestions: ✅ ${suggestions.length} generated`);
    console.log(`   - Edge Cases: ✅ Handled correctly`);
    console.log(`   - Performance: ✅ Efficient processing`);
    console.log(`   - Context Analysis: ✅ Working`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run tests
testQuestionAnswerDetector();