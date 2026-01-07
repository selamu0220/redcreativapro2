/**
 * Script de diagnóstico para el Escritor IA
 * Verifica la configuración y detecta problemas comunes
 */

const fs = require('fs');
const path = require('path');

function diagnosticarEscritorIA() {
  console.log('🔍 DIAGNÓSTICO DEL ESCRITOR IA');
  console.log('================================\n');

  const problemas = [];
  const advertencias = [];
  const exitos = [];

  // 1. Verificar archivo .env.local
  console.log('1. Verificando configuración de entorno...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    problemas.push('❌ Archivo .env.local no encontrado');
  } else {
    exitos.push('✅ Archivo .env.local encontrado');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Verificar API key de OpenRouter
    if (envContent.includes('OPEN_ROUTER_API_KEY=') && !envContent.includes('OPEN_ROUTER_API_KEY=sk-or-v1-your-openrouter-api-key-here')) {
      exitos.push('✅ API key de OpenRouter configurada');
    } else {
      problemas.push('❌ API key de OpenRouter no configurada o usando valor de ejemplo');
    }
  }

  // 2. Verificar archivos de la API
  console.log('\n2. Verificando archivos de la API...');
  
  const apiFiles = [
    'app/api/improve-text-simple/route.ts',
    'app/hooks/useSimpleAutoImprovement.ts',
    'app/lib/ai-client.ts'
  ];

  apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
      exitos.push(`✅ ${file} existe`);
    } else {
      problemas.push(`❌ ${file} no encontrado`);
    }
  });

  // 3. Verificar componentes
  console.log('\n3. Verificando componentes...');
  
  const componentFiles = [
    'app/escritor-ia/components/EnhancedAIWriterEditor.tsx',
    'app/test-escritor-simple/page.tsx',
    'app/components/AutoModeSettings.tsx'
  ];

  componentFiles.forEach(file => {
    if (fs.existsSync(file)) {
      exitos.push(`✅ ${file} existe`);
    } else {
      problemas.push(`❌ ${file} no encontrado`);
    }
  });

  // 4. Verificar dependencias en package.json
  console.log('\n4. Verificando dependencias...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };
    
    const requiredDeps = ['sonner', 'lucide-react'];
    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        exitos.push(`✅ Dependencia ${dep} instalada`);
      } else {
        advertencias.push(`⚠️ Dependencia ${dep} podría estar faltando`);
      }
    });
  }

  // 5. Mostrar resultados
  console.log('\n📊 RESULTADOS DEL DIAGNÓSTICO');
  console.log('==============================\n');

  if (exitos.length > 0) {
    console.log('✅ CONFIGURACIÓN CORRECTA:');
    exitos.forEach(exito => console.log(`   ${exito}`));
    console.log('');
  }

  if (advertencias.length > 0) {
    console.log('⚠️ ADVERTENCIAS:');
    advertencias.forEach(advertencia => console.log(`   ${advertencia}`));
    console.log('');
  }

  if (problemas.length > 0) {
    console.log('❌ PROBLEMAS ENCONTRADOS:');
    problemas.forEach(problema => console.log(`   ${problema}`));
    console.log('');
  }

  // 6. Recomendaciones
  console.log('💡 RECOMENDACIONES:');
  console.log('===================\n');

  if (problemas.some(p => p.includes('API key'))) {
    console.log('🔑 Para configurar la API key de OpenRouter:');
    console.log('   1. Ve a https://openrouter.ai');
    console.log('   2. Crea una cuenta gratuita');
    console.log('   3. Ve a "Keys" y crea una nueva API key');
    console.log('   4. Agrega la key a .env.local:');
    console.log('      OPEN_ROUTER_API_KEY=sk-or-v1-tu-api-key-aqui\n');
  }

  if (problemas.length === 0) {
    console.log('🎉 ¡Todo parece estar configurado correctamente!');
    console.log('   Puedes probar el escritor IA en:');
    console.log('   - /escritor-ia (página principal)');
    console.log('   - /test-escritor-simple (página de prueba)\n');
  }

  console.log('📚 Para más ayuda, revisa: ESCRITOR_IA_SETUP.md');
  
  return {
    problemas: problemas.length,
    advertencias: advertencias.length,
    exitos: exitos.length
  };
}

// Ejecutar diagnóstico
if (require.main === module) {
  diagnosticarEscritorIA();
}

module.exports = { diagnosticarEscritorIA };