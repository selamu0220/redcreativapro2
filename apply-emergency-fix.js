/**
 * Aplicar el fix de emergencia automáticamente
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 Aplicando fix de emergencia...\n');

const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
const pagePath = path.join(process.cwd(), 'app', 'page.tsx');
const layoutEmergencyPath = path.join(process.cwd(), 'app', 'layout-emergency.tsx');
const pageEmergencyPath = path.join(process.cwd(), 'app', 'page-emergency.tsx');

try {
  // 1. Backup de originales
  if (fs.existsSync(layoutPath)) {
    fs.copyFileSync(layoutPath, layoutPath + '.complex');
    console.log('✅ Backup de layout.tsx → layout.tsx.complex');
  }
  
  if (fs.existsSync(pagePath)) {
    fs.copyFileSync(pagePath, pagePath + '.complex');
    console.log('✅ Backup de page.tsx → page.tsx.complex');
  }
  
  // 2. Copiar versiones de emergencia
  if (fs.existsSync(layoutEmergencyPath)) {
    fs.copyFileSync(layoutEmergencyPath, layoutPath);
    console.log('✅ layout-emergency.tsx → layout.tsx');
  }
  
  if (fs.existsSync(pageEmergencyPath)) {
    fs.copyFileSync(pageEmergencyPath, pagePath);
    console.log('✅ page-emergency.tsx → page.tsx');
  }
  
  console.log('\n✅ Fix de emergencia aplicado!');
  console.log('\nAhora ejecuta:');
  console.log('  git add app/layout.tsx app/page.tsx');
  console.log('  git commit -m "emergency: simplify layout and page"');
  console.log('  git push');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
