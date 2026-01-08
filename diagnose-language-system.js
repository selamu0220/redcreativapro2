// Script de diagnóstico para el sistema de idiomas
console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE IDIOMAS');
console.log('=====================================\n');

// 1. Verificar que las traducciones existen
console.log('1. ✅ Verificando traducciones...');
const fs = require('fs');
const path = require('path');

try {
    const translationsPath = path.join(__dirname, 'app/lib/simple-translations.ts');
    const content = fs.readFileSync(translationsPath, 'utf8');
    
    // Verificar que contiene las traducciones principales
    const hasSpanish = content.includes("'es': {");
    const hasEnglish = content.includes("'en': {");
    const hasFrench = content.includes("'fr': {");
    
    console.log(`   - Español: ${hasSpanish ? '✅' : '❌'}`);
    console.log(`   - Inglés: ${hasEnglish ? '✅' : '❌'}`);
    console.log(`   - Francés: ${hasFrench ? '✅' : '❌'}`);
    
    if (hasSpanish && hasEnglish && hasFrench) {
        console.log('   ✅ Traducciones encontradas correctamente\n');
    } else {
        console.log('   ❌ Faltan algunas traducciones\n');
    }
} catch (error) {
    console.log('   ❌ Error leyendo archivo de traducciones:', error.message, '\n');
}

// 2. Verificar componente SimpleLanguageToggle
console.log('2. ✅ Verificando SimpleLanguageToggle...');
try {
    const togglePath = path.join(__dirname, 'app/components/SimpleLanguageToggle.tsx');
    const toggleContent = fs.readFileSync(togglePath, 'utf8');
    
    const hasLanguageChange = toggleContent.includes('changeLanguage');
    const hasLocalStorage = toggleContent.includes('localStorage');
    const hasCustomEvent = toggleContent.includes('CustomEvent');
    
    console.log(`   - Función changeLanguage: ${hasLanguageChange ? '✅' : '❌'}`);
    console.log(`   - LocalStorage: ${hasLocalStorage ? '✅' : '❌'}`);
    console.log(`   - CustomEvent: ${hasCustomEvent ? '✅' : '❌'}`);
    
    if (hasLanguageChange && hasLocalStorage && hasCustomEvent) {
        console.log('   ✅ SimpleLanguageToggle configurado correctamente\n');
    } else {
        console.log('   ❌ SimpleLanguageToggle tiene problemas\n');
    }
} catch (error) {
    console.log('   ❌ Error leyendo SimpleLanguageToggle:', error.message, '\n');
}

// 3. Verificar contexto de idioma
console.log('3. ✅ Verificando contexto de idioma...');
try {
    const contextPath = path.join(__dirname, 'app/lib/language/context.tsx');
    const contextContent = fs.readFileSync(contextPath, 'utf8');
    
    const hasUseTranslation = contextContent.includes('useTranslation');
    const hasSimpleTranslations = contextContent.includes('useSimpleTranslations');
    const hasLanguageProvider = contextContent.includes('LanguageProvider');
    
    console.log(`   - useTranslation: ${hasUseTranslation ? '✅' : '❌'}`);
    console.log(`   - useSimpleTranslations: ${hasSimpleTranslations ? '✅' : '❌'}`);
    console.log(`   - LanguageProvider: ${hasLanguageProvider ? '✅' : '❌'}`);
    
    if (hasUseTranslation && hasSimpleTranslations && hasLanguageProvider) {
        console.log('   ✅ Contexto de idioma configurado correctamente\n');
    } else {
        console.log('   ❌ Contexto de idioma tiene problemas\n');
    }
} catch (error) {
    console.log('   ❌ Error leyendo contexto de idioma:', error.message, '\n');
}

// 4. Verificar página de prueba
console.log('4. ✅ Verificando página de prueba...');
try {
    const testPath = path.join(__dirname, 'app/test-language-system/page.tsx');
    const testContent = fs.readFileSync(testPath, 'utf8');
    
    const hasUseSimpleTranslations = testContent.includes('useSimpleTranslations');
    const hasSimpleLanguageToggle = testContent.includes('SimpleLanguageToggle');
    const hasForceUpdate = testContent.includes('forceUpdate');
    
    console.log(`   - useSimpleTranslations: ${hasUseSimpleTranslations ? '✅' : '❌'}`);
    console.log(`   - SimpleLanguageToggle: ${hasSimpleLanguageToggle ? '✅' : '❌'}`);
    console.log(`   - forceUpdate: ${hasForceUpdate ? '✅' : '❌'}`);
    
    if (hasUseSimpleTranslations && hasSimpleLanguageToggle && hasForceUpdate) {
        console.log('   ✅ Página de prueba configurada correctamente\n');
    } else {
        console.log('   ❌ Página de prueba tiene problemas\n');
    }
} catch (error) {
    console.log('   ❌ Error leyendo página de prueba:', error.message, '\n');
}

// 5. Instrucciones finales
console.log('🎯 INSTRUCCIONES PARA PROBAR:');
console.log('=============================');
console.log('1. Abre http://localhost:3001/test-language-system');
console.log('2. Haz clic en el selector de idioma (esquina superior derecha)');
console.log('3. Selecciona un idioma diferente (English, Français, etc.)');
console.log('4. Verifica que todos los textos cambien');
console.log('5. El contador de "Renders" debería incrementarse');
console.log('6. Recarga la página para verificar que se mantiene el idioma\n');

console.log('🔧 SI NO FUNCIONA:');
console.log('==================');
console.log('1. Abre las herramientas de desarrollador (F12)');
console.log('2. Ve a la consola y busca errores');
console.log('3. Verifica que localStorage.getItem("simple-language") cambie');
console.log('4. Verifica que se dispare el evento "languageChanged"');
console.log('5. Comprueba que los componentes se re-rendericen\n');

console.log('✅ Diagnóstico completado. ¡Prueba el sistema ahora!');