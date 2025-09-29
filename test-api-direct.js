// Test directo del API de send-email
import fetch from 'node-fetch';

async function testSendEmailAPI() {
  console.log('🧪 === TEST DIRECTO DEL API SEND-EMAIL ===');
  
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
  
  // Escenario 1: Sin headers (debería fallar)
  console.log('\n🔍 === ESCENARIO 1: SIN HEADERS ===');
  try {
    const response1 = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });
    
    const result1 = await response1.text();
    console.log('📊 Status:', response1.status);
    console.log('📄 Response:', result1);
    
    if (!response1.ok) {
      try {
        const errorData = JSON.parse(result1);
        console.log('❌ Error parseado:', errorData);
      } catch (e) {
        console.log('❌ Error como texto:', result1);
      }
    }
  } catch (error) {
    console.error('💥 Error en petición 1:', error.message);
  }
  
  // Escenario 2: Con headers de Web3Forms
  console.log('\n🔍 === ESCENARIO 2: CON HEADERS WEB3FORMS ===');
  try {
    const response2 = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-selected-provider': 'web3forms',
        'x-web3forms-key': 'test-key-123',
        'x-web3forms-sender': 'test@example.com'
      },
      body: JSON.stringify(emailData)
    });
    
    const result2 = await response2.text();
    console.log('📊 Status:', response2.status);
    console.log('📄 Response:', result2);
    
    if (!response2.ok) {
      try {
        const errorData = JSON.parse(result2);
        console.log('❌ Error parseado:', errorData);
      } catch (e) {
        console.log('❌ Error como texto:', result2);
      }
    }
  } catch (error) {
    console.error('💥 Error en petición 2:', error.message);
  }
  
  // Escenario 3: Headers incompletos
  console.log('\n🔍 === ESCENARIO 3: HEADERS INCOMPLETOS ===');
  try {
    const response3 = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-selected-provider': 'web3forms'
        // Falta x-web3forms-key y x-web3forms-sender
      },
      body: JSON.stringify(emailData)
    });
    
    const result3 = await response3.text();
    console.log('📊 Status:', response3.status);
    console.log('📄 Response:', result3);
    
    if (!response3.ok) {
      try {
        const errorData = JSON.parse(result3);
        console.log('❌ Error parseado:', errorData);
      } catch (e) {
        console.log('❌ Error como texto:', result3);
      }
    }
  } catch (error) {
    console.error('💥 Error en petición 3:', error.message);
  }
  
  console.log('\n🏁 === PRUEBAS COMPLETADAS ===');
}

// Ejecutar test
testSendEmailAPI().catch(console.error);

export { testSendEmailAPI };