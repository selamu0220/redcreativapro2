const fs = require('fs');
const path = require('path');

// List of files that need to be fixed
const filesToFix = [
  'app/api/user/profile/route.ts',
  'app/api/subscription/cancel/route.ts',
  'app/api/subscription/status/route.ts',
  'app/api/seo/opportunities/route.ts',
  'app/api/seo/optimize-three-kings/route.ts',
  'app/api/seo/keywords/research/route.ts',
  'app/api/seo/request-reindex/route.ts',
  'app/api/seo/projects/route.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/api/subscription/create/route.ts',
  'app/api/seo/content/generate/route.ts',
  'app/api/seo/backlinks/route.ts',
  'app/api/seo/analyze-intent/route.ts',
  'app/api/seo/analytics/route.ts'
];

function fixSupabaseUsage(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Find all function definitions (GET, POST, PUT, DELETE, etc.)
  const functionPattern = /export async function (GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{/g;
  let match;
  const functions = [];
  
  while ((match = functionPattern.exec(content)) !== null) {
    functions.push({
      method: match[1],
      start: match.index,
      end: findFunctionEnd(content, match.index)
    });
  }
  
  // Process each function
  functions.reverse().forEach(func => {
    const functionContent = content.slice(func.start, func.end);
    
    // Check if this function uses supabase
    if (functionContent.includes('await supabase') && !functionContent.includes('const supabase = getSupabaseClient()')) {
      // Find the opening brace of the function
      const openBraceIndex = functionContent.indexOf('{');
      const beforeBrace = functionContent.slice(0, openBraceIndex + 1);
      const afterBrace = functionContent.slice(openBraceIndex + 1);
      
      // Add supabase initialization at the beginning of the function
      const newFunctionContent = beforeBrace + '\n  const supabase = getSupabaseClient();\n' + afterBrace;
      
      // Replace in the main content
      content = content.slice(0, func.start) + newFunctionContent + content.slice(func.end);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed supabase usage in: ${filePath}`);
  } else {
    console.log(`No changes needed in: ${filePath}`);
  }
}

function findFunctionEnd(content, startIndex) {
  let braceCount = 0;
  let inFunction = false;
  
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    
    if (char === '{') {
      braceCount++;
      inFunction = true;
    } else if (char === '}') {
      braceCount--;
      if (inFunction && braceCount === 0) {
        return i + 1;
      }
    }
  }
  
  return content.length;
}

// Fix all files
filesToFix.forEach(fixSupabaseUsage);

console.log('Done fixing Supabase usage in API routes');