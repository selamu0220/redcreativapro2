const fs = require('fs');
const path = require('path');

// Lista de archivos API que necesitan ser arreglados
const apiFiles = [
  'app/api/subscription/cancel/route.ts',
  'app/api/subscription/check/route.ts',
  'app/api/subscription/create/route.ts',
  'app/api/subscription/status/route.ts',
  'app/api/usage-stats/route.ts',
  'app/api/seo/analyze-intent/route.ts',
  'app/api/seo/analytics/route.ts',
  'app/api/user/profile/route.ts',
  'app/api/documents/[id]/route.ts',
  'app/api/voice-guide/content/route.ts',
  'app/api/check-auth/route.ts',
  'app/api/voice-guide/preferences/route.ts',
  'app/api/check-and-register-user/route.ts',
  'app/api/all-users/route.ts',
  'app/api/current-user/route.ts',
  'app/api/voice-guide/generate-speech/route.ts',
  'app/api/users-info/route.ts',
  'app/api/auth-status/route.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/api/contact/suggestion/route.ts',
  'app/api/debug-user/route.ts',
  'app/api/test-supabase/route.ts'
];

function fixSupabaseInitialization(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Check if getSupabaseClient function exists
    if (!content.includes('function getSupabaseClient()')) {
      console.log(`⚠️  No getSupabaseClient function found in: ${filePath}`);
      return false;
    }

    // Find all HTTP method functions (GET, POST, PUT, DELETE, PATCH)
    const methodRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*\{/g;
    let match;
    const methods = [];

    while ((match = methodRegex.exec(content)) !== null) {
      methods.push({
        method: match[1],
        start: match.index,
        fullMatch: match[0]
      });
    }

    for (const methodInfo of methods) {
      const methodStart = methodInfo.start + methodInfo.fullMatch.length;
      
      // Find the opening brace and look for try block or direct supabase usage
      let searchStart = methodStart;
      let braceCount = 1;
      let i = methodStart;
      
      // Find the method body
      while (i < content.length && braceCount > 0) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        i++;
      }
      
      const methodBody = content.substring(methodStart, i - 1);
      
      // Check if this method uses supabase without initialization
      if (methodBody.includes('await supabase') && !methodBody.includes('const supabase = getSupabaseClient()')) {
        // Find where to insert the supabase initialization
        let insertPoint = methodStart;
        
        // Look for try block
        const tryMatch = methodBody.match(/\s*try\s*\{/);
        if (tryMatch) {
          insertPoint = methodStart + tryMatch.index + tryMatch[0].length;
          // Insert after try {
          const beforeInsert = content.substring(0, insertPoint);
          const afterInsert = content.substring(insertPoint);
          content = beforeInsert + '\n    const supabase = getSupabaseClient();' + afterInsert;
          modified = true;
          console.log(`✅ Fixed ${methodInfo.method} method in ${filePath} (try block)`);
        } else {
          // Insert at the beginning of the method body
          const beforeInsert = content.substring(0, insertPoint);
          const afterInsert = content.substring(insertPoint);
          content = beforeInsert + '\n  const supabase = getSupabaseClient();' + afterInsert;
          modified = true;
          console.log(`✅ Fixed ${methodInfo.method} method in ${filePath} (method start)`);
        }
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`📝 Updated file: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed for: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🚀 Starting automated Supabase client initialization fix...\n');

let totalFixed = 0;
let totalProcessed = 0;

for (const file of apiFiles) {
  console.log(`\n📁 Processing: ${file}`);
  totalProcessed++;
  
  if (fixSupabaseInitialization(file)) {
    totalFixed++;
  }
}

console.log(`\n🎉 Completed! Fixed ${totalFixed} out of ${totalProcessed} files.`);

if (totalFixed > 0) {
  console.log('\n✅ Run "npm run build" to verify all fixes are working correctly.');
} else {
  console.log('\n⚠️  No files were modified. All files may already be correctly configured.');
}