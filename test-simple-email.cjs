// PRUEBA SIMPLE DE GENERACIÓN DE EMAIL
const http = require('http');

console.log('🧪 PRUEBA SIMPLE DE GENERACIÓN DE EMAIL');
console.log('=====================================');

async function probarEmailSimple() {
  const datos = JSON.stringify({
    recipient: 'test@example.com',
    subject: 'Prueba Simple',
    purpose: 'Verificar funcionamiento básico'
  });

  const opciones = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': datos.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(opciones, (res) => {
      let data = '';
      
      console.log(`📡 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Respuesta RAW: ${data}`);
        try {
          const resultado = JSON.parse(data);
          resolve({ status: res.statusCode, data: resultado });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, parseError: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    console.log(`📤 Enviando datos: ${datos}`);
    req.write(datos);
    req.end();
  });
}

async function ejecutarPrueba() {
  try {
    console.log('🚀 Iniciando prueba simple...');
    const resultado = await probarEmailSimple();
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`🔢 Status: ${resultado.status}`);
    console.log(`📄 Data:`, resultado.data);
    
    if (resultado.parseError) {
      console.log(`❌ Error de parsing: ${resultado.parseError}`);
    }
    
    if (resultado.status === 200) {
      console.log('\n✅ ¡ÉXITO! La API funciona correctamente');
    } else if (resultado.status === 400) {
      console.log('\n❌ Error 400 - Parámetros incorrectos');
      console.log('💡 Verificar que recipient, subject y purpose estén presentes');
    } else {
      console.log(`\n❌ Error ${resultado.status}`);
    }
    
  } catch (error) {
    console.log('\n💥 Error de conexión:', error.message);
  }
}

// Ejecutar la prueba
ejecutarPrueba();