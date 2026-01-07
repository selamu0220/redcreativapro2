/**
 * Test script para probar el escritor IA en vivo
 * Simula interacciones del usuario con el editor
 */

async function testEscritorIA() {
  console.log('🧪 PRUEBA DEL ESCRITOR IA EN VIVO');
  console.log('=================================\n');
  
  const testCases = [
    {
      name: "Texto con errores básicos",
      text: "hola como estas hoy mi amigo",
      expectImprovement: true
    },
    {
      name: "Texto con errores de gramática",
      text: "este texto tiene errores de gramatica",
      expectImprovement: true
    },
    {
      name: "Texto muy corto (menos de 5 palabras)",
      text: "hola mundo",
      expectImprovement: false,
      expectedError: "muy corto"
    },
    {
      name: "Texto perfecto",
      text: "Este texto está perfectamente escrito con gramática correcta.",
      expectImprovement: false,
      expectedError: "no necesita mejoras"
    }
  ];

  console.log('📋 Casos de prueba preparados:', testCases.length);
  console.log('🌐 Servidor debe estar corriendo en http://localhost:3000\n');

  let totalTests = 0;
  let passedTests = 0;

  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n📝 Caso ${totalTests}: ${testCase.name}`);
    console.log(`Texto: "${testCase.text}"`);
    console.log(`Palabras: ${testCase.text.split(/\s+/).length}`);
    console.log(`Espera mejora: ${testCase.expectImprovement ? 'SÍ' : 'NO'}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/improve-text-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: testCase.text,
          language: 'es'
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.improvedContent) {
        console.log(`✅ Mejorado: "${data.improvedContent}"`);
        
        // Verificar que realmente cambió
        const originalLower = testCase.text.trim().toLowerCase();
        const improvedLower = data.improvedContent.trim().toLowerCase();
        
        if (originalLower === improvedLower) {
          console.log('❌ FALLO: El texto no cambió pero la API dice que sí');
        } else {
          console.log('✅ ÉXITO: El texto realmente cambió');
          
          if (testCase.expectImprovement) {
            console.log('✅ CORRECTO: Comportamiento esperado');
            passedTests++;
          } else {
            console.log('❌ FALLO: No debería haber mejorado este texto');
          }
        }
        
      } else {
        console.log(`❌ Rechazado: ${data.error}`);
        
        if (!testCase.expectImprovement) {
          console.log('✅ CORRECTO: Rechazo esperado');
          
          // Verificar si el error es el esperado
          if (testCase.expectedError && data.error.toLowerCase().includes(testCase.expectedError)) {
            console.log(`✅ CORRECTO: Error esperado "${testCase.expectedError}" encontrado`);
          }
          
          passedTests++;
        } else {
          console.log('❌ FALLO: Debería haber mejorado este texto');
        }
      }
      
    } catch (error) {
      console.error(`❌ Error de red: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }

  console.log(`\n🎯 RESULTADOS FINALES:`);
  console.log(`======================`);
  console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
  console.log(`📊 Porcentaje de éxito: ${Math.round((passedTests/totalTests)*100)}%`);
  
  if (passedTests === totalTests) {
    console.log(`🎉 ¡TODAS LAS PRUEBAS PASARON!`);
    console.log(`✅ El sistema de mejoramiento automático funciona correctamente`);
    console.log(`✅ Los errores se detectan y muestran apropiadamente`);
    console.log(`✅ Los textos perfectos se rechazan correctamente`);
    console.log(`✅ Los textos cortos se rechazan correctamente`);
  } else {
    console.log(`⚠️ Algunas pruebas fallaron. Revisar la implementación.`);
  }

  console.log(`\n📋 PRÓXIMOS PASOS:`);
  console.log(`==================`);
  console.log(`1. Abrir http://localhost:3000/escritor-ia`);
  console.log(`2. Probar escribir texto y ver si mejora automáticamente`);
  console.log(`3. Verificar que los mensajes de error aparezcan correctamente`);
  console.log(`4. Probar el botón manual "Mejorar con IA"`);
}

// Ejecutar la prueba
if (typeof window === 'undefined') {
  testEscritorIA();
}

module.exports = { testEscritorIA };