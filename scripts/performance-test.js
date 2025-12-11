#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests web performance optimizations and validates Core Web Vitals
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  performance: 85, // GTmetrix target: 85%+
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
  // Core Web Vitals thresholds
  'largest-contentful-paint': 2500, // 2.5s
  'cumulative-layout-shift': 0.1,   // 0.1
  'first-contentful-paint': 1800,   // 1.8s
  'total-blocking-time': 200,       // 200ms
  'speed-index': 3400,              // 3.4s
};

// Test URLs
const TEST_URLS = [
  'http://localhost:3000',
  'http://localhost:3000/dashboard',
  'http://localhost:3000/blog',
  'http://localhost:3000/planes',
];

// Chrome launch options for performance testing
const CHROME_OPTIONS = {
  chromeFlags: [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--enable-features=NetworkService,NetworkServiceLogging',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--disable-background-networking',
  ],
};

// Lighthouse configuration
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36 Chrome-Lighthouse',
  },
};

// Mobile configuration
const MOBILE_CONFIG = {
  ...LIGHTHOUSE_CONFIG,
  settings: {
    ...LIGHTHOUSE_CONFIG.settings,
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 150 * 3.75,
      downloadThroughputKbps: 1638.4,
      uploadThroughputKbps: 675,
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
  },
};

async function runLighthouseTest(url, config = LIGHTHOUSE_CONFIG) {
  const chrome = await chromeLauncher.launch(CHROME_OPTIONS);
  
  try {
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      disableDeviceEmulation: false,
      chromeFlags: CHROME_OPTIONS.chromeFlags,
    }, config);

    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function analyzeResults(lhr) {
  const scores = {
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
  };

  const metrics = {
    'largest-contentful-paint': lhr.audits['largest-contentful-paint'].numericValue,
    'cumulative-layout-shift': lhr.audits['cumulative-layout-shift'].numericValue,
    'first-contentful-paint': lhr.audits['first-contentful-paint'].numericValue,
    'total-blocking-time': lhr.audits['total-blocking-time'].numericValue,
    'speed-index': lhr.audits['speed-index'].numericValue,
  };

  return { scores, metrics };
}

function checkThresholds(results) {
  const issues = [];
  
  // Check category scores
  Object.entries(results.scores).forEach(([category, score]) => {
    const threshold = PERFORMANCE_THRESHOLDS[category];
    if (score < threshold) {
      issues.push({
        type: 'score',
        category,
        actual: score,
        expected: threshold,
        status: 'FAIL'
      });
    }
  });

  // Check Core Web Vitals
  Object.entries(results.metrics).forEach(([metric, value]) => {
    const threshold = PERFORMANCE_THRESHOLDS[metric];
    if (value > threshold) {
      issues.push({
        type: 'metric',
        metric,
        actual: Math.round(value),
        expected: threshold,
        status: 'FAIL'
      });
    }
  });

  return issues;
}

function generateReport(testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: testResults.length,
      passed: 0,
      failed: 0,
    },
    results: testResults,
  };

  testResults.forEach(result => {
    if (result.issues.length === 0) {
      report.summary.passed++;
    } else {
      report.summary.failed++;
    }
  });

  return report;
}

