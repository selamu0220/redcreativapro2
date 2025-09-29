const http = require('http');

// Función para hacer peticiones HTTP
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testRoutes() {
  console.log('🧪 PRUEBA DE RUTAS DEBUG');
  console.log('========================');
  
  // Probar ruta que sabemos que funciona
  console.log('\n1. Probando GET /api/test-connection...');
  try {
    const result1 = await makeRequest('/api/test-connection');
    console.log(`   Status: ${result1.statusCode}`);
    console.log(`   Response: ${result1.data}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Probar POST a generate-email
  console.log('\n2. Probando POST /api/generate-email...');
  try {
    const result2 = await makeRequest('/api/generate-email', 'POST', {
      recipient: 'test@example.com',
      subject: 'Test Subject',
      purpose: 'Test Purpose'
    });
    console.log(`   Status: ${result2.statusCode}`);
    console.log(`   Response: ${result2.data}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Probar GET a generate-email (debería dar 405)
  console.log('\n3. Probando GET /api/generate-email...');
  try {
    const result3 = await makeRequest('/api/generate-email');
    console.log(`   Status: ${result3.statusCode}`);
    console.log(`   Response: ${result3.data}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
}

testRoutes().catch(console.error);