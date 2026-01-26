// SCRIPT DE LIMPIEZA COMPLETA DE CONFIGURACIÓN GEMINI
// Este script elimina TODA la configuración problemática y establece valores correctos

console.log('🧹 INICIANDO LIMPIEZA COMPLETA DE CONFIGURACIÓN GEMINI');
console.log('='.repeat(70));

// Función para limpiar localStorage completamente
function limpiezaCompleta() {
  console.log('\n🔍 PASO 1: Analizando configuración actual...');
  
  // Listar todas las claves relacionadas con Gemini
  const clavesGemini = [];
  for (let i = 0; i < localStorage.length; i++) {
    const clave = localStorage.key(i);
    if (clave && (clave.includes('gemini') || clave.includes('ai') || clave.includes('model'))) {
      clavesGemini.push(clave);
    }
  }
  
  console.log('📋 Claves encontradas relacionadas con Gemini:', clavesGemini);
  
  // Mostrar valores actuales
  clavesGemini.forEach(clave => {
    const valor = localStorage.getItem(clave);
    console.log(`   ${clave}: ${valor}`);
    if (valor && valor.includes('gemini-1.5-flash-002')) {
      console.log('   ❌ PROBLEMA DETECTADO: Modelo incorrecto');
    }
  });
  
  console.log('\n🗑️ PASO 2: Eliminando TODA la configuración problemática...');
  
  // Eliminar TODAS las claves relacionadas con Gemini
  clavesGemini.forEach(clave => {
    localStorage.removeItem(clave);
    console.log(`   ✅ Eliminado: ${clave}`);
  });
  
  // Eliminar también claves específicas que podrían causar problemas
  const clavesEspecificas = [
    'gemini_api_key',
    'gemini_model', 
    'gemini_temperature',
    'gemini_max_tokens',
    'ai_model',
    'ai_config',
    'model_config'
  ];
  
  clavesEspecificas.forEach(clave => {
    if (localStorage.getItem(clave)) {
      localStorage.removeItem(clave);
      console.log(`   ✅ Eliminado (específico): ${clave}`);
    }
  });
  
  console.log('\n✨ PASO 3: Estableciendo configuración CORRECTA...');
  
  // Establecer configuración correcta
  localStorage.setItem('gemini_model', 'gemini-1.5-flash');
  localStorage.setItem('gemini_temperature', '0.7');
  localStorage.setItem('gemini_max_tokens', '1000');
  
  console.log('   ✅ Modelo establecido: gemini-1.5-flash');
  console.log('   ✅ Temperatura establecida: 0.7');
  console.log('   ✅ Max tokens establecido: 1000');
  
  console.log('\n🔍 PASO 4: Verificando configuración final...');
  
  const modeloFinal = localStorage.getItem('gemini_model');
  const temperaturaFinal = localStorage.getItem('gemini_temperature');
  const maxTokensFinal = localStorage.getItem('gemini_max_tokens');
  
  console.log(`   📋 Modelo: ${modeloFinal}`);
  console.log(`   📋 Temperatura: ${temperaturaFinal}`);
  console.log(`   📋 Max Tokens: ${maxTokensFinal}`);
  
  if (modeloFinal === 'gemini-1.5-flash') {
    console.log('\n🎉 ¡ÉXITO! Configuración corregida completamente');
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Recarga la página (F5)');
    console.log('   2. Ve a la página de Correos IA');
    console.log('   3. Intenta generar un email');
    console.log('   4. Si aún no funciona, configura tu API Key en Ajustes');
    
    return true;
  } else {
    console.log('\n❌ ERROR: La configuración no se estableció correctamente');
    return false;
  }
}

// Función para verificar si hay API Key configurada
function verificarApiKey() {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.length < 10) {
    console.log('\n⚠️ ADVERTENCIA: No hay API Key configurada');
    console.log('\n🔑 PARA CONFIGURAR API KEY:');
    console.log('   1. Ve a https://aistudio.google.com/');
    console.log('   2. Crea una cuenta o inicia sesión');
    console.log('   3. Genera una nueva API Key');
    console.log('   4. Ve a Ajustes en la aplicación');
    console.log('   5. Pega la API Key en el campo correspondiente');
    return false;
  } else {
    console.log(`\n✅ API Key configurada: ${apiKey.substring(0, 10)}...`);
    return true;
  }
}

// Ejecutar limpieza completa
if (typeof window !== 'undefined' && window.localStorage) {
  const limpiezaExitosa = limpiezaCompleta();
  const apiKeyConfigurada = verificarApiKey();
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN FINAL:');
  console.log(`   🧹 Limpieza: ${limpiezaExitosa ? '✅ EXITOSA' : '❌ FALLÓ'}`);
  console.log(`   🔑 API Key: ${apiKeyConfigurada ? '✅ CONFIGURADA' : '⚠️ FALTA CONFIGURAR'}`);
  
  if (limpiezaExitosa && apiKeyConfigurada) {
    console.log('\n🎯 ¡TODO LISTO! Puedes generar emails ahora.');
  } else if (limpiezaExitosa && !apiKeyConfigurada) {
    console.log('\n🎯 Configuración limpia. Solo falta configurar la API Key.');
  } else {
    console.log('\n❌ Hubo problemas. Intenta ejecutar el script nuevamente.');
  }
  
} else {
  console.log('❌ Este script debe ejecutarse en el navegador');
  console.log('💡 Copia y pega este código en la consola del navegador (F12)');
}

// Exportar función para uso programático
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { limpiezaCompleta, verificarApiKey };
}