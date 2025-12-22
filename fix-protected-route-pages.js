#!/usr/bin/env node

/**
 * Add dynamic export to all pages using ProtectedRoute
 * This prevents static generation errors with LocalizationProvider
 */

const fs = require('fs');

console.log('🔧 Adding dynamic export to protected pages...\n');

const pagesToFix = [
  'app/plantillas/page.tsx',
  'app/historial/page.tsx',
  'app/documentos/page.tsx',
  'app/dashboard/email-pages/page.tsx',
  'app/contactos/page.tsx',
  'app/correos-ia/page.tsx',
  'app/correosia/[userEmail]/admin/page.tsx',
  'app/ajustes/page.tsx'
];

pagesToFix.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`  ⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  
  // Check if already has dynamic export
  if (content.includes("export const dynamic = 'force-dynamic'")) {
    console.log(`  ℹ️  Already fixed: ${file}`);
    return;
  }

  // Check if it's a client component
  if (content.includes("'use client'")) {
    // Add dynamic export after 'use client'
    content = content.replace(
      /'use client';?\n/,
      "'use client';\n\n// Force dynamic rendering - this page requires authentication\nexport const dynamic = 'force-dynamic';\n"
    );
  } else {
    // Add at the top
    content = "// Force dynamic rendering - this page requires authentication\nexport const dynamic = 'force-dynamic';\n\n" + content;
  }

  fs.writeFileSync(file, content);
  console.log(`  ✅ Fixed: ${file}`);
});

console.log('\n✅ All protected pages updated!');
console.log('\nThese pages will now be dynamically rendered instead of statically generated.');
