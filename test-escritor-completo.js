/**
 * Script para probar el escritor IA completo
 * Simula el uso real del escritor con mejoramiento automático
 */

async function testEscritorCompleto() {
  console.log('🧪 PRUEBA COMPLETA DEL ESCRITOR IA');
  console.log('==================================\n');
  
  // Simular diferentes escenarios de uso
  const scenarios = [
    {
      name: "Mejoramiento manual",
      text: "este texto necesita mejoras de gramatica",
      action: "manual"
    },
    {
      name: "Mejoramiento automático",
      text: "hola como estas todo bien",
      action: "auto"
    },
    {
      name: "Texto perfecto (debe rechazar)",
      text: "Este texto está perfectamente escrito.",
      action: "manual"
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📝 Escenario: ${scenario.name}`);
    console.log(`Texto: "${scenario.text}"`);
    console.log(`Acción: ${scenario.action}`);
    
    try {
      // Simular llamada del cliente AI
      const response = await fetch('http://localhost:3000/api/improve-text-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: scenario.text,
          language: 'es'
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.improvedContent) {
        console.log(`✅ Resultado: "${data.improvedContent}"`);
        
        // Verificar que realmente cambió
        if (scenario.text.trim() === data.improvedContent.trim()) {
          console.log('❌ PROBLEMA: Texto idéntico pero reportado como mejorado');
        } else {
          console.log('✅ ÉXITO: Mejoramiento real aplicado');
          
          // Calcular estadísticas
          const stats = {
            originalLength: scenario.text.length,
            improvedLength: data.improvedContent.length,
            wordCountChange: data.improvedContent.split(' ').length - scenario.text.split(' ').length,
            hasCapitalization: /^[A-Z]/.test(data.improvedContent),
            hasPunctuation: /[.!?]$/.test(data.improvedContent)
          };
          
          console.log('📊 Estadísticas:');
          console.log(`   - Longitud: ${stats.originalLength} → ${stats.improvedLength}`);
          console.log(`   - Palabras: ${stats.wordCountChange >= 0 ? '+' : ''}${stats.wordCountChange}`);
          console.log(`   - Mayúscula inicial: ${stats.hasCapitalization ? '✓' : '✗'}`);
          console.log(`   - Puntuación final: ${stats.hasPunctuation ? '✓' : '✗'}`);
        }
        
      } else {
        console.log(`❌ Rechazado: ${data.error}`);
        if (scenario.text.includes('perfectamente')) {
          console.log('✅ CORRECTO: Texto perfecto rechazado apropiadamente');
        } else {
          console.log('⚠️ ADVERTENCIA: Texto con errores fue rechazado');
        }
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }

  console.log('\n🎯 PRUEBA DE INTEGRACIÓN COMPLETA');
  console.log('==================================');
  
  // Simular flujo completo del escritor IA
  console.log('\n1. Usuario escribe texto con errores...');
  const userText = "hola necesito ayuda con este texto que tiene errores";
  
  console.log(`   Texto original: "${userText}"`);
  
  console.log('\n2. Sistema detecta que dejó de escribir...');
  console.log('   ⏱️ Esperando 3 segundos...');
  
  console.log('\n3. Activando mejoramiento automático...');
  
  try {
    const response = await fetch('http://localhost:3000/api/improve-text-demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: userText,
        language: 'es'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.improvedContent) {
      console.log('\n4. ✅ Mejoramiento aplicado exitosamente:');
      console.log(`   Texto mejorado: "${data.improvedContent}"`);
      
      console.log('\n5. 🎉 FLUJO COMPLETO EXITOSO');
      console.log('   - El usuario ve el texto mejorado automáticamente');
      console.log('   - Los cambios son reales y verificables');
      console.log('   - El sistema es honesto sobre las mejoras');
      
    } else {
      console.log('\n4. ❌ Mejoramiento rechazado:');
      console.log(`   Razón: ${data.error}`);
    }
    
  } catch (error) {
    console.error(`\n4. ❌ Error en el flujo: ${error.message}`);
  }
  
  console.log('\n🏁 PRUEBA COMPLETA FINALIZADA');
}

// Ejecutar la prueba
if (typeof window === 'undefined') {
  testEscritorCompleto();
}

module.exports = { testEscritorCompleto };