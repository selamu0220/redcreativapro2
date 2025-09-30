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

async function testOpenRouter() {
  console.log('🧪 Testing OpenRouter API connection...');
  
  const env = loadEnvFile();
  const apiKey = env.OPEN_ROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;
  
  console.log('🔑 API Key from env:', apiKey ? 'Present' : 'Missing');
  console.log('🔑 API Key length:', apiKey ? apiKey.length : 0);
  console.log('🔑 API Key preview:', apiKey ? apiKey.substring(0, 10) + '...' : 'None');
  
  if (!apiKey) {
    console.log('❌ No API Key found in environment');
    return;
  }
  
  try {
    const payload = {
      model: 'openai/gpt-4o-mini',
      messages: [{
        role: 'user',
        content: 'Responde solo con "Hola mundo" en español'
      }],
      temperature: 0.1,
      max_tokens: 50
    };

    console.log('📤 Sending request to OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://redcreativapro.com',
        'X-Title': 'Red Creativa Pro'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ OpenRouter API failed:', errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ OpenRouter API Response:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('🎉 OpenRouter API is working correctly!');
      console.log('📝 Generated content:', data.choices[0].message.content);
    } else {
      console.log('⚠️ Unexpected response structure:', data);
    }
    
  } catch (error) {
    console.error('🔥 Test failed with error:', error);
  }
}

testOpenRouter();