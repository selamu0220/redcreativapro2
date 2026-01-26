#!/usr/bin/env node

/**
 * Script to reset export rate limit for a user in development
 * Usage: node reset-export-rate-limit.js [email]
 */

const userEmail = process.argv[2] || 'selamu.garciabravo@gmail.com';

async function resetRateLimit() {
  try {
    console.log(`🔄 Resetting export rate limit for: ${userEmail}`);
    
    const response = await fetch(`http://localhost:3000/api/email-collection/${encodeURIComponent(userEmail)}/export`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // In development, we'll bypass auth for this specific operation
        'x-user-email': userEmail,
        'x-development-reset': 'true'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Rate limit reset successfully!');
      console.log('📋 Response:', result);
    } else {
      const error = await response.json();
      console.error('❌ Failed to reset rate limit:', error);
      
      if (response.status === 429) {
        console.log('💡 The rate limit is still active. This is expected if you just hit the limit.');
        console.log('💡 The limit has been increased to 50 exports per day and will reset automatically in 24 hours.');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Make sure your development server is running on http://localhost:3000');
  }
}

console.log('🚀 Export Rate Limit Reset Tool');
console.log('================================');
resetRateLimit();