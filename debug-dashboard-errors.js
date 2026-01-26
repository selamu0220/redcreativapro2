// Debug script to identify specific dashboard errors
console.log('🔍 Debugging Dashboard Errors...');

const fs = require('fs');
const path = require('path');

// Function to check if a file exists and read its content
function checkFile(filePath, description) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      console.log(`✅ ${description}: EXISTS`);
      return { exists: true, content };
    } else {
      console.log(`❌ ${description}: MISSING`);
      return { exists: false, content: null };
    }
  } catch (error) {
    console.log(`❌ ${description}: ERROR - ${error.message}`);
    return { exists: false, content: null };
  }
}

// Function to check for common import issues
function checkImports(content, filePath) {
  const issues = [];
  
  // Check for problematic imports
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('import') && line.includes('from')) {
      // Check for relative imports that might be broken
      if (line.includes('../../../') || line.includes('../../')) {
        issues.push(`Line ${index + 1}: Deep relative import - ${line.trim()}`);
      }
      
      // Check for missing file extensions in imports
      if (line.includes('./') && !line.includes('.ts') && !line.includes('.tsx') && !line.includes('.js')) {
        const importPath = line.match(/from ['"](.+)['"]/);
        if (importPath && importPath[1].startsWith('./')) {
          issues.push(`Line ${index + 1}: Possible missing extension - ${line.trim()}`);
        }
      }
    }
  });
  
  return issues;
}

// Check all critical files
console.log('\n📋 Checking Critical Files...\n');

const criticalFiles = [
  { path: 'lib/utils.ts', desc: 'Utils Library' },
  { path: 'app/components/ui/card.tsx', desc: 'Card Component' },
  { path: 'app/components/ui/button.tsx', desc: 'Button Component' },
  { path: 'app/components/ui/badge.tsx', desc: 'Badge Component' },
  { path: 'app/components/ui/separator.tsx', desc: 'Separator Component' },
  { path: 'app/components/WorkingClientLayout.tsx', desc: 'Working Client Layout' },
  { path: 'app/components/WorkingAuthProvider.tsx', desc: 'Working Auth Provider' },
  { path: 'app/components/ToastProvider.tsx', desc: 'Toast Provider' },
  { path: 'app/hooks/useAuth.ts', desc: 'useAuth Hook' },
  { path: 'app/hooks/usePremiumAccess.ts', desc: 'usePremiumAccess Hook' },
  { path: 'app/hooks/useGuestTrial.ts', desc: 'useGuestTrial Hook' },
  { path: 'app/contexts/AuthContext.tsx', desc: 'Auth Context' },
  { path: 'components/animations/PageAnimations.tsx', desc: 'Page Animations' },
  { path: 'app/components/GuestTrialInterface.tsx', desc: 'Guest Trial Interface' },
  { path: 'app/components/VideoModal.tsx', desc: 'Video Modal' }
];

let allFilesExist = true;
const importIssues = [];

criticalFiles.forEach(file => {
  const result = checkFile(file.path, file.desc);
  if (!result.exists) {
    allFilesExist = false;
  } else if (result.content) {
    const issues = checkImports(result.content, file.path);
    if (issues.length > 0) {
      importIssues.push({ file: file.path, issues });
    }
  }
});

console.log('\n🔍 Import Issues Analysis...\n');

if (importIssues.length === 0) {
  console.log('✅ No obvious import issues found');
} else {
  importIssues.forEach(({ file, issues }) => {
    console.log(`❌ Issues in ${file}:`);
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('');
  });
}

// Check for specific patterns that might cause "Cannot read properties of undefined"
console.log('\n🔍 Checking for Undefined Property Access Patterns...\n');

const dashboardResult = checkFile('app/dashboard/page.tsx', 'Dashboard Page');
if (dashboardResult.exists && dashboardResult.content) {
  const content = dashboardResult.content;
  
  // Check for potential undefined access patterns
  const patterns = [
    { regex: /\.\w+\(/g, desc: 'Method calls' },
    { regex: /\[\w+\]/g, desc: 'Property access with brackets' },
    { regex: /\?\./g, desc: 'Optional chaining (good)' },
    { regex: /&&\s*\w+\./g, desc: 'Conditional property access (good)' }
  ];
  
  patterns.forEach(({ regex, desc }) => {
    const matches = content.match(regex);
    if (matches) {
      console.log(`📊 Found ${matches.length} instances of ${desc}`);
      if (desc.includes('Method calls') && matches.length > 50) {
        console.log('⚠️  High number of method calls - potential source of undefined errors');
      }
    }
  });
  
  // Check for specific problematic patterns
  const problematicPatterns = [
    'user.user_metadata.name',
    'user.email.split',
    'subscription.unsubscribe(',
    '.localeCompare(',
    'context.user.',
    'authUser.uid'
  ];
  
  console.log('\n🔍 Checking for Known Problematic Patterns...\n');
  
  problematicPatterns.forEach(pattern => {
    if (content.includes(pattern)) {
      console.log(`⚠️  Found potentially problematic pattern: ${pattern}`);
    }
  });
}

// Summary
console.log('\n📋 Summary...\n');

if (allFilesExist) {
  console.log('✅ All critical files exist');
} else {
  console.log('❌ Some critical files are missing');
}

if (importIssues.length === 0) {
  console.log('✅ No obvious import issues');
} else {
  console.log(`❌ Found ${importIssues.length} files with import issues`);
}

console.log('\n🔧 Recommendations:');
console.log('1. Check browser console for specific error messages');
console.log('2. Verify all imports are resolving correctly');
console.log('3. Check for null/undefined checks before property access');
console.log('4. Ensure all providers are properly wrapped');
console.log('5. Test with simplified component versions');

console.log('\n✅ Debug analysis complete!');