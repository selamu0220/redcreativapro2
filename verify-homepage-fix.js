#!/usr/bin/env node

/**
 * VERIFICATION SCRIPT: Homepage 404 Fix
 * 
 * This script verifies that the homepage fix is working correctly
 */

const https = require('https');
const fs = require('fs');

console.log('🔍 VERIFYING HOMEPAGE FIX...\n');

// Test URLs to check
const testUrls = [
  'https://redcreativa.pro/',
  'https://redcreativa.pro/es/',
  'https://redcreativa.pro/en/',
];

function testUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        const status = response.statusCode;
        const isHomepage = data.includes('Red Creativa Pro') && data.includes('IA Para Periodistas');
        const is404 = data.includes('404') || data.includes('Página no encontrada');
        
        resolve({
          url,
          status,
          isHomepage,
          is404,
          success: status === 200 && isHomepage && !is404
        });
      });
    });
    
    request.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message,
        success: false
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false
      });
    });
  });
}

async function runTests() {
  console.log('Testing URLs...\n');
  
  for (const url of testUrls) {
    console.log(`Testing: ${url}`);
    const result = await testUrl(url);
    
    if (result.success) {
      console.log(`✅ SUCCESS - Status: ${result.status}, Homepage loaded correctly`);
    } else if (result.is404) {
      console.log(`❌ FAILED - Status: ${result.status}, Still showing 404 error`);
    } else if (result.error) {
      console.log(`❌ ERROR - ${result.error}`);
    } else {
      console.log(`⚠️  UNKNOWN - Status: ${result.status}, Unexpected response`);
    }
    console.log('');
  }
  
  console.log('📋 VERIFICATION COMPLETE');
  console.log('If any tests failed, the deployment may still be in progress.');
  console.log('Wait 2-3 minutes and run this script again.');
}

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.log('❌ Error: Run this script from the project root directory');
  process.exit(1);
}

runTests().catch(console.error);