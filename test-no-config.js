// Test para reproducir el error original: "No hay configuración de email"
import fetch from 'node-fetch';

async function testNoConfig() {
  console.log('🧪 === TEST SIN CONFIGURACIÓN ===');
  
  const baseUrl = 'http://localhost:3000';
  const endpoint = '/api/send-email';
  
  // Datos de prueba
  const emailData = {
    to: 'test@example.com',
    subject: 'Email de prueba',
    text: 'Este es un email de prueba.',
    html: 'Este es un email de prueba.',
    isPromotional: false
  };
  
  console.log('📧 Datos del email:', emailData);
  
  // Test 1: Usuario sin configuración en BD ni headers
  console.log('\n🔍 === TEST 1: SIN CONFIGURACIÓN ===');
  console.log('👤 Usuario: selamu.garcia@gmail.com (sin config)');
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'selamu.garcia@gmail.com'
        // Sin headers de configuración
      },
      body: JSON.stringify(emailData)
    });
    
    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(result);
        console.log('❌ Error parseado:', errorData);
        
        // Verificar si es el error original del usuario
        if (errorData.error && errorData.error.includes('No hay configuración de email')) {
          console.log('🎯 ¡REPRODUCIDO! Este es el error original del usuario');
          console.log('🔍 Debug info:', errorData.debug);
        }
      } catch (e) {
        console.log('❌ Error como texto:', result);
      }
    } else {
      console.log('✅ Respuesta exitosa (inesperado)');
    }
  } catch (error) {
    console.error('💥 Error en petición:', error.message);
  }
  
  // Test 2: Usuario con headers incompletos
  console.log('\n🔍 === TEST 2: HEADERS INCOMPLETOS ===');
  console.log('👤 Usuario: selamu.garcia@gmail.com (headers parciales)');
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'selamu.garcia@gmail.com',
        'x-selected-provider': 'web3forms',
        // Falta x-web3forms-key y x-web3forms-sender
      },
      body: JSON.stringify(emailData)
    });
    
    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(result);
        console.log('❌ Error parseado:', errorData);
        
        if (errorData.error && errorData.error.includes('No hay configuración de email')) {
          console.log('🎯 ¡REPRODUCIDO! Error con headers incompletos');
          console.log('🔍 Debug info:', errorData.debug);
        }
      } catch (e) {
        console.log('❌ Error como texto:', result);
      }
    }
  } catch (error) {
    console.error('💥 Error en petición:', error.message);
  }
  
  console.log('\n🏁 === TESTS COMPLETADOS ===');
}

// Ejecutar test
testNoConfig().catch(console.error);

export { testNoConfig };