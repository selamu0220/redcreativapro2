// Script para probar la API de generación de emails
// Verifica que la corrección del modelo funcione correctamente

const http = require('http');

console.log('🧪 PRUEBA FINAL - API DE GENERACIÓN DE EMAILS');
console.log('='.repeat(60));

// Datos de prueba
const testData = {
  recipient: 'test@example.com',
  subject: 'Prueba de Generación IA',
  purpose: 'Verificar que el sistema funciona correctamente después de las correcciones',
  context: 'Esta es una prueba automática para confirmar que el modelo Gemini correcto está siendo usado',
  emailType: 'professional'
};

// Función para hacer la petición HTTP
function testGenerateEmailAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/generate-email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('📡 Enviando petición a /api/generate-email...');
    console.log('📋 Datos de prueba:', testData);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📊 Respuesta recibida:');
        console.log('🔢 Status Code:', res.statusCode);
        console.log('📄 Headers:', res.headers);
        
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('\n✅ ¡ÉXITO! La API funciona correctamente');
            console.log('📧 Email generado:');
            console.log('-'.repeat(40));
            console.log(response.email ? response.email.substring(0, 300) + '...' : 'No se generó contenido');
            console.log('-'.repeat(40));
            resolve(true);
          } else {
            console.log('\n❌ Error en la API:');
            console.log('📄 Respuesta:', JSON.stringify(response, null, 2));
            
            // Analizar el tipo de error
            if (response.error && response.error.includes('gemini-1.5-flash-002')) {
              console.log('\n🚨 PROBLEMA DETECTADO: Todavía se está usando el modelo incorrecto');
              console.log('💡 Solución: El usuario debe limpiar su localStorage en el navegador');
            } else if (response.error && response.error.includes('API key')) {
              console.log('\n🔑 PROBLEMA: API Key no configurada o inválida');
              console.log('💡 Solución: Verificar configuración en .env o en la interfaz');
            }
            
            resolve(false);
          }
        } catch (error) {
          console.log('\n❌ Error parseando respuesta:', error.message);
          console.log('📄 Respuesta cruda:', data);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('\n❌ Error de conexión:', error.message);
      console.log('💡 Asegúrate de que el servidor esté corriendo (npm run dev)');
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

// Función principal
async function runTest() {
  console.log('🚀 Iniciando prueba...');
  
  try {
    const success = await testGenerateEmailAPI();
    
    console.log('\n📋 RESULTADO FINAL:');
    console.log('='.repeat(40));
    
    if (success) {
      console.log('🎉 ¡PRUEBA EXITOSA!');
      console.log('✅ La API de generación de emails funciona correctamente');
      console.log('✅ El modelo Gemini está configurado correctamente');
      console.log('💡 El usuario ya puede generar emails sin problemas');
    } else {
      console.log('❌ PRUEBA FALLIDA');
      console.log('🔧 Se requiere intervención adicional');
      console.log('💡 Revisa los logs arriba para identificar el problema específico');
    }
    
  } catch (error) {
    console.log('\n💥 Error inesperado:', error.message);
  }
}

// Ejecutar la prueba
runTest();