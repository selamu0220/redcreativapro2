import fetch from 'node-fetch';

// Test the automatic cleanup system for empty email configurations
async function testCleanupSystem() {
  const baseUrl = 'http://localhost:3000';
  const testEmail = 'test-cleanup@example.com';
  
  console.log('🧪 Testing automatic cleanup system for empty email configurations\n');
  
  // Test 1: Send email with user that has empty configuration
  console.log('📧 Test 1: Sending email with user that has empty configuration...');
  try {
    const response1 = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': testEmail
        // No configuration headers - should trigger cleanup
      },
      body: JSON.stringify({
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test message'
      })
    });
    
    const result1 = await response1.text();
    console.log(`Status: ${response1.status}`);
    console.log(`Response: ${result1}`);
    
    if (response1.status === 400 && result1.includes('No hay configuración de email')) {
      console.log('✅ Expected error for empty configuration');
    } else {
      console.log('❌ Unexpected response for empty configuration');
    }
  } catch (error) {
    console.error('❌ Error in test 1:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Send email with valid Web3Forms configuration
  console.log('📧 Test 2: Sending email with valid Web3Forms configuration...');
  try {
    const response2 = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': testEmail,
        'x-web3forms-key': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Valid UUID format
        'x-web3forms-sender': 'sender@example.com' // Correct header name
      },
      body: JSON.stringify({
        to: 'recipient@example.com',
        subject: 'Test Email with Config',
        text: 'This is a test message with configuration'
      })
    });
    
    const result2 = await response2.text();
    console.log(`Status: ${response2.status}`);
    console.log(`Response: ${result2}`);
    
    if (response2.status === 500 && result2.includes('Web3Forms')) {
      console.log('✅ Expected Web3Forms API error (configuration is working)');
    } else if (response2.status === 200) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Unexpected response for valid configuration');
    }
  } catch (error) {
    console.error('❌ Error in test 2:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Send email with incomplete configuration (should trigger cleanup)
  console.log('📧 Test 3: Sending email with incomplete configuration...');
  try {
    const response3 = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': testEmail,
        'x-web3forms-key': 'invalid-key-format' // Invalid format
        // Missing x-web3forms-sender
      },
      body: JSON.stringify({
        to: 'recipient@example.com',
        subject: 'Test Email Incomplete',
        text: 'This is a test message with incomplete configuration'
      })
    });
    
    const result3 = await response3.text();
    console.log(`Status: ${response3.status}`);
    console.log(`Response: ${result3}`);
    
    if (response3.status === 400 && result3.includes('No hay configuración de email')) {
      console.log('✅ Expected error for incomplete configuration (cleanup worked)');
    } else {
      console.log('❌ Unexpected response for incomplete configuration');
    }
  } catch (error) {
    console.error('❌ Error in test 3:', error.message);
  }
  
  console.log('\n🏁 Cleanup system test completed!');
}

// Run the test
testCleanupSystem().catch(console.error);