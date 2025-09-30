// Test del sistema de saludos inteligentes
// Usar fetch nativo de Node.js 18+
const fetch = globalThis.fetch;

async function testGreetingSystem() {
  console.log('🧪 Probando sistema de saludos inteligentes...');
  
  const testData = {
    recipient: 'Juan Pérez',
    subject: 'Prueba de saludo automático',
    purpose: 'Probar que el sistema usa el saludo correcto según la hora',
    context: 'Esta es una prueba del nuevo sistema de saludos inteligentes'
  };
  
  try {
    console.log('📤 Enviando petición a /api/generate-email...');
    console.log('🕐 Hora actual:', new Date().toLocaleTimeString('es-ES'));
    
    const response = await fetch('http://localhost:3000/api/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email generado exitosamente!');
      console.log('📧 Contenido del email:');
      console.log('---');
      console.log(result.email);
      console.log('---');
      
      // Verificar que el saludo sea apropiado
      const currentHour = new Date().getHours();
      let expectedGreeting = '';
      
      if (currentHour >= 6 && currentHour < 12) {
        expectedGreeting = 'Buenos días';
      } else if (currentHour >= 12 && currentHour < 20) {
        expectedGreeting = 'Buenas tardes';
      } else {
        expectedGreeting = 'Buenas noches';
      }
      
      console.log(`🕐 Saludo esperado para las ${currentHour}:${new Date().getMinutes()}: ${expectedGreeting}`);
      
      if (result.email.includes(expectedGreeting)) {
        console.log('✅ ¡Saludo correcto detectado!');
      } else {
        console.log('❌ Saludo incorrecto o no encontrado');
        console.log('🔍 Buscando saludos en el email...');
        const greetings = ['Buenos días', 'Buenas tardes', 'Buenas noches'];
        greetings.forEach(greeting => {
          if (result.email.includes(greeting)) {
            console.log(`⚠️  Encontrado: ${greeting}`);
          }
        });
      }
      
    } else {
      console.log('❌ Error al generar email:');
      console.log(result);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testGreetingSystem();