// Test simple de la API avanzada
const testAPI = async () => {
  console.log('🔍 Probando API con parámetros avanzados...');
  
  const testData = {
    content: 'hola que tal como estas hoy',
    creativity: 0.5,
    customPrompt: 'Mejora este texto corrigiendo gramática y ortografía'
  };
  
  console.log('📤 Enviando:', testData);
  
  try {
    const response = await fetch('http://localhost:3000/api/improve-text-ai-sdk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Status:', response.status);
    
    const result = await response.json();
    console.log('📥 Respuesta:', result);
    
    if (response.ok && result.improvedContent) {
      console.log('✅ API funcionando correctamente');
      console.log('📝 Texto mejorado:', result.improvedContent);
    } else {
      console.log('❌ Error en API:', result.error || 'Sin respuesta');
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
};

testAPI();