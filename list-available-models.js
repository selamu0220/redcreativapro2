#!/usr/bin/env node

/**
 * LIST AVAILABLE GEMINI MODELS
 * ============================
 */

console.log('🔍 LISTING AVAILABLE GEMINI MODELS');
console.log('==================================\n');

async function listModels() {
  const apiKey = 'AIzaSyB2tbgvIDgHZs8GouIE0PCd8NkzvbvICLc';
  
  try {
    console.log('🚀 Fetching available models...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    console.log('📡 Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('📊 Available models:');
    
    if (data.models) {
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   Display Name: ${model.displayName || 'N/A'}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No models found in response');
      console.log('📄 Full response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
  }
}

listModels();