#!/usr/bin/env node

/**
 * Simple verification script to check if Escritor IA page loads without errors
 */

const http = require('http');

function checkServerHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Server is running and responding');
          resolve(true);
        } else {
          console.log(`❌ Server responded with status ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Cannot connect to server:', err.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Server connection timeout');
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🔍 Verifying Escritor IA fix...\n');

  // Check if server is running
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    console.log('\n❌ Server is not running. Please start the development server first:');
    console.log('   npm run dev');
    return;
  }

  // Check for compilation errors by trying to access the page
  try {
    console.log('📄 Checking if Escritor IA page compiles without errors...');

    // Use curl or similar to check the page
    const { execSync } = require('child_process');
    try {
      const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/escritor-ia', { timeout: 10000 });
      const statusCode = result.toString().trim();

      if (statusCode === '200') {
        console.log('✅ Escritor IA page loads successfully (HTTP 200)');
      } else {
        console.log(`❌ Escritor IA page returned HTTP ${statusCode}`);
        return;
      }
    } catch (error) {
      console.log('❌ Cannot check page status - curl not available or page error');
      console.log('   Manual check: Open http://localhost:3000/escritor-ia in your browser');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }

  console.log('\n🎯 Manual Testing Instructions:');
  console.log('1. Open http://localhost:3000/escritor-ia in your browser');
  console.log('2. Check that the page loads without excessive flashing');
  console.log('3. Verify that loading states are smooth and not jarring');
  console.log('4. Test the editor functionality works normally');

  console.log('\n🔧 Changes Applied:');
  console.log('✓ Disabled auto-improvement system that was causing re-renders');
  console.log('✓ Unified loading states to prevent state transitions');
  console.log('✓ Improved hydration logic to prevent mismatches');
  console.log('✓ Simplified useEffect hooks to reduce unnecessary renders');
  console.log('✓ Optimized memory monitoring to reduce overhead');
}

if (require.main === module) {
  main().catch(console.error);
}
