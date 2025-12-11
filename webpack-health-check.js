#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏥 Running webpack health check...');

const checks = [
  {
    name: 'Next.js cache',
    check: () => {
      const nextDir = path.join(process.cwd(), '.next');
      const cacheSize = fs.existsSync(nextDir) ? getDirSize(nextDir) : 0;
      return {
        status: cacheSize < 500 * 1024 * 1024 ? 'healthy' : 'warning', // 500MB threshold
        message: `Cache size: ${(cacheSize / 1024 / 1024).toFixed(2)}MB`
      };
    }
  },
  {
    name: 'Node modules integrity',
    check: () => {
      const nodeModulesDir = path.join(process.cwd(), 'node_modules');
      const nextDir = path.join(nodeModulesDir, 'next');
      return {
        status: fs.existsSync(nextDir) ? 'healthy' : 'error',
        message: fs.existsSync(nextDir) ? 'Next.js installed correctly' : 'Next.js not found'
      };
    }
  },
  {
    name: 'Config files',
    check: () => {
      const configFiles = ['next.config.js', 'package.json', 'tsconfig.json'];
      const missing = configFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)));
      return {
        status: missing.length === 0 ? 'healthy' : 'warning',
        message: missing.length === 0 ? 'All config files present' : `Missing: ${missing.join(', ')}`
      };
    }
  }
];

function getDirSize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (error) {
    // Ignore errors for inaccessible files
  }
  return size;
}

let allHealthy = true;

checks.forEach(({ name, check }) => {
  try {
    const result = check();
    const icon = result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${name}: ${result.message}`);
    
    if (result.status === 'error') {
      allHealthy = false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Check failed - ${error.message}`);
    allHealthy = false;
  }
});

if (allHealthy) {
  console.log('\n🎉 All webpack health checks passed!');
} else {
  console.log('\n⚠️  Some issues detected. Consider running: npm run dev:clean');
}