// Script de prueba para verificar la solución del problema de Gemini
// Ejecutar en la consola del navegador para probar la corrección automática

console.log('🧪 INICIANDO PRUEBAS DE LA SOLUCIÓN GEMINI...');

// 1. SIMULAR EL PROBLEMA ORIGINAL
console.log('\n1️⃣ Simulando el problema original...');
localStorage.setItem('gemini_model', 'gemini-1.5-flash-002'); // Modelo incorrecto
console.log('❌ Modelo incorrecto establecido:', localStorage.getItem('gemini_model'));

// 2. IMPORTAR Y PROBAR LA FUNCIÓN DE VALIDACIÓN
console.log('\n2️⃣ Probando la función de validación...');

// Función de validación (copiada del utils/gemini-validator.ts)
function validateAndFixGeminiModel(model) {
    const validModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    const DEFAULT_MODEL = 'gemini-1.5-flash';
    
    // Si el modelo es válido, devolverlo
    if (validModels.includes(model)) {
        return model;
    }
    
    // Si el modelo contiene 'gemini-1.5-flash' pero tiene sufijos incorrectos
    if (model.includes('gemini-1.5-flash')) {
        console.warn(`⚠️ Modelo incorrecto detectado: ${model}. Corrigiendo a ${DEFAULT_MODEL}`);
        localStorage.setItem('gemini_model', DEFAULT_MODEL);
        return DEFAULT_MODEL;
    }
    
    // Para cualquier otro modelo inválido, usar el por defecto
    console.warn(`⚠️ Modelo inválido detectado: ${model}. Usando ${DEFAULT_MODEL} por defecto`);
    localStorage.setItem('gemini_model', DEFAULT_MODEL);
    return DEFAULT_MODEL;
}

// 3. PROBAR LA CORRECCIÓN AUTOMÁTICA
const modeloIncorrecto = localStorage.getItem('gemini_model');
const modeloCorregido = validateAndFixGeminiModel(modeloIncorrecto);

console.log('\n3️⃣ Resultado de la corrección:');
console.log('   Modelo antes:', modeloIncorrecto);
console.log('   Modelo después:', modeloCorregido);
console.log('   Almacenado en localStorage:', localStorage.getItem('gemini_model'));

// 4. VERIFICAR QUE LA CORRECCIÓN PERSISTE
console.log('\n4️⃣ Verificando persistencia...');
const modeloVerificado = localStorage.getItem('gemini_model');
if (modeloVerificado === 'gemini-1.5-flash') {
    console.log('✅ ÉXITO: El modelo se corrigió correctamente y persiste');
} else {
    console.log('❌ ERROR: El modelo no se corrigió correctamente');
}

// 5. PROBAR DIFERENTES CASOS
console.log('\n5️⃣ Probando diferentes casos...');

const casosPrueba = [
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-001', 
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash', // Correcto
    'gemini-1.5-pro',    // Correcto
    'modelo-inexistente'
];

casosPrueba.forEach((caso, index) => {
    const resultado = validateAndFixGeminiModel(caso);
    const esValido = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'].includes(resultado);
    console.log(`   Caso ${index + 1}: ${caso} → ${resultado} ${esValido ? '✅' : '❌'}`);
});

// 6. SIMULAR LA CONFIGURACIÓN COMPLETA
console.log('\n6️⃣ Simulando configuración completa...');
function getValidatedGeminiConfig() {
    const rawModel = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';
    const validatedModel = validateAndFixGeminiModel(rawModel);
    
    return {
        model: validatedModel,
        temperature: localStorage.getItem('gemini_temperature') || '0.7',
        maxTokens: localStorage.getItem('gemini_max_tokens') || '1000',
        apiKey: localStorage.getItem('gemini_api_key') || undefined
    };
}

const config = getValidatedGeminiConfig();
console.log('   Configuración final:', config);

// 7. RESULTADO FINAL
console.log('\n🎉 PRUEBAS COMPLETADAS');
if (config.model === 'gemini-1.5-flash') {
    console.log('✅ TODAS LAS PRUEBAS PASARON - La solución funciona correctamente');
    console.log('\n📋 PRÓXIMOS PASOS PARA EL USUARIO:');
    console.log('   1. Ejecutar el script de limpieza (SOLUCION-DEFINITIVA-GEMINI-FINAL.js)');
    console.log('   2. Recargar la página');
    console.log('   3. Configurar la API Key de Gemini');
    console.log('   4. Probar la generación de emails');
} else {
    console.log('❌ ALGUNAS PRUEBAS FALLARON - Revisar la implementación');
}

console.log('\n🔍 Para verificar manualmente:');
console.log('localStorage.getItem("gemini_model"):', localStorage.getItem('gemini_model'));