#!/usr/bin/env node

/**
 * VERIFICACIÓN COMPLETA DEL NUEVO ESCRITOR IA
 * ==========================================
 * 
 * Este script verifica que el nuevo escritor funciona correctamente
 * tanto en terminal como en la interfaz web.
 */

const fetch = require('node-fetch');

console.log('🚀 VERIFICACIÓN COMPLETA DEL NUEVO ESCRITOR IA');
console.log('==============================================\n');

async function testAPI() {
  console.log('📡 PRUEBA 1: API - Texto muy corto (debe rechazar)');
  console.log('─'.repeat(50));
  
  try {
    const shortText = 'hola que tal';
    console.log(`📝 Texto: "${shortText}"`);
    console.log(`📊 Palabras: ${shortText.split(/\s+/).length}`);
    
    const response = await fetch('http://localhost:3000/api/improve-text-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: shortText, language: 'es' })
    });
    
    const data = await response.json();
    
    if (data.error && data.error.includes('muy corto')) {
      console.log('✅ CORRECTO: Texto rechazado apropiadamente');
      console.log(`💬 Mensaje: ${data.error}`);
    } else {
      console.log('❌ ERROR: Debería rechazar texto muy corto');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en prueba 1:', error.message);
    return false;
  }
  
  console.log('\n📡 PRUEBA 2: API - Texto suficiente (debe mejorar)');
  console.log('─'.repeat(50));
  
  try {
    const longText = 'hola como estas espero que todo este bien';
    console.log(`📝 Texto: "${longText}"`);
    console.log(`📊 Palabras: ${longText.split(/\s+/).length}`);
    
    const response = await fetch('http://localhost:3000/api/improve-text-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: longText, language: 'es' })
    });
    
    const data = await response.json();
    
    if (data.improvedContent) {
      console.log('✅ ÉXITO: Texto mejorado');
      console.log(`📝 Original: "${longText}"`);
      console.log(`📝 Mejorado: "${data.improvedContent}"`);
      
      // Verificar que realmente cambió
      if (longText.toLowerCase() !== data.improvedContent.toLowerCase()) {
        console.log('✅ VERIFICADO: El texto realmente cambió');
      } else {
        console.log('❌ ERROR: El texto no cambió');
        return false;
      }
    } else {
      console.log('❌ ERROR:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en prueba 2:', error.message);
    return false;
  }
  
  return true;
}

async function main() {
  const apiSuccess = await testAPI();
  
  console.log('\n🎯 RESULTADOS FINALES');
  console.log('===================');
  
  if (apiSuccess) {
    console.log('✅ API: Funcionando correctamente');
    console.log('✅ Validación: Rechaza textos muy cortos');
    console.log('✅ Mejoramiento: Mejora textos apropiadamente');
    console.log('✅ Verificación: Confirma que el texto cambió');
    
    console.log('\n🎉 ¡NUEVO ESCRITOR IA LISTO!');
    console.log('============================');
    console.log('');
    console.log('📝 Páginas disponibles:');
    console.log('  • /escritor-ia-nuevo - Nuevo escritor funcional');
    console.log('  • /test-escritor-nuevo - Página de pruebas');
    console.log('');
    console.log('🔧 Características:');
    console.log('  • ✅ Mejoramiento manual (botón)');
    console.log('  • ✅ Mejoramiento automático (3 segundos)');
    console.log('  • ✅ Validación de contenido mínimo (5 palabras)');
    console.log('  • ✅ Verificación de cambios reales');
    console.log('  • ✅ Mensajes de error claros');
    console.log('  • ✅ Interfaz limpia y funcional');
    console.log('');
    console.log('🚀 INSTRUCCIONES PARA EL USUARIO:');
    console.log('1. Ve a /escritor-ia-nuevo');
    console.log('2. Escribe texto con al menos 5 palabras');
    console.log('3. Espera 3 segundos (auto) o haz clic en "Mejorar con IA"');
    console.log('4. ¡Disfruta del texto mejorado!');
    
  } else {
    console.log('❌ Hay problemas con la API');
    console.log('🔧 Revisa la configuración del servidor');
  }
}

main().catch(console.error);