// 🎯 SOLUCIÓN DEFINITIVA - PROBLEMA GENERACIÓN EMAILS IA
// =====================================================
// Este script resuelve el problema del modelo incorrecto gemini-1.5-flash-002
// INSTRUCCIONES: Copia y pega este código completo en la consola del navegador (F12)

console.log('🎯 SOLUCIÓN DEFINITIVA - PROBLEMA EMAILS IA');
console.log('='.repeat(60));
console.log('🚨 Resolviendo modelo incorrecto: gemini-1.5-flash-002 → gemini-1.5-flash');
console.log('');

// PASO 1: Diagnóstico inicial
function diagnosticoInicial() {
  console.log('🔍 PASO 1: Diagnóstico inicial...');
  
  const modeloActual = localStorage.getItem('gemini_model');
  const apiKey = localStorage.getItem('gemini_api_key');
  
  console.log(`   📋 Modelo actual: ${modeloActual || 'No configurado'}`);
  console.log(`   🔑 API Key: ${apiKey ? 'Configurada (' + apiKey.substring(0, 10) + '...)' : 'No configurada'}`);
  
  const tieneProblema = modeloActual && modeloActual.includes('gemini-1.5-flash-002');
  
  if (tieneProblema) {
    console.log('   ❌ PROBLEMA DETECTADO: Modelo incorrecto gemini-1.5-flash-002');
  } else if (!modeloActual) {
    console.log('   ⚠️ No hay modelo configurado (usará por defecto)');
  } else {
    console.log('   ✅ Modelo parece correcto');
  }
  
  return { tieneProblema, modeloActual, tieneApiKey: !!apiKey };
}

// PASO 2: Limpieza completa
function limpiezaCompleta() {
  console.log('\n🧹 PASO 2: Limpieza completa...');
  
  const clavesProblematicas = [
    'gemini_model',
    'gemini_temperature', 
    'gemini_max_tokens',
    'ai_model',
    'ai_config',
    'model_config'
  ];
  
  let eliminadas = 0;
  
  // Eliminar configuraciones específicas
  clavesProblematicas.forEach(clave => {
    const valor = localStorage.getItem(clave);
    if (valor) {
      localStorage.removeItem(clave);
      console.log(`   ✅ Eliminado: ${clave} (era: ${valor})`);
      eliminadas++;
    }
  });
  
  // Buscar y eliminar cualquier referencia al modelo problemático
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const clave = localStorage.key(i);
    if (clave) {
      const valor = localStorage.getItem(clave);
      if (valor && typeof valor === 'string' && valor.includes('gemini-1.5-flash-002')) {
        localStorage.removeItem(clave);
        console.log(`   ❌ Eliminado modelo problemático en: ${clave}`);
        eliminadas++;
      }
    }
  }
  
  console.log(`   📊 Total eliminadas: ${eliminadas} configuraciones`);
  return eliminadas;
}

// PASO 3: Configuración correcta
function establecerConfiguracionCorrecta() {
  console.log('\n✨ PASO 3: Estableciendo configuración correcta...');
  
  const configuracionCorrecta = {
    'gemini_model': 'gemini-1.5-flash',
    'gemini_temperature': '0.7',
    'gemini_max_tokens': '1000'
  };
  
  Object.entries(configuracionCorrecta).forEach(([clave, valor]) => {
    localStorage.setItem(clave, valor);
    console.log(`   ✅ Configurado: ${clave} = ${valor}`);
  });
  
  return true;
}

// PASO 4: Verificación final
function verificacionFinal() {
  console.log('\n🔍 PASO 4: Verificación final...');
  
  const modelo = localStorage.getItem('gemini_model');
  const temperatura = localStorage.getItem('gemini_temperature');
  const maxTokens = localStorage.getItem('gemini_max_tokens');
  const apiKey = localStorage.getItem('gemini_api_key');
  
  console.log('   📋 Configuración final:');
  console.log(`      🤖 Modelo: ${modelo}`);
  console.log(`      🌡️ Temperatura: ${temperatura}`);
  console.log(`      📊 Max Tokens: ${maxTokens}`);
  console.log(`      🔑 API Key: ${apiKey ? 'Configurada (' + apiKey.substring(0, 10) + '...)' : 'No configurada'}`);
  
  const configuracionCorrecta = (
    modelo === 'gemini-1.5-flash' &&
    temperatura === '0.7' &&
    maxTokens === '1000'
  );
  
  if (configuracionCorrecta) {
    console.log('   ✅ CONFIGURACIÓN CORRECTA');
  } else {
    console.log('   ❌ CONFIGURACIÓN INCORRECTA');
  }
  
  return { configuracionCorrecta, tieneApiKey: !!apiKey };
}

