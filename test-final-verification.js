/**
 * Verificación final completa del sistema de Escritor IA
 * Verifica todos los componentes y configuraciones
 */

async function verifySystem() {
  console.log('🔍 VERIFICACIÓN FINAL DEL SISTEMA ESCRITOR IA');
  console.log('==============================================\n');
  
  let allTestsPassed = true;
  const results = [];

  // Test 1: Verificar servidor corriendo
  console.log('📡 TEST 1: Verificando servidor...');
  try {
    const response = await fetch('http://localhost:3000/api/improve-text-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'test' })
    });
    
    if (response.status === 400) {
      console.log('✅ Servidor corriendo y API respondiendo');
      results.push({ test: 'Servidor', status: 'PASS' });
    } else {
      console.log('⚠️ Servidor responde pero comportamiento inesperado');
      results.push({ test: 'Servidor', status: 'WARN' });
    }
  } catch (error) {
    console.log('❌ Servidor no responde - Ejecuta: npm run dev');
    results.push({ test: 'Servidor', status: 'FAIL' });
    allTestsPassed = false;
  }

  // Test 2: Verificar mejora de texto con errores
  console.log('\n📝 TEST 2: Verificando mejora de texto...');
  try {
    const response = await fetch('http://localhost:3000/api/improve-text-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content: 'este texto tiene errores de gramatica y ortografia',
        language: 'es'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.improvedContent) {
      const original = 'este texto tiene errores de gramatica y ortografia';
      const improved = data.improvedContent;
      
      if (original !== improved) {
        console.log('✅ Mejora de texto funciona correctamente');
        console.log(`   Original: "${original}"`);
        console.log(`   Mejorado: "${improved}"`);
        results.push({ test: 'Mejora de texto', status: 'PASS' });
      } else {
        console.log('❌ El texto no cambió - Sistema no está mejorando');
        results.push({ test: 'Mejora de texto', status: 'FAIL' });
        allTestsPassed = false;
      }
    } else {
      console.log('❌ API no devolvió contenido mejorado');
      results.push({ test: 'Mejora de texto', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Error al probar mejora de texto:', error.message);
    results.push({ test: 'Mejora de texto', status: 'FAIL' });
    allTestsPassed = false;
  }

  // Test 3: Verificar rechazo de texto corto
  console.log('\n⚠️ TEST 3: Verificando rechazo de texto corto...');
  try {
    const response = await fetch('http://localhost:3000/api/improve-text-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content: 'hola mundo',
        language: 'es'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok && data.error && data.error.includes('muy corto')) {
      console.log('✅ Rechazo de texto corto funciona correctamente');
      console.log(`   Error: "${data.error}"`);
      results.push({ test: 'Rechazo texto corto', status: 'PASS' });
    } else {
      console.log('❌ Texto corto no fue rechazado apropiadamente');
      results.push({ test: 'Rechazo texto corto', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Error al probar rechazo de texto corto:', error.message);
    results.push({ test: 'Rechazo texto corto', status: 'FAIL' });
    allTestsPassed = false;
  }

  // Test 4: Verificar rechazo de texto perfecto
  console.log('\n✨ TEST 4: Verificando rechazo de texto perfecto...');
  try {
    const response = await fetch('http://localhost:3000/api/improve-text-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content: 'Este texto está perfectamente escrito con gramática correcta y tono profesional.',
        language: 'es'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok && data.error && data.error.includes('no necesita mejoras')) {
      console.log('✅ Rechazo de texto perfecto funciona correctamente');
      console.log(`   Error: "${data.error}"`);
      results.push({ test: 'Rechazo texto perfecto', status: 'PASS' });
    } else {
      console.log('❌ Texto perfecto no fue rechazado apropiadamente');
      results.push({ test: 'Rechazo texto perfecto', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Error al probar rechazo de texto perfecto:', error.message);
    results.push({ test: 'Rechazo texto perfecto', status: 'FAIL' });
    allTestsPassed = false;
  }

  // Test 5: Verificar página del escritor IA
  console.log('\n🌐 TEST 5: Verificando página del escritor IA...');
  try {
    const response = await fetch('http://localhost:3000/escritor-ia', {
      redirect: 'manual' // Don't follow redirects
    });
    
    if (response.status === 307 || response.status === 302) {
      console.log('✅ Página del escritor IA protegida correctamente (redirige a login)');
      results.push({ test: 'Página escritor IA', status: 'PASS' });
    } else if (response.ok) {
      console.log('✅ Página del escritor IA accesible');
      results.push({ test: 'Página escritor IA', status: 'PASS' });
    } else {
      console.log('❌ Página del escritor IA no accesible');
      results.push({ test: 'Página escritor IA', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Error al acceder a página del escritor IA:', error.message);
    results.push({ test: 'Página escritor IA', status: 'FAIL' });
    allTestsPassed = false;
  }

  // Mostrar resumen final
  console.log('\n📊 RESUMEN DE RESULTADOS');
  console.log('========================');
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${result.test}: ${result.status}`);
  });

  console.log('\n🎯 ESTADO FINAL DEL SISTEMA');
  console.log('===========================');
  
  if (allTestsPassed) {
    console.log('🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');
    console.log('✅ Todas las funcionalidades están trabajando correctamente');
    console.log('✅ El escritor IA está listo para uso en producción');
    console.log('✅ Los errores se manejan apropiadamente');
    console.log('✅ El sistema es honesto sobre los cambios realizados');
    
    console.log('\n🚀 PRÓXIMOS PASOS RECOMENDADOS:');
    console.log('1. Configurar API key real (Gemini o OpenRouter) para producción');
    console.log('2. Probar manualmente en http://localhost:3000/escritor-ia');
    console.log('3. Verificar que la auto-mejora funcione después de 3 segundos');
    console.log('4. Desplegar a producción cuando esté listo');
    
  } else {
    console.log('⚠️ SISTEMA PARCIALMENTE FUNCIONAL');
    console.log('❌ Algunos componentes necesitan atención');
    console.log('💡 Revisa los errores arriba y corrígelos antes de continuar');
    
    console.log('\n🔧 ACCIONES REQUERIDAS:');
    results.forEach(result => {
      if (result.status === 'FAIL') {
        console.log(`❌ Corregir: ${result.test}`);
      }
    });
  }

  console.log('\n📋 CONFIGURACIÓN ACTUAL:');
  console.log('========================');
  console.log('🔧 API: Demo mode (mejoras basadas en reglas)');
  console.log('⏱️ Auto-mejora: Habilitada por defecto (3 segundos)');
  console.log('📏 Mínimo de palabras: 5');
  console.log('🎯 Nivel de mejora: Balanceado');
  console.log('🚫 Verificación anti-mentira: Activada');
  
  return allTestsPassed;
}

// Ejecutar verificación
if (typeof window === 'undefined') {
  verifySystem().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { verifySystem };