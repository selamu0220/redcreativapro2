// Script para verificar y corregir la configuración del modelo Gemini

console.log('🔧 Verificando configuración del modelo Gemini...');
console.log('=' .repeat(60));

// Verificar si estamos en un entorno de navegador
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Verificar configuraciones actuales
  const currentModel = localStorage.getItem('gemini_model');
  const currentApiKey = localStorage.getItem('gemini_api_key');
  const hasCustomApiKey = localStorage.getItem('has_custom_api_key');
  const temperature = localStorage.getItem('gemini_temperature');
  const maxTokens = localStorage.getItem('gemini_max_tokens');
  
  console.log('📋 Configuración actual en localStorage:');
  console.log('🤖 Modelo:', currentModel || 'No configurado (usará gemini-1.5-flash por defecto)');
  console.log('🔑 API Key:', currentApiKey ? 'Configurada (' + currentApiKey.substring(0, 10) + '...)' : 'No configurada');
  console.log('🔐 Tiene API Key personalizada:', hasCustomApiKey);
  console.log('🌡️ Temperatura:', temperature || 'No configurada (usará 0.7 por defecto)');
  console.log('📏 Max Tokens:', maxTokens || 'No configurado (usará 2000 por defecto)');
  
  // Verificar si el modelo es problemático
  if (currentModel && currentModel.includes('gemini-1.5-flash-002')) {
    console.log('\n❌ PROBLEMA ENCONTRADO: Modelo incorrecto configurado!');
    console.log('🔧 Corrigiendo modelo a gemini-1.5-flash...');
    
    // Corregir el modelo
    localStorage.setItem('gemini_model', 'gemini-1.5-flash');
    console.log('✅ Modelo corregido exitosamente');
  } else if (!currentModel) {
    console.log('\n💡 No hay modelo configurado, se usará el por defecto (gemini-1.5-flash)');
  } else {
    console.log('\n✅ Modelo configurado correctamente:', currentModel);
  }
  
  // Mostrar configuración final
  console.log('\n📋 Configuración final:');
  console.log('🤖 Modelo:', localStorage.getItem('gemini_model') || 'gemini-1.5-flash (por defecto)');
  
  // Limpiar cualquier configuración problemática
  const keysToCheck = [
    'gemini_model',
    'gemini_api_key', 
    'gemini_temperature',
    'gemini_max_tokens',
    'has_custom_api_key'
  ];
  
  console.log('\n🧹 Limpiando configuraciones problemáticas...');
  let cleaned = false;
  
  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
    if (value && (value.includes('gemini-1.5-flash-002') || value === 'undefined' || value === 'null')) {
      console.log(`🗑️ Limpiando ${key}: ${value}`);
      if (key === 'gemini_model') {
        localStorage.setItem(key, 'gemini-1.5-flash');
      } else {
        localStorage.removeItem(key);
      }
      cleaned = true;
    }
  });
  
  if (!cleaned) {
    console.log('✅ No se encontraron configuraciones problemáticas');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Verificación completada');
  console.log('💡 Ahora intenta generar un email nuevamente');
  
} else {
  console.log('❌ Este script debe ejecutarse en el navegador');
  console.log('💡 Copia y pega este código en la consola del navegador:');
  console.log('');
  console.log('// Verificar y corregir configuración de Gemini');
  console.log('const currentModel = localStorage.getItem("gemini_model");');
  console.log('console.log("Modelo actual:", currentModel);');
  console.log('if (currentModel && currentModel.includes("gemini-1.5-flash-002")) {');
  console.log('  localStorage.setItem("gemini_model", "gemini-1.5-flash");');
  console.log('  console.log("✅ Modelo corregido a gemini-1.5-flash");');
  console.log('} else {');
  console.log('  console.log("✅ Modelo OK o no configurado");');
  console.log('}');
}