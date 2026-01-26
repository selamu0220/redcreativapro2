#!/usr/bin/env node

/**
 * TEST SIMPLE DEL API SIN NEXT.JS
 * ===============================
 */

// Cargar variables de entorno manualmente
require('dotenv').config({ path: '.env.local' });

console.log('🔍 TEST SIMPLE DEL API');
console.log('=====================\n');

async function testAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  const testText = 'hola como estas espero que todo este bien';
  
  console.log('🔑 API Key found:', !!apiKey);
  console.log('🔑 API Key length:', apiKey?.length || 0);
  console.log('🔑 API Key starts with:', apiKey?.substring(0, 15) || 'N/A');
  console.log('📝 Texto de prueba:', testText);
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  try {
    console.log('\n🚀 Enviando solicitud a Gemini...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Mejora este texto corrigiendo gramática, ortografía y fluidez. Mantén el idioma original y el tono. Solo devuelve el texto mejorado, sin explicaciones:

${testText}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      })
    });
    
    console.log('📡 Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ ERROR:', errorData);
      return;
    }
    
    const data = await response.json();
    const improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (improvedContent) {
      console.log('✅ SUCCESS!');
      console.log('📝 Original:', testText);
      console.log('📝 Improved:', improvedContent);
      console.log('🔄 Changed:', testText.toLowerCase() !== improvedContent.toLowerCase());
    } else {
      console.log('❌ ERROR: No improved content found');
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
  }
}

testAPI();