// PASO 5: Prueba de conectividad
async function pruebaConectividad() {
  console.log('\n🌐 PASO 5: Probando conectividad...');
  
  const datosTest = {
    recipient: 'test@example.com',
    subject: 'Test de configuración',
    purpose: 'Verificar que la configuración funciona correctamente'
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'x-model': 'gemini-1.5-flash',
    'x-temperature': '0.7',
    'x-max-tokens': '1000'
  };
  
  const apiKey = localStorage.getItem('gemini_api_key');
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  try {
    console.log('   📤 Enviando request de prueba...');
    
    const response = await fetch('/api/generate-email', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(datosTest)
    });
    
    console.log(`   📨 Respuesta: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (data.error) {
      console.log(`   ❌ Error: ${data.error}`);
      
      if (data.error.includes('gemini-1.5-flash-002')) {
        console.log('   🚨 PROBLEMA PERSISTENTE: Aún se usa el modelo incorrecto');
        return 'modelo_incorrecto';
      } else if (data.error.includes('API key') || data.error.includes('no configurada')) {
        console.log('   🔑 Problema de API Key - necesitas configurarla');
        return 'falta_api_key';
      } else {
        console.log('   ⚠️ Otro error - revisa la configuración');
        return 'otro_error';
      }
    } else {
      console.log('   ✅ CONECTIVIDAD OK - Email generado exitosamente');
      return 'exito';
    }
  } catch (error) {
    console.log(`   ❌ Error de red: ${error.message}`);
    return 'error_red';
  }
}

// FUNCIÓN PRINCIPAL
async function solucionDefinitiva() {
  console.log('\n🚀 Iniciando solución definitiva...');
  console.log('');
  
  // Paso 1: Diagnóstico
  const diagnostico = diagnosticoInicial();
  
  // Paso 2: Limpieza
  const eliminadas = limpiezaCompleta();
  
  // Paso 3: Configuración
  establecerConfiguracionCorrecta();
  
  // Paso 4: Verificación
  const { configuracionCorrecta, tieneApiKey } = verificacionFinal();
  
  if (!configuracionCorrecta) {
    console.log('\n❌ FALLO: No se pudo establecer la configuración correcta');
    return false;
  }
  
  // Paso 5: Prueba de conectividad
  let resultadoPrueba = 'no_probada';
  if (tieneApiKey) {
    resultadoPrueba = await pruebaConectividad();
  } else {
    console.log('\n⚠️ Saltando prueba de conectividad (no hay API Key)');
  }
  
  // RESUMEN FINAL
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL:');
  console.log('='.repeat(60));
  console.log(`🔍 Diagnóstico: ${diagnostico.tieneProblema ? '❌ Problema detectado' : '✅ Sin problemas'}`);
  console.log(`🧹 Limpieza: ${eliminadas > 0 ? `✅ ${eliminadas} items eliminados` : '✅ No necesaria'}`);
  console.log(`⚙️ Configuración: ${configuracionCorrecta ? '✅ Correcta' : '❌ Incorrecta'}`);
  console.log(`🔑 API Key: ${tieneApiKey ? '✅ Configurada' : '⚠️ Falta configurar'}`);
  
  let estadoConectividad = '';
  switch (resultadoPrueba) {
    case 'exito':
      estadoConectividad = '✅ Funcionando perfectamente';
      break;
    case 'falta_api_key':
      estadoConectividad = '⚠️ Falta API Key';
      break;
    case 'modelo_incorrecto':
      estadoConectividad = '❌ Modelo aún incorrecto';
      break;
    case 'otro_error':
      estadoConectividad = '❌ Otro error';
      break;
    case 'error_red':
      estadoConectividad = '❌ Error de red';
      break;
    default:
      estadoConectividad = '⏭️ No probada';
  }
  
  console.log(`🌐 Conectividad: ${estadoConectividad}`);
  
  // INSTRUCCIONES FINALES
  console.log('\n' + '='.repeat(60));
  
  if (configuracionCorrecta && (resultadoPrueba === 'exito' || resultadoPrueba === 'no_probada')) {
    console.log('🎉 ¡SOLUCIÓN COMPLETADA EXITOSAMENTE!');
    console.log('');
    console.log('📝 PRÓXIMOS PASOS:');
    console.log('   1. 🔄 Recarga la página (F5 o Ctrl+R)');
    console.log('   2. 📧 Ve a la sección de Correos IA');
    console.log('   3. ✨ Intenta generar un email');
    
    if (!tieneApiKey) {
      console.log('   4. 🔑 Si no funciona, configura tu API Key en Ajustes');
    }
    
    console.log('');
    console.log('💡 Si el problema persiste, contacta al soporte técnico.');
    
  } else if (resultadoPrueba === 'falta_api_key') {
    console.log('⚠️ CONFIGURACIÓN PARCIALMENTE COMPLETADA');
    console.log('');
    console.log('🔑 NECESITAS CONFIGURAR TU API KEY:');
    console.log('   1. Ve a Ajustes en la aplicación');
    console.log('   2. Configura tu API Key de Gemini');
    console.log('   3. Intenta generar un email nuevamente');
    
  } else {
    console.log('❌ SOLUCIÓN INCOMPLETA');
    console.log('');
    console.log('🔧 ACCIONES REQUERIDAS:');
    console.log('   1. Recarga la página (F5)');
    console.log('   2. Ejecuta este script nuevamente');
    console.log('   3. Si persiste, contacta soporte técnico');
  }
  
  console.log('\n' + '='.repeat(60));
  
  return configuracionCorrecta;
}

// EJECUTAR AUTOMÁTICAMENTE
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Estamos en el navegador, ejecutar la solución
  solucionDefinitiva().then(exito => {
    if (exito) {
      console.log('\n🎯 Script completado exitosamente');
    } else {
      console.log('\n⚠️ Script completado con advertencias');
    }
  }).catch(error => {
    console.error('\n❌ Error ejecutando script:', error);
  });
} else {
  // No estamos en el navegador
  console.log('❌ Este script debe ejecutarse en el navegador');
  console.log('💡 Instrucciones:');
  console.log('   1. Abre tu aplicación en el navegador');
  console.log('   2. Presiona F12 para abrir la consola');
  console.log('   3. Copia y pega este código completo');
  console.log('   4. Presiona Enter para ejecutar');
}