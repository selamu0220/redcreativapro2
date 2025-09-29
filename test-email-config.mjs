import { updateUserEmailProviderAsync, getUserEmailProviderAsync } from './app/lib/database.js';

// Test email configuration saving and retrieval
async function testEmailConfiguration() {
  const testEmail = 'programar@redcreativapro.com';
  
  console.log('🧪 Testing email configuration save/load...');
  
  // Test Web3Forms configuration
  const web3formsConfig = {
    provider: 'web3forms',
    config: {
      web3formsKey: 'test-key-12345',
      senderEmail: testEmail
    }
  };
  
  try {
    // Save configuration
    console.log('📝 Saving Web3Forms configuration...');
    const saveResult = await updateUserEmailProviderAsync(testEmail, web3formsConfig);
    console.log('Save result:', saveResult);
    
    if (saveResult) {
      // Retrieve configuration
      console.log('📖 Retrieving configuration...');
      const retrievedConfig = await getUserEmailProviderAsync(testEmail);
      console.log('Retrieved config:', JSON.stringify(retrievedConfig, null, 2));
      
      // Verify configuration
      if (retrievedConfig && 
          retrievedConfig.provider === 'web3forms' && 
          retrievedConfig.config.web3formsKey === 'test-key-12345' &&
          retrievedConfig.config.senderEmail === testEmail) {
        console.log('✅ Configuration test PASSED!');
        return true;
      } else {
        console.log('❌ Configuration test FAILED - data mismatch');
        return false;
      }
    } else {
      console.log('❌ Configuration test FAILED - save failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Configuration test ERROR:', error);
    return false;
  }
}

// Run the test
testEmailConfiguration().then(success => {
  console.log('\n' + (success ? '🎉 All tests passed!' : '💥 Tests failed!'));
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});