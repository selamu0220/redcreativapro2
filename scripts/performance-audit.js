#!/usr/bin/env node

/**
 * Performance Audit Script for AI Writer
 * Identifies memory leaks, performance bottlenecks, and optimization opportunities
 */

const fs = require('fs');
const path = require('path');

class PerformanceAuditor {
  constructor() {
    this.issues = [];
    this.suggestions = [];
    this.metrics = {
      timeoutUsage: 0,
      intervalUsage: 0,
      eventListeners: 0,
      memoryLeakRisks: 0,
      bundleOptimizations: 0
    };
  }

  /**
   * Audit a file for performance issues
   */
  auditFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    console.log(`\n🔍 Auditing: ${fileName}`);
    
    // Check for timeout/interval usage without cleanup
    this.checkTimeoutUsage(content, fileName);
    
    // Check for event listeners without cleanup
    this.checkEventListeners(content, fileName);
    
    // Check for memory leak patterns
    this.checkMemoryLeaks(content, fileName);
    
    // Check for bundle optimization opportunities
    this.checkBundleOptimizations(content, fileName);
    
    // Check for React performance issues
    this.checkReactPerformance(content, fileName);
  }

  /**
   * Check for timeout/interval usage patterns
   */
  checkTimeoutUsage(content, fileName) {
    const timeoutMatches = content.match(/setTimeout|setInterval/g) || [];
    const clearMatches = content.match(/clearTimeout|clearInterval/g) || [];
    
    this.metrics.timeoutUsage += timeoutMatches.length;
    
    if (timeoutMatches.length > clearMatches.length) {
      this.issues.push({
        file: fileName,
        type: 'memory-leak',
        severity: 'high',
        message: `Potential memory leak: ${timeoutMatches.length} timeouts/intervals but only ${clearMatches.length} cleanup calls`,
        suggestion: 'Ensure all setTimeout/setInterval calls have corresponding cleanup in useEffect return or component unmount'
      });
      this.metrics.memoryLeakRisks++;
    }

    // Check for timeout refs without cleanup
    const timeoutRefMatches = content.match(/useRef<NodeJS\.Timeout/g) || [];
    const cleanupInUseEffect = content.match(/return\s*\(\)\s*=>\s*{[\s\S]*?clearTimeout/g) || [];
    
    if (timeoutRefMatches.length > 0 && cleanupInUseEffect.length === 0) {
      this.issues.push({
        file: fileName,
        type: 'memory-leak',
        severity: 'medium',
        message: 'Timeout refs found without cleanup in useEffect',
        suggestion: 'Add cleanup function in useEffect return to clear timeout refs'
      });
    }
  }

  /**
   * Check for event listener patterns
   */
  checkEventListeners(content, fileName) {
    const addListenerMatches = content.match(/addEventListener/g) || [];
    const removeListenerMatches = content.match(/removeEventListener/g) || [];
    
    this.metrics.eventListeners += addListenerMatches.length;
    
    if (addListenerMatches.length > removeListenerMatches.length) {
      this.issues.push({
        file: fileName,
        type: 'memory-leak',
        severity: 'high',
        message: `Event listener leak: ${addListenerMatches.length} listeners added but only ${removeListenerMatches.length} removed`,
        suggestion: 'Ensure all addEventListener calls have corresponding removeEventListener in cleanup'
      });
      this.metrics.memoryLeakRisks++;
    }
  }

  /**
   * Check for memory leak patterns
   */
  checkMemoryLeaks(content, fileName) {
    // Check for large state objects
    const largeStateMatches = content.match(/useState\([^)]{100,}\)/g) || [];
    if (largeStateMatches.length > 0) {
      this.issues.push({
        file: fileName,
        type: 'performance',
        severity: 'medium',
        message: 'Large initial state objects detected',
        suggestion: 'Consider lazy initialization or breaking down large state objects'
      });
    }

    // Check for missing dependency arrays
    const useEffectWithoutDeps = content.match(/useEffect\([^,]+\);/g) || [];
    if (useEffectWithoutDeps.length > 0) {
      this.issues.push({
        file: fileName,
        type: 'performance',
        severity: 'medium',
        message: 'useEffect without dependency array detected',
        suggestion: 'Add dependency array to prevent unnecessary re-runs'
      });
    }

    // Check for inline object/function creation in JSX
    const inlineObjectsInJSX = content.match(/\w+\s*=\s*\{[^}]+\}/g) || [];
    if (inlineObjectsInJSX.length > 5) {
      this.issues.push({
        file: fileName,
        type: 'performance',
        severity: 'low',
        message: 'Multiple inline objects in JSX detected',
        suggestion: 'Move object creation outside render or use useMemo for expensive objects'
      });
    }
  }

  /**
   * Check for bundle optimization opportunities
   */
  checkBundleOptimizations(content, fileName) {
    // Check for dynamic imports
    const dynamicImports = content.match(/import\(/g) || [];
    const regularImports = content.match(/^import\s+/gm) || [];
    
    this.metrics.bundleOptimizations += dynamicImports.length;
    
    if (regularImports.length > 10 && dynamicImports.length === 0) {
      this.suggestions.push({
        file: fileName,
        type: 'optimization',
        message: 'Consider using dynamic imports for large components',
        suggestion: 'Use React.lazy() and dynamic imports to reduce initial bundle size'
      });
    }

    // Check for large libraries that could be code-split
    const heavyLibraries = ['lodash', 'moment', 'chart.js', 'three.js'];
    heavyLibraries.forEach(lib => {
      if (content.includes(`from '${lib}'`) || content.includes(`require('${lib}')`)) {
        this.suggestions.push({
          file: fileName,
          type: 'optimization',
          message: `Heavy library ${lib} detected`,
          suggestion: `Consider tree-shaking or dynamic import for ${lib}`
        });
      }
    });
  }

  /**
   * Check for React performance issues
   */
  checkReactPerformance(content, fileName) {
    // Check for missing useCallback/useMemo
    const functionDeclarations = content.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || [];
    const useCallbackUsage = content.match(/useCallback/g) || [];
    
    if (functionDeclarations.length > 3 && useCallbackUsage.length === 0) {
      this.suggestions.push({
        file: fileName,
        type: 'performance',
        message: 'Multiple function declarations without useCallback',
        suggestion: 'Consider using useCallback for functions passed as props or used in dependencies'
      });
    }

    // Check for expensive operations in render
    const expensiveOperations = ['JSON.parse', 'JSON.stringify', 'Array.sort', 'Array.filter'];
    expensiveOperations.forEach(op => {
      if (content.includes(op) && !content.includes('useMemo')) {
        this.suggestions.push({
          file: fileName,
          type: 'performance',
          message: `Expensive operation ${op} detected in render`,
          suggestion: `Consider wrapping ${op} in useMemo to avoid recalculation`
        });
      }
    });
  }

  /**
   * Generate audit report
   */
  generateReport() {
    console.log('\n📊 PERFORMANCE AUDIT REPORT');
    console.log('=' .repeat(50));
    
    // Metrics summary
    console.log('\n📈 Metrics:');
    console.log(`- Timeout/Interval usage: ${this.metrics.timeoutUsage}`);
    console.log(`- Event listeners: ${this.metrics.eventListeners}`);
    console.log(`- Memory leak risks: ${this.metrics.memoryLeakRisks}`);
    console.log(`- Bundle optimizations: ${this.metrics.bundleOptimizations}`);
    
    // Issues
    if (this.issues.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.file}`);
        console.log(`   Type: ${issue.type}`);
        console.log(`   Severity: ${issue.severity}`);
        console.log(`   Issue: ${issue.message}`);
        console.log(`   Fix: ${issue.suggestion}`);
      });
    }
    
    // Suggestions
    if (this.suggestions.length > 0) {
      console.log('\n💡 OPTIMIZATION SUGGESTIONS:');
      this.suggestions.forEach((suggestion, index) => {
        console.log(`\n${index + 1}. ${suggestion.file}`);
        console.log(`   Type: ${suggestion.type}`);
        console.log(`   Suggestion: ${suggestion.message}`);
        console.log(`   Action: ${suggestion.suggestion}`);
      });
    }
    
    // Overall score
    const totalIssues = this.issues.length;
    const criticalIssues = this.issues.filter(i => i.severity === 'high').length;
    const score = Math.max(0, 100 - (criticalIssues * 20) - (totalIssues * 5));
    
    console.log('\n🎯 PERFORMANCE SCORE:');
    console.log(`${score}/100`);
    
    if (score >= 90) {
      console.log('✅ Excellent performance! Minor optimizations possible.');
    } else if (score >= 70) {
      console.log('⚠️  Good performance with room for improvement.');
    } else if (score >= 50) {
      console.log('🔧 Performance issues detected. Optimization recommended.');
    } else {
      console.log('🚨 Critical performance issues. Immediate action required.');
    }
    
    return {
      score,
      issues: this.issues,
      suggestions: this.suggestions,
      metrics: this.metrics
    };
  }
}

// Main execution
function main() {
  const auditor = new PerformanceAuditor();
  
  // Files to audit
  const filesToAudit = [
    'app/escritor-ia/page.tsx',
    'app/escritor-ia/page-optimized.tsx',
    'app/escritor-ia/components/EscritorIAEditor.tsx',
    'app/hooks/useAISettings.ts',
    'app/hooks/useErrorMonitoring.ts',
    'app/hooks/useOptimizedAutoImprovement.ts',
    'app/components/AIProgressIndicator.tsx',
    'app/components/PerformanceMonitor.tsx'
  ];
  
  console.log('🚀 Starting Performance Audit...');
  
  filesToAudit.forEach(file => {
    auditor.auditFile(file);
  });
  
  const report = auditor.generateReport();
  
  // Save report to file
  const reportPath = 'performance-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  process.exit(report.score < 70 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = PerformanceAuditor;