#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting Ionic build process...');

// Run Next.js build
try {
  console.log('Running next build...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Next.js build completed successfully');
} catch (error) {
  console.error('Next.js build failed:', error.message);
  process.exit(1);
}

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Function to copy files with pattern
function copyFiles(srcDir, destDir, pattern) {
  if (!fs.existsSync(srcDir)) {
    console.log(`Source directory ${srcDir} does not exist, skipping...`);
    return;
  }
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const files = fs.readdirSync(srcDir).filter(file => file.match(pattern));
  
  files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${file}`);
  });
}

// Create dist directory
if (fs.existsSync('dist')) {
  console.log('Removing existing dist directory...');
  fs.rmSync('dist', { recursive: true, force: true });
}

fs.mkdirSync('dist', { recursive: true });
console.log('Created dist directory');

// Copy static files
if (fs.existsSync('.next/out')) {
  console.log('Copying from .next/out...');
  copyDir('.next/out', 'dist');
} else {
  console.log('Copying from .next/static and .next/server/app...');
  
  // Copy static assets
  if (fs.existsSync('.next/static')) {
    copyDir('.next/static', 'dist/_next/static');
    console.log('Static assets copied');
  }
  
  // Copy HTML files
  if (fs.existsSync('.next/server/app')) {
    copyFiles('.next/server/app', 'dist', /\.html$/);
    console.log('HTML files copied');
  }
  
  // Copy chunks if they exist
  if (fs.existsSync('.next/static/chunks')) {
    copyDir('.next/static/chunks', 'dist/chunks');
    console.log('Chunks copied');
  }
  
  // Copy CSS if it exists
  if (fs.existsSync('.next/static/css')) {
    copyDir('.next/static/css', 'dist/css');
    console.log('CSS files copied');
  }
}

// Verify dist directory contents
if (fs.existsSync('dist')) {
  const distContents = fs.readdirSync('dist');
  console.log('\nDist directory contents:');
  distContents.forEach(item => {
    console.log(`  - ${item}`);
  });
  
  if (distContents.length === 0) {
    console.error('ERROR: dist directory is empty!');
    process.exit(1);
  }
} else {
  console.error('ERROR: dist directory was not created!');
  process.exit(1);
}

console.log('\nIonic build process completed successfully!');
console.log(`Total files in dist: ${fs.readdirSync('dist').length}`);