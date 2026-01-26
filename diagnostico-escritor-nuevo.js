#!/usr/bin/env node

/**
 * DIAGNÓSTICO DIRECTO DEL ESCRITOR NUEVO
 * =====================================
 */

console.log('🔍 DIAGNÓSTICO DIRECTO DEL ESCRITOR NUEVO');
console.log('=========================================\n');

// Test 1: Verificar que la API funciona
console.log('📡 TEST 1: Verificando API /api/improve-text-demo');
console.log('─'.repeat(50));

const testText = 'hola como estas espero que todo este bien';
console.log(`📝 Texto de prueba: "${testText}"`);
console.log(`📊 Palabras: ${testText.split(/\s+/).length}`);

// Simular la llamada que hace el componente
const requestBody = {
  content: testText,
  language: 'es'
};

console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
console.log('🌐 URL: http://localhost:3000/api/improve-text-demo');
console.log('📋 Method: POST');
console.log('📋 Headers: Content-Type: application/json');

console.log('\n🧪 Ejecutando curl para probar...');

// Usar curl para probar la API directamente
const { exec } = require('child_process');

const curlCommand = `curl -X POST http://localhost:3000/api/improve-text-demo -H "Content-Type: application/json" -d "${JSON.stringify(requestBody).replace(/"/g, '\\"')}"`;

console.log('💻 Comando curl:', curlCommand);

exec(curlCommand, (error, stdout, stderr) => {
  console.log('\n📡 RESPUESTA DE LA API:');
  console.log('─'.repeat(30));
  
  if (error) {
    console.log('❌ ERROR en curl:', error.message);
    return;
  }
  
  if (stderr) {
    console.log('⚠️ STDERR:', stderr);
  }
  
  console.log('✅ STDOUT:', stdout);
  
  try {
    const response = JSON.parse(stdout);
    console.log('\n📊 ANÁLISIS DE RESPUESTA:');
    console.log('─'.repeat(30));
    
    if (response.error) {
      console.log('❌ Error en respuesta:', response.error);
    } else if (response.improvedContent) {
      console.log('✅ Contenido mejorado recibido');
      console.log('📝 Original:', testText);
      console.log('📝 Mejorado:', response.improvedContent);
      console.log('🔄 Cambió:', testText !== response.improvedContent);
    } else {
      console.log('❓ Respuesta inesperada:', response);
    }
  } catch (parseError) {
    console.log('❌ Error parseando JSON:', parseError.message);
    console.log('📄 Raw response:', stdout);
  }
});

// Test 2: Verificar que el servidor está corriendo
console.log('\n🌐 TEST 2: Verificando que el servidor esté corriendo');
console.log('─'.repeat(50));

exec('curl -I http://localhost:3000', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Servidor no está corriendo en puerto 3000');
    console.log('💡 Ejecuta: npm run dev');
  } else {
    console.log('✅ Servidor está corriendo');
    console.log('📋 Headers:', stdout.split('\n')[0]);
  }
});

// Test 3: Verificar archivos
console.log('\n📁 TEST 3: Verificando archivos necesarios');
console.log('─'.repeat(50));

const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'app/escritor-ia-nuevo/page.tsx',
  'app/api/improve-text-demo/route.ts',
  'app/test-escritor-nuevo/page.tsx'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - NO EXISTE`);
  }
});

console.log('\n🎯 INSTRUCCIONES DE PRUEBA MANUAL:');
console.log('=================================');
console.log('1. Asegúrate de que el servidor esté corriendo: npm run dev');
console.log('2. Ve a: http://localhost:3000/escritor-ia-nuevo');
console.log('3. Escribe: "hola como estas espero que todo este bien"');
console.log('4. Haz clic en "Mejorar con IA" o espera 3 segundos');
console.log('5. Deberías ver el texto mejorado');
console.log('\n📋 Si hay errores, revisa la consola del navegador (F12)');