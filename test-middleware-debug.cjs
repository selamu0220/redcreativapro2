// PRUEBA DE DEPURACIÓN DEL MIDDLEWARE
const http = require('http');

console.log('🔍 PRUEBA DE DEPURACIÓN DEL MIDDLEWARE');
console.log('=====================================');

async function probarRutaPublica() {
  console.log('\n🧪 Probando ruta pública /api/test-connection...');
  
  const datos = JSON.stringify({ test: 'data' });
  
  const opciones = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-connection',
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
        console.log(`📄 Respuesta: ${data}`);
        resolve({ status: res.statusCode, data: data });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(datos);
    req.end();
  });
}

async function probarGenerateEmail() {
  console.log('\n🧪 Probando /api/generate-email...');
  
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
        console.log(`📄 Respuesta: ${data}`);
        resolve({ status: res.statusCode, data: data });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(datos);
    req.end();
  });
}

async function ejecutarPruebas() {
  try {
    // Probar ruta pública primero
    const resultadoPublico = await probarRutaPublica();
    console.log('\n📊 RESULTADO RUTA PÚBLICA:');
    console.log(`🔢 Status: ${resultadoPublico.status}`);
    
    // Probar generate-email
    const resultadoEmail = await probarGenerateEmail();
    console.log('\n📊 RESULTADO GENERATE-EMAIL:');
    console.log(`🔢 Status: ${resultadoEmail.status}`);
    
    if (resultadoPublico.status === 200 && resultadoEmail.status !== 200) {
      console.log('\n🔍 DIAGNÓSTICO: El middleware funciona para rutas públicas pero hay problema específico con generate-email');
    } else if (resultadoPublico.status !== 200) {
      console.log('\n🔍 DIAGNÓSTICO: Problema general del servidor o middleware');
    }
    
  } catch (error) {
    console.log('\n💥 Error de conexión:', error.message);
  }
}

// Ejecutar las pruebas
ejecutarPruebas();