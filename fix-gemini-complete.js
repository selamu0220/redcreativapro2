// Script completo para limpiar y corregir configuración de Gemini
// Este script debe ejecutarse en la consola del navegador

console.log('🔧 LIMPIEZA COMPLETA DE CONFIGURACIÓN GEMINI');
console.log('='.repeat(60));

// Función para limpiar completamente la configuración
function limpiarConfiguracionGemini() {
  console.log('\n🧹 Limpiando configuración existente...');
  
  // Lista de todas las claves relacionadas con Gemini
  const geminKeys = [
    'gemini_api_key',
    'gemini_model',
    'gemini_temperature',
    'gemini_max_tokens',
    'has_custom_api_key',
    'gemini_config',
    'ai_config',
    'custom_gemini_key'
  ];
  
  // Eliminar todas las configuraciones
  geminKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🗑️ Eliminando: ${key} = ${localStorage.getItem(key)}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Configuración limpiada completamente');
}

// Función para establecer configuración correcta
function establecerConfiguracionCorrecta() {
  console.log('\n⚙️ Estableciendo configuración correcta...');
  
  // Configurar modelo correcto
  localStorage.setItem('gemini_model', 'gemini-1.5-flash');
  console.log('✅ Modelo configurado: gemini-1.5-flash');
  
  // Configurar parámetros por defecto
  localStorage.setItem('gemini_temperature', '0.7');
  localStorage.setItem('gemini_max_tokens', '2048');
  
  console.log('✅ Parámetros por defecto configurados');
}

// Función para verificar configuración
function verificarConfiguracion() {
  console.log('\n📋 CONFIGURACIÓN ACTUAL:');
  console.log('-'.repeat(40));
  
  const modelo = localStorage.getItem('gemini_model');
  const apiKey = localStorage.getItem('gemini_api_key');
  const temperature = localStorage.getItem('gemini_temperature');
  const maxTokens = localStorage.getItem('gemini_max_tokens');
  
  console.log('🤖 Modelo:', modelo || 'No configurado (usará gemini-1.5-flash por defecto)');
  console.log('🔑 API Key:', apiKey ? `Configurada (${apiKey.substring(0, 10)}...)` : 'No configurada');
  console.log('🌡️ Temperature:', temperature || 'Por defecto');
  console.log('📊 Max Tokens:', maxTokens || 'Por defecto');
  
  // Verificar si hay configuraciones problemáticas
  if (modelo && modelo.includes('gemini-1.5-flash-002')) {
    console.log('❌ PROBLEMA DETECTADO: Modelo incorrecto');
    return false;
  }
  
  console.log('✅ Configuración parece correcta');
  return true;
}

// Función principal
function solucionarProblemaGemini() {
  console.log('🚀 INICIANDO SOLUCIÓN COMPLETA...');
  
  // Paso 1: Verificar configuración actual
  console.log('\n📋 Paso 1: Verificando configuración actual...');
  const configOk = verificarConfiguracion();
  
  if (!configOk) {
    // Paso 2: Limpiar configuración
    console.log('\n🧹 Paso 2: Limpiando configuración problemática...');
    limpiarConfiguracionGemini();
    
    // Paso 3: Establecer configuración correcta
    console.log('\n⚙️ Paso 3: Estableciendo configuración correcta...');
    establecerConfiguracionCorrecta();
  }
  
  // Paso 4: Verificación final
  console.log('\n✅ Paso 4: Verificación final...');
  verificarConfiguracion();
  
  console.log('\n🎉 SOLUCIÓN COMPLETADA');
  console.log('💡 Ahora recarga la página (F5) y prueba generar un email');
  console.log('💡 Si el problema persiste, verifica que tengas una API Key válida en Ajustes');
}

// Ejecutar automáticamente si estamos en el navegador
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  solucionarProblemaGemini();
} else {
  console.log('❌ Este script debe ejecutarse en la consola del navegador');
  console.log('💡 Copia todo el contenido de este archivo y pégalo en la consola del navegador');
}

// Exportar funciones para uso manual
if (typeof window !== 'undefined') {
  window.limpiarGemini = limpiarConfiguracionGemini;
  window.verificarGemini = verificarConfiguracion;
  window.solucionarGemini = solucionarProblemaGemini;
  
  console.log('\n🔧 Funciones disponibles:');
  console.log('- limpiarGemini() - Limpia toda la configuración');
  console.log('- verificarGemini() - Verifica la configuración actual');
  console.log('- solucionarGemini() - Ejecuta la solución completa');
}