/**
 * EMERGENCY FIX: Simplificar componentes para identificar el problema
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY FIX: Simplificando componentes...\n');

// 1. Crear un layout ultra simple
const simpleLayout = `import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Red Creativa Pro',
  description: 'Plataforma de IA para copywriting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div style={{ padding: '20px' }}>
          <h1>Red Creativa Pro - Modo Emergencia</h1>
          <p>Si ves esto, el layout funciona</p>
          {children}
        </div>
      </body>
    </html>
  )
}
`;

// 2. Crear una página ultra simple
const simplePage = `export default function HomePage() {
  return (
    <div>
      <h2>Página Principal</h2>
      <p>Si ves esto, la página funciona correctamente</p>
      <p>El problema estaba en los componentes complejos</p>
    </div>
  )
}
`;

// 3. Backup de archivos originales
console.log('📦 Creando backups...');
try {
  const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
  const pagePath = path.join(process.cwd(), 'app', 'page.tsx');
  
  if (fs.existsSync(layoutPath)) {
    fs.copyFileSync(layoutPath, layoutPath + '.backup-emergency');
    console.log('✅ Backup de layout.tsx creado');
  }
  
  if (fs.existsSync(pagePath)) {
    fs.copyFileSync(pagePath, pagePath + '.backup-emergency');
    console.log('✅ Backup de page.tsx creado');
  }
} catch (error) {
  console.error('❌ Error creando backups:', error.message);
}

// 4. Escribir archivos simplificados
console.log('\n🔧 Escribiendo archivos simplificados...');
try {
  fs.writeFileSync(
    path.join(process.cwd(), 'app', 'layout-emergency.tsx'),
    simpleLayout
  );
  console.log('✅ layout-emergency.tsx creado');
  
  fs.writeFileSync(
    path.join(process.cwd(), 'app', 'page-emergency.tsx'),
    simplePage
  );
  console.log('✅ page-emergency.tsx creado');
} catch (error) {
  console.error('❌ Error escribiendo archivos:', error.message);
}

console.log('\n📋 INSTRUCCIONES:');
console.log('1. Renombra layout.tsx a layout.tsx.old');
console.log('2. Renombra layout-emergency.tsx a layout.tsx');
console.log('3. Renombra page.tsx a page.tsx.old');
console.log('4. Renombra page-emergency.tsx a page.tsx');
console.log('5. Commit y push');
console.log('6. Si funciona, el problema está en los componentes complejos');
console.log('\nO ejecuta: node apply-emergency-fix.js');
