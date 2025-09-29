// SOLUCIÓN DEFINITIVA - LIMPIEZA COMPLETA Y PRUEBA DIRECTA
console.log('🔧 SOLUCIÓN DEFINITIVA - LIMPIEZA COMPLETA');
console.log('============================================');

// 1. LIMPIEZA TOTAL DE LOCALSTORAGE
console.log('\n🧹 PASO 1: Limpieza total de localStorage...');

// Limpiar TODAS las claves relacionadas con IA/Gemini
const keysToRemove = [
  'gemini_api_key',
  'gemini_model', 
  'gemini_temperature',
  'gemini_max_tokens',
  'ai_model',
  'ai_config',
  'model_config',
  'has_custom_api_key',
  'user_gemini_config',
  'gemini_settings'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`   ❌ Eliminando: ${key} = ${localStorage.getItem(key)}`);
    localStorage.removeItem(key);
  }
});

// Limpiar cualquier clave que contenga 'gemini', 'ai' o 'model'
Object.keys(localStorage).forEach(key => {
  if (key.toLowerCase().includes('gemini') || 
      key.toLowerCase().includes('ai') || 
      key.toLowerCase().includes('model')) {
    console.log(`   ❌ Eliminando clave sospechosa: ${key} = ${localStorage.getItem(key)}`);
    localStorage.removeItem(key);
  }
});

console.log('✅ Limpieza completa terminada');

// 2. CONFIGURACIÓN FORZADA
console.log('\n⚙️ PASO 2: Configuración forzada...');
localStorage.setItem('gemini_model', 'gemini-1.5-flash');
localStorage.setItem('gemini_temperature', '0.7');
localStorage.setItem('gemini_max_tokens', '1000');
console.log('✅ Configuración establecida:');
console.log('   📱 Modelo: gemini-1.5-flash');
console.log('   🌡️ Temperatura: 0.7');
console.log('   🔢 Max tokens: 1000');

// 3. VERIFICACIÓN
console.log('\n🔍 PASO 3: Verificación final...');
const modeloFinal = localStorage.getItem('gemini_model');
const temperaturaFinal = localStorage.getItem('gemini_temperature');
const tokensFinales = localStorage.getItem('gemini_max_tokens');

console.log('📊 Estado actual del localStorage:');
console.log(`   🤖 Modelo: ${modeloFinal}`);
console.log(`   🌡️ Temperatura: ${temperaturaFinal}`);
console.log(`   🔢 Max tokens: ${tokensFinales}`);

if (modeloFinal === 'gemini-1.5-flash' && temperaturaFinal === '0.7' && tokensFinales === '1000') {
  console.log('✅ CONFIGURACIÓN CORRECTA');
} else {
  console.log('❌ CONFIGURACIÓN INCORRECTA - ALGO FALLÓ');
}

// 4. PRUEBA DIRECTA DE LA API
console.log('\n🧪 PASO 4: Prueba directa de la API...');

async function probarAPIDirecta() {
  try {
    const response = await fetch('/api/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-model': 'gemini-1.5-flash', // FORZAR EL MODELO CORRECTO
        'x-temperature': '0.7',
        'x-max-tokens': '1000',
        'x-user-email': 'test@example.com'
      },
      body: JSON.stringify({
        recipient: 'test@example.com',
        subject: 'Prueba Final de Corrección',
        purpose: 'Verificar que el modelo gemini-1.5-flash funciona correctamente',
        context: 'Esta es una prueba definitiva después de la limpieza completa',
        emailType: 'professional'
      })
    });

    const data = await response.json();
    
    console.log('📡 Respuesta de la API:');
    console.log(`   🔢 Status: ${response.status}`);
    console.log(`   📄 Datos:`, data);
    
    if (response.ok && data.email) {
      console.log('\n🎉 ¡ÉXITO! La API funciona correctamente');
      console.log('📧 Email generado:', data.email.substring(0, 100) + '...');
      if (data.metadata) {
        console.log('📊 Metadata:', data.metadata);
      }
    } else {
      console.log('\n❌ ERROR EN LA API:');
      console.log('📄 Detalles:', data);
      
      // Verificar si sigue usando el modelo incorrecto
      if (data.details && data.details.includes('gemini-1.5-flash-002')) {
        console.log('\n🚨 PROBLEMA CRÍTICO: El servidor sigue usando gemini-1.5-flash-002');
        console.log('💡 Esto indica un problema en el código del servidor, no en el frontend');
      }
    }
  } catch (error) {
    console.log('\n💥 Error en la prueba:', error);
  }
}

// Ejecutar la prueba
probarAPIDirecta();

// 5. INSTRUCCIONES FINALES
console.log('\n📋 INSTRUCCIONES FINALES:');
console.log('1. ✅ Ejecuta este script en la consola del navegador');
console.log('2. ✅ Recarga la página completamente (Ctrl+F5)');
console.log('3. ✅ Intenta generar un email');
console.log('4. ✅ Si sigue fallando, el problema está en el servidor');

console.log('\n🔧 Si el problema persiste:');
console.log('- El modelo incorrecto puede estar hardcodeado en algún lugar del servidor');
console.log('- Puede haber variables de entorno incorrectas');
console.log('- Puede haber caché del servidor que necesita reiniciarse');

console.log('\n✅ SCRIPT COMPLETADO - Revisa los resultados arriba');