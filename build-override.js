#!/usr/bin/env node

/**
 * Build Override Script
 * This script forces the correct build command for CI/CD systems
 * that might not recognize our custom scripts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Build Override: Forcing correct mobile build...');

// Check if we're in a CI/CD environment or if mobile build is needed
const isCI = process.env.CI || process.env.GITLAB_CI || process.env.GITHUB_ACTIONS;
const isIonicAppflow = process.env.IONIC_CLI_VERSION || process.env.CAPACITOR_WEB_DIR || process.env.PROJECT_WEB_DIR;
const needsMobileBuild = isIonicAppflow || 
                       process.argv.includes('--mobile') || 
                       fs.existsSync('capacitor.config.json') ||
                       fs.existsSync('ionic.config.json') ||
                       fs.existsSync('appflow.config.json');

if (isCI || needsMobileBuild) {
  if (isCI) {
    console.log('🤖 CI/CD environment detected');
  }
  if (isIonicAppflow) {
    console.log('⚡ Ionic Appflow environment detected');
    console.log('📊 Environment variables:');
    console.log(`   IONIC_CLI_VERSION: ${process.env.IONIC_CLI_VERSION || 'not set'}`);
    console.log(`   CAPACITOR_WEB_DIR: ${process.env.CAPACITOR_WEB_DIR || 'not set'}`);
    console.log(`   PROJECT_WEB_DIR: ${process.env.PROJECT_WEB_DIR || 'not set'}`);
  }
  if (!isCI && !isIonicAppflow) {
    console.log('📱 Mobile build environment detected');
  }
  console.log('📱 Forcing mobile build process...');
  
  try {
    // Force the ionic build command
    console.log('💻 Executing: npm run build:ionic');
    execSync('npm run build:ionic', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // Verify the build
    if (fs.existsSync('dist')) {
      console.log('✅ SUCCESS: dist directory created!');
      const files = fs.readdirSync('dist');
      console.log(`📁 dist contains ${files.length} items:`);
      files.forEach(file => console.log(`   - ${file}`));
    } else {
      console.error('❌ FAILED: dist directory not found!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Build failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('🏠 Local web environment detected');
  console.log('💡 Use: npm run build:ionic for mobile builds');
  console.log('💡 Use: npm run build:web for web builds');
  console.log('🔄 Falling back to standard Next.js build...');
  
  try {
    execSync('npm run build:web', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('💥 Web build failed:', error.message);
    process.exit(1);
  }
}