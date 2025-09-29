// Usar fetch nativo de Node.js (disponible desde v18)
const fs = require('fs');
const path = require('path');

// Leer variables de entorno manualmente
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  const envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
  }
  
  return envVars;
}

const env = loadEnvFile();

async function testEmailGeneration() {
  console.log('🧪 Iniciando prueba de generación de email...');
  
  const testData = {
    recipient: 'test@example.com',
    subject: 'Prueba de email',
    purpose: 'Enviar un saludo profesional',
    context: 'Email de prueba para verificar funcionamiento',
    emailType: 'value',
    model: 'gemini-2.0-flash-lite',
    temperature: 0.7,
    maxTokens: 1000
  };
  
  console.log('📤 Enviando solicitud a la API...');
  console.log('📋 Datos:', testData);
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'test@example.com',
        'x-gemini-api-key': env.GEMINI_API_KEY,
        'x-gemini-model': 'gemini-2.0-flash-lite',
        'x-gemini-temperature': '0.7',
        'x-gemini-max-tokens': '1000'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const result = await response.json();
    console.log('📨 Respuesta:', result);
    
    if (result.email) {
      console.log('✅ Email generado exitosamente!');
      console.log('📧 Contenido:', result.email.substring(0, 200) + '...');
    } else {
      console.log('❌ Error en la generación:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testEmailGeneration();