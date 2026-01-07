#!/usr/bin/env node

/**
 * TEST DIRECTO DE LA API DE GEMINI
 * ===============================
 */

console.log('🔍 TEST DIRECTO DE LA API DE GEMINI');
console.log('==================================\n');

// Simular la llamada exacta que hace nuestro código
async function testGeminiAPI() {
  const apiKey = 'AIzaSyB2tbgvIDgHZs8GouIE0PCd8NkzvbvICLc';
  const testText = 'hola como estas espero que todo este bien';
  
  console.log('🔑 API Key:', apiKey);
  console.log('📝 Texto de prueba:', testText);
  console.log('🌐 URL:', `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`);
  
  const requestBody = {
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
  };
  
  console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
  
  try {
    console.log('\n🚀 Enviando solicitud...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);
    
    if (!response.ok) {
      console.log('❌ ERROR: Response not OK');
      try {
        const errorData = JSON.parse(responseText);
        console.log('📊 Error data:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('📄 Raw error text:', responseText);
      }
      return;
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('📊 Parsed response:', JSON.stringify(data, null, 2));
      
      const improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (improvedContent) {
        console.log('✅ SUCCESS!');
        console.log('📝 Original:', testText);
        console.log('📝 Improved:', improvedContent);
        console.log('🔄 Changed:', testText.toLowerCase() !== improvedContent.toLowerCase());
      } else {
        console.log('❌ ERROR: No improved content found in response');
      }
      
    } catch (parseError) {
      console.log('❌ ERROR parsing JSON:', parseError.message);
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
  }
}

// Verificar si fetch está disponible
if (typeof fetch === 'undefined') {
  console.log('❌ fetch no está disponible en Node.js');
  console.log('💡 Instala node-fetch: npm install node-fetch');
  process.exit(1);
}

testGeminiAPI();