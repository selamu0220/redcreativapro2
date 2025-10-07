const fs = require('fs');
const path = require('path');

// List of files that need to be fixed
const filesToFix = [
  'app/api/subscription/create/route.ts',
  'app/api/subscription/cancel/route.ts',
  'app/api/seo/keywords/research/route.ts',
  'app/api/seo/opportunities/route.ts',
  'app/api/seo/backlinks/route.ts',
  'app/api/seo/analytics/route.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/api/seo/optimize-three-kings/route.ts',
  'app/api/contact/suggestion/route.ts',
  'app/api/user/profile/route.ts',
  'app/api/seo/request-reindex/route.ts',
  'app/api/seo/projects/route.ts',
  'app/api/seo/content/generate/route.ts',
  'app/api/seo/analyze-intent/route.ts'
];

// Function to fix a single file
function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace the throw error with console.warn and return null
  const oldPattern = `  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);`;

  const newPattern = `  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Missing Supabase environment variables during build');
    return null;
  }
  
  // Validar URL
  try {
    new URL(supabaseUrl);
  } catch {
    console.warn('Invalid Supabase URL during build');
    return null;
  }
  
  try {
    return createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.warn('Failed to create Supabase client during build:', error);
    return null;
  }`;

  if (content.includes("throw new Error('Missing Supabase environment variables')")) {
    content = content.replace(oldPattern, newPattern);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  Already fixed or different pattern: ${filePath}`);
  }
}

// Function to add null checks to route handlers
function addNullChecks(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Add null check after getSupabaseClient() calls
  const patterns = [
    {
      old: /const supabase = getSupabaseClient\(\);\s*\n/g,
      new: `const supabase = getSupabaseClient();
    
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
`
    }
  ];

  let modified = false;
  patterns.forEach(pattern => {
    if (pattern.old.test(content) && !content.includes('if (!supabase)')) {
      content = content.replace(pattern.old, pattern.new);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Added null checks: ${filePath}`);
  } else {
    console.log(`ℹ️  Null checks already present or no pattern found: ${filePath}`);
  }
}

// Main execution
console.log('🔧 Fixing Supabase build errors...\n');

filesToFix.forEach(file => {
  console.log(`\n📁 Processing: ${file}`);
  fixFile(file);
  addNullChecks(file);
});

console.log('\n✨ All files processed!');