// Script de prueba para la función generateEmail con OpenRouter
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Función para cargar variables de entorno
function loadEnvFiles() {
  const envVars = {};
  
  // Cargar .env
  const envPath = path.join(process.cwd(), '.env');
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
    console.log('No se encontró archivo .env');
  }
  
  // Cargar .env.local
  const envLocalPath = path.join(process.cwd(), '.env.local');
  try {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
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
    console.log('No se encontró archivo .env.local');
  }
  
  return envVars;
}

const envVars = loadEnvFiles();

class OpenRouterEmailTester {
  constructor() {
    this.apiKey = envVars.OPEN_ROUTER_API_KEY;
  }

  // Probar directamente la API de OpenRouter
  async testOpenRouterDirectly() {
    console.log('\n🧪 Probando API de OpenRouter directamente...');
    
    if (!this.apiKey) {
      console.log('❌ No se puede probar - API key no configurada');
      return false;
    }

    return new Promise((resolve) => {
      const postData = JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: 'Genera un email profesional de prueba con el asunto "Prueba de conectividad" dirigido a test@example.com. El propósito es verificar que la API funciona correctamente.'
        }],
        temperature: 0.7,
        max_tokens: 1000
      });

      const options = {
        hostname: 'openrouter.ai',
        port: 443,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'RedCreativaPro Email Generator',
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
            
            console.log('📊 Status Code:', res.statusCode);
            console.log('📄 Respuesta completa:', JSON.stringify(response, null, 2));
            
            if (res.statusCode === 200 && response.choices && response.choices[0]) {
              console.log('✅ API de OpenRouter funciona correctamente');
              console.log('📧 Email generado:', response.choices[0].message.content.substring(0, 200) + '...');
              resolve(true);
            } else {
              console.log('❌ Error en API de OpenRouter');
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
    console.log('🚀 Iniciando pruebas de generación de emails con OpenRouter...');
    console.log('='.repeat(60));
    
    // Verificar configuración
    console.log('🔑 OpenRouter API Key configurada:', !!this.apiKey);
    if (this.apiKey) {
      console.log('🔑 API Key (primeros 10 caracteres):', this.apiKey.substring(0, 10) + '...');
    }
    
    // Probar API de OpenRouter directamente
    const openrouterWorks = await this.testOpenRouterDirectly();
    
    // Probar endpoint local
    const localWorks = await this.testLocalEndpoint();
    
    // Generar reporte
    console.log('\n' + '='.repeat(60));
    console.log('📋 REPORTE DE PRUEBAS');
    console.log('='.repeat(60));
    console.log('🧪 API de OpenRouter directa:', openrouterWorks ? '✅ FUNCIONA' : '❌ FALLA');
    console.log('🔧 Endpoint local:', localWorks ? '✅ FUNCIONA' : '❌ FALLA');
    
    if (!openrouterWorks && !localWorks) {
      console.log('\n❌ Hay un problema con la API de OpenRouter.');
      console.log('💡 Verifica tu API key y la conectividad a internet.');
    } else if (openrouterWorks && !localWorks) {
      console.log('\n⚠️  La API de OpenRouter funciona, pero hay un problema en el endpoint local.');
      console.log('💡 Revisa los logs del servidor para más detalles.');
    } else if (!openrouterWorks && localWorks) {
      console.log('\n⚠️  El endpoint local funciona, pero hay un problema con la API de OpenRouter.');
      console.log('💡 Verifica la configuración de la API key.');
    } else {
      console.log('\n✅ Todo funciona correctamente!');
    }
    
    console.log('='.repeat(60));
  }
}

// Ejecutar las pruebas
const tester = new OpenRouterEmailTester();
tester.runAllTests().catch(console.error);