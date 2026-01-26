// Script para ejecutar en la consola del navegador
// Limpia y configura correctamente el modelo Gemini

console.log('🔧 Limpiando configuración de Gemini...');

// Limpiar modelo incorrecto si existe
if (localStorage.getItem('gemini_model') === 'gemini-1.5-flash-002') {
  localStorage.removeItem('gemini_model');
  console.log('✅ Modelo incorrecto eliminado');
}

// Configurar modelo correcto
localStorage.setItem('gemini_model', 'gemini-2.0-flash-lite');
localStorage.setItem('gemini_temperature', '0.7');
localStorage.setItem('gemini_max_tokens', '1000');

console.log('✅ Configuración actualizada:');
console.log('- Modelo:', localStorage.getItem('gemini_model'));
console.log('- Temperatura:', localStorage.getItem('gemini_temperature'));
console.log('- Max tokens:', localStorage.getItem('gemini_max_tokens'));

// Recargar la página para aplicar cambios
console.log('🔄 Recargando página...');
window.location.reload();