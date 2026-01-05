const https = require('https');

console.log('🔍 Verificación detallada de producción...\n');

https.get('https://redcreativa.pro', (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`📦 Content-Length: ${res.headers['content-length']}`);
  console.log(`🔄 Cache: ${res.headers['x-vercel-cache']}`);
  console.log(`⏱️  Age: ${res.headers['age']}s\n`);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  
  res.on('end', () => {
    // Verificar si hay errores reales
    const hasAppError = data.includes('Application error: a client-side exception has occurred');
    const hasRuntimeError = data.includes('Unhandled Runtime Error');
    const hasHydrationError = data.includes('Hydration failed');
    const hasContent = data.includes('Red Creativa Pro');
    const hasReactRoot = data.includes('__next');
    
    console.log('📊 Análisis del contenido:');
    console.log(`  - Tiene contenido de la app: ${hasContent ? '✅' : '❌'}`);
    console.log(`  - Tiene estructura React: ${hasReactRoot ? '✅' : '❌'}`);
    console.log(`  - Error de aplicación: ${hasAppError ? '❌' : '✅'}`);
    console.log(`  - Error de runtime: ${hasRuntimeError ? '❌' : '✅'}`);
    console.log(`  - Error de hydration: ${hasHydrationError ? '❌' : '✅'}`);
    console.log(`  - Tamaño del HTML: ${data.length} bytes`);
    
    if (hasAppError || hasRuntimeError || hasHydrationError) {
      console.log('\n❌ ERRORES DETECTADOS EN LA PÁGINA');
      console.log('\n📄 Fragmento con error:');
      const errorStart = data.indexOf('error') - 100;
      console.log(data.substring(Math.max(0, errorStart), errorStart + 300));
    } else if (hasContent && hasReactRoot) {
      console.log('\n✅ ¡SITIO FUNCIONANDO CORRECTAMENTE!');
    } else {
      console.log('\n⚠️  Respuesta inesperada');
    }
  });
}).on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
});
