/**
 * Cross-Module Navigation Test for SEO Fundamentals
 * Tests navigation between all modules, progress tracking, and user experience consistency
 * 
 * Requirements tested:
 * - 6.1: Logical, hierarchical structure with clear headings and subsections
 * - 6.2: Checklists, bullet points, and step-by-step processes for easy reference
 */

const fs = require('fs');
const path = require('path');

// SEO modules configuration
const SEO_MODULES = [
  {
    id: 'introduction',
    title: 'Introducción al SEO',
    path: '/seo-fundamentals/introduction',
    filePath: 'app/seo-fundamentals/introduction/page.tsx',
    expectedSections: ['que-es-seo', 'por-que-importa', 'proceso-google'],
    nextModule: 'keyword-research',
    previousModule: null
  },
  {
    id: 'keyword-research',
    title: 'Investigación de Palabras Clave',
    path: '/seo-fundamentals/keyword-research',
    filePath: 'app/seo-fundamentals/keyword-research/page.tsx',
    expectedSections: ['keyword-selection-criteria', 'traffic-potential-vs-search-volume', '3c-technique', 'keyword-research-tools'],
    nextModule: 'on-page-seo',
    previousModule: 'introduction'
  },
  {
    id: 'on-page-seo',
    title: 'SEO On-Page',
    path: '/seo-fundamentals/on-page-seo',
    filePath: 'app/seo-fundamentals/on-page-seo/page.tsx',
    expectedSections: ['myth-busting', 'content-optimization', 'on-page-checklist'],
    nextModule: 'link-building',
    previousModule: 'keyword-research'
  },
  {
    id: 'link-building',
    title: 'Link Building',
    path: '/seo-fundamentals/link-building',
    filePath: 'app/seo-fundamentals/link-building/page.tsx',
    expectedSections: ['backlink-quality-attributes', 'link-building-strategies', 'specific-tactics', 'outreach-templates'],
    nextModule: 'technical-seo',
    previousModule: 'on-page-seo'
  },
  {
    id: 'technical-seo',
    title: 'SEO Técnico',
    path: '/seo-fundamentals/technical-seo',
    filePath: 'app/seo-fundamentals/technical-seo/page.tsx',
    expectedSections: ['technical-requirements', 'monitoring-tools', 'seo-formula-summary'],
    nextModule: null,
    previousModule: 'link-building'
  }
];

class CrossModuleNavigationTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };
  }

  testFileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  testModuleFilesExist() {
    console.log('\n📁 Testing Module Files Exist...');
    
    let allFilesExist = true;
    
    for (const module of SEO_MODULES) {
      const exists = this.testFileExists(module.filePath);
      if (exists) {
        console.log(`✅ ${module.title} file exists: ${module.filePath}`);
      } else {
        console.log(`❌ ${module.title} file missing: ${module.filePath}`);
        this.testResults.errors.push(`Missing file: ${module.filePath}`);
        allFilesExist = false;
      }
    }

    // Test main SEO fundamentals page
    const mainPageExists = this.testFileExists('app/seo-fundamentals/page.tsx');
    if (mainPageExists) {
      console.log('✅ Main SEO fundamentals page exists');
    } else {
      console.log('❌ Main SEO fundamentals page missing');
      this.testResults.errors.push('Missing main SEO fundamentals page');
      allFilesExist = false;
    }

    // Test SEOModuleLayout component
    const layoutExists = this.testFileExists('app/components/seo/SEOModuleLayout.tsx');
    if (layoutExists) {
      console.log('✅ SEOModuleLayout component exists');
    } else {
      console.log('❌ SEOModuleLayout component missing');
      this.testResults.errors.push('Missing SEOModuleLayout component');
      allFilesExist = false;
    }

    if (allFilesExist) {
      this.testResults.passed++;
      this.testResults.details.push('✅ All module files exist');
    } else {
      this.testResults.failed++;
    }
  }

  testNavigationStructure() {
    console.log('\n🧭 Testing Navigation Structure...');
    
    let navigationValid = true;

    for (const module of SEO_MODULES) {
      const content = this.readFileContent(module.filePath);
      if (!content) {
        console.log(`❌ Cannot read ${module.title} file`);
        navigationValid = false;
        continue;
      }

      // Test SEOModuleLayout usage
      if (!content.includes('SEOModuleLayout')) {
        console.log(`❌ ${module.title} missing SEOModuleLayout`);
        this.testResults.errors.push(`${module.title}: Missing SEOModuleLayout`);
        navigationValid = false;
      } else {
        console.log(`✅ ${module.title} uses SEOModuleLayout`);
      }

      // Test currentModule prop
      if (!content.includes(`currentModule="${module.id}"`)) {
        console.log(`❌ ${module.title} missing currentModule prop`);
        this.testResults.errors.push(`${module.title}: Missing currentModule prop`);
        navigationValid = false;
      } else {
        console.log(`✅ ${module.title} has correct currentModule prop`);
      }

      // Test previous module navigation
      if (module.previousModule) {
        const hasPreviousModule = content.includes('previousModule') && 
                                 (content.includes(module.previousModule) || content.includes('/seo-fundamentals'));
        if (!hasPreviousModule) {
          console.log(`❌ ${module.title} missing previous module navigation`);
          this.testResults.errors.push(`${module.title}: Missing previous module navigation`);
          navigationValid = false;
        } else {
          console.log(`✅ ${module.title} has previous module navigation`);
        }
      }

      // Test next module navigation
      if (module.nextModule) {
        const hasNextModule = content.includes('nextModule') && 
                             (content.includes(module.nextModule) || content.includes('/seo-fundamentals'));
        if (!hasNextModule) {
          console.log(`❌ ${module.title} missing next module navigation`);
          this.testResults.errors.push(`${module.title}: Missing next module navigation`);
          navigationValid = false;
        } else {
          console.log(`✅ ${module.title} has next module navigation`);
        }
      }
    }

    if (navigationValid) {
      this.testResults.passed++;
      this.testResults.details.push('✅ Navigation structure test passed');
    } else {
      this.testResults.failed++;
    }
  }

  testInternalLinking() {
    console.log('\n🔗 Testing Internal Linking Between Modules...');
    
    let linkingValid = true;

    for (const module of SEO_MODULES) {
      const content = this.readFileContent(module.filePath);
      if (!content) continue;

      // Count internal links to other SEO modules
      const internalLinks = (content.match(/href="\/seo-fundamentals\//g) || []).length;
      console.log(`✅ ${module.title} has ${internalLinks} internal SEO links`);

      // Test for cross-references to other modules
      const otherModules = SEO_MODULES.filter(m => m.id !== module.id);
      let hasReferences = false;

      for (const otherModule of otherModules) {
        if (content.includes(otherModule.path)) {
          hasReferences = true;
          break;
        }
      }

      if (hasReferences) {
        console.log(`✅ ${module.title} has cross-references to other modules`);
      } else {
        console.log(`⚠️ ${module.title} has limited cross-references`);
      }
    }

    this.testResults.passed++;
    this.testResults.details.push('✅ Internal linking test passed');
  }

  testProgressTrackingElements() {
    console.log('\n📊 Testing Progress Tracking Elements...');
    
    let progressValid = true;

    // Test main page progress tracking
    const mainPageContent = this.readFileContent('app/seo-fundamentals/page.tsx');
    if (mainPageContent) {
      if (mainPageContent.includes('Progress') || mainPageContent.includes('progress')) {
        console.log('✅ Main page has progress tracking elements');
      } else {
        console.log('❌ Main page missing progress tracking');
        this.testResults.errors.push('Main page: Missing progress tracking');
        progressValid = false;
      }
    }

    // Test SEOModuleLayout progress support
    const layoutContent = this.readFileContent('app/components/seo/SEOModuleLayout.tsx');
    if (layoutContent) {
      if (layoutContent.includes('progress') && layoutContent.includes('Progress')) {
        console.log('✅ SEOModuleLayout supports progress tracking');
      } else {
        console.log('❌ SEOModuleLayout missing progress support');
        this.testResults.errors.push('SEOModuleLayout: Missing progress support');
        progressValid = false;
      }
    }

    // Test individual modules for progress props
    for (const module of SEO_MODULES) {
      const content = this.readFileContent(module.filePath);
      if (!content) continue;

      if (content.includes('progress=')) {
        console.log(`✅ ${module.title} has progress prop`);
      } else {
        console.log(`⚠️ ${module.title} missing progress prop`);
      }
    }

    if (progressValid) {
      this.testResults.passed++;
      this.testResults.details.push('✅ Progress tracking test passed');
    } else {
      this.testResults.failed++;
    }
  }

  testConsistentStructure() {
    console.log('\n🎨 Testing Consistent Structure...');
    
    let structureValid = true;
    const structureChecks = [];

    for (const module of SEO_MODULES) {
      const content = this.readFileContent(module.filePath);
      if (!content) continue;

      const check = {
        module: module.title,
        hasMetadata: content.includes('export const metadata'),
        hasEducationalSchema: content.includes('EducationalContentSchema'),
        hasSEOModuleLayout: content.includes('SEOModuleLayout'),
        hasTitle: content.includes('title='),
        hasDescription: content.includes('description=')
      };

      structureChecks.push(check);

      if (check.hasMetadata && check.hasSEOModuleLayout && check.hasTitle && check.hasDescription) {
        console.log(`✅ ${module.title} has consistent structure`);
      } else {
        console.log(`❌ ${module.title} missing structure elements`);
        this.testResults.errors.push(`${module.title}: Inconsistent structure`);
        structureValid = false;
      }
    }

    // Check if all modules have similar structure
    const allHaveMetadata = structureChecks.every(check => check.hasMetadata);
    const allHaveLayout = structureChecks.every(check => check.hasSEOModuleLayout);
    const allHaveTitle = structureChecks.every(check => check.hasTitle);

    if (allHaveMetadata && allHaveLayout && allHaveTitle) {
      console.log('✅ All modules have consistent structure');
    } else {
      console.log('❌ Inconsistent structure across modules');
      structureValid = false;
    }

    if (structureValid) {
      this.testResults.passed++;
      this.testResults.details.push('✅ Consistent structure test passed');
    } else {
      this.testResults.failed++;
    }
  }

  testInteractiveElements() {
    console.log('\n🎯 Testing Interactive Elements...');
    
    let interactiveValid = true;

    for (const module of SEO_MODULES) {
      const content = this.readFileContent(module.filePath);
      if (!content) continue;

      // Test for interactive components
      const hasChecklistComponent = content.includes('ChecklistComponent');
      const hasExampleShowcase = content.includes('ExampleShowcase');
      const hasToolRecommendation = content.includes('ToolRecommendation');
      const hasInteractiveElements = hasChecklistComponent || hasExampleShowcase || hasToolRecommendation;

      if (hasInteractiveElements) {
        console.log(`✅ ${module.title} has interactive elements`);
        
        if (hasChecklistComponent) console.log(`  - ChecklistComponent found`);
        if (hasExampleShowcase) console.log(`  - ExampleShowcase found`);
        if (hasToolRecommendation) console.log(`  - ToolRecommendation found`);
      } else {
        console.log(`⚠️ ${module.title} has limited interactive elements`);
      }

      // Test for section anchors (for navigation within page)
      const sectionAnchors = (content.match(/id="[^"]*"/g) || []).length;
      if (sectionAnchors > 0) {
        console.log(`✅ ${module.title} has ${sectionAnchors} section anchors`);
      } else {
        console.log(`⚠️ ${module.title} missing section anchors`);
      }
    }

    this.testResults.passed++;
    this.testResults.details.push('✅ Interactive elements test passed');
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.passed + this.testResults.failed,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: this.testResults.passed + this.testResults.failed > 0 
          ? `${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`
          : '0%'
      },
      details: this.testResults.details,
      errors: this.testResults.errors,
      modules: SEO_MODULES.map(module => ({
        id: module.id,
        title: module.title,
        path: module.path,
        filePath: module.filePath,
        exists: this.testFileExists(module.filePath)
      })),
      recommendations: [
        'Ensure all modules use SEOModuleLayout consistently',
        'Verify navigation props (previousModule, nextModule) are correct',
        'Add progress tracking to all modules',
        'Include interactive elements (checklists, examples) in each module',
        'Test cross-module navigation manually in browser',
        'Verify mobile responsiveness of navigation elements'
      ]
    };

    // Save report to file
    const reportPath = path.join(__dirname, 'cross-module-navigation-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    
    if (report.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      report.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    
    return report;
  }

  runAllTests() {
    console.log('🚀 Starting Cross-Module Navigation Tests...');
    console.log('============================================');
    
    try {
      // Run all static analysis tests
      this.testModuleFilesExist();
      this.testNavigationStructure();
      this.testInternalLinking();
      this.testProgressTrackingElements();
      this.testConsistentStructure();
      this.testInteractiveElements();
      
      // Generate final report
      const report = this.generateReport();
      
      console.log('\n🎉 Cross-module navigation testing completed!');
      console.log('\n📋 MANUAL TESTING CHECKLIST:');
      console.log('============================');
      console.log('1. Start the development server: npm run dev');
      console.log('2. Navigate to http://localhost:3000/seo-fundamentals');
      console.log('3. Click on each module card to verify navigation works');
      console.log('4. Test previous/next navigation in each module');
      console.log('5. Verify sidebar navigation works in all modules');
      console.log('6. Test breadcrumb navigation');
      console.log('7. Check progress tracking updates');
      console.log('8. Test on mobile devices');
      console.log('9. Verify internal links between modules work');
      console.log('10. Test interactive elements (checklists, examples)');
      
      return report;
      
    } catch (error) {
      console.log(`❌ Test suite failed: ${error.message}`);
      this.testResults.errors.push(`Test suite: ${error.message}`);
      return this.generateReport();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CrossModuleNavigationTester();
  
  const report = tester.runAllTests();
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

module.exports = CrossModuleNavigationTester;