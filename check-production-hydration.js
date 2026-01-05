// Script para verificar el estado de producción
const https = require('https');

const url = 'https://redcreativa.pro';

console.log('🔍 Verificando producción...\n');

https.get(url, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📄 Primeros 500 caracteres del HTML:');
    console.log(data.substring(0, 500));
    
    // Buscar errores comunes
    if (data.includes('Application error')) {
      console.log('\n❌ ERROR: Application error detectado');
    }
    if (data.includes('500')) {
      console.log('\n❌ ERROR: Error 500 detectado');
    }
    if (data.includes('hydration')) {
      console.log('\n⚠️  WARNING: Posible error de hydration');
    }
    if (data.length < 100) {
      console.log('\n❌ ERROR: Respuesta muy corta, posible error');
    }
  });
}).on('error', (err) => {
  console.error('❌ Error al conectar:', err.message);
});
