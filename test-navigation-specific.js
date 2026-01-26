/**
 * Specific Navigation Test for Link Building Module
 * Tests the exact navigation configuration
 */

const fs = require('fs');
const path = require('path');

function testLinkBuildingNavigation() {
  console.log('🔍 Testing Link Building Navigation Specifically...');
  
  const linkBuildingPath = path.join(__dirname, 'app', 'seo-fundamentals', 'link-building', 'page.tsx');
  const content = fs.readFileSync(linkBuildingPath, 'utf8');
  
  console.log('📄 Link Building Page Content Analysis:');
  console.log('=====================================');
  
  // Check for SEOModuleLayout
  const hasSEOModuleLayout = content.includes('SEOModuleLayout');
  console.log(`SEOModuleLayout: ${hasSEOModuleLayout ? '✅' : '❌'}`);
  
  // Check for EducationalContentSchema
  const hasEducationalSchema = content.includes('EducationalContentSchema');
  console.log(`EducationalContentSchema: ${hasEducationalSchema ? '✅' : '❌'}`);
  
  // Check for metadata export
  const hasMetadata = content.includes('export const metadata');
  console.log(`Metadata export: ${hasMetadata ? '✅' : '❌'}`);
  
  // Check for previousModule configuration
  const hasPreviousModule = content.includes('previousModule');
  console.log(`Previous module config: ${hasPreviousModule ? '✅' : '❌'}`);
  
  // Check for nextModule configuration
  const hasNextModule = content.includes('nextModule');
  console.log(`Next module config: ${hasNextModule ? '✅' : '❌'}`);
  
  // Check for specific previous module path
  const hasOnPageSeoPath = content.includes('/seo-fundamentals/on-page-seo');
  console.log(`On-page SEO path: ${hasOnPageSeoPath ? '✅' : '❌'}`);
  
  // Check for specific next module path
  const hasTechnicalSeoPath = content.includes('/seo-fundamentals/technical-seo');
  console.log(`Technical SEO path: ${hasTechnicalSeoPath ? '✅' : '❌'}`);
  
  // Check for cross-module links in content
  const crossModuleLinks = [
    '/seo-fundamentals/keyword-research',
    '/seo-fundamentals/on-page-seo',
    '/seo-fundamentals/technical-seo',
    '/seo-fundamentals/introduction'
  ];
  
  console.log('\n🔗 Cross-module links in content:');
  crossModuleLinks.forEach(link => {
    const hasLink = content.includes(link);
    console.log(`${link}: ${hasLink ? '✅' : '❌'}`);
  });
  
  // Extract the actual navigation configuration
  console.log('\n📋 Navigation Configuration:');
  const previousModuleMatch = content.match(/previousModule=\{[\s\S]*?\}\}/);
  if (previousModuleMatch) {
    console.log('Previous Module Config:', previousModuleMatch[0]);
  }
  
  const nextModuleMatch = content.match(/nextModule=\{[\s\S]*?\}\}/);
  if (nextModuleMatch) {
    console.log('Next Module Config:', nextModuleMatch[0]);
  }
}

function testAllModulesNavigation() {
  console.log('\n🧭 Testing All Modules Navigation Configuration...');
  
  const modules = [
    { id: 'introduction', expectedPrevious: null, expectedNext: 'keyword-research' },
    { id: 'keyword-research', expectedPrevious: 'introduction', expectedNext: 'on-page-seo' },
    { id: 'on-page-seo', expectedPrevious: 'keyword-research', expectedNext: 'link-building' },
    { id: 'link-building', expectedPrevious: 'on-page-seo', expectedNext: 'technical-seo' },
    { id: 'technical-seo', expectedPrevious: 'link-building', expectedNext: null }
  ];
  
  modules.forEach(module => {
    console.log(`\n📄 ${module.id}:`);
    
    const modulePath = path.join(__dirname, 'app', 'seo-fundamentals', module.id, 'page.tsx');
    
    if (fs.existsSync(modulePath)) {
      const content = fs.readFileSync(modulePath, 'utf8');
      
      // Check currentModule
      const currentModuleMatch = content.match(/currentModule="([^"]+)"/);
      const currentModule = currentModuleMatch ? currentModuleMatch[1] : 'NOT FOUND';
      console.log(`  Current Module: ${currentModule}`);
      
      // Check previous module
      if (module.expectedPrevious) {
        const hasPrevious = content.includes('previousModule');
        const expectedPath = `/seo-fundamentals/${module.expectedPrevious}`;
        const hasCorrectPreviousPath = content.includes(expectedPath);
        console.log(`  Previous Module: ${hasPrevious ? '✅' : '❌'} (Path: ${hasCorrectPreviousPath ? '✅' : '❌'})`);
      } else {
        console.log(`  Previous Module: N/A (first module)`);
      }
      
      // Check next module
      if (module.expectedNext) {
        const hasNext = content.includes('nextModule');
        const expectedPath = `/seo-fundamentals/${module.expectedNext}`;
        const hasCorrectNextPath = content.includes(expectedPath);
        console.log(`  Next Module: ${hasNext ? '✅' : '❌'} (Path: ${hasCorrectNextPath ? '✅' : '❌'})`);
      } else {
        console.log(`  Next Module: N/A (last module)`);
      }
    } else {
      console.log(`  ❌ Module file not found`);
    }
  });
}

// Run the tests
testLinkBuildingNavigation();
testAllModulesNavigation();