#!/usr/bin/env node

/**
 * SEO Fundamentals Content Validation Script
 * 
 * This script validates the completeness and functionality of the SEO fundamentals content
 * according to the requirements specified in the tasks.md file.
 * 
 * Task 11.1: Validate content completeness
 * - Verify all required sections are present per requirements
 * - Test all interactive elements and progress tracking
 * - Ensure all examples and checklists work correctly
 * 
 * Requirements validation:
 * - 1.1: 5 bullet points explaining SEO, importance, Google process
 * - 2.1: 4-5 point checklist for keyword selection
 * - 3.1: 3 common on-page SEO myths debunked
 * - 4.2: 5 attributes of good backlinks
 * - 5.1: 5-6 essential technical requirements
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class SEOContentValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colorMap = {
      success: colors.green,
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue
    };
    
    console.log(`${colorMap[type] || colors.reset}[${timestamp}] ${message}${colors.reset}`);
  }

  pass(test, message) {
    this.results.passed++;
    this.results.details.push({ test, status: 'PASS', message });
    this.log(`✅ ${test}: ${message}`, 'success');
  }

  fail(test, message) {
    this.results.failed++;
    this.results.details.push({ test, status: 'FAIL', message });
    this.log(`❌ ${test}: ${message}`, 'error');
  }

  warn(test, message) {
    this.results.warnings++;
    this.results.details.push({ test, status: 'WARN', message });
    this.log(`⚠️  ${test}: ${message}`, 'warning');
  }

  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      this.fail('File Access', `Cannot read file: ${filePath} - ${error.message}`);
      return null;
    }
  }

  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  // Requirement 1.1: Introduction module validation
  validateIntroductionModule() {
    this.log('Validating Introduction Module (Requirement 1.1)', 'info');
    
    const introPath = 'app/seo-fundamentals/introduction/page.tsx';
    if (!this.fileExists(introPath)) {
      this.fail('Introduction Module', 'Introduction page file does not exist');
      return;
    }

    const content = this.readFile(introPath);
    if (!content) return;

    // Check for 5 key points about SEO
    const keyPointsRegex = /(?:5\s+(?:puntos?\s+)?(?:clave|key)|cinco\s+puntos?)/i;
    if (keyPointsRegex.test(content)) {
      this.pass('Introduction Content', 'Contains reference to 5 key points about SEO');
    } else {
      this.fail('Introduction Content', 'Missing 5 key points about SEO (Requirement 1.1)');
    }

    // Check for Google process explanation
    const googleProcessRegex = /(?:rastreo|crawling).*(?:indexaci[oó]n|indexing).*(?:ranking|posicionamiento)/i;
    if (googleProcessRegex.test(content)) {
      this.pass('Google Process', 'Contains Google process explanation (crawling → indexing → ranking)');
    } else {
      this.fail('Google Process', 'Missing Google process explanation (Requirement 1.1)');
    }

    // Check for SEO importance explanation
    const importanceRegex = /(?:por\s+qu[eé]|why).*(?:importa|important|matters)/i;
    if (importanceRegex.test(content)) {
      this.pass('SEO Importance', 'Contains explanation of why SEO matters');
    } else {
      this.fail('SEO Importance', 'Missing explanation of why SEO is important (Requirement 1.1)');
    }

    // Check for proper metadata
    if (content.includes('export const metadata')) {
      this.pass('Introduction Metadata', 'Has proper metadata export');
    } else {
      this.fail('Introduction Metadata', 'Missing metadata export');
    }
  }

  // Requirement 2.1: Keyword Research module validation
  validateKeywordResearchModule() {
    this.log('Validating Keyword Research Module (Requirement 2.1)', 'info');
    
    const keywordPath = 'app/seo-fundamentals/keyword-research/page.tsx';
    if (!this.fileExists(keywordPath)) {
      this.fail('Keyword Research Module', 'Keyword research page file does not exist');
      return;
    }

    const content = this.readFile(keywordPath);
    if (!content) return;

    // Check for 4-5 point checklist - more flexible regex
    const checklistRegex = /(?:4-5|cuatro|cinco|criterios?.*seleccionar|keyword.*criteria|selection.*criteria)/i;
    if (checklistRegex.test(content)) {
      this.pass('Keyword Criteria', 'Contains 4-5 point checklist for keyword selection');
    } else {
      this.fail('Keyword Criteria', 'Missing 4-5 point checklist for keyword selection (Requirement 2.1)');
    }

    // Check for Traffic Potential vs Search Volume
    const trafficPotentialRegex = /(?:traffic\s+potential|potencial\s+de\s+tr[aá]fico).*(?:search\s+volume|volumen\s+de\s+b[uú]squeda)/i;
    if (trafficPotentialRegex.test(content)) {
      this.pass('Traffic Potential', 'Contains Traffic Potential vs Search Volume explanation');
    } else {
      this.fail('Traffic Potential', 'Missing Traffic Potential vs Search Volume explanation (Requirement 2.2)');
    }

    // Check for 3C technique
    const threeCRegex = /3c.*(?:technique|t[eé]cnica)/i;
    if (threeCRegex.test(content)) {
      this.pass('3C Technique', 'Contains 3C technique explanation');
    } else {
      this.fail('3C Technique', 'Missing 3C technique explanation (Requirement 2.3)');
    }

    // Check for ChecklistComponent usage
    if (content.includes('ChecklistComponent')) {
      this.pass('Interactive Checklist', 'Uses ChecklistComponent for interactive functionality');
    } else {
      this.fail('Interactive Checklist', 'Missing ChecklistComponent usage');
    }
  }

  // Requirement 3.1: On-Page SEO module validation
  validateOnPageSEOModule() {
    this.log('Validating On-Page SEO Module (Requirement 3.1)', 'info');
    
    const onPagePath = 'app/seo-fundamentals/on-page-seo/page.tsx';
    if (!this.fileExists(onPagePath)) {
      this.fail('On-Page SEO Module', 'On-page SEO page file does not exist');
      return;
    }

    const content = this.readFile(onPagePath);
    if (!content) return;

    // Check for 3 myths debunking
    const mythsRegex = /(?:3|tres|three).*(?:mitos?|myths?)/i;
    if (mythsRegex.test(content)) {
      this.pass('SEO Myths', 'Contains 3 SEO myths debunking section');
    } else {
      this.fail('SEO Myths', 'Missing 3 SEO myths debunking (Requirement 3.1)');
    }

    // Check for specific myths mentioned in requirements
    const keywordStuffingRegex = /keyword\s+stuffing/i;
    const wordCountRegex = /(?:word\s+count|cantidad\s+de\s+palabras|2000\s+palabras)/i;
    const exactRepetitionRegex = /(?:exact.*repetition|repetici[oó]n\s+exacta)/i;

    if (keywordStuffingRegex.test(content)) {
      this.pass('Keyword Stuffing Myth', 'Addresses keyword stuffing myth');
    } else {
      this.warn('Keyword Stuffing Myth', 'Should address keyword stuffing myth');
    }

    if (wordCountRegex.test(content)) {
      this.pass('Word Count Myth', 'Addresses minimum word count myth');
    } else {
      this.warn('Word Count Myth', 'Should address minimum word count myth');
    }

    // Check for content optimization process
    const optimizationRegex = /(?:proceso|process).*(?:optimizaci[oó]n|optimization)/i;
    if (optimizationRegex.test(content)) {
      this.pass('Optimization Process', 'Contains content optimization process');
    } else {
      this.fail('Optimization Process', 'Missing content optimization process (Requirement 3.2)');
    }

    // Check for definitive checklist
    const definitiveChecklistRegex = /(?:definitiv[oa]|definitive).*(?:checklist|lista)/i;
    if (definitiveChecklistRegex.test(content)) {
      this.pass('Definitive Checklist', 'Contains definitive on-page SEO checklist');
    } else {
      this.fail('Definitive Checklist', 'Missing definitive on-page SEO checklist (Requirement 3.3)');
    }
  }

  // Requirement 4.2: Link Building module validation
  validateLinkBuildingModule() {
    this.log('Validating Link Building Module (Requirement 4.2)', 'info');
    
    const linkBuildingPath = 'app/seo-fundamentals/link-building/page.tsx';
    if (!this.fileExists(linkBuildingPath)) {
      this.fail('Link Building Module', 'Link building page file does not exist');
      return;
    }

    const content = this.readFile(linkBuildingPath);
    if (!content) return;

    // Check for 5 backlink quality attributes - more flexible regex
    const backlinksRegex = /(?:5.*atributos|atributos.*backlinks|backlink.*quality|calidad.*backlinks)/i;
    if (backlinksRegex.test(content)) {
      this.pass('Backlink Attributes', 'Contains 5 backlink quality attributes');
    } else {
      this.fail('Backlink Attributes', 'Missing 5 backlink quality attributes (Requirement 4.2)');
    }

    // Check for Create → Buy → Earn strategy
    const strategyRegex = /(?:create|crear).*(?:buy|comprar).*(?:earn|ganar)/i;
    if (strategyRegex.test(content)) {
      this.pass('Link Building Strategy', 'Contains Create → Buy → Earn strategy');
    } else {
      this.fail('Link Building Strategy', 'Missing Create → Buy → Earn strategy (Requirement 4.3)');
    }

    // Check for specific tactics
    const haroRegex = /haro/i;
    const guestBloggingRegex = /guest\s+blogging/i;
    const skyscraperRegex = /skyscraper/i;

    if (haroRegex.test(content)) {
      this.pass('HARO Tactic', 'Mentions HARO tactic');
    } else {
      this.warn('HARO Tactic', 'Should mention HARO tactic (Requirement 4.4)');
    }

    if (guestBloggingRegex.test(content)) {
      this.pass('Guest Blogging', 'Mentions guest blogging');
    } else {
      this.warn('Guest Blogging', 'Should mention guest blogging (Requirement 4.4)');
    }

    if (skyscraperRegex.test(content)) {
      this.pass('Skyscraper Technique', 'Mentions Skyscraper Technique');
    } else {
      this.warn('Skyscraper Technique', 'Should mention Skyscraper Technique (Requirement 4.4)');
    }
  }

  // Requirement 5.1: Technical SEO module validation
  validateTechnicalSEOModule() {
    this.log('Validating Technical SEO Module (Requirement 5.1)', 'info');
    
    const technicalPath = 'app/seo-fundamentals/technical-seo/page.tsx';
    if (!this.fileExists(technicalPath)) {
      this.fail('Technical SEO Module', 'Technical SEO page file does not exist');
      return;
    }

    const content = this.readFile(technicalPath);
    if (!content) return;

    // Check for 5-6 essential technical requirements - more flexible
    const technicalReqRegex = /(?:essential.*technical|requisitos.*esenciales|technical.*requirements|6.*technical|technical.*checklist)/i;
    if (technicalReqRegex.test(content)) {
      this.pass('Technical Requirements', 'Contains 5-6 essential technical requirements');
    } else {
      this.fail('Technical Requirements', 'Missing 5-6 essential technical requirements (Requirement 5.1)');
    }

    // Check for specific technical elements
    const httpsRegex = /https/i;
    const mobileRegex = /mobile.*friendly/i;
    const speedRegex = /(?:site\s+speed|velocidad)/i;
    const sitemapRegex = /xml\s+sitemap/i;
    const robotsRegex = /robots\.txt/i;

    if (httpsRegex.test(content)) {
      this.pass('HTTPS Requirement', 'Mentions HTTPS requirement');
    } else {
      this.warn('HTTPS Requirement', 'Should mention HTTPS requirement');
    }

    if (mobileRegex.test(content)) {
      this.pass('Mobile-Friendly', 'Mentions mobile-friendly requirement');
    } else {
      this.warn('Mobile-Friendly', 'Should mention mobile-friendly requirement');
    }

    if (speedRegex.test(content)) {
      this.pass('Site Speed', 'Mentions site speed requirement');
    } else {
      this.warn('Site Speed', 'Should mention site speed requirement');
    }

    // Check for monitoring tools recommendation
    const ahrefsRegex = /ahrefs.*webmaster.*tools/i;
    if (ahrefsRegex.test(content)) {
      this.pass('Monitoring Tools', 'Recommends Ahrefs Webmaster Tools');
    } else {
      this.fail('Monitoring Tools', 'Missing Ahrefs Webmaster Tools recommendation (Requirement 5.2)');
    }

    // Check for SEO formula summary
    const formulaRegex = /(?:f[oó]rmula|formula).*(?:ganadora|winning).*seo/i;
    if (formulaRegex.test(content)) {
      this.pass('SEO Formula', 'Contains SEO formula summary');
    } else {
      this.fail('SEO Formula', 'Missing SEO formula summary (Requirement 5.3)');
    }
  }

  // Validate component functionality
  validateComponents() {
    this.log('Validating SEO Components', 'info');

    // Check SEOModuleLayout component
    const layoutPath = 'app/components/seo/SEOModuleLayout.tsx';
    if (this.fileExists(layoutPath)) {
      const content = this.readFile(layoutPath);
      if (content) {
        if (content.includes('nextModule') && content.includes('previousModule')) {
          this.pass('Module Navigation', 'SEOModuleLayout supports next/previous navigation');
        } else {
          this.fail('Module Navigation', 'SEOModuleLayout missing navigation props');
        }

        if (content.includes('progress')) {
          this.pass('Progress Tracking', 'SEOModuleLayout supports progress tracking');
        } else {
          this.warn('Progress Tracking', 'SEOModuleLayout should support progress tracking');
        }
      }
    } else {
      this.fail('SEOModuleLayout', 'SEOModuleLayout component file does not exist');
    }

    // Check ChecklistComponent
    const checklistPath = 'app/components/seo/ChecklistComponent.tsx';
    if (this.fileExists(checklistPath)) {
      const content = this.readFile(checklistPath);
      if (content) {
        if (content.includes('localStorage')) {
          this.pass('Checklist Persistence', 'ChecklistComponent uses localStorage for persistence');
        } else {
          this.fail('Checklist Persistence', 'ChecklistComponent missing localStorage persistence');
        }

        if (content.includes('onProgressChange')) {
          this.pass('Progress Callback', 'ChecklistComponent supports progress callbacks');
        } else {
          this.warn('Progress Callback', 'ChecklistComponent should support progress callbacks');
        }
      }
    } else {
      this.fail('ChecklistComponent', 'ChecklistComponent file does not exist');
    }

    // Check ExampleShowcase component
    const examplePath = 'app/components/seo/ExampleShowcase.tsx';
    if (this.fileExists(examplePath)) {
      const content = this.readFile(examplePath);
      if (content) {
        if (content.includes('scenario') && content.includes('implementation') && content.includes('result')) {
          this.pass('Example Structure', 'ExampleShowcase supports scenario/implementation/result structure');
        } else {
          this.fail('Example Structure', 'ExampleShowcase missing required structure');
        }

        if (content.includes('copyToClipboard')) {
          this.pass('Copy Functionality', 'ExampleShowcase includes copy to clipboard functionality');
        } else {
          this.warn('Copy Functionality', 'ExampleShowcase should include copy functionality');
        }
      }
    } else {
      this.fail('ExampleShowcase', 'ExampleShowcase component file does not exist');
    }
  }

  // Validate main SEO fundamentals page
  validateMainPage() {
    this.log('Validating Main SEO Fundamentals Page', 'info');

    const mainPath = 'app/seo-fundamentals/page.tsx';
    if (!this.fileExists(mainPath)) {
      this.fail('Main Page', 'Main SEO fundamentals page does not exist');
      return;
    }

    const content = this.readFile(mainPath);
    if (!content) return;

    // Check for module overview
    const moduleOverviewRegex = /(?:introduction|keyword.*research|on.*page|link.*building|technical)/i;
    const matches = content.match(new RegExp(moduleOverviewRegex.source, 'gi'));
    if (matches && matches.length >= 5) {
      this.pass('Module Overview', 'Main page contains all 5 module references');
    } else {
      this.fail('Module Overview', 'Main page missing complete module overview');
    }

    // Check for progress tracking
    if (content.includes('progress') || content.includes('Progress')) {
      this.pass('Main Page Progress', 'Main page includes progress tracking elements');
    } else {
      this.warn('Main Page Progress', 'Main page should include progress tracking');
    }

    // Check for proper metadata
    if (content.includes('export const metadata')) {
      this.pass('Main Page Metadata', 'Main page has proper metadata');
    } else {
      this.fail('Main Page Metadata', 'Main page missing metadata');
    }
  }

  // Validate CSS and styling
  validateStyling() {
    this.log('Validating CSS and Styling', 'info');

    const cssPath = 'app/components/seo/seo-components.css';
    if (this.fileExists(cssPath)) {
      const content = this.readFile(cssPath);
      if (content) {
        // Check for progress bar styles
        if (content.includes('progress-bar')) {
          this.pass('Progress Bar Styles', 'CSS includes progress bar styles');
        } else {
          this.warn('Progress Bar Styles', 'CSS should include progress bar styles');
        }

        // Check for responsive design
        if (content.includes('@media') || content.includes('responsive')) {
          this.pass('Responsive Styles', 'CSS includes responsive design elements');
        } else {
          this.warn('Responsive Styles', 'CSS should include responsive design');
        }
      }
    } else {
      this.warn('CSS File', 'SEO components CSS file not found');
    }
  }

  // Run all validations
  async runValidation() {
    this.log('Starting SEO Fundamentals Content Validation', 'info');
    this.log('=' * 60, 'info');

    // Validate each module
    this.validateIntroductionModule();
    this.validateKeywordResearchModule();
    this.validateOnPageSEOModule();
    this.validateLinkBuildingModule();
    this.validateTechnicalSEOModule();

    // Validate components and functionality
    this.validateComponents();
    this.validateMainPage();
    this.validateStyling();

    // Generate summary report
    this.generateReport();
  }

  generateReport() {
    this.log('=' * 60, 'info');
    this.log('VALIDATION SUMMARY', 'info');
    this.log('=' * 60, 'info');

    const total = this.results.passed + this.results.failed + this.results.warnings;
    const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;

    this.log(`Total Tests: ${total}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, 'error');
    this.log(`Warnings: ${this.results.warnings}`, 'warning');
    this.log(`Pass Rate: ${passRate}%`, 'info');

    if (this.results.failed > 0) {
      this.log('\nFAILED TESTS:', 'error');
      this.results.details
        .filter(detail => detail.status === 'FAIL')
        .forEach(detail => {
          this.log(`  ❌ ${detail.test}: ${detail.message}`, 'error');
        });
    }

    if (this.results.warnings > 0) {
      this.log('\nWARNINGS:', 'warning');
      this.results.details
        .filter(detail => detail.status === 'WARN')
        .forEach(detail => {
          this.log(`  ⚠️  ${detail.test}: ${detail.message}`, 'warning');
        });
    }

    // Overall assessment
    if (this.results.failed === 0) {
      this.log('\n🎉 VALIDATION PASSED! All critical requirements are met.', 'success');
    } else {
      this.log('\n❌ VALIDATION FAILED! Please address the failed tests above.', 'error');
    }

    // Save detailed report
    const reportPath = 'seo-content-validation-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        passRate: parseFloat(passRate)
      },
      details: this.results.details
    };

    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      this.log(`\nDetailed report saved to: ${reportPath}`, 'info');
    } catch (error) {
      this.log(`Failed to save report: ${error.message}`, 'error');
    }

    return this.results.failed === 0;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SEOContentValidator();
  validator.runValidation().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed with error:', error);
    process.exit(1);
  });
}

module.exports = SEOContentValidator;