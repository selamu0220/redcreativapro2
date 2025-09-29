// Script para limpiar localStorage y corregir el modelo de Gemini
// Ejecutar este código en la consola del navegador (F12)

console.log('🧹 Iniciando limpieza de localStorage...');

// Limpiar configuración incorrecta
localStorage.removeItem('gemini_model');
localStorage.removeItem('gemini_temperature');
localStorage.removeItem('gemini_max_tokens');

// Configurar valores correctos
localStorage.setItem('gemini_model', 'gemini-2.0-flash-lite');
localStorage.setItem('gemini_temperature', '0.7');
localStorage.setItem('gemini_max_tokens', '1000');

console.log('✅ localStorage limpiado y configurado correctamente');
console.log('📋 Configuración actual:');
console.log('- Modelo:', localStorage.getItem('gemini_model'));
console.log('- Temperatura:', localStorage.getItem('gemini_temperature'));
console.log('- Max Tokens:', localStorage.getItem('gemini_max_tokens'));

console.log('🔄 Recargando página...');
location.reload();