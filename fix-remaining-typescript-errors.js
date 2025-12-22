const fs = require('fs');

const fixes = [
  // Fix db.ts duplicate export
  {
    file: 'app/lib/db.ts',
    content: `// Database connection stub - Supabase removed, using Clerk
export async function getDbConnection(userId?: string) {
  // Database connections are no longer used
  return null;
}
`
  },
  
  // Fix voice-guide routes that still reference createClient
  {
    file: 'app/api/voice-guide/content/route.ts',
    find: /supabase\s*=\s*createClient\([^)]+\);/g,
    replace: 'supabase = null; // Supabase removed'
  },
  {
    file: 'app/api/voice-guide/generate-speech/route.ts',
    find: /supabase\s*=\s*createClient\([^)]+\);/g,
    replace: 'supabase = null; // Supabase removed'
  },
  {
    file: 'app/api/voice-guide/preferences/route.ts',
    find: /supabase\s*=\s*createClient\([^)]+\);/g,
    replace: 'supabase = null; // Supabase removed'
  },
  {
    file: 'app/api/usage-stats/route.ts',
    find: /supabase\s*=\s*createClient\([^)]+\);/g,
    replace: 'supabase = null; // Supabase removed'
  },
  {
    file: 'page-middleware.ts',
    find: /supabase\s*=\s*createClient\([^)]+\);/g,
    replace: 'supabase = null; // Supabase removed'
  },
  
  // Fix usage-stats missing await
  {
    file: 'app/api/usage-stats/route.ts',
    find: /const\s+userUsageData\s*=\s*allUsageData\.filter/g,
    replace: 'const userUsageData = (await allUsageData).filter'
  },
  
  // Remove getSupabaseClient imports
  {
    file: 'app/api/documents/[id]/route.ts',
    find: /import\s+{\s*getSupabaseClient\s*}\s+from\s+['"]\.\.[\/\\]+\.\.[\/\\]+\.\.[\/\\]+lib[\/\\]db['"];?\s*/g,
    replace: ''
  },
  {
    file: 'app/api/documents/route.ts',
    find: /import\s+{\s*getSupabaseClient\s*}\s+from\s+['"]\.\.[\/\\]+\.\.[\/\\]+lib[\/\\]db['"];?\s*/g,
    replace: ''
  },
  {
    file: 'app/api/email-history/route.ts',
    find: /import\s+{\s*getSupabaseClient\s*}\s+from\s+['"]\.\.[\/\\]+\.\.[\/\\]+lib[\/\\]db['"];?\s*/g,
    replace: ''
  },
  {
    file: 'app/api/folders/route.ts',
    find: /import\s+{\s*getSupabaseClient\s*}\s+from\s+['"]\.\.[\/\\]+\.\.[\/\\]+lib[\/\\]db['"];?\s*/g,
    replace: ''
  },
  
  // Remove Supabase import from src/contexts/VoiceGuideContext.tsx
  {
    file: 'src/contexts/VoiceGuideContext.tsx',
    find: /import\s+{\s*createClient\s*}\s+from\s+['"]@supabase\/supabase-js['"];?\s*/g,
    replace: ''
  }
];

console.log('🔧 Fixing remaining TypeScript errors...\n');

let fixedCount = 0;

fixes.forEach(fix => {
  try {
    if (!fs.existsSync(fix.file)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      return;
    }

    if (fix.content) {
      // Replace entire file content
      fs.writeFileSync(fix.file, fix.content, 'utf8');
      console.log(`✅ Replaced: ${fix.file}`);
      fixedCount++;
    } else if (fix.find && fix.replace !== undefined) {
      // Find and replace
      let content = fs.readFileSync(fix.file, 'utf8');
      const originalContent = content;
      content = content.replace(fix.find, fix.replace);
      
      if (content !== originalContent) {
        fs.writeFileSync(fix.file, content, 'utf8');
        console.log(`✅ Fixed: ${fix.file}`);
        fixedCount++;
      } else {
        console.log(`ℹ️  No changes needed: ${fix.file}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files!`);
