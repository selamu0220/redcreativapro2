import { ConversationalLanguageAnalyzer } from './lib/conversational-analyzer.js';

// Test suite for Conversational Language Analyzer
console.log('🧪 Testing Conversational Language Analyzer...\n');

const analyzer = new ConversationalLanguageAnalyzer();

// Test 1: Formal vs Conversational Language Detection
console.log('Test 1: Formal vs Conversational Language Detection');
const formalText = "We utilize advanced methodologies to facilitate the implementation of sophisticated algorithms that subsequently demonstrate optimal performance characteristics.";
const conversationalText = "We use simple methods to help you set up smart tools that then show great results.";

const formalResult = analyzer.analyzeContent(formalText);
const conversationalResult = analyzer.analyzeContent(conversationalText);

console.log(`Formal text formality score: ${formalResult.formalityScore}`);
console.log(`Conversational text formality score: ${conversationalResult.formalityScore}`);
console.log(`✅ Test 1 ${formalResult.formalityScore > conversationalResult.formalityScore ? 'PASSED' : 'FAILED'}\n`);

// Test 2: Technical Jargon Detection
console.log('Test 2: Technical Jargon Detection');
const technicalText = "The API integration requires SDK configuration and framework optimization for scalable architecture deployment.";
const simpleText = "The connection needs setup and improvements for better performance when launching.";

const technicalResult = analyzer.analyzeContent(technicalText);
const simpleResult = analyzer.analyzeContent(simpleText);

console.log(`Technical text jargon count: ${technicalResult.technicalJargonCount}`);
console.log(`Simple text jargon count: ${simpleResult.technicalJargonCount}`);
console.log(`✅ Test 2 ${technicalResult.technicalJargonCount > simpleResult.technicalJargonCount ? 'PASSED' : 'FAILED'}\n`);

// Test 3: Question-Based Heading Opportunities
console.log('Test 3: Question-Based Heading Opportunities');
const processText = "First, you need to configure the system. The process involves several steps. This method is defined as the standard approach.";
const processResult = analyzer.analyzeContent(processText);

console.log(`Question opportunities found: ${processResult.questionBasedHeadingOpportunities.length}`);
console.log('Opportunities:', processResult.questionBasedHeadingOpportunities);
console.log(`✅ Test 3 ${processResult.questionBasedHeadingOpportunities.length > 0 ? 'PASSED' : 'FAILED'}\n`);

// Test 4: Natural Language Suggestions
console.log('Test 4: Natural Language Suggestions');
const suggestionText = "We will utilize this framework to implement the solution and subsequently demonstrate the results.";
const suggestionResult = analyzer.analyzeContent(suggestionText);

console.log(`Natural language suggestions: ${suggestionResult.naturalLanguageSuggestions.length}`);
suggestionResult.naturalLanguageSuggestions.forEach(suggestion => {
  console.log(`  "${suggestion.originalText}" → "${suggestion.suggestedText}"`);
});
console.log(`✅ Test 4 ${suggestionResult.naturalLanguageSuggestions.length > 0 ? 'PASSED' : 'FAILED'}\n`);

// Test 5: Readability Score Calculation
console.log('Test 5: Readability Score Calculation');
const complexText = "The implementation of sophisticated algorithmic methodologies necessitates comprehensive understanding of underlying architectural paradigms and their subsequent optimization strategies.";
const readableText = "Setting up smart tools needs you to understand how they work and how to make them better.";

const complexReadability = analyzer.analyzeContent(complexText);
const readableReadability = analyzer.analyzeContent(readableText);

console.log(`Complex text readability: ${complexReadability.overallReadabilityScore.toFixed(1)}`);
console.log(`Readable text readability: ${readableReadability.overallReadabilityScore.toFixed(1)}`);
console.log(`✅ Test 5 ${readableReadability.overallReadabilityScore > complexReadability.overallReadabilityScore ? 'PASSED' : 'FAILED'}\n`);

// Test 6: Edge Cases
console.log('Test 6: Edge Cases');
const emptyResult = analyzer.analyzeContent('');
const shortResult = analyzer.analyzeContent('Hi.');

console.log(`Empty content formality score: ${emptyResult.formalityScore}`);
console.log(`Short content formality score: ${shortResult.formalityScore}`);
console.log(`✅ Test 6 ${emptyResult.formalityScore === 0 && shortResult.formalityScore >= 0 ? 'PASSED' : 'FAILED'}\n`);

// Test 7: Comprehensive Analysis
console.log('Test 7: Comprehensive Analysis');
const comprehensiveText = `
How to optimize your website for better performance? This is a question many developers ask.
We utilize advanced techniques to implement solutions. The API integration facilitates better user experience.
First, you need to configure the caching system. This process involves several steps that demonstrate optimal results.
The methodology is defined as a systematic approach to web optimization.
`;

const comprehensiveResult = analyzer.analyzeContent(comprehensiveText);
console.log('Comprehensive Analysis Results:');
console.log(`- Formality Score: ${comprehensiveResult.formalityScore.toFixed(1)}`);
console.log(`- Conversational Score: ${comprehensiveResult.conversationalScore.toFixed(1)}`);
console.log(`- Technical Jargon Count: ${comprehensiveResult.technicalJargonCount}`);
console.log(`- Question Opportunities: ${comprehensiveResult.questionBasedHeadingOpportunities.length}`);
console.log(`- Natural Language Suggestions: ${comprehensiveResult.naturalLanguageSuggestions.length}`);
console.log(`- Readability Score: ${comprehensiveResult.overallReadabilityScore.toFixed(1)}`);

const hasValidScores = comprehensiveResult.formalityScore >= 0 && 
                      comprehensiveResult.conversationalScore >= 0 &&
                      comprehensiveResult.overallReadabilityScore >= 0;

console.log(`✅ Test 7 ${hasValidScores ? 'PASSED' : 'FAILED'}\n`);

console.log('🎉 Conversational Language Analyzer tests completed!');