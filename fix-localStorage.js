// Script para limpiar localStorage y configurar modelo correcto
// Ejecutar en la consola del navegador (F12)

console.log('🔧 Limpiando localStorage y configurando modelo correcto...');

// Limpiar modelo incorrecto
const modeloActual = localStorage.getItem('gemini_model');
console.log('Modelo actual:', modeloActual);

if (modeloActual && modeloActual.includes('gemini-1.5-flash-002')) {
  console.log('❌ Modelo incorrecto detectado, limpiando...');
  localStorage.removeItem('gemini_model');
}

// Configurar modelo correcto
localStorage.setItem('gemini_model', 'gemini-2.0-flash-lite');
localStorage.setItem('gemini_temperature', '0.7');
localStorage.setItem('gemini_max_tokens', '1000');

console.log('✅ Configuración actualizada:');
console.log('- Modelo:', localStorage.getItem('gemini_model'));
console.log('- Temperatura:', localStorage.getItem('gemini_temperature'));
console.log('- Max Tokens:', localStorage.getItem('gemini_max_tokens'));

console.log('🔄 Recarga la página para aplicar los cambios');

// Recargar automáticamente
setTimeout(() => {
  window.location.reload();
}, 2000);