const fs = require('fs');
const path = require('path');

// Leer variables de entorno desde .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

console.log('🧪 === TESTING TIMEOUT ISSUE ===');
console.log('⏰ Probando si el problema es un timeout en la petición...');

async function testWithTimeout() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('⏰ TIMEOUT: La petición tardó más de 30 segundos');
    controller.abort();
  }, 30000); // 30 segundos timeout

  try {
    console.log('🚀 Iniciando petición con timeout de 30s...');
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': env.GEMINI_API_KEY,
        'x-user-email': 'test@example.com'
      },
      body: JSON.stringify({
        recipient: 'cliente@ejemplo.com',
        subject: 'Propuesta comercial',
        purpose: 'Presentar nuestros servicios',
        context: 'Cliente potencial interesado en marketing digital',
        emailType: 'comercial'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Respuesta recibida en ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📧 Email generado exitosamente');
      console.log('📝 Longitud del contenido:', data.email?.length || 0);
    } else {
      const errorText = await response.text();
      console.log('❌ Error en la respuesta:', errorText);
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.log('⏰ CONFIRMADO: La petición fue cancelada por timeout');
      console.log('🔍 DIAGNÓSTICO: El problema es que la petición se cuelga y nunca responde');
    } else {
      console.log('❌ Error durante la petición:', error.message);
    }
  }
}

testWithTimeout().then(() => {
  console.log('🏁 Test completado');
}).catch(error => {
  console.error('💥 Error en el test:', error);
});