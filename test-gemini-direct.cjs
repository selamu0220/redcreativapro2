// Test directo de la API de Gemini
const fs = require('fs');
const path = require('path');

// Función para leer el archivo .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key] = valueParts.join('=');
        }
      }
    });
    
    return env;
  } catch (error) {
    console.error('Error leyendo .env.local:', error.message);
    return {};
  }
}

const env = loadEnvFile();

async function testGeminiAPI() {
  console.log('🧪 === TEST DIRECTO DE LA API DE GEMINI ===');
  console.log('='.repeat(50));
  
  const apiKey = env.GEMINI_API_KEY;
  console.log('🔑 API Key configurada:', !!apiKey);
  
  if (!apiKey) {
    console.log('❌ ERROR: No se encontró GEMINI_API_KEY en .env.local');
    return;
  }
  
  console.log('🔑 API Key (primeros 10 caracteres):', apiKey.substring(0, 10) + '...');
  
  const model = 'gemini-2.0-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: 'Escribe un email profesional de prueba para verificar que la API funciona correctamente. El email debe ser breve y dirigido a un cliente potencial.'
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
      topP: 0.8,
      topK: 40
    }
  };
  
  console.log('🚀 Enviando petición a Gemini API...');
  console.log('📍 URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo de respuesta: ${responseTime}ms`);
    console.log('📊 Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📄 Respuesta raw (primeros 500 caracteres):');
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    if (!response.ok) {
      console.log('❌ ERROR EN LA RESPUESTA:');
      console.log('Status:', response.status);
      console.log('Response:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('🔍 Error parseado:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('🔍 No se pudo parsear el error como JSON');
      }
      
      return;
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('✅ RESPUESTA EXITOSA:');
      console.log('📊 Metadata:', {
        model: model,
        responseTime: responseTime + 'ms',
        tokensUsed: data.usageMetadata?.totalTokenCount || 'N/A'
      });
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        console.log('📧 CONTENIDO GENERADO:');
        console.log('---');
        console.log(content);
        console.log('---');
        console.log('✅ La API de Gemini funciona correctamente!');
      } else {
        console.log('⚠️ ADVERTENCIA: La respuesta no contiene contenido');
        console.log('🔍 Estructura de respuesta:', JSON.stringify(data, null, 2));
      }
      
    } catch (parseError) {
      console.log('❌ ERROR AL PARSEAR LA RESPUESTA JSON:');
      console.log(parseError.message);
    }
    
  } catch (error) {
    console.log('❌ ERROR EN LA PETICIÓN:');
    console.log('Tipo:', error.constructor.name);
    console.log('Mensaje:', error.message);
    
    if (error.code) {
      console.log('Código:', error.code);
    }
    
    if (error.cause) {
      console.log('Causa:', error.cause);
    }
  }
}

// Ejecutar el test
testGeminiAPI().catch(console.error);