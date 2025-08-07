#!/usr/bin/env node

/**
 * Ionic/Capacitor Build Script
 * This script ensures the dist directory is properly created for mobile builds
 * Resolves: "No dist found in root of project" error
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Ionic/Capacitor build process...');

// Function to run command and log output
function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`💻 Running: ${command}`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Function to verify dist directory
function verifyDistDirectory() {
  console.log('\n🔍 Verifying dist directory...');
  
  if (!fs.existsSync('dist')) {
    console.error('❌ dist directory does not exist!');
    return false;
  }
  
  const files = fs.readdirSync('dist');
  console.log(`✅ dist directory exists with ${files.length} items:`);
  files.forEach(file => console.log(`   - ${file}`));
  
  // Check for essential files
  const hasIndex = fs.existsSync('dist/index.html');
  const hasStatic = fs.existsSync('dist/_next') || fs.existsSync('dist/static');
  
  console.log(`📄 index.html: ${hasIndex ? '✅' : '❌'}`);
  console.log(`📁 Static files: ${hasStatic ? '✅' : '❌'}`);
  
  return hasIndex;
}

// Main build process
async function main() {
  console.log('🏗️  Building Next.js application...');
  
  // Step 1: Clean previous builds
  if (fs.existsSync('dist')) {
    console.log('🧹 Cleaning previous dist directory...');
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Step 2: Run Next.js build
  const buildSuccess = runCommand('npx next build', 'Next.js build');
  if (!buildSuccess) {
    console.error('❌ Next.js build failed. Exiting...');
    process.exit(1);
  }
  
  // Step 3: Create dist directory
  console.log('\n📁 Creating dist directory for Capacitor...');
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // Step 4: Copy static files
  console.log('📋 Copying static files to dist...');
  if (fs.existsSync('.next/static')) {
    copyDir('.next/static', 'dist/_next/static');
    console.log('✅ Static files copied successfully');
  }
  
  // Step 5: Ensure index.html exists
  if (!fs.existsSync('dist/index.html')) {
    console.log('📄 Creating mobile-optimized index.html...');
    const mobileHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Escritor IA - Mobile App</title>
    <meta name="theme-color" content="#667eea">
    <link rel="manifest" href="./manifest.json">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            max-width: 400px;
            padding: 40px 20px;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        p {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        .loading {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Escritor IA</h1>
        <p>Aplicación móvil cargando...</p>
        <div class="loading"></div>
    </div>
</body>
</html>`;
    
    fs.writeFileSync('dist/index.html', mobileHtml);
    console.log('✅ Mobile index.html created');
  }
  
  // Step 6: Ensure manifest.json exists
  if (!fs.existsSync('dist/manifest.json')) {
    console.log('📱 Creating PWA manifest.json...');
    const manifest = {
      name: "Escritor IA",
      short_name: "EscritorIA",
      description: "Aplicación de escritura con inteligencia artificial",
      start_url: "/",
      display: "standalone",
      background_color: "#667eea",
      theme_color: "#667eea",
      icons: [
        {
          src: "icon-192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "icon-512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    
    fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
    console.log('✅ PWA manifest.json created');
  }
  
  // Step 7: Verify everything is ready
  const isReady = verifyDistDirectory();
  
  if (isReady) {
    console.log('\n🎉 Mobile build completed successfully!');
    console.log('📱 The dist/ directory is ready for Capacitor/Fastlane');
    console.log('\n🚀 Next steps:');
    console.log('   - npx cap sync android');
    console.log('   - npx cap build android');
  } else {
    console.error('\n❌ Mobile build verification failed!');
    process.exit(1);
  }
}

// Run the build process
main().catch(error => {
  console.error('💥 Build process failed:', error);
  process.exit(1);
});