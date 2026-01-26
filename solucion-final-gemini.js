// SOLUCIÓN FINAL PARA PROBLEMA DE GENERACIÓN DE EMAILS IA
// Este script resuelve definitivamente el problema del modelo incorrecto

console.log('🎯 SOLUCIÓN FINAL - PROBLEMA GENERACIÓN EMAILS IA');
console.log('='.repeat(70));

// PASO 1: Limpieza completa de configuración
function limpiezaCompleta() {
  console.log('\n🧹 PASO 1: Limpieza completa de configuración...');
  
  // Eliminar TODAS las configuraciones problemáticas
  const clavesProblematicas = [
    'gemini_api_key',
    'gemini_model', 
    'gemini_temperature',
    'gemini_max_tokens',
    'ai_model',
    'ai_config',
    'model_config'
  ];
  
  let eliminadas = 0;
  clavesProblematicas.forEach(clave => {
    if (localStorage.getItem(clave)) {
      const valor = localStorage.getItem(clave);
      localStorage.removeItem(clave);
      console.log(`   ✅ Eliminado: ${clave} (era: ${valor})`);
      eliminadas++;
    }
  });
  
  // Buscar y eliminar cualquier clave que contenga el modelo problemático
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const clave = localStorage.key(i);
    if (clave) {
      const valor = localStorage.getItem(clave);
      if (valor && valor.includes('gemini-1.5-flash-002')) {
        localStorage.removeItem(clave);
        console.log(`   ❌ Eliminado modelo problemático en: ${clave}`);
        eliminadas++;
      }
    }
  }
  
  console.log(`   📊 Total eliminadas: ${eliminadas} configuraciones`);
  return eliminadas > 0;
}

// PASO 2: Establecer configuración correcta
function establecerConfiguracionCorrecta() {
  console.log('\n✨ PASO 2: Estableciendo configuración correcta...');
  
  // Configuración correcta garantizada
  const configuracionCorrecta = {
    'gemini_model': 'gemini-1.5-flash',
    'gemini_temperature': '0.7',
    'gemini_max_tokens': '1000'
  };
  
  Object.entries(configuracionCorrecta).forEach(([clave, valor]) => {
    localStorage.setItem(clave, valor);
    console.log(`   ✅ Establecido: ${clave} = ${valor}`);
  });
  
  return true;
}

// PASO 3: Verificar configuración
function verificarConfiguracion() {
  console.log('\n🔍 PASO 3: Verificando configuración...');
  
  const modelo = localStorage.getItem('gemini_model');
  const temperatura = localStorage.getItem('gemini_temperature');
  const maxTokens = localStorage.getItem('gemini_max_tokens');
  const apiKey = localStorage.getItem('gemini_api_key');
  
  console.log('   📋 Configuración actual:');
  console.log(`      Modelo: ${modelo}`);
  console.log(`      Temperatura: ${temperatura}`);
  console.log(`      Max Tokens: ${maxTokens}`);
  console.log(`      API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NO CONFIGURADA'}`);
  
  const configuracionCorrecta = modelo === 'gemini-1.5-flash' && temperatura === '0.7' && maxTokens === '1000';
  
  if (configuracionCorrecta) {
    console.log('   ✅ Configuración CORRECTA');
  } else {
    console.log('   ❌ Configuración INCORRECTA');
  }
  
  return { configuracionCorrecta, tieneApiKey: !!apiKey };
}

