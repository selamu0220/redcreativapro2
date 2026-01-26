/**
 * Script de prueba para el Escritor IA
 * Verifica que la API de mejoramiento funcione correctamente
 */

async function testEscritorIA() {
  console.log('🧪 Iniciando prueba del Escritor IA...');
  
  const testContent = "Este es un texto de prueba que necesita ser mejorado. Tiene algunos errores y podria ser mas fluido.";
  
  try {
    console.log('📝 Texto original:', testContent);
    console.log('🔄 Enviando solicitud a la API...');
    
    const response = await fetch('http://localhost:3000/api/improve-text-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: testContent,
        language: 'es'
      })
    });
    
    console.log('📊 Status de respuesta:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error en la API:', errorData);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Respuesta exitosa:');
    console.log('📝 Texto mejorado:', data.improvedContent);
    
    // Verificar que el contenido fue mejorado
    if (data.improvedContent && data.improvedContent !== testContent) {
      console.log('🎉 ¡El mejoramiento automático funciona correctamente!');
    } else {
      console.log('⚠️ El texto no fue mejorado o es idéntico al original');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba si se ejecuta directamente
if (typeof window === 'undefined') {
  testEscritorIA();
}

module.exports = { testEscritorIA };