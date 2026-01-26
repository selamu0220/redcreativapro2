#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🛡️  Setting up webpack error prevention...');

// 1. Create a development script with error handling
const devScriptPath = path.join(process.cwd(), 'dev-safe.js');
const devScriptContent = `#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Next.js with error prevention...');

// Clear cache before starting
const nextCacheDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCacheDir)) {
  console.log('🗑️  Clearing .next cache...');
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
}

// Start Next.js with proper error handling
const nextProcess = spawn('node', [
  '--max-old-space-size=4096',
  'node_modules/next/dist/bin/next',
  'dev'
], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (error) => {
  console.error('❌ Next.js process error:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  if (code !== 0) {
    console.log(\`❌ Next.js exited with code \${code}\`);
  }
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down Next.js...');
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Terminating Next.js...');
  nextProcess.kill('SIGTERM');
});`;

fs.writeFileSync(devScriptPath, devScriptContent);
console.log('✅ Created dev-safe.js script');

// 2. Update package.json to include the safe dev script
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.scripts['dev:safe'] = 'node dev-safe.js';
packageJson.scripts['dev:clean'] = 'rm -rf .next && npm run dev:safe';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with safe dev scripts');

// 3. Create a webpack health check script
const healthCheckPath = path.join(process.cwd(), 'webpack-health-check.js');
const healthCheckContent = `#!/usr/bin/env node

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
        message: \`Cache size: \${(cacheSize / 1024 / 1024).toFixed(2)}MB\`
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
        message: missing.length === 0 ? 'All config files present' : \`Missing: \${missing.join(', ')}\`
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
    console.log(\`\${icon} \${name}: \${result.message}\`);
    
    if (result.status === 'error') {
      allHealthy = false;
    }
  } catch (error) {
    console.log(\`❌ \${name}: Check failed - \${error.message}\`);
    allHealthy = false;
  }
});

if (allHealthy) {
  console.log('\\n🎉 All webpack health checks passed!');
} else {
  console.log('\\n⚠️  Some issues detected. Consider running: npm run dev:clean');
}`;

fs.writeFileSync(healthCheckPath, healthCheckContent);
console.log('✅ Created webpack-health-check.js');

// 4. Add health check to package.json
packageJson.scripts['health'] = 'node webpack-health-check.js';
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('\n🎉 Webpack error prevention setup complete!');
console.log('\n📋 Available commands:');
console.log('• npm run dev:safe - Start development with error prevention');
console.log('• npm run dev:clean - Clear cache and start development');
console.log('• npm run health - Run webpack health check');
console.log('\n💡 Tip: Use "npm run dev:safe" instead of "npm run dev" for better stability');