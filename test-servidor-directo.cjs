// PRUEBA DIRECTA DEL SERVIDOR - SIN FRONTEND
const https = require('https');
const http = require('http');

console.log('🧪 PRUEBA DIRECTA DEL SERVIDOR');
console.log('==============================');

async function probarServidor() {
  const datos = JSON.stringify({
    recipient: 'test@example.com',
    subject: 'Prueba Final de Corrección',
    purpose: 'Verificar que el modelo gemini-1.5-flash funciona correctamente',
    context: 'Esta es una prueba definitiva después de la limpieza completa',
    emailType: 'professional'
  });

  const opciones = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': datos.length,
      'x-api-key': 'AIzaSyAJq7iG93QUWskytILsgmClXBKbcowbXjM', // API KEY DEL .env
      'x-model': 'gemini-1.5-flash', // FORZAR EL MODELO CORRECTO
      'x-temperature': '0.7',
      'x-max-tokens': '1000',
      'x-user-email': 'test@example.com'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(opciones, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const resultado = JSON.parse(data);
          resolve({ status: res.statusCode, data: resultado, rawData: data });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, rawData: data, error: 'JSON parse error' });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(datos);
    req.end();
  });
}

async function ejecutarPrueba() {
  try {
    console.log('📡 Enviando petición al servidor...');
    console.log('🔑 API Key: AIzaSyAJq7iG93QUWskytILsgmClXBKbcowbXjM');
    console.log('🤖 Modelo forzado: gemini-1.5-flash');
    console.log('🌡️ Temperatura: 0.7');
    console.log('🔢 Max tokens: 1000');
    
    const resultado = await probarServidor();
    
    console.log('\n📊 RESULTADO:');
    console.log(`🔢 Status Code: ${resultado.status}`);
    
    if (resultado.status === 200) {
      console.log('✅ ¡ÉXITO! El servidor responde correctamente');
      console.log('📧 Email generado:', resultado.data.email ? resultado.data.email.substring(0, 100) + '...' : 'No disponible');
      if (resultado.data.metadata) {
        console.log('📊 Metadata:', resultado.data.metadata);
      }
    } else {
      console.log('❌ ERROR EN EL SERVIDOR:');
      console.log('📄 Respuesta JSON:', resultado.data);
      console.log('📄 Respuesta RAW:', resultado.rawData);
      
      // Verificar si sigue usando el modelo incorrecto
      const respuestaStr = resultado.rawData || JSON.stringify(resultado.data);
      if (respuestaStr.includes('gemini-1.5-flash-002')) {
        console.log('\n🚨 PROBLEMA CRÍTICO DETECTADO:');
        console.log('   El servidor sigue intentando usar gemini-1.5-flash-002');
        console.log('   Este modelo NO EXISTE en la API de Gemini');
        console.log('   Debe ser gemini-1.5-flash (sin el -002)');
      }
      
      if (respuestaStr.includes('404') || respuestaStr.includes('not found')) {
        console.log('\n💡 DIAGNÓSTICO:');
        console.log('   - Error 404 indica que el modelo no se encuentra');
        console.log('   - Confirma que gemini-1.5-flash-002 no existe');
        console.log('   - El problema está en el código del servidor');
      }
      
      if (resultado.status === 400) {
        console.log('\n💡 DIAGNÓSTICO ERROR 400:');
        console.log('   - Error de validación en el servidor');
        console.log('   - Puede ser parámetros faltantes o incorrectos');
        console.log('   - Revisar logs del servidor para más detalles');
      }
    }
    
  } catch (error) {
    console.log('\n💥 Error de conexión:', error.message);
    console.log('🔍 Verifica que el servidor esté ejecutándose en localhost:3000');
  }
}

// Ejecutar la prueba
ejecutarPrueba();

console.log('\n📋 NOTA IMPORTANTE:');
console.log('Esta prueba bypasa completamente el frontend y localStorage');
console.log('Si falla aquí, el problema está 100% en el código del servidor');