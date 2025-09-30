import { readFileSync } from 'fs';

function loadEnvFile() {
  try {
    const envContent = readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    const env = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
        }
      }
    }
    
    return env;
  } catch (error) {
    console.log('⚠️ Could not read .env.local file:', error.message);
    return {};
  }
}

async function testEmailGeneration() {
  console.log('🧪 Testing email generation with optimized OpenRouter client...');
  
  const env = loadEnvFile();
  const apiKey = env.OPEN_ROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
  
  const testData = {
    recipient: 'Juan Pérez',
    subject: 'Propuesta de colaboración',
    purpose: 'Presentar una propuesta de servicios de marketing digital',
    context: 'Cliente potencial interesado en mejorar su presencia online',
    emailType: 'sales'
  };
  
  console.log('📤 Sending request to /api/generate-email...');
  console.log('📋 Test data:', JSON.stringify(testData, null, 2));
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-model': 'openai/gpt-4o-mini',
        'x-temperature': '0.7',
        'x-max-tokens': '1500'
      },
      body: JSON.stringify(testData)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('📥 Response status:', response.status);
    console.log('⏱️ Response time:', responseTime + 'ms');
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS - Email generated successfully!');
      console.log('📧 Generated email:');
      console.log('---');
      console.log(responseData.email || responseData.content || 'Content not found');
      console.log('---');
      
      if (responseData.metadata) {
        console.log('📊 Metadata:');
        console.log(`   🤖 Model used: ${responseData.metadata.model}`);
        console.log(`   ⏱️ API response time: ${responseData.metadata.responseTime}ms`);
        console.log(`   🔢 Tokens used: ${responseData.metadata.tokensUsed || 'N/A'}`);
      }
    } else {
      console.log('❌ ERROR - Email generation failed');
      console.log('🔍 Error details:', responseData.error);
      console.log('📝 Error type:', responseData.errorType);
      console.log('🔄 Retryable:', responseData.retryable);
      if (responseData.details) {
        console.log('🔍 Additional details:', responseData.details);
      }
    }
    
  } catch (error) {
    console.log('❌ Network or parsing error:', error.message);
  }
}

// Run the test
testEmailGeneration().catch(console.error);