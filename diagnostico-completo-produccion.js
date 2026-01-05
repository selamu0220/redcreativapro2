/**
 * Diagnóstico Completo de Producción
 * Ejecuta: node diagnostico-completo-produccion.js
 */

const https = require('https');
const http = require('http');

const tests = [
  { name: 'Homepage', url: 'https://redcreativa.pro' },
  { name: 'Homepage (www)', url: 'https://www.redcreativa.pro' },
  { name: 'Blog', url: 'https://redcreativa.pro/blog' },
  { name: 'Dashboard', url: 'https://redcreativa.pro/dashboard' },
  { name: 'API Health', url: 'https://redcreativa.pro/api/health' },
];

console.log('🔍 DIAGNÓSTICO COMPLETO DE PRODUCCIÓN\n');
console.log('='.repeat(60));

async function testUrl(test) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(test.url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const result = {
          name: test.name,
          url: test.url,
          status: res.statusCode,
          duration: duration,
          size: data.length,
          hasHTML: data.includes('<html'),
          hasTitle: data.includes('Red Creativa Pro'),
          hasError: data.includes('error') || data.includes('Error'),
          headers: res.headers,
          preview: data.substring(0, 200)
        };
        
        resolve(result);
      });
      
    }).on('error', (err) => {
      resolve({
        name: test.name,
        url: test.url,
        error: err.message
      });
    });
  });
}

async function runAllTests() {
  for (const test of tests) {
    console.log(`\n📋 Test: ${test.name}`);
    console.log(`🔗 URL: ${test.url}`);
    
    const result = await testUrl(test);
    
    if (result.error) {
      console.log(`❌ ERROR: ${result.error}`);
      continue;
    }
    
    console.log(`✅ Status: ${result.status}`);
    console.log(`⏱️  Tiempo: ${result.duration}ms`);
    console.log(`📦 Tamaño: ${result.size} bytes`);
    console.log(`🏷️  HTML: ${result.hasHTML ? '✅' : '❌'}`);
    console.log(`📝 Título: ${result.hasTitle ? '✅' : '❌'}`);
    console.log(`⚠️  Error: ${result.hasError ? '❌ SÍ' : '✅ NO'}`);
    
    // Análisis específico
    if (result.size < 500) {
      console.log(`⚠️  ADVERTENCIA: Respuesta muy pequeña (${result.size} bytes)`);
      console.log(`📄 Preview:\n${result.preview}`);
    }
    
    if (!result.hasHTML) {
      console.log(`❌ PROBLEMA: No se detectó estructura HTML`);
    }
    
    if (result.hasError) {
      console.log(`❌ PROBLEMA: Se detectaron errores en el contenido`);
    }
    
    // Headers importantes
    console.log(`\n📋 Headers importantes:`);
    console.log(`   Cache: ${result.headers['x-vercel-cache'] || 'N/A'}`);
    console.log(`   Content-Type: ${result.headers['content-type'] || 'N/A'}`);
    console.log(`   Server: ${result.headers['server'] || 'N/A'}`);
    
    console.log('-'.repeat(60));
  }
  
  console.log('\n\n🎯 RESUMEN:');
  console.log('='.repeat(60));
  console.log('\nSi todos los tests muestran ✅, el problema es en el navegador.');
  console.log('Si algún test muestra ❌, hay un problema en el servidor.\n');
  console.log('SIGUIENTE PASO:');
  console.log('1. Abre https://redcreativa.pro en tu navegador');
  console.log('2. Presiona F12 para abrir DevTools');
  console.log('3. Ve a la pestaña "Console"');
  console.log('4. Copia TODOS los errores en rojo');
  console.log('5. Compártelos para diagnosticar\n');
}

runAllTests().catch(console.error);
