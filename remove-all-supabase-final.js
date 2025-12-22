const fs = require('fs');
const path = require('path');

// Files that need complete Supabase removal
const filesToClean = [
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
  'app/lib/subscription/SubscriptionStatusService.ts'
];

function cleanFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove Supabase imports
    content = content.replace(/import\s+{\s*createClient\s*}\s+from\s+['"]@supabase\/supabase-js['"];?\s*/g, '');
    content = content.replace(/import\s+{\s*getSupabaseClient\s*}\s+from\s+['"]\.\.[\/\\]+lib[\/\\]db['"];?\s*/g, '');
    content = content.replace(/import\s+{\s*getSupabaseClient\s*}\s+from\s+['"]\.\.[\/\\]+\.\.[\/\\]+lib[\/\\]db['"];?\s*/g, '');
    content = content.replace(/import\s+{\s*getSupabaseClient\s*}\s+from\s+['"]\.\.[\/\\]+\.\.[\/\\]+\.\.[\/\\]+lib[\/\\]db['"];?\s*/g, '');

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

console.log('🧹 Starting complete Supabase removal...\n');

let cleanedCount = 0;
filesToClean.forEach(file => {
  if (cleanFile(file)) {
    cleanedCount++;
  }
});

console.log(`\n✨ Cleanup complete! ${cleanedCount} files cleaned.`);
console.log('\n📝 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Remove SUPABASE_* environment variables from Vercel dashboard');
console.log('3. Deploy to production');
