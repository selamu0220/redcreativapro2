// Script de prueba para reproducir el error de configuración de email
const testEmailSend = async () => {
  console.log('🧪 === INICIANDO PRUEBA DE ENVÍO DE EMAIL ===');
  
  // Simular datos de email
  const emailData = {
    to: 'test@example.com',
    subject: 'Email de prueba',
    text: 'Este es un email de prueba para verificar la configuración.',
    html: 'Este es un email de prueba para verificar la configuración.',
    isPromotional: false
  };
  
  console.log('📧 Datos del email:', emailData);
  
  // Verificar localStorage
  console.log('\n🔍 === VERIFICANDO LOCALSTORAGE ===');
  const selectedProvider = localStorage.getItem('selectedProvider');
  const gmailUser = localStorage.getItem('gmailUser');
  const gmailPassword = localStorage.getItem('gmailPassword');
  const web3formsKey = localStorage.getItem('web3formsKey');
  const senderEmail = localStorage.getItem('senderEmail');
  const resendApiKey = localStorage.getItem('resendApiKey');
  const resendFromEmail = localStorage.getItem('resendFromEmail');
  
  console.log('📋 Estado de localStorage:', {
    selectedProvider,
    gmailUser: gmailUser ? '✅ Presente' : '❌ Ausente',
    gmailPassword: gmailPassword ? '✅ Presente' : '❌ Ausente',
    web3formsKey: web3formsKey ? '✅ Presente' : '❌ Ausente',
    senderEmail: senderEmail ? '✅ Presente' : '❌ Ausente',
    resendApiKey: resendApiKey ? '✅ Presente' : '❌ Ausente',
    resendFromEmail: resendFromEmail ? '✅ Presente' : '❌ Ausente'
  });
  
  // Preparar headers
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Agregar headers de configuración si están disponibles
  if (selectedProvider) headers['x-selected-provider'] = selectedProvider;
  if (gmailUser) headers['x-gmail-user'] = gmailUser;
  if (gmailPassword) headers['x-gmail-password'] = gmailPassword;
  if (web3formsKey) headers['x-web3forms-key'] = web3formsKey;
  if (senderEmail) headers['x-web3forms-sender'] = senderEmail;
  if (resendApiKey) headers['x-resend-key'] = resendApiKey;
  if (resendFromEmail) headers['x-resend-sender'] = resendFromEmail;
  
  console.log('\n🔑 === HEADERS PREPARADOS ===');
  console.log('Headers a enviar:', Object.keys(headers).filter(k => k !== 'Content-Type'));
  
  try {
    console.log('\n📤 === ENVIANDO PETICIÓN ===');
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(emailData)
    });
    
    console.log('📊 Status de respuesta:', response.status);
    
    const responseText = await response.text();
    console.log('📄 Respuesta completa:', responseText);
    
    if (!response.ok) {
      console.error('❌ Error en la respuesta:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      // Intentar parsear como JSON para obtener más detalles
      try {
        const errorData = JSON.parse(responseText);
        console.error('🔍 Detalles del error:', errorData);
      } catch (parseError) {
        console.error('⚠️ No se pudo parsear la respuesta como JSON');
      }
    } else {
      console.log('✅ Email enviado exitosamente!');
      try {
        const successData = JSON.parse(responseText);
        console.log('📋 Datos de éxito:', successData);
      } catch (parseError) {
        console.log('✅ Respuesta exitosa (no JSON):', responseText);
      }
    }
    
  } catch (error) {
    console.error('💥 Error en la petición:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
  
  console.log('\n🏁 === PRUEBA COMPLETADA ===');
};

// Ejecutar la prueba
testEmailSend();