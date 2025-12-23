const fs = require('fs');
const path = require('path');

const directories = ['app/api', 'app/lib', 'app/components', 'src'];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

console.log('🚀 Starting deep Supabase cleanup...');

let filesProcessed = 0;
let filesModified = 0;

const processFile = (filePath) => {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  
  filesProcessed++;
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 1. Remove the annoying build warning
  content = content.replace(/console\.warn\(['"]Supabase environment variables not configured or using placeholder values['"]\);/g, '// Supabase removed (using Clerk)');
  
  // 2. Disable supabase client initialization blocks
  content = content.replace(/let supabase: any = null;[\s\S]*?if \(supabaseUrl && supabaseServiceKey && isValidSupabaseUrl\(supabaseUrl\)\) \{[\s\S]*?\}/g, 'let supabase: any = null; // Supabase disabled');
  
  // 3. Stub the remaining auth check to use Clerk instead of failing
  // This is a more complex replacement, let's target the most common pattern in usage-stats
  if (filePath.includes('usage-stats') || content.includes('supabase.auth.getUser(token)')) {
    // Add Clerk import if missing
    if (!content.includes("@clerk/nextjs/server")) {
        content = "import { getAuth } from '@clerk/nextjs/server';\n" + content;
    }
    
    // Replace supabase auth check pattern
    content = content.replace(
        /const \{ data: \{ user \}, error: authError \} = await supabase\.auth\.getUser\(token\);/g,
        "const { userId } = getAuth(request); const user = userId ? { email: (await (await fetch(`${new URL(request.url).origin}/api/current-user`, { headers: { Authorization: `Bearer ${token}` } })).json()).email } : null; const authError = !userId ? { message: 'Not authenticated' } : null;"
    );
    
    // Since we don't want to overcomplicate the replace, let's just make supabase = null and bypass the check
    content = content.replace(/if \(!supabase\) \{[\s\S]*?return NextResponse\.json\([\s\S]*?\{ error: 'Supabase not configured' \},[\s\S]*?\{ status: 500 \}[\s\S]*?\);[\s\S]*?\}/g, '// Supabase check bypassed');
  }

  // 4. Comment out supabase environment variable lookups
  content = content.replace(/const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL;/g, '// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;');
  content = content.replace(/const supabaseServiceKey = process\.env\.SUPABASE_SERVICE_ROLE_KEY;/g, '// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;');
  content = content.replace(/const supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY;/g, '// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
  }
};

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    walk(dir, processFile);
  }
});

console.log(`✅ Finished. Processed ${filesProcessed} files, modified ${filesModified} files.`);
