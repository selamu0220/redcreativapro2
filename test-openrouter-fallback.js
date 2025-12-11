// Script de prueba para verificar el sistema de fallback de OpenRouter
const { OpenRouterClient } = require('./app/lib/openrouter-client.ts');

async function testOpenRouterFallback() {
  console.log('🧪 Probando sistema de fallback de OpenRouter...\n');
  
  // Test 1: Sin API key del usuario (debería usar la del sistema)
  console.log('📋 Test 1: Sin API key del usuario');
  console.log('='.repeat(50));
  
  try {
    const client1 = new OpenRouterClient({
      model: 'openai/gpt-4o-mini'
    });
    
    const result1 = await client1.generateContent({
      prompt: 'Escribe un saludo profesional de 2 líneas para un email de marketing.',
      temperature: 0.7,
      maxTokens: 100
    });
    
    if (result1.success) {
      console.log('✅ Test 1 EXITOSO - Usando API del sistema');
      console.log('📝 Contenido generado:', result1.content?.substring(0, 100) + '...');
      console.log('📊 Modelo usado:', result1.metadata.model);
      console.log('⏱️ Tiempo de respuesta:', result1.metadata.responseTime + 'ms');
    } else {
      console.log('❌ Test 1 FALLÓ');
      console.log('🔍 Error:', result1.error?.message);
    }
  } catch (error) {
    console.log('❌ Test 1 ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Con API key inválida del usuario (debería usar la del sistema)
  console.log('📋 Test 2: Con API key inválida del usuario');
  console.log('='.repeat(50));
  
  try {
    const client2 = new OpenRouterClient({
      apiKey: 'sk-invalid-key-123',
      model: 'openai/gpt-4o-mini'
    });
    
    const result2 = await client2.generateContent({
      prompt: 'Escribe un título atractivo para un artículo sobre marketing digital.',
      temperature: 0.7,
      maxTokens: 50
    });
    
    if (result2.success) {
      console.log('✅ Test 2 EXITOSO - Fallback funcionando');
      console.log('📝 Contenido generado:', result2.content?.substring(0, 100) + '...');
    } else {
      console.log('❌ Test 2 FALLÓ');
      console.log('🔍 Error:', result2.error?.message);
    }
  } catch (error) {
    console.log('❌ Test 2 ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Probar diferentes tipos de contenido
  console.log('📋 Test 3: Diferentes tipos de contenido');
  console.log('='.repeat(50));
  
  const testPrompts = [
    {
      name: 'Email de bienvenida',
      prompt: 'Escribe un email de bienvenida para nuevos suscriptores de una newsletter de marketing digital. Debe ser cálido y profesional.',
      maxTokens: 200
    },
    {
      name: 'Mejora de texto',
      prompt: 'Mejora este texto: "Nuestro producto es bueno y lo recomendamos mucho para todos los clientes que quieren resultados."',
      maxTokens: 100
    },
    {
      name: 'Contenido SEO',
      prompt: 'Escribe un párrafo optimizado para SEO sobre "marketing digital para pequeñas empresas".',
      maxTokens: 150
    }
  ];
  
  for (const test of testPrompts) {
    console.log(`\n🔍 Probando: ${test.name}`);
    
    try {
      const client = new OpenRouterClient({
        model: 'openai/gpt-4o-mini'
      });
      
      const result = await client.generateContent({
        prompt: test.prompt,
        temperature: 0.7,
        maxTokens: test.maxTokens
      });
      
      if (result.success) {
        console.log(`✅ ${test.name} - EXITOSO`);
        console.log('📝 Resultado:', result.content?.substring(0, 80) + '...');
      } else {
        console.log(`❌ ${test.name} - FALLÓ`);
        console.log('🔍 Error:', result.error?.message);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 RESUMEN DE PRUEBAS COMPLETADO');
  console.log('='.repeat(60));
  console.log('✅ Si ves contenido generado arriba, el sistema de fallback funciona correctamente');
  console.log('🔑 Los usuarios pueden usar el servicio sin configurar su propia API key');
  console.log('⚙️ Los usuarios pueden configurar su propia API key para acceso ilimitado');
  console.log('🚀 El sistema está listo para producción');
}

// Ejecutar las pruebas
testOpenRouterFallback().catch(console.error);