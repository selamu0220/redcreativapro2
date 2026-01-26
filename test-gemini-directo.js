/**
 * Script de prueba directa para Gemini
 * Prueba la API de Gemini directamente para verificar que funciona
 */

async function testGeminiDirecto() {
  console.log('🧪 PRUEBA DIRECTA DE GEMINI');
  console.log('===========================\n');
  
  const testCases = [
    {
      name: "Texto con errores evidentes",
      text: "este texto tiene muchos errores de gramatica y ortografia que necesita ser corregido urgentemente"
    },
    {
      name: "Texto sin puntuación",
      text: "hola como estas espero que bien me gustaria saber si puedes ayudarme con esto"
    },
    {
      name: "Texto ya perfecto",
      text: "Este texto está perfectamente escrito con gramática correcta y tono profesional."
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Probando: ${testCase.name}`);
    console.log(`Original: "${testCase.text}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/improve-text-gemini', {
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
          console.log('⚠️ PROBLEMA: El texto no cambió pero la API dice que sí');
        } else {
          console.log('✅ CORRECTO: El texto realmente cambió');
          
          // Mostrar diferencias específicas
          const changes = findChanges(testCase.text, data.improvedContent);
          if (changes.length > 0) {
            console.log('📊 Cambios detectados:');
            changes.forEach(change => console.log(`   - ${change}`));
          }
        }
        
      } else {
        console.log(`❌ Error: ${data.error}`);
        if (testCase.name.includes("perfecto")) {
          console.log('✅ CORRECTO: Texto perfecto rechazado apropiadamente');
        } else {
          console.log('⚠️ PROBLEMA: Texto con errores fue rechazado');
        }
      }
      
    } catch (error) {
      console.error(`❌ Error de red: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }
}

function findChanges(original, improved) {
  const changes = [];
  
  // Verificar cambios básicos
  if (original.toLowerCase() !== improved.toLowerCase()) {
    changes.push('Contenido modificado');
  }
  
  // Verificar mejoras específicas
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

  if (original.includes('gustaria') && improved.includes('gustaría')) {
    changes.push('Tilde en "gustaría" corregida');
  }
  
  return changes;
}

// Ejecutar la prueba
if (typeof window === 'undefined') {
  testGeminiDirecto();
}

module.exports = { testGeminiDirecto };