function printResults(report) {
  console.log('\n🚀 Performance Test Results');
  console.log('=' .repeat(50));
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total Tests: ${report.summary.totalTests}`);
  console.log(`   ✅ Passed: ${report.summary.passed}`);
  console.log(`   ❌ Failed: ${report.summary.failed}`);
  
  report.results.forEach((result, index) => {
    console.log(`\n🌐 Test ${index + 1}: ${result.url}`);
    console.log(`   Device: ${result.device}`);
    
    // Print scores
    console.log(`\n   📈 Scores:`);
    Object.entries(result.analysis.scores).forEach(([category, score]) => {
      const threshold = PERFORMANCE_THRESHOLDS[category];
      const status = score >= threshold ? '✅' : '❌';
      console.log(`      ${status} ${category}: ${score}% (target: ${threshold}%)`);
    });
    
    // Print Core Web Vitals
    console.log(`\n   ⚡ Core Web Vitals:`);
    Object.entries(result.analysis.metrics).forEach(([metric, value]) => {
      const threshold = PERFORMANCE_THRESHOLDS[metric];
      const status = value <= threshold ? '✅' : '❌';
      const unit = metric === 'cumulative-layout-shift' ? '' : 'ms';
      console.log(`      ${status} ${metric}: ${Math.round(value)}${unit} (target: ≤${threshold}${unit})`);
    });
    
    // Print issues
    if (result.issues.length > 0) {
      console.log(`\n   ⚠️  Issues Found:`);
      result.issues.forEach(issue => {
        if (issue.type === 'score') {
          console.log(`      • ${issue.category} score: ${issue.actual}% (expected: ≥${issue.expected}%)`);
        } else {
          console.log(`      • ${issue.metric}: ${issue.actual}ms (expected: ≤${issue.expected}ms)`);
        }
      });
    }
  });
  
  // Overall status
  const overallStatus = report.summary.failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED';
  console.log(`\n${overallStatus}`);
  
  if (report.summary.failed > 0) {
    console.log('\n💡 Recommendations:');
    console.log('   • Check image optimization and compression');
    console.log('   • Verify critical resource preloading');
    console.log('   • Review JavaScript bundle sizes');
    console.log('   • Ensure proper caching headers');
    console.log('   • Validate service worker implementation');
  }
}

async function saveReport(report) {
  const reportsDir = path.join(process.cwd(), 'performance-reports');
  
  try {
    await fs.mkdir(reportsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  const filename = `performance-report-${Date.now()}.json`;
  const filepath = path.join(reportsDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${filepath}`);
}

async function main() {
  console.log('🔍 Starting Performance Tests...\n');
  
  const testResults = [];
  
  for (const url of TEST_URLS) {
    console.log(`Testing: ${url}`);
    
    try {
      // Test desktop
      console.log('  📱 Running desktop test...');
      const desktopResult = await runLighthouseTest(url, LIGHTHOUSE_CONFIG);
      const desktopAnalysis = analyzeResults(desktopResult.lhr);
      const desktopIssues = checkThresholds(desktopAnalysis);
      
      testResults.push({
        url,
        device: 'desktop',
        analysis: desktopAnalysis,
        issues: desktopIssues,
        rawResult: desktopResult.lhr,
      });
      
      // Test mobile
      console.log('  📱 Running mobile test...');
      const mobileResult = await runLighthouseTest(url, MOBILE_CONFIG);
      const mobileAnalysis = analyzeResults(mobileResult.lhr);
      const mobileIssues = checkThresholds(mobileAnalysis);
      
      testResults.push({
        url,
        device: 'mobile',
        analysis: mobileAnalysis,
        issues: mobileIssues,
        rawResult: mobileResult.lhr,
      });
      
      console.log('  ✅ Completed\n');
      
    } catch (error) {
      console.error(`  ❌ Error testing ${url}:`, error.message);
      testResults.push({
        url,
        device: 'error',
        error: error.message,
        issues: [{ type: 'error', message: error.message, status: 'FAIL' }],
      });
    }
  }
  
  const report = generateReport(testResults);
  printResults(report);
  await saveReport(report);
  
  // Exit with error code if tests failed
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Performance Testing Script

Usage: node scripts/performance-test.js [options]

Options:
  --help, -h     Show this help message
  --mobile-only  Run only mobile tests
  --desktop-only Run only desktop tests
  --url <url>    Test specific URL only

Examples:
  node scripts/performance-test.js
  node scripts/performance-test.js --mobile-only
  node scripts/performance-test.js --url http://localhost:3000
  `);
  process.exit(0);
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runLighthouseTest,
  analyzeResults,
  checkThresholds,
  generateReport,
  PERFORMANCE_THRESHOLDS,
};