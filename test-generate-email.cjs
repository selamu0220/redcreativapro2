// Script de prueba para la función generateEmail
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Función para cargar variables de entorno
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envVars = {};
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  } catch (error) {
    console.error('Error leyendo archivo .env:', error.message);
  }
  
  return envVars;
}

const envVars = loadEnvFile();

class EmailGenerationTester {
  constructor() {
    this.apiKey = envVars.GEMINI_API_KEY;
  }

  // Probar directamente la API de Gemini
  async testGeminiDirectly() {
    console.log('\n🧪 Probando API de Gemini directamente...');
    
    if (!this.apiKey) {
      console.log('❌ No se puede probar - API key no configurada');
      return false;
    }

    return new Promise((resolve) => {
      const postData = JSON.stringify({
        contents: [{
          parts: [{
            text: 'Genera un email profesional de prueba con el asunto "Prueba de conectividad" dirigido a test@example.com. El propósito es verificar que la API funciona correctamente.'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 40
        }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200 && response.candidates) {
              console.log('✅ API de Gemini funciona correctamente');
              console.log('📧 Email generado:', response.candidates[0]?.content?.parts[0]?.text?.substring(0, 200) + '...');
              resolve(true);
            } else {
              console.log('❌ Error en API de Gemini');
              console.log('📊 Status Code:', res.statusCode);
              console.log('📄 Respuesta completa:', JSON.stringify(response, null, 2));
              resolve(false);
            }
          } catch (error) {
            console.log('❌ Error parseando respuesta:', error.message);
            console.log('📄 Respuesta raw:', data);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.log('❌ Error de conectividad:', error.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  }

  // Probar el endpoint local /api/generate-email
  async testLocalEndpoint() {
    console.log('\n🔧 Probando endpoint local /api/generate-email...');
    
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        recipient: 'test@example.com',
        subject: 'Prueba de generación de email',
        purpose: 'Verificar que el sistema de generación de emails funciona correctamente',
        context: 'Esta es una prueba del sistema de diagnóstico para identificar problemas en la generación de emails con IA'
      });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/generate-email',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'test@example.com',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            console.log('📊 Status Code:', res.statusCode);
            console.log('📄 Respuesta completa:', JSON.stringify(response, null, 2));
            
            if (res.statusCode === 200 && response.email) {
              console.log('✅ Endpoint local funciona correctamente');
              console.log('📧 Email generado (preview):', response.email.substring(0, 200) + '...');
              resolve(true);
            } else {
              console.log('❌ Error en endpoint local');
              if (response.error) {
                console.log('🔍 Detalles del error:', response.details || response.error);
                console.log('🔄 Es reintentable:', response.retryable);
                console.log('📝 Tipo de error:', response.errorType);
              }
              resolve(false);
            }
          } catch (error) {
            console.log('❌ Error parseando respuesta del endpoint local:', error.message);
            console.log('📄 Respuesta raw:', data);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.log('❌ Error conectando al servidor local:', error.message);
        console.log('💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:3000');
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  }

  // Ejecutar todas las pruebas
  async runAllTests() {
    console.log('🚀 Iniciando pruebas de generación de emails...');
    console.log('='.repeat(60));
    
    // Verificar configuración
    console.log('🔑 API Key configurada:', !!this.apiKey);
    if (this.apiKey) {
      console.log('🔑 API Key (primeros 10 caracteres):', this.apiKey.substring(0, 10) + '...');
    }
    
    // Probar API de Gemini directamente
    const geminiWorks = await this.testGeminiDirectly();
    
    // Probar endpoint local
    const localWorks = await this.testLocalEndpoint();
    
    // Generar reporte
    console.log('\n' + '='.repeat(60));
    console.log('📋 REPORTE DE PRUEBAS');
    console.log('='.repeat(60));
    
    console.log('🧪 API de Gemini directa:', geminiWorks ? '✅ FUNCIONA' : '❌ FALLA');
    console.log('🔧 Endpoint local:', localWorks ? '✅ FUNCIONA' : '❌ FALLA');
    
    if (geminiWorks && localWorks) {
      console.log('\n🎉 ¡TODO FUNCIONA CORRECTAMENTE!');
      console.log('💡 El problema puede estar en el frontend o en la configuración del usuario.');
    } else if (geminiWorks && !localWorks) {
      console.log('\n🔍 La API de Gemini funciona, pero hay un problema en el endpoint local.');
      console.log('💡 Revisa la configuración del servidor y los logs de errores.');
    } else if (!geminiWorks && !localWorks) {
      console.log('\n❌ Hay un problema con la API de Gemini.');
      console.log('💡 Verifica tu API key y la conectividad a internet.');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Ejecutar las pruebas
const tester = new EmailGenerationTester();
tester.runAllTests().catch(console.error);