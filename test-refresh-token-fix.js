/**
 * Test script to verify the refresh token fix is working
 */

console.log('🧪 Testing refresh token fix...');

// Import the TokenCleanup utility
import('./app/lib/auth/TokenCleanup.js').then(({ TokenCleanup }) => {
  console.log('✅ TokenCleanup utility loaded successfully');

  // Test diagnostics
  console.log('\n🔍 Running token diagnostics...');
  const diagnostics = TokenCleanup.getDiagnostics();
  
  console.log('📊 Diagnostic Results:');
  console.log(`- Has tokens: ${diagnostics.hasTokens}`);
  console.log(`- Has corrupted tokens: ${diagnostics.hasCorruptedTokens}`);
  console.log(`- Token keys found: ${diagnostics.tokenKeys.join(', ')}`);
  
  if (diagnostics.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    diagnostics.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  // Test token corruption detection
  console.log('\n🔍 Testing token corruption detection...');
  const hasCorrupted = TokenCleanup.hasCorruptedTokens();
  console.log(`Corrupted tokens detected: ${hasCorrupted}`);

  if (hasCorrupted) {
    console.log('\n🧹 Corrupted tokens found - testing cleanup...');
    TokenCleanup.clearAllTokens();
    console.log('✅ Token cleanup completed');
    
    // Verify cleanup
    const postCleanupDiagnostics = TokenCleanup.getDiagnostics();
    console.log('\n📊 Post-cleanup diagnostics:');
    console.log(`- Has tokens: ${postCleanupDiagnostics.hasTokens}`);
    console.log(`- Has corrupted tokens: ${postCleanupDiagnostics.hasCorruptedTokens}`);
  } else {
    console.log('✅ No corrupted tokens detected');
  }

  console.log('\n✅ Refresh token fix test completed');
  
}).catch(error => {
  console.error('❌ Failed to load TokenCleanup utility:', error);
  console.log('💡 Make sure the file exists at app/lib/auth/TokenCleanup.ts');
});