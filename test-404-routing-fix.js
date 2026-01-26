const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing 404 Routing Fix...\n');

// Test 1: Check if main pages exist
console.log('1. Checking if main pages exist...');
const pagesToCheck = [
  'app/page.tsx',
  'app/not-found.tsx', 
  'app/escritor-ia/page.tsx',
  'app/correos-ia/page.tsx',
  'app/prompts/page.tsx'
];

pagesToCheck.forEach(page => {
  if (fs.existsSync(page)) {
    console.log(`✅ ${page} exists`);
  } else {
    console.log(`❌ ${page} missing`);
  }
});

// Test 2: Check middleware configuration
console.log('\n2. Checking middleware configuration...');
if (fs.existsSync('middleware.ts')) {
  const middlewareContent = fs.readFileSync('middleware.ts', 'utf8');
  
  // Check for redirect rules
  const hasEscritorRedirect = middlewareContent.includes("'/escritor': '/escritor-ia'");
  const hasCorreosRedirect = middlewareContent.includes("'/correos': '/correos-ia'");
  const hasChatRedirect = middlewareContent.includes("'/chat': '/prompts'");
  
  console.log(`✅ Middleware exists`);
  console.log(`${hasEscritorRedirect ? '✅' : '❌'} Escritor redirect configured`);
  console.log(`${hasCorreosRedirect ? '✅' : '❌'} Correos redirect configured`);
  console.log(`${hasChatRedirect ? '✅' : '❌'} Chat redirect configured`);
} else {
  console.log('❌ middleware.ts missing');
}

// Test 3: Check Next.js configuration
console.log('\n3. Checking Next.js configuration...');
if (fs.existsSync('next.config.js')) {
  console.log('✅ next.config.js exists');
  
  try {
    const nextConfig = require('./next.config.js');
    console.log('✅ Next.js config loads successfully');
  } catch (error) {
    console.log('❌ Next.js config has errors:', error.message);
  }
} else {
  console.log('❌ next.config.js missing');
}

// Test 4: Check for build issues
console.log('\n4. Checking for potential build issues...');
try {
  // Check if .next directory exists
  if (fs.existsSync('.next')) {
    console.log('✅ .next build directory exists');
  } else {
    console.log('⚠️  .next build directory missing - app may need to be built');
  }
  
  // Check package.json scripts
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ package.json exists');
    
    if (packageJson.scripts && packageJson.scripts.dev) {
      console.log('✅ dev script configured');
    } else {
      console.log('❌ dev script missing');
    }
  }
} catch (error) {
  console.log('❌ Error checking build configuration:', error.message);
}

// Test 5: Check for TypeScript compilation issues
console.log('\n5. Checking TypeScript configuration...');
if (fs.existsSync('tsconfig.json')) {
  console.log('✅ tsconfig.json exists');
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    console.log('✅ TypeScript config is valid JSON');
  } catch (error) {
    console.log('❌ TypeScript config has JSON errors:', error.message);
  }
} else {
  console.log('❌ tsconfig.json missing');
}

// Test 6: Check for common routing issues
console.log('\n6. Checking for common routing issues...');

// Check layout.tsx
if (fs.existsSync('app/layout.tsx')) {
  const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
  
  if (layoutContent.includes('export default function RootLayout')) {
    console.log('✅ Root layout properly exported');
  } else {
    console.log('❌ Root layout export issue');
  }
  
  if (layoutContent.includes('children')) {
    console.log('✅ Layout renders children');
  } else {
    console.log('❌ Layout missing children rendering');
  }
} else {
  console.log('❌ app/layout.tsx missing');
}

// Test 7: Check for client-side issues
console.log('\n7. Checking for client-side issues...');
if (fs.existsSync('app/components/ClientLayout.tsx')) {
  const clientLayoutContent = fs.readFileSync('app/components/ClientLayout.tsx', 'utf8');
  
  if (clientLayoutContent.includes("'use client'")) {
    console.log('✅ ClientLayout properly marked as client component');
  } else {
    console.log('❌ ClientLayout missing client directive');
  }
} else {
  console.log('⚠️  ClientLayout component not found');
}

console.log('\n🔧 Diagnosis complete. Common solutions:');
console.log('1. Run "npm run build" to rebuild the application');
console.log('2. Run "npm run dev" to start development server');
console.log('3. Clear .next directory and rebuild if issues persist');
console.log('4. Check browser console for JavaScript errors');
console.log('5. Verify all environment variables are set correctly');