// Test the email generation API directly
async function testEmailAPI() {
  const testData = {
    recipient: "test@example.com",
    subject: "Test Email",
    purpose: "Testing the email generation API"
  };

  console.log('Testing email generation API...');
  console.log('Request data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);

    try {
      const data = JSON.parse(responseText);
      console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Could not parse response as JSON');
    }

  } catch (error) {
    console.error('Network error:', error.message);
  }
}

testEmailAPI();