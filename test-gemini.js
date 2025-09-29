// Test script to verify Gemini API key
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key from .env.local:', apiKey);
console.log('API Key length:', apiKey?.length);
console.log('Is placeholder?', apiKey === 'your_gemini_api_key_here');

// Test the Gemini API directly
async function testGeminiAPI() {
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('❌ No valid API key configured');
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, this is a test. Please respond with 'Test successful'"
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        })
      }
    );

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Gemini API is working!');
    } else {
      console.log('❌ Gemini API error:', data.error?.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testGeminiAPI();