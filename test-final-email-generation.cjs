// Test final de generación de emails con modelo correcto
const http = require('http');

const testData = {
  recipient: 'cliente@ejemplo.com',
  subject: 'Propuesta de colaboración',
  purpose: 'Presentar nuestros servicios de desarrollo web y establecer una reunión inicial'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    // Forzar el uso del modelo correcto
    'x-model': 'gemini-1.5-flash',
    'x-temperature': '0.7',
    'x-max-tokens': '1000'
  }
};

console.log('🧪 PRUEBA FINAL - Generación de Emails IA');
console.log('=' .repeat(50));
console.log('📤 Enviando request con modelo correcto: gemini-1.5-flash');
console.log('📋 Datos de prueba:', testData);
console.log('');

const req = http.request(options, (res) => {
  console.log(`📨 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('');
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Respuesta completa:');
    console.log('Raw response length:', data.length);
    
    if (data.length === 0) {
      console.log('❌ RESPUESTA VACÍA - El servidor no devolvió datos');
      return;
    }
    
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ ÉXITO - Email generado correctamente');
        console.log('📧 Email generado:');
        console.log('---');
        console.log(response.email || response.content || 'Contenido no encontrado');
        console.log('---');
        
        if (response.metadata) {
          console.log('📊 Metadata:');
          console.log(`   🤖 Modelo usado: ${response.metadata.model}`);
          console.log(`   ⏱️ Tiempo de respuesta: ${response.metadata.responseTime}ms`);
          console.log(`   🔄 Intentos: ${response.metadata.attempt}`);
        }
        
      } else {
        console.log('❌ ERROR en la generación:');
        console.log(`   Código: ${res.statusCode}`);
        console.log(`   Error: ${response.error || 'Error desconocido'}`);
        
        // Verificar si aún usa el modelo incorrecto
        if (response.error && response.error.includes('gemini-1.5-flash-002')) {
          console.log('');
          console.log('🚨 PROBLEMA DETECTADO: Aún se usa el modelo incorrecto!');
          console.log('💡 Solución: Ejecuta el script SOLUCION-DEFINITIVA-GEMINI.js en el navegador');
        }
        
        // Verificar problema de API Key
        if (response.error && (response.error.includes('API key') || response.error.includes('no configurada'))) {
          console.log('');
          console.log('🔑 PROBLEMA DE API KEY detectado');
          console.log('💡 Solución: Configura tu API Key de Gemini en Ajustes');
        }
      }
      
    } catch (parseError) {
      console.log('❌ ERROR parseando JSON:');
      console.log('Parse error:', parseError.message);
      console.log('Raw response:', data.substring(0, 500));
    }
    
    console.log('');
    console.log('=' .repeat(50));
    
    if (res.statusCode === 200) {
      console.log('🎉 PRUEBA COMPLETADA EXITOSAMENTE');
      console.log('✅ La generación de emails funciona correctamente');
    } else {
      console.log('⚠️ PRUEBA COMPLETADA CON ERRORES');
      console.log('🔧 Revisa las instrucciones en INSTRUCCIONES-SOLUCION-EMAILS.md');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ ERROR de conexión:');
  console.log(error.message);
  console.log('');
  console.log('💡 Asegúrate de que el servidor esté ejecutándose:');
  console.log('   npm run dev');
});

req.write(postData);
req.end();