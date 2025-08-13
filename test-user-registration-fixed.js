const fs = require('fs');
const path = require('path');

// Función para hacer peticiones HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`Error en petición a ${url}:`, error.message);
    return { ok: false, error: error.message };
  }
}

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

async function testUserRegistration() {
  console.log('🧪 Iniciando prueba de registro de nuevos usuarios...');
  
  const baseUrl = 'http://localhost:3000';
  const timestamp = Date.now();
  const testEmail = `nuevo.usuario.${timestamp}@test.com`;
  
  console.log(`\n📧 Creando nuevo usuario: ${testEmail}`);
  
  // 1. Crear nuevo usuario
  const createUserResult = await makeRequest(`${baseUrl}/api/users/${encodeURIComponent(testEmail)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: testEmail,
      displayName: `Usuario Test ${timestamp}`,
      photoURL: null
    })
  });
  
  if (!createUserResult.ok) {
    console.error('❌ Error creando usuario:', createUserResult.data || createUserResult.error);
    return;
  }
  
  console.log('✅ Usuario creado exitosamente:', createUserResult.data.message);
  
  // 2. Verificar que el usuario fue agregado a users.json
  console.log('\n🔍 Verificando usuario en users.json...');
  const usersData = readJsonFile('./data/users.json');
  if (usersData && usersData.some(user => user.email === testEmail)) {
    console.log('✅ Usuario encontrado en users.json');
  } else {
    console.log('❌ Usuario NO encontrado en users.json');
    return;
  }
  
  // 3. Verificar que se crearon configuraciones por defecto
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
  
  // 4. Probar actualización de configuraciones
  console.log('\n🔧 Probando actualización de configuraciones...');
  const testApiKey = `test-api-key-${timestamp}`;
  
  const updateSettingsResult = await makeRequest(`${baseUrl}/api/email-collection/${encodeURIComponent(testEmail)}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pageTitle: `Página de ${testEmail}`,
      pageDescription: 'Descripción personalizada',
      web3formsAccessKey: testApiKey
    })
  });
  
  if (!updateSettingsResult.ok) {
    console.error('❌ Error actualizando configuraciones:', updateSettingsResult.data || updateSettingsResult.error);
    return;
  }
  
  console.log('✅ Configuraciones actualizadas exitosamente');
  
  // 5. Verificar que las configuraciones se guardaron
  console.log('\n🔍 Verificando configuraciones actualizadas...');
  const updatedSettingsData = readJsonFile('./data/user-page-settings.json');
  if (updatedSettingsData && updatedSettingsData[testEmail] && updatedSettingsData[testEmail].web3formsAccessKey === testApiKey) {
    console.log('✅ Configuraciones guardadas correctamente:', {
      pageTitle: updatedSettingsData[testEmail].pageTitle,
      web3formsAccessKey: updatedSettingsData[testEmail].web3formsAccessKey
    });
  } else {
    console.log('❌ Configuraciones NO se guardaron correctamente');
    return;
  }
  
  // 6. Probar recolección de emails
  console.log('\n📬 Probando recolección de emails...');
  const testCollectedEmail = `test.collected.${timestamp}@example.com`;
  
  const collectEmailResult = await makeRequest(`${baseUrl}/api/email-collection/${encodeURIComponent(testEmail)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: testCollectedEmail
    })
  });
  
  if (!collectEmailResult.ok) {
    console.error('❌ Error recolectando email:', collectEmailResult.data || collectEmailResult.error);
    return;
  }
  
  console.log('✅ Email recolectado exitosamente');
  
  // 7. Verificar que el email se guardó
  console.log('\n🔍 Verificando email guardado...');
  const emailFileName = `collected-emails-${testEmail.replace(/[@.]/g, '_')}.json`;
  const emailFilePath = `./data/${emailFileName}`;
  const collectedEmails = readJsonFile(emailFilePath);
  
  if (collectedEmails && collectedEmails.some(entry => entry.email === testCollectedEmail)) {
    console.log('✅ Email encontrado en archivo de recolección');
  } else {
    console.log('❌ Email NO encontrado en archivo de recolección');
    return;
  }
  
  console.log('\n🎉 ¡Todas las pruebas de registro de usuario pasaron exitosamente!');
  console.log(`\n📋 Resumen para ${testEmail}:`);
  console.log('- ✅ Usuario creado en users.json');
  console.log('- ✅ Configuraciones por defecto creadas');
  console.log('- ✅ Configuraciones personalizadas guardadas');
  console.log('- ✅ API Key de Web3Forms configurada');
  console.log('- ✅ Recolección de emails funcionando');
  console.log('- ✅ Emails guardados en archivo individual');
}

// Ejecutar la prueba
testUserRegistration().catch(console.error);