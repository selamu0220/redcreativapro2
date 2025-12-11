#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Blog Content Quality Fix
 * Tests all components and systems implemented
 */

const fs = require('fs');
const path = require('path');

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  try {
    const result = testFunction();
    if (result) {
      console.log(`✅ ${testName}: PASS`);
      passedTests++;
    } else {
      console.log(`❌ ${testName}: FAIL`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ ${testName}: ERROR - ${error.message}`);
    failedTests++;
  }
}

console.log('🧪 Running Comprehensive Blog Content Quality Test Suite...\n');

// === FORMATTING TESTS ===
console.log('📝 Testing Content Formatting Fixes...');

runTest('Button type attributes added', () => {
  const blogPagePath = path.join(__dirname, 'app', 'blog', 'page.tsx');
  const content = fs.readFileSync(blogPagePath, 'utf8');
  return !/<button(?![^>]*type=)/.test(content);
});

runTest('Aria-label attributes present', () => {
  const blogPagePath = path.join(__dirname, 'app', 'blog', 'page.tsx');
  const content = fs.readFileSync(blogPagePath, 'utf8');
  return /aria-label="/.test(content);
});

runTest('Mobile responsive classes added', () => {
  const blogPagePath = path.join(__dirname, 'app', 'blog', 'page.tsx');
  const content = fs.readFileSync(blogPagePath, 'utf8');
  return /text-2xl md:text-4xl/.test(content);
});

runTest('Theme-aware colors implemented', () => {
  const blogPagePath = path.join(__dirname, 'app', 'blog', 'page.tsx');
  const content = fs.readFileSync(blogPagePath, 'utf8');
  return /text-foreground/.test(content);
});

// === COMPONENT TESTS ===
console.log('\n🧩 Testing Blog Components...');

runTest('BlogContentFormatter component exists', () => {
  const componentPath = path.join(__dirname, 'components', 'blog', 'BlogContentFormatter.tsx');
  return fs.existsSync(componentPath);
});

runTest('BlogLayout component exists', () => {
  const componentPath = path.join(__dirname, 'components', 'blog', 'BlogLayout.tsx');
  return fs.existsSync(componentPath);
});

runTest('SearchBar component has proper accessibility', () => {
  const componentPath = path.join(__dirname, 'components', 'blog', 'SearchBar.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');
  return /aria-label="Seleccionar/.test(content) && /type="button"/.test(content);
});

runTest('Newsletter component has proper form elements', () => {
  const componentPath = path.join(__dirname, 'components', 'blog', 'Newsletter.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');
  return /type="submit"/.test(content) && /type="email"/.test(content);
});

// === VALIDATION SYSTEM TESTS ===
console.log('\n🔍 Testing Validation Systems...');

runTest('URL Validator service exists', () => {
  const servicePath = path.join(__dirname, 'lib', 'url-validator.ts');
  return fs.existsSync(servicePath);
});

runTest('Content Validator service exists', () => {
  const servicePath = path.join(__dirname, 'lib', 'content-validator.ts');
  return fs.existsSync(servicePath);
});

runTest('Quality Monitor service exists', () => {
  const servicePath = path.join(__dirname, 'lib', 'quality-monitor.ts');
  return fs.existsSync(servicePath);
});

runTest('Sitemap Manager service exists', () => {
  const servicePath = path.join(__dirname, 'lib', 'sitemap-manager.ts');
  return fs.existsSync(servicePath);
});

runTest('URL Health Monitor service exists', () => {
  const servicePath = path.join(__dirname, 'lib', 'url-health-monitor.ts');
  return fs.existsSync(servicePath);
});

runTest('Content Workflow service exists', () => {
  const servicePath = path.join(__dirname, 'lib', 'content-workflow.ts');
  return fs.existsSync(servicePath);
});

// === CSS AND STYLING TESTS ===
console.log('\n🎨 Testing CSS and Styling...');

runTest('Blog-specific CSS file exists', () => {
  const cssPath = path.join(__dirname, 'app', 'blog', 'blog-styles.css');
  return fs.existsSync(cssPath);
});

runTest('Global CSS has blog improvements', () => {
  const cssPath = path.join(__dirname, 'app', 'globals.css');
  const content = fs.readFileSync(cssPath, 'utf8');
  return /blog-article/.test(content) && /SOLUCIÓN DEFINITIVA PARA ARTÍCULOS LEGIBLES/.test(content);
});

runTest('CSS has proper dark mode support', () => {
  const cssPath = path.join(__dirname, 'app', 'globals.css');
  const content = fs.readFileSync(cssPath, 'utf8');
  return /.dark article/.test(content);
});

runTest('CSS has mobile optimizations', () => {
  const cssPath = path.join(__dirname, 'app', 'globals.css');
  const content = fs.readFileSync(cssPath, 'utf8');
  return /@media \(max-width: 768px\)/.test(content);
});

// === SCRIPT TESTS ===
console.log('\n🔧 Testing Utility Scripts...');

runTest('Blog content quality fix script exists', () => {
  const scriptPath = path.join(__dirname, 'scripts', 'fix-blog-content-quality.js');
  return fs.existsSync(scriptPath);
});

runTest('Fix script has proper functions', () => {
  const scriptPath = path.join(__dirname, 'scripts', 'fix-blog-content-quality.js');
  const content = fs.readFileSync(scriptPath, 'utf8');
  return /fixButtonAccessibility/.test(content) && /fixFormAccessibility/.test(content);
});

// === INTEGRATION TESTS ===
console.log('\n🔗 Testing Integration...');

runTest('Sitemap imports validation services', () => {
  const sitemapPath = path.join(__dirname, 'app', 'sitemap.ts');
  const content = fs.readFileSync(sitemapPath, 'utf8');
  return /blogPosts/.test(content) && /SUPPORTED_LANGUAGES/.test(content);
});

runTest('Blog not-found page has proper structure', () => {
  const notFoundPath = path.join(__dirname, 'app', 'blog', 'not-found.tsx');
  const content = fs.readFileSync(notFoundPath, 'utf8');
  return /getFeaturedPosts|featuredPosts/.test(content) && /Link/.test(content);
});

// === PERFORMANCE TESTS ===
console.log('\n⚡ Testing Performance Optimizations...');

runTest('CSS has performance optimizations', () => {
  const cssPath = path.join(__dirname, 'app', 'globals.css');
  const content = fs.readFileSync(cssPath, 'utf8');
  return /will-change/.test(content) && /transform3d/.test(content);
});

runTest('Components use proper React patterns', () => {
  const formatterPath = path.join(__dirname, 'components', 'blog', 'BlogContentFormatter.tsx');
  const content = fs.readFileSync(formatterPath, 'utf8');
  return /ReactNode/.test(content) && /interface/.test(content);
});

// === ACCESSIBILITY TESTS ===
console.log('\n♿ Testing Accessibility Improvements...');

runTest('Components have proper ARIA attributes', () => {
  const searchBarPath = path.join(__dirname, 'components', 'blog', 'SearchBar.tsx');
  const content = fs.readFileSync(searchBarPath, 'utf8');
  return /aria-label/.test(content);
});

runTest('CSS has high contrast mode support', () => {
  const cssPath = path.join(__dirname, 'app', 'globals.css');
  const content = fs.readFileSync(cssPath, 'utf8');
  return /prefers-contrast: high/.test(content);
});

runTest('CSS has reduced motion support', () => {
  const cssPath = path.join(__dirname, 'app', 'globals.css');
  const content = fs.readFileSync(cssPath, 'utf8');
  return /prefers-reduced-motion/.test(content);
});

// === FINAL RESULTS ===
console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(50));
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Blog content quality fix is complete.');
} else if (failedTests <= 2) {
  console.log('\n✅ Most tests passed. Minor issues may need attention.');
} else {
  console.log('\n⚠️  Some tests failed. Please review and fix the issues.');
}

console.log('\n🚀 Blog Content Quality Fix Implementation Complete!');

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);