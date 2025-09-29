// Test completo del sistema de configuración de email
// INSTRUCCIONES: Copiar y pegar este código en la consola del navegador
// en la página de la aplicación (http://localhost:3000)

console.log('🧪 INICIANDO TEST COMPLETO DEL SISTEMA DE EMAIL');
console.log('=' .repeat(60));

const testUserEmail = 'test@example.com';
const testConfig = {
  provider: 'web3forms',
  web3formsKey: '12345678-1234-1234-1234-123456789abc', // UUID válido de prueba
  web3formsSender: 'test@example.com'
};

// Función para ejecutar todos los tests
async function runCompleteSystemTest() {
  try {
    // Test 1: Configurar en localStorage
    console.log('\n📝 Test 1: Configurando en localStorage...');
    localStorage.setItem('selectedEmailProvider', testConfig.provider);
    localStorage.setItem('web3formsKey', testConfig.web3formsKey);
    localStorage.setItem('web3formsSender', testConfig.web3formsSender);
    console.log('✅ Configuración guardada en localStorage');

    // Test 2: Verificar sincronización a BD
    console.log('\n🔄 Test 2: Verificando sincronización a BD...');
    try {
      const syncResponse = await fetch('/api/user/email-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': testUserEmail
        },
        body: JSON.stringify({
          provider: testConfig.provider,
          config: {
            web3formsKey: testConfig.web3formsKey,
            senderEmail: testConfig.web3formsSender
          }
        })
      });
      const syncData = await syncResponse.json();
      console.log('📊 Respuesta sincronización:', syncData);
      if (syncData.success) {
        console.log('✅ Configuración sincronizada a BD');
      } else {
        console.log('❌ Error en sincronización:', syncData.error);
      }
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
    }

    // Esperar un momento para que se procese
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Verificar lectura desde BD
    console.log('\n📖 Test 3: Verificando lectura desde BD...');
    try {
      const readResponse = await fetch('/api/user/email-provider', {
        method: 'GET',
        headers: {
          'x-user-email': testUserEmail
        }
      });
      const readData = await readResponse.json();
      console.log('📊 Configuración en BD:', readData);
      if (readData.provider === testConfig.provider) {
        console.log('✅ Configuración leída correctamente desde BD');
      } else {
        console.log('❌ Configuración no coincide en BD');
      }
    } catch (error) {
      console.error('❌ Error leyendo desde BD:', error);
    }

    // Test 4: Probar envío de email
    console.log('\n📧 Test 4: Probando envío de email...');
    try {
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': testUserEmail,
          // Headers de fallback por si acaso
          'x-web3forms-key': testConfig.web3formsKey,
          'x-web3forms-sender': testConfig.web3formsSender
        },
        body: JSON.stringify({
          to: 'destinatario@example.com',
          subject: 'Test del sistema completo',
          text: 'Este es un email de prueba del sistema completo de configuración.',
          emailType: 'test'
        })
      });
      console.log('📊 Status envío:', emailResponse.status);
      const emailData = await emailResponse.json();
      console.log('📊 Respuesta envío:', emailData);
      if (emailData.success) {
        console.log('✅ Email enviado correctamente');
      } else {
        console.log('❌ Error en envío:', emailData.error);
        // Si es error de Web3Forms por clave inválida, es esperado
        if (emailData.error && emailData.error.includes('Invalid access key format')) {
          console.log('ℹ️  Error esperado: clave de prueba no válida en Web3Forms');
        }
      }
    } catch (error) {
      console.error('❌ Error en envío:', error);
    }

    // Test 5: Simular recarga de página
    console.log('\n🔄 Test 5: Simulando recarga de página...');
    
    // Guardar configuración actual
    const savedConfig = {
      provider: localStorage.getItem('selectedEmailProvider'),
      web3formsKey: localStorage.getItem('web3formsKey'),
      web3formsSender: localStorage.getItem('web3formsSender')
    };
    
    // Limpiar localStorage (simular recarga)
    localStorage.removeItem('selectedEmailProvider');
    localStorage.removeItem('web3formsKey');
    localStorage.removeItem('web3formsSender');
    localStorage.removeItem('emailConfigSynced');
    localStorage.removeItem('emailConfigSyncedAt');
    
    console.log('🧹 localStorage limpiado (simulando recarga)');
    
    // Verificar que se puede recuperar desde BD
    try {
      const recoverResponse = await fetch('/api/user/email-provider', {
        method: 'GET',
        headers: {
          'x-user-email': testUserEmail
        }
      });
      const recoverData = await recoverResponse.json();
      console.log('📊 Configuración recuperada desde BD:', recoverData);
      if (recoverData.provider === testConfig.provider) {
        console.log('✅ Configuración persistió correctamente después de "recarga"');
        
        // Restaurar en localStorage (simular sincronización automática)
        localStorage.setItem('selectedEmailProvider', recoverData.provider);
        if (recoverData.config.web3formsKey) {
          localStorage.setItem('web3formsKey', recoverData.config.web3formsKey);
        }
        if (recoverData.config.senderEmail) {
          localStorage.setItem('web3formsSender', recoverData.config.senderEmail);
        }
        
        console.log('✅ Configuración restaurada en localStorage');
      } else {
        console.log('❌ Configuración no persistió después de recarga');
      }
    } catch (error) {
      console.error('❌ Error recuperando configuración:', error);
    }

    // Test 6: Verificar envío después de "recarga"
    console.log('\n📧 Test 6: Verificando envío después de "recarga"...');
    try {
      const postReloadResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': testUserEmail
        },
        body: JSON.stringify({
          to: 'destinatario@example.com',
          subject: 'Test después de recarga',
          text: 'Este email verifica que la configuración persiste después de recargar.',
          emailType: 'test'
        })
      });
      console.log('📊 Status envío post-recarga:', postReloadResponse.status);
      const postReloadData = await postReloadResponse.json();
      console.log('📊 Respuesta envío post-recarga:', postReloadData);
      if (postReloadData.success || (postReloadData.error && postReloadData.error.includes('Invalid access key format'))) {
        console.log('✅ Sistema funciona correctamente después de "recarga"');
      } else {
        console.log('❌ Sistema falló después de recarga:', postReloadData.error);
      }
    } catch (error) {
      console.error('❌ Error en envío post-recarga:', error);
    }

    // Resumen final
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 TEST COMPLETO FINALIZADO');
    console.log('\n📋 RESUMEN:');
    console.log('1. ✅ Configuración en localStorage');
    console.log('2. 🔄 Sincronización a BD');
    console.log('3. 📖 Lectura desde BD');
    console.log('4. 📧 Envío de email');
    console.log('5. 🔄 Persistencia después de recarga');
    console.log('6. 📧 Envío después de recarga');
    console.log('\n🎯 Si todos los pasos muestran ✅, el sistema está funcionando correctamente.');
    
  } catch (error) {
    console.error('❌ Error general en el test:', error);
  }
}

// Ejecutar el test
runCompleteSystemTest();

console.log('\n⏳ Ejecutando tests completos...');
console.log('\n📋 INSTRUCCIONES:');
console.log('1. Asegúrate de estar en la página de la aplicación');
console.log('2. Abre las herramientas de desarrollador (F12)');
console.log('3. Ve a la pestaña Console');
console.log('4. Copia y pega este código completo');
console.log('5. Presiona Enter para ejecutar');
console.log('6. Observa los resultados de cada test');