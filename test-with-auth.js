// Test del API con headers de autenticación
import fetch from 'node-fetch';

async function testWithAuth() {
  console.log('🧪 === TEST CON AUTENTICACIÓN ===');
  
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
  
  // Test con email de usuario válido (el que vimos en los logs)
  const userEmail = 'selamu.garcia@gmail.com';
  
  console.log('\n🔍 === TEST CON USUARIO AUTENTICADO ===');
  console.log('👤 Usuario:', userEmail);
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
        'x-selected-provider': 'web3forms',
        'x-web3forms-key': 'test-key-123',
        'x-web3forms-sender': 'test@example.com'
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
        
        // Si el error es sobre configuración, esto confirma nuestro diagnóstico
        if (errorData.error && errorData.error.includes('configuración')) {
          console.log('🎯 ¡CONFIRMADO! El error es sobre configuración de email');
        }
      } catch (e) {
        console.log('❌ Error como texto:', result);
      }
    } else {
      console.log('✅ Respuesta exitosa!');
    }
  } catch (error) {
    console.error('💥 Error en petición:', error.message);
  }
  
  console.log('\n🏁 === TEST COMPLETADO ===');
}

// Ejecutar test
testWithAuth().catch(console.error);

export { testWithAuth };