// Test completo del Escritor IA Avanzado
const testAdvancedWriter = async () => {
  console.log('🚀 Probando Escritor IA Avanzado...');
  
  const testCases = [
    {
      name: 'Creatividad Baja + Prompt Personalizado',
      content: 'Hola que tal como estas hoy espero que bien',
      creativity: 0.2,
      customPrompt: 'Corrige únicamente errores gramaticales y ortográficos. Mantén el estilo original.'
    },
    {
      name: 'Creatividad Media + Prompt por Defecto',
      content: 'Este texto tiene algunos errores y podria mejorarse bastante',
      creativity: 0.5,
      customPrompt: 'Mejora la claridad y fluidez del texto manteniendo el mensaje original.'
    },
    {
      name: 'Creatividad Alta + Prompt Creativo',
      content: 'La empresa vende productos buenos para clientes',
      creativity: 0.8,
      customPrompt: 'Reescribe el texto de forma más creativa y atractiva, mejorando el estilo y la expresión.'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Probando: ${testCase.name}`);
    console.log(`📄 Texto original: "${testCase.content}"`);
    console.log(`🎨 Creatividad: ${testCase.creativity}`);
    console.log(`📋 Prompt: ${testCase.customPrompt.substring(0, 50)}...`);
    
    try {
      const response = await fetch('http://localhost:3000/api/improve-text-ai-sdk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: testCase.content,
          creativity: testCase.creativity,
          customPrompt: testCase.customPrompt
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Éxito: "${data.improvedContent}"`);
        
        // Verificar que cambió
        if (testCase.content.toLowerCase() !== data.improvedContent.toLowerCase()) {
          console.log('✅ El texto SÍ cambió correctamente');
        } else {
          console.log('❌ El texto NO cambió');
        }
      } else {
        console.log(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
    
    // Pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎯 Test de funcionalidades avanzadas completado');
};

// Ejecutar test
testAdvancedWriter().catch(console.error);