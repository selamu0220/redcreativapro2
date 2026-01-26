// Test script para verificar la API de generate-email
// Usar fetch nativo de Node.js 18+

async function testGenerateEmailAPI() {
  console.log('🧪 Iniciando test de la API generate-email...');
  
  const testData = {
    recipient: 'test@example.com',
    subject: 'Prueba de API',
    purpose: 'Correo de prueba',
    context: 'Esto es una prueba de la API'
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'AIzaSyAHgF-_mg6MGnxSyef7pS_VwZDlIqXpAHY',
    'x-model': 'gemini-1.5-flash',
    'x-temperature': '0.7',
    'x-max-tokens': '2000',
    'x-user-email': 'test@example.com'
  };
  
  try {
    console.log('📤 Enviando petición a http://localhost:3000/api/generate-email');
    console.log('📋 Datos:', testData);
    console.log('🔧 Headers:', headers);
    
    const response = await fetch('http://localhost:3000/api/generate-email', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const responseText = await response.text();
    console.log('📄 Contenido de la respuesta:', responseText);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('✅ API funcionando correctamente');
        console.log('📧 Email generado:', jsonData.email ? 'Sí' : 'No');
        if (jsonData.email) {
          console.log('📝 Longitud del email:', jsonData.email.length);
          console.log('👀 Preview:', jsonData.email.substring(0, 200) + '...');
        }
      } catch (parseError) {
        console.log('⚠️ Respuesta no es JSON válido:', parseError.message);
      }
    } else {
      console.log('❌ Error en la API:', response.status, response.statusText);
      console.log('📄 Detalles del error:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Error en la petición:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔌 El servidor no está corriendo en localhost:3000');
    }
  }
}

// Ejecutar el test
testGenerateEmailAPI();