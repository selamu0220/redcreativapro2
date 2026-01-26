// Using native fetch (Node.js 18+)
const fetch = globalThis.fetch || require('undici').fetch;

async function testEmailEndpoint() {
  console.log('Testing email generation endpoint...');
  
  const testData = {
    recipient: 'Juan',
    subject: 'Saludo',
    purpose: 'Saludar a un cliente',
    context: 'Cliente nuevo'
  };
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-max-tokens': '2000'
      },
      body: JSON.stringify(testData)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response time: ${responseTime}ms`);
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email generation successful!');
      console.log('Generated email:');
      console.log(result.email);
    } else {
      console.log('❌ Email generation failed:');
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testEmailEndpoint();