// SOLUCIÓN DEFINITIVA PARA EL PROBLEMA DE GEMINI MODEL
// Ejecutar este script en la consola del navegador (F12 > Console)

console.log('🔧 INICIANDO LIMPIEZA DEFINITIVA DE CONFIGURACIÓN GEMINI...');

// 1. LIMPIAR TODAS LAS CONFIGURACIONES INCORRECTAS
const keysToClean = [
    'gemini_model',
    'gemini_temperature', 
    'gemini_max_tokens',
    'gemini_api_key',
    'customGeminiApiKey',
    'customGeminiModel',
    'customGeminiTemperature',
    'customGeminiMaxTokens'
];

console.log('🗑️ Eliminando configuraciones incorrectas...');
keysToClean.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
        console.log(`   Eliminando ${key}: ${value}`);
        localStorage.removeItem(key);
    }
});

// 2. ESTABLECER CONFIGURACIÓN CORRECTA POR DEFECTO
const correctConfig = {
    gemini_model: 'gemini-1.5-flash',
    gemini_temperature: '0.7',
    gemini_max_tokens: '1000'
};

console.log('✅ Estableciendo configuración correcta...');
Object.entries(correctConfig).forEach(([key, value]) => {
    localStorage.setItem(key, value);
    console.log(`   ${key}: ${value}`);
});

// 3. VERIFICAR CONFIGURACIÓN
console.log('🔍 VERIFICANDO CONFIGURACIÓN FINAL:');
keysToClean.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
        console.log(`   ${key}: ${value}`);
    }
});

// 4. FUNCIÓN DE VALIDACIÓN AUTOMÁTICA
function validateGeminiModel() {
    const model = localStorage.getItem('gemini_model');
    if (model && model !== 'gemini-1.5-flash') {
        console.warn(`⚠️ Modelo incorrecto detectado: ${model}`);
        localStorage.setItem('gemini_model', 'gemini-1.5-flash');
        console.log('✅ Modelo corregido automáticamente a: gemini-1.5-flash');
        return false;
    }
    return true;
}

// 5. INSTALAR VALIDACIÓN AUTOMÁTICA
window.validateGeminiModel = validateGeminiModel;

console.log('🎉 LIMPIEZA COMPLETADA EXITOSAMENTE!');
console.log('📋 PRÓXIMOS PASOS:');
console.log('   1. Ir a Configuración en la aplicación');
console.log('   2. Ingresar tu API Key de Gemini');
console.log('   3. Verificar que el modelo sea "gemini-1.5-flash"');
console.log('   4. Guardar configuración');
console.log('\n🔄 Para validar automáticamente en el futuro, ejecuta: validateGeminiModel()');

// Ejecutar validación inicial
validateGeminiModel();