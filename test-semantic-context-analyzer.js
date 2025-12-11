const { SemanticContextAnalyzer } = require('./lib/semantic-context-analyzer.ts');

// Test data
const testContent = {
  rich: `
    Software development requires careful optimization of algorithms and implementation strategies. 
    For example, machine learning systems need efficient data processing and neural network architectures.
    Unlike traditional programming, AI development involves training models with large datasets.
    Because of this complexity, developers must understand both software engineering and data science.
    Specifically, they need to grasp concepts like deep learning, automation, and performance tuning.
  `,
  poor: `
    This is about stuff. It does things. Some people use it. It works okay.
    There are features. They help users. The system runs fine.
  `,
  repetitive: `
    Software development is important. Software development requires skills.
    Software development involves coding. Software development needs optimization.
    Software development uses frameworks. Software development creates applications.
  `
};

async function testSemanticContextAnalyzer() {
  console.log('🧪 Testing Semantic Context Analyzer...\n');
  
  const analyzer = new SemanticContextAnalyzer();
  
  // Test 1: Rich content analysis
  console.log('📊 Test 1: Rich Content Analysis');
  const richResult = analyzer.analyzeSemanticContext(testContent.rich);
  console.log('Semantic Richness:', richResult.semanticRichness);
  console.log('Related Terms:', richResult.relatedTerms.slice(0, 5));
  console.log('Synonym Suggestions:', richResult.synonymSuggestions.length);
  console.log('Context Depth:', richResult.contextDepth);
  console.log('Topical Gaps:', richResult.topicalCoverageGaps.slice(0, 3));
  
  // Assertions for rich content
  if (richResult.semanticRichness < 30) {
    console.log('❌ FAIL: Rich content should have higher semantic richness');
  } else {
    console.log('✅ PASS: Rich content has good semantic richness');
  }
  
  if (richResult.relatedTerms.length === 0) {
    console.log('❌ FAIL: Should find related terms in rich content');
  } else {
    console.log('✅ PASS: Found related terms in rich content');
  }
  
  console.log('\n📊 Test 2: Poor Content Analysis');
  const poorResult = analyzer.analyzeSemanticContext(testContent.poor);
  console.log('Semantic Richness:', poorResult.semanticRichness);
  console.log('Related Terms:', poorResult.relatedTerms.length);
  console.log('Context Depth:', poorResult.contextDepth);
  console.log('Topical Gaps:', poorResult.topicalCoverageGaps.length);
  
  // Assertions for poor content
  if (poorResult.semanticRichness > richResult.semanticRichness) {
    console.log('❌ FAIL: Poor content should have lower semantic richness than rich content');
  } else {
    console.log('✅ PASS: Poor content has lower semantic richness');
  }
  
  if (poorResult.topicalCoverageGaps.length === 0) {
    console.log('❌ FAIL: Poor content should have topical coverage gaps');
  } else {
    console.log('✅ PASS: Identified topical coverage gaps in poor content');
  }
  
  console.log('\n📊 Test 3: Repetitive Content Analysis');
  const repetitiveResult = analyzer.analyzeSemanticContext(testContent.repetitive);
  console.log('Semantic Richness:', repetitiveResult.semanticRichness);
  console.log('Synonym Suggestions:', repetitiveResult.synonymSuggestions.length);
  
  // Assertions for repetitive content
  if (repetitiveResult.synonymSuggestions.length === 0) {
    console.log('❌ FAIL: Should suggest synonyms for repetitive content');
  } else {
    console.log('✅ PASS: Found synonym suggestions for repetitive content');
    console.log('Suggested synonyms for "software":', repetitiveResult.synonymSuggestions[0]?.synonyms);
  }
  
  console.log('\n📊 Test 4: Empty Content Handling');
  const emptyResult = analyzer.analyzeSemanticContext('');
  console.log('Empty content semantic richness:', emptyResult.semanticRichness);
  
  if (emptyResult.semanticRichness !== 0) {
    console.log('❌ FAIL: Empty content should have 0 semantic richness');
  } else {
    console.log('✅ PASS: Empty content handled correctly');
  }
  
  console.log('\n📊 Test 5: Specific Feature Tests');
  
  // Test related terms finding
  const techContent = 'This article covers SEO optimization and content marketing strategies.';
  const techResult = analyzer.analyzeSemanticContext(techContent);
  console.log('Tech content related terms:', techResult.relatedTerms.slice(0, 3));
  
  if (techResult.relatedTerms.some(term => term.includes('search') || term.includes('ranking'))) {
    console.log('✅ PASS: Found SEO-related terms');
  } else {
    console.log('❌ FAIL: Should find SEO-related terms');
  }
  
  // Test context depth calculation
  const detailedContent = `
    First, you need to understand the basics. For example, SEO involves keyword research.
    Because search engines rank content differently, you must optimize specifically for each platform.
    Compared to traditional marketing, digital marketing offers more precise targeting.
  `;
  const detailedResult = analyzer.analyzeSemanticContext(detailedContent);
  console.log('Detailed content context depth:', detailedResult.contextDepth);
  
  if (detailedResult.contextDepth > poorResult.contextDepth) {
    console.log('✅ PASS: Detailed content has higher context depth');
  } else {
    console.log('❌ FAIL: Detailed content should have higher context depth');
  }
  
  console.log('\n🎯 Semantic Context Analyzer Tests Complete!');
}

// Run tests
testSemanticContextAnalyzer().catch(console.error);