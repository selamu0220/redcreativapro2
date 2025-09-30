const fs = require('fs');
const path = require('path');

console.log('🔍 Probando modelos alternativos...');

// Leer el archivo .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent;
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Error leyendo .env.local:', error.message);
  process.exit(1);
}

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
  console.error('❌ GEMINI_API_KEY no encontrada');
  process.exit(1);
}

async function testModel(modelName) {
  try {
    console.log(`\n🧪 === PROBANDO ${modelName} ===`);
    
    const payload = {
      contents: [{
        parts: [{
          text: 'Responde solo: Hola'
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 50
      }
    };
    
    console.log('📦 Enviando petición...');
    const startTime = Date.now();
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo: ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERROR:', errorText);
      return false;
    }
    
    const data = await response.json();
    
    console.log('🎯 finishReason:', data.candidates?.[0]?.finishReason);
    
    // Buscar texto en la estructura estándar
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text && text.trim()) {
      console.log('✅ TEXTO GENERADO:', `"${text.trim()}"`);
      return true;
    } else {
      console.log('❌ No hay texto en la respuesta');
      console.log('📄 Estructura candidates[0].content:', JSON.stringify(data.candidates?.[0]?.content, null, 2));
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testMultipleModels() {
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ];
  
  console.log('🚀 Probando múltiples modelos...');
  
  for (const model of modelsToTest) {
    const success = await testModel(model);
    if (success) {
      console.log(`\n🎉 ¡MODELO FUNCIONAL ENCONTRADO: ${model}!`);
      return model;
    }
    
    // Esperar un poco entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ Ningún modelo funcionó');
  return null;
}

// Ejecutar el test
testMultipleModels();