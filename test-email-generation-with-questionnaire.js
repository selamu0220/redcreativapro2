const https = require('https');
const http = require('http');

// Configuración de prueba
const BASE_URL = 'http://localhost:3000';
const TEST_USER_EMAIL = 'selamu.garcia@gmail.com';
const TEST_RECIPIENT = 'public-test-1755086132438@example.com'; // Email que tiene customFields

async function testEmailGenerationWithQuestionnaire() {
  console.log('🧪 Probando generación de email con datos del cuestionario...');
  
  try {
    // Datos para generar el email
    const emailData = {
      recipient: TEST_RECIPIENT,
      subject: 'Propuesta personalizada para tu empresa',
      purpose: 'Propuesta comercial',
      context: 'Quiero enviar una propuesta comercial personalizada basada en la información que proporcionó en el cuestionario.'
    };

    console.log('📧 Generando email para:', TEST_RECIPIENT);
    console.log('📝 Datos del email:', emailData);

    const postData = JSON.stringify(emailData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/generate-email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': TEST_USER_EMAIL,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`Error ${res.statusCode}: ${data}`));
              return;
            }
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
    
    console.log('\n✅ Email generado exitosamente!');
    console.log('\n📄 Contenido del email generado:');
    console.log('=' .repeat(60));
    console.log(result.email);
    console.log('=' .repeat(60));
    
    // Verificar si el email contiene referencias a los datos del cuestionario
    const emailContent = result.email.toLowerCase();
    const hasPersonalization = (
      emailContent.includes('tecnología') ||
      emailContent.includes('desarrollador') ||
      emailContent.includes('10-50') ||
      emailContent.includes('empleados')
    );
    
    if (hasPersonalization) {
      console.log('\n🎯 ¡Excelente! El email contiene personalización basada en el cuestionario');
    } else {
      console.log('\n⚠️  El email no parece contener personalización específica del cuestionario');
    }
    
    console.log('\n🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testEmailGenerationWithQuestionnaire();