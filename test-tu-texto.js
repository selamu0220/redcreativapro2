/**
 * Test específico para el texto del usuario: "hola que tal"
 */

async function testTuTexto() {
  console.log('🧪 PROBANDO TU TEXTO: "hola que tal"');
  console.log('=====================================\n');
  
  const tuTexto = 'hola que tal';
  console.log(`📝 Tu texto: "${tuTexto}"`);
  console.log(`📊 Palabras: ${tuTexto.split(' ').length}`);
  console.log(`📏 Caracteres: ${tuTexto.length}`);
  
  try {
    console.log('🔄 Enviando a la API...');
    
    const response = await fetch('http://localhost:3000/api/improve-text-demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: tuTexto,
        language: 'es'
      })
    });
    
    console.log(`📡 Respuesta HTTP: ${response.status}`);
    
    const data = await response.json();
    console.log('📦 Datos recibidos:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.improvedContent) {
      console.log('\n✅ ÉXITO - TEXTO MEJORADO:');
      console.log(`📝 Original: "${tuTexto}"`);
      console.log(`✨ Mejorado: "${data.improvedContent}"`);
      
      // Verificar si realmente cambió
      if (tuTexto.trim().toLowerCase() !== data.improvedContent.trim().toLowerCase()) {
        console.log('🎉 ¡EL TEXTO REALMENTE CAMBIÓ!');
        
        // Mostrar cambios específicos
        const cambios = [];
        if (!/^[A-Z]/.test(tuTexto) && /^[A-Z]/.test(data.improvedContent)) {
          cambios.push('✓ Mayúscula inicial agregada');
        }
        if (!tuTexto.endsWith('.') && data.improvedContent.endsWith('.')) {
          cambios.push('✓ Punto final agregado');
        }
        if (tuTexto.includes('que tal') && data.improvedContent.includes('¿qué tal?')) {
          cambios.push('✓ Pregunta formalizada');
        }
        
        if (cambios.length > 0) {
          console.log('\n📊 CAMBIOS APLICADOS:');
          cambios.forEach(cambio => console.log(`   ${cambio}`));
        }
        
        console.log('\n🎯 RESULTADO: ¡EL SISTEMA FUNCIONA CORRECTAMENTE!');
        
      } else {
        console.log('❌ ERROR: El texto no cambió pero la API dice que sí');
      }
      
    } else if (!response.ok && data.error) {
      console.log('\n⚠️ TEXTO RECHAZADO:');
      console.log(`❌ Error: "${data.error}"`);
      
      if (data.error.includes('muy corto')) {
        console.log('💡 EXPLICACIÓN: Tu texto tiene solo 3 palabras, pero el sistema requiere mínimo 5');
        console.log('💡 SOLUCIÓN: Agrega más palabras, por ejemplo: "hola que tal como estas hoy"');
      } else {
        console.log('💡 El sistema detectó que no necesita mejoras');
      }
      
    } else {
      console.log('❌ ERROR INESPERADO');
      console.log('Respuesta completa:', data);
    }
    
  } catch (error) {
    console.error('❌ ERROR DE CONEXIÓN:', error.message);
    console.log('\n🔧 POSIBLES SOLUCIONES:');
    console.log('1. Verificar que el servidor esté corriendo: npm run dev');
    console.log('2. Verificar que esté en http://localhost:3000');
    console.log('3. Revisar los logs del servidor para errores');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🔍 DIAGNÓSTICO COMPLETO:');
  console.log('========================');
  
  // Verificar servidor
  try {
    const healthCheck = await fetch('http://localhost:3000/api/improve-text-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'test' })
    });
    
    if (healthCheck.status === 400) {
      console.log('✅ Servidor: Funcionando (responde con error esperado para "test")');
    } else {
      console.log('⚠️ Servidor: Respuesta inesperada');
    }
  } catch (e) {
    console.log('❌ Servidor: No responde');
  }
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('==================');
  console.log('1. Si el texto fue rechazado por ser muy corto, prueba con más palabras');
  console.log('2. Si hay error de conexión, verifica que npm run dev esté corriendo');
  console.log('3. Si todo funciona, prueba en la interfaz web: http://localhost:3000/escritor-ia');
}

// Ejecutar test
if (typeof window === 'undefined') {
  testTuTexto();
}

module.exports = { testTuTexto };