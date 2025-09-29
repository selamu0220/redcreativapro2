// Ejecutar en consola del navegador
const testEmail = async () => {
  console.log('🧪 PRUEBA DE EMAIL');
  
  // Verificar localStorage
  const selectedProvider = localStorage.getItem('selectedProvider');
  const web3formsKey = localStorage.getItem('web3formsKey');
  const senderEmail = localStorage.getItem('senderEmail');
  
  console.log('📋 localStorage:', {
    selectedProvider,
    web3formsKey: web3formsKey ? 'Presente' : 'Ausente',
    senderEmail: senderEmail ? 'Presente' : 'Ausente'
  });
  
  // Preparar petición
  const headers = { 'Content-Type': 'application/json' };
  if (selectedProvider) headers['x-selected-provider'] = selectedProvider;
  if (web3formsKey) headers['x-web3forms-key'] = web3formsKey;
  if (senderEmail) headers['x-web3forms-sender'] = senderEmail;
  
  console.log('🔑 Headers:', Object.keys(headers));
  
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test email',
        html: 'Test email'
      })
    });
    
    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(result);
        console.error('❌ Error:', errorData);
      } catch (e) {
        console.error('❌ Error text:', result);
      }
    }
  } catch (error) {
    console.error('💥 Fetch error:', error.message);
  }
};

testEmail();