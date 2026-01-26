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

async function listGeminiModels() {
  try {
    console.log('🔍 Listando modelos disponibles de Gemini...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📋 Modelos disponibles:');
    console.log('='.repeat(50));
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        if (model.displayName) {
          console.log(`   Display Name: ${model.displayName}`);
        }
        if (model.description) {
          console.log(`   Description: ${model.description}`);
        }
        if (model.supportedGenerationMethods) {
          console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('No se encontraron modelos.');
    }
    
  } catch (error) {
    console.error('❌ Error al listar modelos:', error.message);
  }
}

listGeminiModels();