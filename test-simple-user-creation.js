const fs = require('fs');
const http = require('http');

// Función para leer archivo JSON
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
    return null;
  }
}

// Función para hacer petición HTTP simple
function makeHttpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testUserCreation() {
  console.log('🧪 Probando creación de usuario con HTTP simple...');
  
  const timestamp = Date.now();
  const testEmail = `usuario.simple.${timestamp}@test.com`;
  
  console.log(`\n📧 Creando usuario: ${testEmail}`);
  
  try {
    const postData = JSON.stringify({
      email: testEmail,
      displayName: `Usuario Test ${timestamp}`,
      photoURL: null
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/users/${encodeURIComponent(testEmail)}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000 // 10 segundos timeout
    };
    
    console.log('📡 Enviando petición HTTP...');
    const response = await makeHttpRequest(options, postData);
    
    if (response.status === 200) {
      console.log('✅ Usuario creado exitosamente:', response.data.message);
    } else {
      console.log('❌ Error creando usuario:', response.status, response.data);
      return;
    }
    
    // Esperar un poco para que se procesen los archivos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar que el usuario fue agregado a users.json
    console.log('\n🔍 Verificando usuario en users.json...');
    const usersData = readJsonFile('./data/users.json');
    if (usersData && usersData.some(user => user.email === testEmail)) {
      console.log('✅ Usuario encontrado en users.json');
    } else {
      console.log('❌ Usuario NO encontrado en users.json');
      return;
    }
    
    // Verificar que se crearon configuraciones por defecto
    console.log('\n🔍 Verificando configuraciones por defecto...');
    const settingsData = readJsonFile('./data/user-page-settings.json');
    if (settingsData && settingsData[testEmail]) {
      console.log('✅ Configuraciones por defecto creadas:', {
        pageTitle: settingsData[testEmail].pageTitle,
        pageDescription: settingsData[testEmail].pageDescription,
        web3formsAccessKey: settingsData[testEmail].web3formsAccessKey || 'No configurado'
      });
    } else {
      console.log('❌ Configuraciones por defecto NO encontradas');
      return;
    }
    
    console.log('\n🎉 ¡Prueba de creación de usuario exitosa!');
    console.log(`\n📋 Resumen para ${testEmail}:`);
    console.log('- ✅ Usuario creado en users.json');
    console.log('- ✅ Configuraciones por defecto creadas');
    console.log('- ✅ Sistema listo para nuevos usuarios');
    
  } catch (error) {
    console.error('❌ Error en la petición:', error.message);
  }
}

// Ejecutar la prueba
testUserCreation().catch(console.error);