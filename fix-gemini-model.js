// Script para limpiar localStorage y configurar el modelo correcto
console.log('🔧 Limpiando configuración de Gemini...');

// Limpiar modelo incorrecto
if (localStorage.getItem('gemini_model') === 'gemini-1.5-flash-002') {
  console.log('❌ Modelo incorrecto encontrado, limpiando...');
  localStorage.removeItem('gemini_model');
}

// Configurar modelo correcto
localStorage.setItem('gemini_model', 'gemini-2.0-flash-lite');
localStorage.setItem('gemini_temperature', '0.7');
localStorage.setItem('gemini_max_tokens', '1000');

console.log('✅ Configuración actualizada:');
console.log('- Modelo:', localStorage.getItem('gemini_model'));
console.log('- Temperatura:', localStorage.getItem('gemini_temperature'));
console.log('- Max tokens:', localStorage.getItem('gemini_max_tokens'));

console.log('🔄 Recargando página...');
window.location.reload();