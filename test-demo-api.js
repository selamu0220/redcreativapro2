/**
 * Script de prueba para la API demo
 * Verifica que el sistema funcione correctamente con mejoras reales
 */

async function testDemoAPI() {
  console.log('🧪 PRUEBA DE API DEMO - MEJORAS REALES');
  console.log('======================================\n');
  
  const testCases = [
    {
      name: "Texto con errores evidentes",
      text: "este texto tiene muchos errores de gramatica y ortografia",
      shouldImprove: true,
      expectedChanges: ["mayúscula", "gramática", "ortografía", "punto final"]
    },
    {
      name: "Texto sin puntuación",
      text: "hola como estas espero que bien",
      shouldImprove: true,
      expectedChanges: ["mayúscula", "¿cómo estás?", "punto final"]
    },
    {
      name: "Texto informal",
      text: "oye tio esto esta super mal ayudame porfa",
      shouldImprove: true,
      expectedChanges: ["formalización", "tildes", "punto final"]
    },
    {
      name: "Texto ya perfecto",
      text: "Este texto está perfectamente escrito con gramática correcta y tono profesional.",
      shouldImprove: false,
      expectedChanges: []
    }
  ];

  let totalTests = 0;
  let passedTests = 0;

  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n📝 Probando: ${testCase.name}`);
    console.log(`Original: "${testCase.text}"`);
    
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
        if (testCase.text.trim() === data.improvedContent.trim()) {
          console.log('❌ FALLO: El texto no cambió pero la API dice que sí');
        } else {
          console.log('✅ ÉXITO: El texto realmente cambió');
          
          if (testCase.shouldImprove) {
            console.log('✅ CORRECTO: Texto que necesitaba mejoras fue mejorado');
            passedTests++;
          } else {
            console.log('❌ FALLO: Texto perfecto fue modificado incorrectamente');
          }
          
          // Mostrar diferencias específicas
          const changes = analyzeChanges(testCase.text, data.improvedContent);
          if (changes.length > 0) {
            console.log('📊 Cambios aplicados:');
            changes.forEach(change => console.log(`   ✓ ${change}`));
          }
        }
        
      } else {
        console.log(`❌ Rechazado: ${data.error}`);
        if (!testCase.shouldImprove) {
          console.log('✅ CORRECTO: Texto perfecto rechazado apropiadamente');
          passedTests++;
        } else {
          console.log('❌ FALLO: Texto con errores fue rechazado incorrectamente');
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
    console.log(`🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema funciona correctamente.`);
  } else {
    console.log(`⚠️ Algunas pruebas fallaron. Revisar la implementación.`);
  }
}

function analyzeChanges(original, improved) {
  const changes = [];
  
  // Verificar cambios específicos
  if (!/^[A-Z]/.test(original) && /^[A-Z]/.test(improved)) {
    changes.push('Mayúscula inicial agregada');
  }
  
  if (!original.endsWith('.') && improved.endsWith('.')) {
    changes.push('Punto final agregado');
  }
  
  if (original.includes('gramatica') && improved.includes('gramática')) {
    changes.push('Tilde en "gramática" corregida');
  }
  
  if (original.includes('ortografia') && improved.includes('ortografía')) {
    changes.push('Tilde en "ortografía" corregida');
  }

  if (original.includes('estas') && improved.includes('estás')) {
    changes.push('Tilde en "estás" corregida');
  }

  if (original.includes('como estas') && improved.includes('¿cómo estás?')) {
    changes.push('Puntuación interrogativa agregada');
  }

  if (original.includes('tio') && improved.includes('tío')) {
    changes.push('Tilde en "tío" corregida');
  }

  if (original.includes('porfa') && improved.includes('por favor')) {
    changes.push('Expresión informal formalizada');
  }
  
  return changes;
}

// Ejecutar la prueba
if (typeof window === 'undefined') {
  testDemoAPI();
}

module.exports = { testDemoAPI };