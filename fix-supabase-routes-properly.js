const fs = require('fs');
const path = require('path');

// Files that need Supabase removal but should keep working
const filesToFix = [
  'app/api/user/profile/route.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/api/seo/backlinks/route.ts',
  'app/api/seo/opportunities/route.ts',
  'app/api/seo/optimize-three-kings/route.ts',
  'app/api/seo/content/generate/route.ts',
  'app/api/seo/analyze-intent/route.ts',
  'app/api/seo/request-reindex/route.ts',
  'app/api/seo/keywords/research/route.ts',
  'app/api/seo/projects/route.ts',
  'app/api/seo/analytics/route.ts',
  'app/api/contact/suggestion/route.ts',
  'app/api/folders/route.ts',
  'app/api/email-history/route.ts',
  'app/api/documents/[id]/route.ts',
  'app/api/documents/route.ts',
  'app/api/usage-stats/route.ts',
  'app/api/voice-guide/preferences/route.ts',
  'app/api/voice-guide/generate-speech/route.ts',
  'app/api/voice-guide/content/route.ts',
  'page-middleware.ts'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove Supabase imports
    content = content.replace(/import\s+{\s*createClient\s*}\s+from\s+['"]@supabase\/supabase-js['"];?\s*\n/g, '');
    
    // Remove getSupabaseClient function definition (but keep the function calls for now)
    content = content.replace(/function\s+getSupabaseClient\(\)\s*{\s*const\s+supabaseUrl[\s\S]*?return\s+null;\s*}\s*}\s*\n*/g, '');
    
    // Replace getSupabaseClient() calls with null
    content = content.replace(/const\s+supabase\s*=\s*getSupabaseClient\(\);/g, 'const supabase = null;');
    
    // Remove Supabase client availability checks that return 503
    content = content.replace(/\s*\/\/\s*Check if Supabase client is available\s*\n\s*if\s*\(!supabase\)\s*{\s*console\.warn\([^)]+\);\s*return\s+NextResponse\.json\([^}]+},\s*{\s*status:\s*503\s*}\);\s*}\s*/g, '');
    
    // Clean up multiple empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing Supabase routes properly...\n');

let fixedCount = 0;
filesToFix.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fix complete! ${fixedCount} files fixed.`);
console.log('\n📝 Note: Routes will now return errors when Supabase operations are attempted.');
console.log('This is expected - these routes need to be migrated to use Clerk or alternative storage.');
