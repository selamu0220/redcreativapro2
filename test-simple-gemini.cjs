const fs = require('fs');
const path = require('path');

// Leer el archivo .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parsear las variables de entorno
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
  }
});

const GEMINI_API_KEY = env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY no encontrada en .env.local');
  process.exit(1);
}

async function testSimpleGemini() {
  try {
    console.log('🧪 === TEST SIMPLE DE GEMINI API ===');
    console.log('='.repeat(50));
    
    const payload = {
      contents: [{
        parts: [{
          text: 'Escribe un email profesional corto para saludar a un cliente.'
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.8,
        topK: 40
      }
    };
    
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log('🚀 Enviando petición a Gemini...');
    
    const startTime = Date.now();
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo de respuesta: ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR EN LA RESPUESTA:');
      console.log('Status:', response.status);
      console.log('Response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('📄 Respuesta completa:', JSON.stringify(data, null, 2));
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!content.trim()) {
      console.log('❌ La API devolvió una respuesta vacía');
      console.log('🔍 Datos de respuesta:', data);
    } else {
      console.log('✅ ÉXITO - Email generado:');
      console.log('='.repeat(50));
      console.log(content.trim());
      console.log('='.repeat(50));
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
  }
}

testSimpleGemini();