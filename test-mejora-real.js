/**
 * Script de prueba para verificar que la mejora de texto realmente funciona
 * Prueba con textos que SÍ necesitan mejoras evidentes
 */

async function testMejoraReal() {
  console.log('🧪 PRUEBA DE MEJORA REAL DE TEXTO');
  console.log('==================================\n');
  
  const testCases = [
    {
      name: "Texto con errores gramaticales",
      original: "este texto tiene muchos errores de gramatica y ortografia que necesita ser corregido urgentemente",
      expectedChanges: ["gramática", "ortografía", "necesitan", "corregidos"]
    },
    {
      name: "Texto con mala puntuación",
      original: "hola como estas espero que bien me gustaria saber si puedes ayudarme con esto",
      expectedChanges: ["puntuación", "mayúsculas"]
    },
    {
      name: "Texto informal que necesita profesionalización",
      original: "oye tio esto esta super mal y no se que hacer ayudame porfa",
      expectedChanges: ["tono profesional", "formalidad"]
    },
    {
      name: "Texto ya perfecto (no debería cambiar)",
      original: "Este texto está perfectamente escrito con gramática correcta y tono profesional.",
      expectedChanges: []
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Probando: ${testCase.name}`);
    console.log(`Original: "${testCase.original}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/improve-text-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: testCase.original,
          language: 'es'
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.improvedContent) {
        console.log(`✅ Mejorado: "${data.improvedContent}"`);
        
        // Verificar que realmente cambió
        if (testCase.original.trim() === data.improvedContent.trim()) {
          console.log('⚠️ PROBLEMA: El texto no cambió pero la API dice que sí');
        } else {
          console.log('✅ CORRECTO: El texto realmente cambió');
        }
        
        // Calcular diferencias
        const changes = calculateChanges(testCase.original, data.improvedContent);
        console.log(`📊 Cambios detectados: ${changes.length}`);
        changes.forEach(change => console.log(`   - ${change}`));
        
      } else {
        console.log(`❌ Error: ${data.error}`);
        if (testCase.expectedChanges.length === 0) {
          console.log('✅ CORRECTO: Texto perfecto rechazado apropiadamente');
        } else {
          console.log('⚠️ PROBLEMA: Texto con errores fue rechazado');
        }
      }
      
    } catch (error) {
      console.error(`❌ Error de red: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
  
  console.log('\n🎯 CONCLUSIONES:');
  console.log('================');
  console.log('1. Los textos con errores DEBEN ser mejorados');
  console.log('2. Los textos perfectos DEBEN ser rechazados');
  console.log('3. NUNCA debe decir "mejorado" si el texto no cambió');
  console.log('4. Los cambios deben ser evidentes y verificables');
}

function calculateChanges(original, improved) {
  const changes = [];
  
  // Verificar cambios básicos
  if (original.toLowerCase() !== improved.toLowerCase()) {
    changes.push('Contenido modificado');
  }
  
  if (original.length !== improved.length) {
    changes.push(`Longitud cambió (${original.length} → ${improved.length})`);
  }
  
  // Verificar mejoras comunes
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
  
  return changes;
}

// Ejecutar la prueba
if (typeof window === 'undefined') {
  testMejoraReal();
}

module.exports = { testMejoraReal };