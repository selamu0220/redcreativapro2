// Script de diagnóstico completo para problemas de generación de emails IA
// Detecta automáticamente problemas de configuración y conectividad

console.log('🔍 DIAGNÓSTICO COMPLETO - GENERACIÓN DE EMAILS IA');
console.log('='.repeat(60));

class DiagnosticoCompleto {
  constructor() {
    this.problemas = [];
    this.advertencias = [];
    this.configuracionCorrecta = true;
  }

  // Verificar configuración de localStorage
  verificarLocalStorage() {
    console.log('\n📱 1. VERIFICANDO CONFIGURACIÓN LOCAL...');
    console.log('-'.repeat(40));
    
    const modelo = localStorage.getItem('gemini_model');
    const apiKey = localStorage.getItem('gemini_api_key');
    const temperature = localStorage.getItem('gemini_temperature');
    const maxTokens = localStorage.getItem('gemini_max_tokens');
    
    // Verificar modelo
    if (modelo) {
      if (modelo.includes('gemini-1.5-flash-002')) {
        this.problemas.push('❌ CRÍTICO: Modelo incorrecto detectado: ' + modelo);
        this.problemas.push('   → Debe ser: gemini-1.5-flash (sin -002)');
        this.configuracionCorrecta = false;
      } else if (modelo === 'gemini-1.5-flash') {
        console.log('✅ Modelo correcto:', modelo);
      } else {
        this.advertencias.push('⚠️ Modelo no estándar: ' + modelo);
      }
    } else {
      console.log('💡 Modelo no configurado (usará por defecto: gemini-1.5-flash)');
    }
    
    // Verificar API Key
    if (apiKey) {
      if (apiKey.startsWith('AIza') && apiKey.length > 30) {
        console.log('✅ API Key configurada correctamente');
      } else {
        this.problemas.push('❌ API Key parece inválida: ' + apiKey.substring(0, 10) + '...');
        this.configuracionCorrecta = false;
      }
    } else {
      this.advertencias.push('⚠️ No hay API Key personalizada (usará la del servidor)');
    }
    
    // Verificar parámetros
    console.log('📊 Temperature:', temperature || 'Por defecto');
    console.log('📊 Max Tokens:', maxTokens || 'Por defecto');
  }

  // Verificar conectividad con el servidor local
  async verificarServidorLocal() {
    console.log('\n🌐 2. VERIFICANDO SERVIDOR LOCAL...');
    console.log('-'.repeat(40));
    
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: 'test@example.com',
          subject: 'Test',
          purpose: 'Test de diagnóstico',
          context: 'Prueba automática',
          emailType: 'professional'
        })
      });
      
      if (response.ok) {
        console.log('✅ Servidor local responde correctamente');
        const data = await response.json();
        if (data.email) {
          console.log('✅ Generación de email funciona');
        }
      } else {
        const errorText = await response.text();
        this.problemas.push('❌ Error del servidor: ' + response.status);
        this.problemas.push('   → Detalle: ' + errorText.substring(0, 100));
        this.configuracionCorrecta = false;
      }
    } catch (error) {
      this.problemas.push('❌ No se puede conectar al servidor local');
      this.problemas.push('   → Error: ' + error.message);
      this.configuracionCorrecta = false;
    }
  }

  // Verificar variables de entorno (simulado)
  verificarVariablesEntorno() {
    console.log('\n🔧 3. VERIFICANDO CONFIGURACIÓN DEL SERVIDOR...');
    console.log('-'.repeat(40));
    
    // Esta verificación se hace indirectamente a través de la API
    console.log('💡 Las variables de entorno se verifican a través de la API');
    console.log('💡 Si hay problemas, aparecerán en la prueba del servidor');
  }

  // Verificar formulario de la página
  verificarFormulario() {
    console.log('\n📝 4. VERIFICANDO FORMULARIO DE LA PÁGINA...');
    console.log('-'.repeat(40));
    
    // Verificar si estamos en la página correcta
    if (window.location.pathname.includes('correos-ia')) {
      console.log('✅ Estás en la página correcta: /correos-ia');
      
      // Verificar elementos del formulario
      const recipient = document.querySelector('input[placeholder*="email"]');
      const subject = document.querySelector('input[placeholder*="asunto"]');
      const purpose = document.querySelector('textarea[placeholder*="objetivo"]');
      const generateBtn = document.querySelector('button:contains("Generar")');
      
      if (recipient && subject && purpose) {
        console.log('✅ Formulario encontrado correctamente');
      } else {
        this.advertencias.push('⚠️ Algunos elementos del formulario no se encontraron');
      }
    } else {
      this.advertencias.push('⚠️ No estás en la página /correos-ia');
      this.advertencias.push('   → Ve a http://localhost:3000/correos-ia para probar');
    }
  }

  // Mostrar resumen del diagnóstico
  mostrarResumen() {
    console.log('\n📋 RESUMEN DEL DIAGNÓSTICO');
    console.log('='.repeat(60));
    
    if (this.problemas.length === 0 && this.advertencias.length === 0) {
      console.log('🎉 ¡TODO ESTÁ CORRECTO!');
      console.log('💡 Si aún tienes problemas, intenta:');
      console.log('   1. Recargar la página (F5)');
      console.log('   2. Verificar que todos los campos estén llenos');
      console.log('   3. Revisar la consola del navegador por errores');
      return;
    }
    
    if (this.problemas.length > 0) {
      console.log('\n🚨 PROBLEMAS CRÍTICOS ENCONTRADOS:');
      this.problemas.forEach(problema => console.log(problema));
    }
    
    if (this.advertencias.length > 0) {
      console.log('\n⚠️ ADVERTENCIAS:');
      this.advertencias.forEach(advertencia => console.log(advertencia));
    }
    
    if (!this.configuracionCorrecta) {
      console.log('\n🔧 SOLUCIÓN RECOMENDADA:');
      console.log('1. Ejecuta: solucionarGemini() en esta consola');
      console.log('2. Recarga la página (F5)');
      console.log('3. Ve a Ajustes y configura tu API Key de Gemini');
      console.log('4. Prueba generar un email nuevamente');
    }
  }

  // Ejecutar diagnóstico completo
  async ejecutarDiagnostico() {
    console.log('🚀 Iniciando diagnóstico completo...');
    
    this.verificarLocalStorage();
    await this.verificarServidorLocal();
    this.verificarVariablesEntorno();
    this.verificarFormulario();
    this.mostrarResumen();
    
    console.log('\n✅ Diagnóstico completado');
  }
}

// Función de acceso rápido
function diagnosticoRapido() {
  const diagnostico = new DiagnosticoCompleto();
  diagnostico.ejecutarDiagnostico();
}

// Ejecutar automáticamente si estamos en el navegador
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  const diagnostico = new DiagnosticoCompleto();
  diagnostico.ejecutarDiagnostico();
  
  // Hacer disponible globalmente
  window.diagnosticoCompleto = diagnosticoRapido;
  window.DiagnosticoCompleto = DiagnosticoCompleto;
  
  console.log('\n🔧 Función disponible: diagnosticoCompleto()');
} else {
  console.log('❌ Este script debe ejecutarse en la consola del navegador');
}