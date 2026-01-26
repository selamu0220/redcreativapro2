/**
 * Test script to verify production site is working
 */

const https = require('https');

const testUrl = 'https://redcreativa.pro';

console.log('🧪 Testing production site:', testUrl);
console.log('');

https.get(testUrl, (res) => {
  console.log('✅ Status Code:', res.statusCode);
  console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('');
    console.log('📄 Response length:', data.length, 'bytes');
    
    // Check for common issues
    if (data.includes('Red Creativa Pro')) {
      console.log('✅ Title found in HTML');
    } else {
      console.log('❌ Title NOT found in HTML');
    }
    
    if (data.includes('<html')) {
      console.log('✅ HTML structure present');
    } else {
      console.log('❌ HTML structure missing');
    }
    
    if (data.length < 500) {
      console.log('⚠️  WARNING: Response is very small, might be blank page');
      console.log('Response preview:', data.substring(0, 500));
    } else {
      console.log('✅ Response size looks good');
    }
    
    console.log('');
    console.log('🎉 Test complete! Please verify manually at:', testUrl);
  });
  
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
});
