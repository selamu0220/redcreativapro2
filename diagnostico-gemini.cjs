const https = require('https');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno manualmente
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.log('⚠️ No se pudo leer el archivo .env:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();

class GeminiDiagnostic {
  constructor() {
    this.apiKey = envVars.GEMINI_API_KEY;
    this.issues = [];
    this.suggestions = [];
  }

  // Verificar configuración de API key
  checkApiKeyConfiguration() {
    console.log('\n🔍 Verificando configuración de API key...');
    
    if (!this.apiKey) {
      this.issues.push('❌ GEMINI_API_KEY no está configurada en .env');
      this.suggestions.push('Configura GEMINI_API_KEY en tu archivo .env');
      return false;
    }
    
    if (this.apiKey.includes('your_') || this.apiKey.includes('tu_') || this.apiKey.length < 20) {
      this.issues.push('❌ GEMINI_API_KEY parece ser un placeholder o inválida');
      this.suggestions.push('Obtén una API key válida de Google AI Studio (https://makersuite.google.com/app/apikey)');
      return false;
    }
    
    console.log('✅ API key configurada correctamente');
    return true;
  }

  // Probar conectividad con API de Gemini
  async testGeminiConnectivity() {
    console.log('\n🌐 Probando conectividad con API de Gemini...');
    
    if (!this.apiKey) {
      console.log('❌ No se puede probar - API key no configurada');
      return false;
    }

    return new Promise((resolve) => {
      const postData = JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hola, esto es una prueba de conectividad. Responde solo con "OK"'
          }]
        }]
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
              console.log('✅ Conectividad con Gemini API exitosa');
              console.log('📝 Respuesta de prueba:', response.candidates[0]?.content?.parts[0]?.text || 'Sin contenido');
              resolve(true);
            } else {
              console.log('❌ Error en respuesta de Gemini API');
              console.log('📊 Status Code:', res.statusCode);
              console.log('📄 Respuesta:', data);
              
              if (response.error) {
                this.issues.push(`❌ Error de API: ${response.error.message}`);
                if (response.error.message.includes('API_KEY_INVALID')) {
                  this.suggestions.push('Verifica que tu API key de Gemini sea válida y esté habilitada');
                }
              }
              resolve(false);
            }
          } catch (error) {
            console.log('❌ Error parseando respuesta:', error.message);
            console.log('📄 Respuesta raw:', data);
            this.issues.push(`❌ Error parseando respuesta de API: ${error.message}`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.log('❌ Error de conectividad:', error.message);
        this.issues.push(`❌ Error de conectividad: ${error.message}`);
        this.suggestions.push('Verifica tu conexión a internet');
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  }

  // Probar endpoint local de generate-email
  async testLocalGenerateEmailEndpoint() {
    console.log('\n🔧 Probando endpoint local /api/generate-email...');
    
    const http = require('http');
    
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        recipient: 'test@example.com',
        subject: 'Prueba de diagnóstico',
        purpose: 'Probar que la generación de emails funciona correctamente',
        context: 'Esta es una prueba del sistema de diagnóstico'
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
            
            if (res.statusCode === 200 && response.email) {
              console.log('✅ Endpoint local funciona correctamente');
              console.log('📧 Email generado (preview):', response.email.substring(0, 100) + '...');
              resolve(true);
            } else {
              console.log('❌ Error en endpoint local');
              console.log('📊 Status Code:', res.statusCode);
              console.log('📄 Respuesta:', data);
              
              if (response.error) {
                this.issues.push(`❌ Error en endpoint local: ${response.error}`);
                if (response.error.includes('API key')) {
                  this.suggestions.push('Verifica la configuración de la API key en el servidor');
                }
              }
              resolve(false);
            }
          } catch (error) {
            console.log('❌ Error parseando respuesta del endpoint local:', error.message);
            console.log('📄 Respuesta raw:', data);
            this.issues.push(`❌ Error en endpoint local: ${error.message}`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.log('❌ Error conectando al servidor local:', error.message);
        this.issues.push(`❌ Error conectando al servidor local: ${error.message}`);
        this.suggestions.push('Asegúrate de que el servidor esté ejecutándose en http://localhost:3000');
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  }

  // Verificar archivos de configuración
  checkConfigurationFiles() {
    console.log('\n📁 Verificando archivos de configuración...');
    
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      this.issues.push('❌ Archivo .env no encontrado');
      this.suggestions.push('Crea un archivo .env basado en .env.example');
      return false;
    }
    
    console.log('✅ Archivo .env encontrado');
    return true;
  }

  // Generar reporte
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 REPORTE DE DIAGNÓSTICO DE GEMINI AI');
    console.log('='.repeat(60));
    
    if (this.issues.length > 0) {
      console.log('\n❌ PROBLEMAS ENCONTRADOS:');
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    if (this.suggestions.length > 0) {
      console.log('\n💡 SUGERENCIAS DE SOLUCIÓN:');
      this.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    }
    
    if (this.issues.length === 0) {
      console.log('\n✅ ¡TODO ESTÁ CONFIGURADO CORRECTAMENTE!');
      console.log('\n🎉 La generación de emails con IA debería funcionar sin problemas.');
    } else {
      console.log('\n🔧 PASOS PARA SOLUCIONAR:');
      console.log('   1. Sigue las sugerencias listadas arriba');
      console.log('   2. Reinicia el servidor después de hacer cambios');
      console.log('   3. Ejecuta este diagnóstico nuevamente');
    }
    
    console.log('\n' + '='.repeat(60));
  }

  // Ejecutar diagnóstico completo
  async runFullDiagnostic() {
    console.log('🚀 Iniciando diagnóstico completo de Gemini AI...');
    
    // Verificar configuración
    this.checkConfigurationFiles();
    const apiKeyOk = this.checkApiKeyConfiguration();
    
    // Probar conectividad si la API key está configurada
    if (apiKeyOk) {
      await this.testGeminiConnectivity();
      await this.testLocalGenerateEmailEndpoint();
    }
    
    // Generar reporte
    this.generateReport();
  }
}

// Ejecutar diagnóstico
if (require.main === module) {
  const diagnostic = new GeminiDiagnostic();
  diagnostic.runFullDiagnostic().catch(console.error);
}

module.exports = GeminiDiagnostic;