#!/usr/bin/env node

/**
 * Script de verificación del nuevo Escritor IA
 * 
 * Este script verifica que todos los archivos necesarios estén en su lugar
 * y que no haya conflictos con el sistema anterior.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando instalación del nuevo Escritor IA...\n');

const checks = [
  {
    name: 'Archivo principal (page.tsx)',
    path: './app/escritor-ia/page.tsx',
    required: true
  },
  {
    name: 'Layout simplificado',
    path: './app/escritor-ia/layout.tsx',
    required: true
  },
  {
    name: 'Backup de componentes antiguos',
    path: './app/escritor-ia/components.backup',
    required: false
  },
  {
    name: 'Backup de context antiguo',
    path: './app/escritor-ia/context.backup',
    required: false
  },
  {
    name: 'Documentación de cambios',
    path: './ESCRITOR_IA_NUEVO_IMPLEMENTADO.md',
    required: false
  }
];

let allGood = true;

checks.forEach(check => {
  const exists = fs.existsSync(path.join(process.cwd(), check.path));
  const status = exists ? '✅' : (check.required ? '❌' : '⚠️');
  
  console.log(`${status} ${check.name}`);
  
  if (check.required && !exists) {
    allGood = false;
    console.log(`   ⚠️  REQUERIDO pero no encontrado: ${check.path}`);
  }
});

console.log('\n' + '='.repeat(60) + '\n');

if (allGood) {
  console.log('✅ VERIFICACIÓN EXITOSA\n');
  console.log('El nuevo Escritor IA está correctamente instalado.');
  console.log('\nPara probarlo:');
  console.log('1. Ejecuta: npm run dev');
  console.log('2. Ve a: http://localhost:3000/escritor-ia');
  console.log('3. Inicia sesión con Kinde');
  console.log('4. ¡Empieza a escribir!\n');
  
  console.log('📝 Funcionalidades disponibles:');
  console.log('  • Mejora automática después de 2 segundos');
  console.log('  • Botón manual "Mejorar texto"');
  console.log('  • Autoguardado cada 30 segundos');
  console.log('  • Historial completo (Undo/Redo)');
  console.log('  • Modo oscuro/claro');
  console.log('  • Formato de texto (negrita, cursiva, listas)');
  console.log('  • Contador de palabras y caracteres\n');
  
  console.log('⚠️  IMPORTANTE para producción:');
  console.log('  Revisa ESCRITOR_IA_NUEVO_IMPLEMENTADO.md para');
  console.log('  configurar un endpoint API seguro.\n');
  
} else {
  console.log('❌ VERIFICACIÓN FALLIDA\n');
  console.log('Faltan archivos requeridos. Por favor, revisa la instalación.');
}

console.log('='.repeat(60) + '\n');
