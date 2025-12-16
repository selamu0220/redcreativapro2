// Test script to verify chunk loading fixes
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Testing chunk loading fixes...\n');

// Check if Next.js config has the fixes
const nextConfigPath = path.join(__dirname, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const config = fs.readFileSync(nextConfigPath, 'utf8');
  
  const checks = [
    { name: 'Webpack splitChunks configuration', pattern: /splitChunks.*cacheGroups/s },
    { name: 'Development onDemandEntries', pattern: /onDemandEntries/ },
    { name: 'WebpackBuildWorker enabled', pattern: /webpackBuildWorker:\s*true/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(config)) {
      console.log(`✅ ${check.name} - Found`);
    } else {
      console.log(`❌ ${check.name} - Missing`);
    }
  });
} else {
  console.log('❌ next.config.js not found');
}

// Check if ClientLayout has enhanced error handling
const clientLayoutPath = path.join(__dirname, 'app', 'components', 'ClientLayout.tsx');
if (fs.existsSync(clientLayoutPath)) {
  const layout = fs.readFileSync(clientLayoutPath, 'utf8');
  
  const layoutChecks = [
    { name: 'Enhanced chunk error handling', pattern: /handleChunkError.*timeout/s },
    { name: 'Retry mechanism', pattern: /retryCount.*maxRetries/ },
    { name: 'Fetch error handling', pattern: /originalFetch.*_next\/static/ }
  ];
  
  layoutChecks.forEach(check => {
    if (check.pattern.test(layout)) {
      console.log(`✅ ${check.name} - Found`);
    } else {
      console.log(`❌ ${check.name} - Missing`);
    }
  });
} else {
  console.log('❌ ClientLayout.tsx not found');
}

console.log('\n🚀 Recommendations:');
console.log('1. Run: fix-chunk-loading.bat to clear cache and restart');
console.log('2. If issues persist, try: npm run dev -- --turbo');
console.log('3. Check browser console for any remaining chunk errors');
console.log('4. Consider using npm instead of pnpm if issues continue');

console.log('\n📋 Quick fixes if error persists:');
console.log('- Clear browser cache (Ctrl+Shift+Delete)');
console.log('- Disable browser extensions temporarily');
console.log('- Try incognito/private browsing mode');
console.log('- Check if antivirus is blocking localhost connections');

