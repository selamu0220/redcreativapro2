const fs = require('fs');

const filesToClean = [
  'page-middleware.ts',
  'app/api/usage-stats/route.ts',
  'app/api/voice-guide/preferences/route.ts',
  'app/api/voice-guide/generate-speech/route.ts',
  'app/api/voice-guide/content/route.ts'
];

function cleanFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove Supabase imports
    content = content.replace(/import\s+{\s*createClient\s*}\s+from\s+['"]@supabase\/supabase-js['"];?\s*/g, '');
    
    // Remove getSupabaseClient function definitions
    content = content.replace(/function\s+getSupabaseClient\(\)\s*{[\s\S]*?return\s+null;\s*}\s*}/g, '');
    
    // Remove all getSupabaseClient() calls and related checks
    content = content.replace(/const\s+supabase\s*=\s*getSupabaseClient\(\);?\s*/g, '');
    content = content.replace(/\s*\/\/\s*Check if Supabase client is available[\s\S]*?if\s*\(!supabase\)\s*{[\s\S]*?}\s*/g, '');
    
    // Remove Supabase environment variable references
    content = content.replace(/const\s+supabaseUrl\s*=\s*process\.env\.[A-Z_]*SUPABASE[A-Z_]*;?\s*/g, '');
    content = content.replace(/const\s+supabaseServiceKey\s*=\s*process\.env\.[A-Z_]*SUPABASE[A-Z_]*;?\s*/g, '');

    // Clean up multiple empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

console.log('🧹 Cleaning remaining Supabase references...\n');

let cleanedCount = 0;
filesToClean.forEach(file => {
  if (cleanFile(file)) {
    cleanedCount++;
  }
});

console.log(`\n✨ Cleanup complete! ${cleanedCount} files cleaned.`);
