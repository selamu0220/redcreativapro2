const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE PROBLEMA CSS - Red Creativa Pro\n');
console.log('='.repeat(60));

// 1. Verificar archivos CSS en build
console.log('\n📁 1. VERIFICANDO ARCHIVOS CSS EN BUILD...');
const nextStaticPath = path.join(__dirname, '.next', 'static', 'css');

if (fs.existsSync(nextStaticPath)) {
  const cssFiles = fs.readdirSync(nextStaticPath).filter(f => f.endsWith('.css'));
  console.log(`✅ Carpeta .next/static/css existe`);
  console.log(`📊 Archivos CSS encontrados: ${cssFiles.length}`);
  
  cssFiles.forEach(file => {
    const filePath = path.join(nextStaticPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   - ${file}: ${sizeKB} KB`);
    
    if (stats.size === 0) {
      console.log(`   ⚠️  ADVERTENCIA: Archivo vacío!`);
    }
  });
} else {
  console.log(`❌ ERROR: Carpeta .next/static/css NO existe`);
  console.log(`   Esto indica que el build no generó archivos CSS`);
}

// 2. Verificar importación de globals.css
console.log('\n📝 2. VERIFICANDO IMPORTACIÓN DE GLOBALS.CSS...');
const layoutPath = path.join(__dirname, 'app', 'layout.tsx');

if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes("import './globals.css'")) {
    console.log(`✅ globals.css está importado en layout.tsx`);
  } else if (layoutContent.includes('globals.css')) {
    console.log(`⚠️  globals.css mencionado pero importación puede ser incorrecta`);
  } else {
    console.log(`❌ ERROR: globals.css NO está importado en layout.tsx`);
  }
  
  // Verificar que globals.css existe
  const globalsCssPath = path.join(__dirname, 'app', 'globals.css');
  if (fs.existsSync(globalsCssPath)) {
    const globalsCssContent = fs.readFileSync(globalsCssPath, 'utf8');
    const hasTailwindDirectives = 
      globalsCssContent.includes('@tailwind base') &&
      globalsCssContent.includes('@tailwind components') &&
      globalsCssContent.includes('@tailwind utilities');
    
    if (hasTailwindDirectives) {
      console.log(`✅ globals.css contiene directivas @tailwind`);
    } else {
      console.log(`❌ ERROR: globals.css NO contiene directivas @tailwind`);
    }
  } else {
    console.log(`❌ ERROR: app/globals.css NO existe`);
  }
} else {
  console.log(`❌ ERROR: app/layout.tsx NO existe`);
}

// 3. Verificar configuración de Tailwind
console.log('\n⚙️  3. VERIFICANDO CONFIGURACIÓN DE TAILWIND...');
const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js');

if (fs.existsSync(tailwindConfigPath)) {
  console.log(`✅ tailwind.config.js existe`);
  
  try {
    const tailwindConfig = require(tailwindConfigPath);
    
    if (tailwindConfig.content && Array.isArray(tailwindConfig.content)) {
      console.log(`✅ Content paths configurados: ${tailwindConfig.content.length} rutas`);
      tailwindConfig.content.forEach(p => console.log(`   - ${p}`));
      
      // Verificar que incluye app/**
      const hasAppPath = tailwindConfig.content.some(p => p.includes('app/**'));
      if (hasAppPath) {
        console.log(`✅ Incluye ruta app/**`);
      } else {
        console.log(`⚠️  ADVERTENCIA: No incluye ruta app/**`);
      }
    } else {
      console.log(`❌ ERROR: content no está configurado correctamente`);
    }
    
    if (tailwindConfig.plugins) {
      console.log(`✅ Plugins configurados: ${tailwindConfig.plugins.length}`);
    }
  } catch (error) {
    console.log(`❌ ERROR al cargar tailwind.config.js: ${error.message}`);
  }
} else {
  console.log(`❌ ERROR: tailwind.config.js NO existe`);
}

// 4. Verificar PostCSS config
console.log('\n🔧 4. VERIFICANDO CONFIGURACIÓN DE POSTCSS...');
const postcssConfigPath = path.join(__dirname, 'postcss.config.js');

if (fs.existsSync(postcssConfigPath)) {
  console.log(`✅ postcss.config.js existe`);
  
  try {
    const postcssConfig = require(postcssConfigPath);
    
    if (postcssConfig.plugins) {
      const hasTailwind = postcssConfig.plugins.tailwindcss !== undefined;
      const hasAutoprefixer = postcssConfig.plugins.autoprefixer !== undefined;
      
      if (hasTailwind) {
        console.log(`✅ Plugin tailwindcss configurado`);
      } else {
        console.log(`❌ ERROR: Plugin tailwindcss NO configurado`);
      }
      
      if (hasAutoprefixer) {
        console.log(`✅ Plugin autoprefixer configurado`);
      } else {
        console.log(`⚠️  ADVERTENCIA: Plugin autoprefixer NO configurado`);
      }
    }
  } catch (error) {
    console.log(`❌ ERROR al cargar postcss.config.js: ${error.message}`);
  }
} else {
  console.log(`❌ ERROR: postcss.config.js NO existe`);
}

// 5. Verificar Next.js config
console.log('\n⚡ 5. VERIFICANDO CONFIGURACIÓN DE NEXT.JS...');
const nextConfigPath = path.join(__dirname, 'next.config.js');

if (fs.existsSync(nextConfigPath)) {
  console.log(`✅ next.config.js existe`);
  
  try {
    const nextConfig = require(nextConfigPath);
    
    if (nextConfig.output) {
      console.log(`📦 Output mode: ${nextConfig.output}`);
      
      if (nextConfig.output === 'standalone') {
        console.log(`⚠️  ADVERTENCIA: Output 'standalone' puede causar problemas con archivos estáticos`);
        console.log(`   Esto podría ser la causa del problema CSS`);
      }
    }
    
    if (nextConfig.webpack) {
      console.log(`✅ Configuración webpack personalizada detectada`);
    }
  } catch (error) {
    console.log(`❌ ERROR al cargar next.config.js: ${error.message}`);
  }
} else {
  console.log(`❌ ERROR: next.config.js NO existe`);
}

// 6. Verificar package.json
console.log('\n📦 6. VERIFICANDO DEPENDENCIAS...');
const packageJsonPath = path.join(__dirname, 'package.json');

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = {
    'next': deps.next,
    'tailwindcss': deps.tailwindcss,
    'postcss': deps.postcss,
    'autoprefixer': deps.autoprefixer
  };
  
  console.log('Versiones de dependencias clave:');
  Object.entries(requiredDeps).forEach(([name, version]) => {
    if (version) {
      console.log(`✅ ${name}: ${version}`);
    } else {
      console.log(`❌ ${name}: NO INSTALADO`);
    }
  });
}

// RESUMEN Y RECOMENDACIONES
console.log('\n' + '='.repeat(60));
console.log('📋 RESUMEN Y RECOMENDACIONES\n');

const issues = [];
const recommendations = [];

// Analizar problemas encontrados
if (!fs.existsSync(nextStaticPath)) {
  issues.push('❌ CRÍTICO: No se generaron archivos CSS en el build');
  recommendations.push('1. Ejecutar: rm -rf .next && npm run build');
  recommendations.push('2. Verificar que el build completa sin errores');
}

const nextConfig = fs.existsSync(nextConfigPath) ? require(nextConfigPath) : {};
if (nextConfig.output === 'standalone') {
  issues.push('⚠️  ADVERTENCIA: Output standalone puede causar problemas');
  recommendations.push('3. Considerar cambiar output a "export" o remover la opción');
}

if (issues.length === 0) {
  console.log('✅ No se detectaron problemas críticos en la configuración');
  console.log('\nPosibles causas del problema:');
  console.log('1. Cache corrupto del navegador');
  console.log('2. Problema en el deployment (Vercel)');
  console.log('3. Archivos CSS no se están sirviendo correctamente');
} else {
  console.log('PROBLEMAS DETECTADOS:');
  issues.forEach(issue => console.log(issue));
  
  console.log('\nRECOMENDACIONES:');
  recommendations.forEach(rec => console.log(rec));
}

console.log('\n' + '='.repeat(60));
console.log('✅ Diagnóstico completado\n');
