const fs = require('fs');

const filesToFix = [
  'app/correosia/[userEmail]/admin/page.tsx',
  'app/dashboard/email-pages/page.tsx',
  'app/plantillas/page.tsx'
];

filesToFix.forEach(file => {
  try {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(file, 'utf8');
    
    // Move "use client" to the top
    content = content.replace(
      /\/\/ Force dynamic rendering.*\nexport const dynamic = 'force-dynamic';\s*\n\s*"use client";/,
      '"use client";\n\n// Force dynamic rendering - this page requires authentication\nexport const dynamic = \'force-dynamic\';'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('\n✨ All files fixed!');
