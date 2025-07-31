// Script de prueba para verificar la API de contactos
const testContactsAPI = async () => {
  try {
    console.log('Probando API de contactos...');
    
    const response = await fetch('http://localhost:3003/api/contacts', {
      headers: { 
        'x-user-email': 'selamu.garcia@gmail.com'
      }
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Contactos encontrados:', data.contacts.length);
      console.log('Datos:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
};

testContactsAPI();