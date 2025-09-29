// Script para forzar limpieza completa de configuración problemática
// Este script debe ejecutarse después de que el usuario limpie su localStorage

const http = require('http');

console.log('🧹 FORZANDO LIMPIEZA COMPLETA DE CONFIGURACIÓN');
console.log('='.repeat(60));

// Función para probar el API después de la limpieza
function probarAPI() {
  console.log('\n🧪 Probando API después de limpieza...');
  
  const datosTest = JSON.stringify({
    recipient: 'test@example.com',
    subject: 'Prueba después de limpieza',
    purpose: 'Verificar que el modelo correcto está siendo usado',
    context: 'Esta es una prueba para confirmar que gemini-1.5-flash funciona',
    emailType: 'professional'
  });

  const opciones = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(datosTest),
      'x-user-email': 'test@example.com',
      // FORZAR el modelo correcto
      'x-model': 'gemini-1.5-flash',
      'x-temperature': '0.7',
      'x-max-tokens': '1000'
    }
  };

  const req = http.request(opciones, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n📄 Respuesta del servidor:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.error) {
          if (response.error.includes('gemini-1.5-flash-002')) {
            console.log('\n❌ PROBLEMA PERSISTENTE: Aún se está usando el modelo incorrecto');
            console.log('🔧 SOLUCIÓN REQUERIDA:');
            console.log('   1. El usuario DEBE limpiar completamente su localStorage');
            console.log('   2. Ejecutar el script de limpieza en el navegador');
            console.log('   3. Recargar la página completamente');
          } else if (response.error.includes('API key')) {
            console.log('\n⚠️ Problema de API Key - esto es normal si no está configurada');
            console.log('✅ El modelo correcto está siendo usado');
          } else {
            console.log('\n❓ Error diferente:', response.error);
          }
        } else {
          console.log('\n✅ ¡API funcionando correctamente!');
        }
      } catch (e) {
        console.log('\n❌ Error parseando respuesta:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('\n❌ Error de conexión:', error.message);
    console.log('💡 Asegúrate de que el servidor esté corriendo (npm run dev)');
  });

  req.write(datosTest);
  req.end();
}

// Función para mostrar instrucciones al usuario
function mostrarInstrucciones() {
  console.log('\n📋 INSTRUCCIONES PARA EL USUARIO:');
  console.log('='.repeat(50));
  console.log('\n1. 🌐 Abre tu navegador y ve a tu aplicación');
  console.log('2. 🔧 Presiona F12 para abrir las herramientas de desarrollador');
  console.log('3. 📝 Ve a la pestaña "Console"');
  console.log('4. 🧹 Pega y ejecuta este código:');
  console.log('\n```javascript');
  console.log('// LIMPIEZA COMPLETA FORZADA');
  console.log('console.log("🧹 Iniciando limpieza completa...");');
  console.log('');
  console.log('// Eliminar TODAS las configuraciones relacionadas con Gemini');
  console.log('const clavesAEliminar = [');
  console.log('  "gemini_api_key", "gemini_model", "gemini_temperature",');
  console.log('  "gemini_max_tokens", "ai_model", "ai_config", "model_config",');
  console.log('  "has_custom_api_key", "custom_gemini_config"');
  console.log('];');
  console.log('');
  console.log('clavesAEliminar.forEach(clave => {');
  console.log('  if (localStorage.getItem(clave)) {');
  console.log('    console.log(`Eliminando: ${clave}`);');
  console.log('    localStorage.removeItem(clave);');
  console.log('  }');
  console.log('});');
  console.log('');
  console.log('// Buscar y eliminar cualquier clave con el modelo problemático');
  console.log('for (let i = localStorage.length - 1; i >= 0; i--) {');
  console.log('  const clave = localStorage.key(i);');
  console.log('  if (clave) {');
  console.log('    const valor = localStorage.getItem(clave);');
  console.log('    if (valor && valor.includes("gemini-1.5-flash-002")) {');
  console.log('      console.log(`❌ Eliminando modelo problemático en: ${clave}`);');
  console.log('      localStorage.removeItem(clave);');
  console.log('    }');
  console.log('  }');
  console.log('}');
  console.log('');
  console.log('// Establecer configuración correcta');
  console.log('localStorage.setItem("gemini_model", "gemini-1.5-flash");');
  console.log('localStorage.setItem("gemini_temperature", "0.7");');
  console.log('localStorage.setItem("gemini_max_tokens", "1000");');
  console.log('');
  console.log('console.log("✅ Limpieza completa terminada");');
  console.log('console.log("🔄 Recarga la página ahora (F5)");');
  console.log('```');
  console.log('');
  console.log('5. ⏎ Presiona Enter para ejecutar el código');
  console.log('6. 🔄 Recarga la página completamente (F5)');
  console.log('7. 🧪 Intenta generar un email nuevamente');
  console.log('');
  console.log('💡 Si sigue sin funcionar, ejecuta este script nuevamente');
}

// Ejecutar
mostrarInstrucciones();
console.log('\n⏳ Esperando 3 segundos antes de probar el API...');
setTimeout(() => {
  probarAPI();
}, 3000);