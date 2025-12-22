#!/usr/bin/env node

const fs = require('fs');

console.log('🧹 Eliminando imports de supabase-users...\n');

const filesToFix = [
  'app/api/create-user-and-page/route.ts',
  'app/api/users/[email]/route.ts',
  'app/api/gmail-notification/route.ts',
  'app/api/email-collection/[userEmail]/export/route.ts'
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`  ⚠️  No existe: ${file}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Eliminar imports de supabase-users
  content = content.replace(/import.*from.*supabase-users.*;?\n/g, '');
  content = content.replace(/import \{[^}]*\} from.*supabase-users.*;?\n/g, '');
  
  // Eliminar líneas que usan funciones de Supabase
  content = content.replace(/.*createOrUpdateSupabaseUser.*\n/g, '');
  content = content.replace(/.*getSupabaseUserByEmail.*\n/g, '');
  content = content.replace(/.*getAllSupabaseUsers.*\n/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`  ✅ Limpiado: ${file}`);
  } else {
    console.log(`  ℹ️  Sin cambios: ${file}`);
  }
});

console.log('\n✅ Imports de Supabase eliminados!');
