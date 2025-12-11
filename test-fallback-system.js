// Script de prueba para verificar el sistema de fallback de OpenRouter en todos los endpoints
const https = require('https');
const http = require('http');

class FallbackSystemTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
  }

  // Función helper para hacer requests HTTP
  makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      const protocol = options.port === 443 ? https : http;
      
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              statusCode: res.statusCode,
              data: jsonData,
              headers: res.headers
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              data: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', reject);
      
      if (postData) {
        req.write(postData);
      }
      
      req.end();
    });
  }

  // Test 1: Endpoint de generación de emails
  async testEmailGeneration() {
    console.log('\n📧 Test 1: Generación de emails con fallback');
    console.log('='.repeat(60));

    const testCases = [
      {
        name: 'Sin API key del usuario (usar fallback)',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: {
          recipient: 'test@example.com',
          subject: 'Bienvenido a nuestro servicio',
          purpose: 'Email de bienvenida para nuevos usuarios',
          emailType: 'value'
        }
      },
      {
        name: 'Con API key inválida (usar fallback)',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk-invalid-key-123'
        },
        payload: {
          recipient: 'cliente@empresa.com',
          subject: 'Propuesta comercial personalizada',
          purpose: 'Email de ventas con propuesta de servicios',
          emailType: 'sales'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Probando: ${testCase.name}`);
      
      try {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/generate-email',
          method: 'POST',
          headers: testCase.headers
        };

        const response = await this.makeRequest(options, JSON.stringify(testCase.payload));
        
        if (response.statusCode === 200 && response.data.email) {
          console.log('✅ EXITOSO - Email generado con fallback');
          console.log('📝 Contenido:', response.data.email.substring(0, 100) + '...');
          this.testResults.push({ test: testCase.name, status: 'PASS' });
        } else {
          console.log('❌ FALLÓ - No se pudo generar email');
          console.log('🔍 Response:', response.data);
          this.testResults.push({ test: testCase.name, status: 'FAIL', error: response.data });
        }
      } catch (error) {
        console.log('❌ ERROR:', error.message);
        this.testResults.push({ test: testCase.name, status: 'ERROR', error: error.message });
      }
    }
  }

  // Test 2: Endpoint de mejora de texto
  async testTextImprovement() {
    console.log('\n✨ Test 2: Mejora de texto con fallback');
    console.log('='.repeat(60));

    const testCases = [
      {
        name: 'Mejora de texto sin API key del usuario',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: {
          content: 'Nuestro producto es muy bueno y lo recomendamos para todos.',
          model: 'openai/gpt-4o-mini',
          temperature: 0.7
        }
      },
      {
        name: 'Mejora de texto con API key inválida',
        headers: {
          'Content-Type': 'application/json',
          'x-openrouter-api-key': 'sk-invalid-123'
        },
        payload: {
          content: 'Queremos ofrecer servicios de marketing digital a empresas.',
          model: 'openai/gpt-4o-mini',
          temperature: 0.8
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Probando: ${testCase.name}`);
      
      try {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/improve-text',
          method: 'POST',
          headers: testCase.headers
        };

        const response = await this.makeRequest(options, JSON.stringify(testCase.payload));
        
        if (response.statusCode === 200 && response.data.improvedContent) {
          console.log('✅ EXITOSO - Texto mejorado con fallback');
          console.log('📝 Original:', testCase.payload.content);
          console.log('📝 Mejorado:', response.data.improvedContent.substring(0, 100) + '...');
          this.testResults.push({ test: testCase.name, status: 'PASS' });
        } else {
          console.log('❌ FALLÓ - No se pudo mejorar texto');
          console.log('🔍 Response:', response.data);
          this.testResults.push({ test: testCase.name, status: 'FAIL', error: response.data });
        }
      } catch (error) {
        console.log('❌ ERROR:', error.message);
        this.testResults.push({ test: testCase.name, status: 'ERROR', error: error.message });
      }
    }
  }

  // Test 3: Endpoint de generación de cuestionarios
  async testQuestionnaireGeneration() {
    console.log('\n📋 Test 3: Generación de cuestionarios con fallback');
    console.log('='.repeat(60));

    const testCases = [
      {
        name: 'Cuestionario sin API key del usuario',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: {
          prompt: 'Crear un cuestionario para leads interesados en marketing digital',
          maxQuestions: 5
        }
      },
      {
        name: 'Cuestionario con API key inválida',
        headers: {
          'Content-Type': 'application/json',
          'x-openrouter-api-key': 'sk-invalid-456'
        },
        payload: {
          prompt: 'Cuestionario para empresas que buscan servicios de consultoría',
          maxQuestions: 6
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Probando: ${testCase.name}`);
      
      try {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/generate-questionnaire',
          method: 'POST',
          headers: testCase.headers
        };

        const response = await this.makeRequest(options, JSON.stringify(testCase.payload));
        
        if (response.statusCode === 200 && response.data.questions) {
          console.log('✅ EXITOSO - Cuestionario generado con fallback');
          console.log('📝 Preguntas generadas:', response.data.questions.length);
          console.log('📝 Primera pregunta:', response.data.questions[0]?.label);
          this.testResults.push({ test: testCase.name, status: 'PASS' });
        } else {
          console.log('❌ FALLÓ - No se pudo generar cuestionario');
          console.log('🔍 Response:', response.data);
          this.testResults.push({ test: testCase.name, status: 'FAIL', error: response.data });
        }
      } catch (error) {
        console.log('❌ ERROR:', error.message);
        this.testResults.push({ test: testCase.name, status: 'ERROR', error: error.message });
      }
    }
  }

  // Test 4: Endpoint de mejora de contenido
  async testContentImprovement() {
    console.log('\n🎯 Test 4: Mejora de contenido con fallback');
    console.log('='.repeat(60));

    const testCase = {
      name: 'Mejora de contenido sin API key del usuario',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        content: 'Somos una empresa que hace marketing. Ayudamos a clientes.',
        prompt: 'Mejora este texto para que sea más profesional y atractivo',
        model: 'openai/gpt-4o-mini',
        temperature: 0.7
      }
    };

    console.log(`\n🔍 Probando: ${testCase.name}`);
    
    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/improve-content',
        method: 'POST',
        headers: testCase.headers
      };

      const response = await this.makeRequest(options, JSON.stringify(testCase.payload));
      
      if (response.statusCode === 200 && response.data.improvedContent) {
        console.log('✅ EXITOSO - Contenido mejorado con fallback');
        console.log('📝 Original:', testCase.payload.content);
        console.log('📝 Mejorado:', response.data.improvedContent.substring(0, 100) + '...');
        this.testResults.push({ test: testCase.name, status: 'PASS' });
      } else {
        console.log('❌ FALLÓ - No se pudo mejorar contenido');
        console.log('🔍 Response:', response.data);
        this.testResults.push({ test: testCase.name, status: 'FAIL', error: response.data });
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
      this.testResults.push({ test: testCase.name, status: 'ERROR', error: error.message });
    }
  }

  // Generar reporte final
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE FINAL DEL SISTEMA DE FALLBACK');
    console.log('='.repeat(80));

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    const total = this.testResults.length;

    console.log(`\n📈 ESTADÍSTICAS:`);
    console.log(`✅ Pruebas exitosas: ${passed}/${total}`);
    console.log(`❌ Pruebas fallidas: ${failed}/${total}`);
    console.log(`🔥 Errores: ${errors}/${total}`);
    console.log(`📊 Tasa de éxito: ${((passed / total) * 100).toFixed(1)}%`);

    console.log(`\n📋 DETALLE DE RESULTADOS:`);
    this.testResults.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '🔥';
      console.log(`${icon} ${index + 1}. ${result.test}`);
      if (result.error) {
        console.log(`   🔍 Error: ${JSON.stringify(result.error).substring(0, 100)}...`);
      }
    });

    console.log(`\n🎯 CONCLUSIONES:`);
    if (passed === total) {
      console.log('🎉 ¡PERFECTO! El sistema de fallback funciona correctamente en todos los endpoints.');
      console.log('🔑 Los usuarios pueden usar la aplicación sin configurar su propia API key.');
      console.log('⚙️ Los usuarios pueden configurar su propia API key para acceso personalizado.');
      console.log('🚀 El sistema está listo para producción.');
    } else if (passed > total / 2) {
      console.log('⚠️  El sistema de fallback funciona parcialmente.');
      console.log('🔧 Revisa los endpoints que fallaron para identificar problemas.');
      console.log('🔍 Verifica la configuración de la API key del sistema.');
    } else {
      console.log('🚨 El sistema de fallback tiene problemas significativos.');
      console.log('🔧 Revisa la configuración de OpenRouter y las variables de entorno.');
      console.log('🔍 Verifica que el servidor esté ejecutándose correctamente.');
    }

    console.log('\n💡 INSTRUCCIONES PARA EL USUARIO:');
    console.log('1. Los usuarios pueden usar la aplicación inmediatamente sin configuración');
    console.log('2. Para acceso ilimitado, pueden configurar su API key en Ajustes');
    console.log('3. La API key del sistema proporciona acceso gratuito con límites razonables');
    console.log('4. Los mensajes de error guían a los usuarios sobre cómo obtener acceso ilimitado');
  }

  // Ejecutar todas las pruebas
  async runAllTests() {
    console.log('🚀 INICIANDO PRUEBAS DEL SISTEMA DE FALLBACK DE OPENROUTER');
    console.log('='.repeat(80));
    console.log('🎯 Objetivo: Verificar que los usuarios puedan usar la IA sin configurar su API key');
    console.log('🔑 API del sistema configurada como fallback');
    console.log('⚠️  NOTA: Asegúrate de que el servidor Next.js esté ejecutándose en localhost:3000');

    try {
      await this.testEmailGeneration();
      await this.testTextImprovement();
      await this.testQuestionnaireGeneration();
      await this.testContentImprovement();
      
      this.generateReport();
    } catch (error) {
      console.error('🔥 Error ejecutando las pruebas:', error);
    }
  }
}

// Ejecutar las pruebas
const tester = new FallbackSystemTester();
tester.runAllTests().catch(console.error);