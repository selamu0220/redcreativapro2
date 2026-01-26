// Script para limpiar localStorage y configurar modelo correcto de Gemini
// Ejecutar en la consola del navegador (F12 > Console)

console.log('🔧 Limpiando configuración de Gemini en localStorage...');

// Verificar configuración actual
const modeloActual = localStorage.getItem('gemini_model');
console.log('Modelo actual en localStorage:', modeloActual);

// Limpiar modelos inválidos
const modelosInvalidos = [
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-002'
];

if (modeloActual && modelosInvalidos.includes(modeloActual)) {
  console.log('❌ Modelo inválido detectado:', modeloActual);
  localStorage.removeItem('gemini_model');
  console.log('✅ Modelo inválido eliminado');
}

// Establecer configuración correcta
localStorage.setItem('gemini_model', 'gemini-1.5-flash');
localStorage.setItem('gemini_temperature', '0.7');
localStorage.setItem('gemini_max_tokens', '2000');

console.log('✅ Configuración actualizada:');
console.log('- Modelo:', localStorage.getItem('gemini_model'));
console.log('- Temperatura:', localStorage.getItem('gemini_temperature'));
console.log('- Max tokens:', localStorage.getItem('gemini_max_tokens'));

// Disparar evento para notificar a la aplicación
window.dispatchEvent(new CustomEvent('gemini-config-updated', {
  detail: { 
    apiKey: localStorage.getItem('gemini_api_key') || '', 
    model: 'gemini-1.5-flash' 
  }
}));

console.log('🎉 Configuración de Gemini corregida. Recarga la página si es necesario.');