// PASO 4: Probar conectividad (solo si estamos en el navegador)
function probarConectividad() {
  console.log('\n🌐 PASO 4: Probando conectividad...');
  
  if (typeof fetch === 'undefined') {
    console.log('   ⚠️ Fetch no disponible, saltando prueba de conectividad');
    return Promise.resolve(false);
  }
  
  const datosTest = {
    recipient: 'test@example.com',
    subject: 'Test de configuración',
    purpose: 'Verificar que la configuración funciona correctamente',
    context: 'Este es un test automático para verificar la configuración de Gemini'
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-email': 'test@example.com',
    'x-model': 'gemini-1.5-flash',
    'x-temperature': '0.7',
    'x-max-tokens': '1000'
  };
  
  const apiKey = localStorage.getItem('gemini_api_key');
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  console.log('   📤 Enviando request de prueba...');
  
  return fetch('/api/generate-email', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(datosTest)
  })
  .then(response => {
    console.log(`   📨 Respuesta: ${response.status} ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    if (data.error) {
      console.log(`   ❌ Error: ${data.error}`);
      if (data.error.includes('gemini-1.5-flash-002')) {
        console.log('   🚨 PROBLEMA: Aún se está usando el modelo incorrecto');
        return false;
      } else if (data.error.includes('API key')) {
        console.log('   🔑 Problema de API Key - configura tu clave en Ajustes');
        return 'api_key';
      }
      return false;
    } else {
      console.log('   ✅ Conectividad OK');
      return true;
    }
  })
  .catch(error => {
    console.log(`   ❌ Error de conectividad: ${error.message}`);
    return false;
  });
}

// FUNCIÓN PRINCIPAL
async function solucionFinal() {
  console.log('\n🚀 Iniciando solución final...');
  
  // Paso 1: Limpiar
  const huboCambios = limpiezaCompleta();
  
  // Paso 2: Configurar
  establecerConfiguracionCorrecta();
  
  // Paso 3: Verificar
  const { configuracionCorrecta, tieneApiKey } = verificarConfiguracion();
  
  if (!configuracionCorrecta) {
    console.log('\n❌ FALLO: No se pudo establecer la configuración correcta');
    return false;
  }
  
  // Paso 4: Probar (solo si tenemos API Key)
  let conectividadOk = false;
  if (tieneApiKey) {
    conectividadOk = await probarConectividad();
  } else {
    console.log('\n⚠️ Saltando prueba de conectividad (no hay API Key)');
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN FINAL:');
  console.log(`   🧹 Limpieza: ${huboCambios ? '✅ REALIZADA' : '✅ NO NECESARIA'}`);
  console.log(`   ⚙️ Configuración: ${configuracionCorrecta ? '✅ CORRECTA' : '❌ INCORRECTA'}`);
  console.log(`   🔑 API Key: ${tieneApiKey ? '✅ CONFIGURADA' : '⚠️ FALTA'}`);
  console.log(`   🌐 Conectividad: ${conectividadOk === true ? '✅ OK' : conectividadOk === 'api_key' ? '⚠️ FALTA API KEY' : conectividadOk === false && tieneApiKey ? '❌ ERROR' : '⏭️ NO PROBADA'}`);
  
  if (configuracionCorrecta && (tieneApiKey ? conectividadOk !== false : true)) {
    console.log('\n🎉 ¡SOLUCIÓN COMPLETADA EXITOSAMENTE!');
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Recarga la página (F5)');
    console.log('   2. Ve a /correos-ia');
    console.log('   3. Intenta generar un email');
    if (!tieneApiKey) {
      console.log('   4. Si no funciona, configura tu API Key en Ajustes');
    }
    return true;
  } else {
    console.log('\n❌ SOLUCIÓN INCOMPLETA');
    if (!tieneApiKey) {
      console.log('\n🔑 CONFIGURA TU API KEY:');
      console.log('   1. Ve a https://aistudio.google.com/');
      console.log('   2. Genera una nueva API Key');
      console.log('   3. Ve a Ajustes en la aplicación');
      console.log('   4. Pega la API Key');
    }
    return false;
  }
}

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined' && window.localStorage) {
  solucionFinal().then(exito => {
    if (exito) {
      console.log('\n🎯 ¡Listo para generar emails!');
    } else {
      console.log('\n🔄 Ejecuta el script nuevamente después de configurar la API Key');
    }
  });
} else {
  console.log('❌ Este script debe ejecutarse en el navegador');
  console.log('💡 Abre la consola del navegador (F12) y pega este código');
}

// Exportar para uso programático
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { solucionFinal, limpiezaCompleta, establecerConfiguracionCorrecta, verificarConfiguracion };
}