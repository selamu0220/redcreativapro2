#!/usr/bin/env node

/**
 * TEST FINAL DEL ESCRITOR DE IA
 * =============================
 */

console.log('🔍 TEST FINAL DEL ESCRITOR DE IA');
console.log('================================\n');

async function testEscritorIA() {
  const testText = 'hola como estas espero que todo este bien';
  
  console.log('📝 Texto de prueba:', testText);
  console.log('🌐 URL:', 'http://localhost:3000/api/improve-text-gemini-simple');
  
  try {
    console.log('\n🚀 Enviando solicitud al API local...');
    
    const response = await fetch('http://localhost:3000/api/improve-text-gemini-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: testText })
    });
    
    console.log('📡 Status:', response.status);
    
    const data = await response.json();
    console.log('📊 Response data:', data);
    
    if (!response.ok) {
      console.log('❌ ERROR:', data.error || 'Unknown error');
      return;
    }
    
    if (data.improvedContent) {
      console.log('✅ SUCCESS!');
      console.log('📝 Original:', testText);
      console.log('📝 Improved:', data.improvedContent);
      console.log('🔄 Changed:', testText.toLowerCase() !== data.improvedContent.toLowerCase());
    } else {
      console.log('❌ ERROR: No improved content received');
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
  }
}

// Wait a bit for the server to start
setTimeout(() => {
  testEscritorIA();
}, 5000);

console.log('⏳ Esperando 5 segundos para que el servidor inicie...');