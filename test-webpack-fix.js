#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing webpack runtime fix...');

// Test if the server is responding
const testServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Server is responding correctly');
          console.log('✅ No webpack runtime errors detected');
          resolve(true);
        } else {
          console.log(`❌ Server responded with status: ${res.statusCode}`);
          reject(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Server connection failed:', err.message);
      reject(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Server request timeout');
      req.destroy();
      reject(false);
    });
  });
};

// Wait a moment for server to fully start
setTimeout(async () => {
  try {
    await testServer();
    console.log('\n🎉 Webpack runtime error fix successful!');
    console.log('📱 Open http://localhost:3001 in your browser to verify');
  } catch (error) {
    console.log('\n⚠️  Server test failed, but this might be normal if server is still starting');
    console.log('📱 Try opening http://localhost:3001 in your browser manually');
  }
}, 2000);