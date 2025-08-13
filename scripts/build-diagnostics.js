#!/usr/bin/env node

/**
 * Build Diagnostics Script
 * 
 * This script verifies the current build configuration and identifies potential issues
 * that could cause the "cd client" error during deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Build Configuration Diagnostics');
console.log('=====================================\n');

// Check if we're in the correct directory
function checkProjectStructure() {
    console.log('📁 Checking project structure...');
    
    const requiredFiles = [
        'package.json',
        'next.config.js',
        'app',
        'public'
    ];
    
    const missingFiles = [];
    
    requiredFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            missingFiles.push(file);
        }
    });
    
    if (missingFiles.length > 0) {
        console.log('❌ Missing required files/directories:', missingFiles);
        return false;
    }
    
    console.log('✅ All required files/directories present');
    
    // Check if there's a client directory (which shouldn't exist)
    if (fs.existsSync('client')) {
        console.log('⚠️  WARNING: "client" directory exists - this might be causing confusion');
        console.log('   Contents:', fs.readdirSync('client'));
    } else {
        console.log('✅ No "client" directory found (this is correct)');
    }
    
    return true;
}

// Verify package.json build scripts
function checkPackageJsonScripts() {
    console.log('\n📦 Checking package.json scripts...');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        console.log('Available scripts:');
        Object.entries(packageJson.scripts || {}).forEach(([name, command]) => {
            console.log(`  ${name}: ${command}`);
        });
        
        // Check for correct build script
        if (packageJson.scripts.build === 'next build') {
            console.log('✅ Build script is correctly configured');
        } else {
            console.log('⚠️  Build script might be incorrect:', packageJson.scripts.build);
        }
        
        return true;
    } catch (error) {
        console.log('❌ Error reading package.json:', error.message);
        return false;
    }
}

// Test build commands locally
function testBuildCommands() {
    console.log('\n🔨 Testing build commands...');
    
    try {
        // Test if npm install works
        console.log('Testing: npm install --dry-run');
        execSync('npm install --dry-run', { stdio: 'pipe' });
        console.log('✅ npm install command works');
        
        // Check if node_modules exists
        if (fs.existsSync('node_modules')) {
            console.log('✅ node_modules directory exists');
        } else {
            console.log('⚠️  node_modules directory not found - run npm install first');
        }
        
        // Test build command (dry run)
        console.log('Testing: npm run build (checking if script exists)');
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (packageJson.scripts && packageJson.scripts.build) {
            console.log('✅ Build script exists and can be executed');
        } else {
            console.log('❌ Build script not found in package.json');
        }
        
        return true;
    } catch (error) {
        console.log('❌ Error testing build commands:', error.message);
        return false;
    }
}

// Check deployment configuration files
function checkDeploymentConfigs() {
    console.log('\n🚀 Checking deployment configurations...');
    
    const configs = [
        { file: 'vercel.json', type: 'Vercel' },
        { file: 'render.yaml', type: 'Render' },
        { file: '.gitlab-ci.yml', type: 'GitLab CI' },
        { file: 'Dockerfile', type: 'Docker' }
    ];
    
    configs.forEach(({ file, type }) => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${type} config found: ${file}`);
            
            // Read and check for problematic commands
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('cd client')) {
                console.log(`❌ FOUND ISSUE: ${file} contains "cd client" command`);
                console.log('   This is likely the source of the build error!');
            } else {
                console.log(`   No "cd client" commands found in ${file}`);
            }
        } else {
            console.log(`⚪ ${type} config not found: ${file}`);
        }
    });
}

// Check for common build output directories
function checkBuildOutput() {
    console.log('\n📤 Checking build output directories...');
    
    const outputDirs = ['.next', 'dist', 'build', 'out'];
    
    outputDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            console.log(`✅ ${dir} directory exists`);
            try {
                const stats = fs.statSync(dir);
                console.log(`   Last modified: ${stats.mtime.toISOString()}`);
            } catch (error) {
                console.log(`   Could not read stats: ${error.message}`);
            }
        } else {
            console.log(`⚪ ${dir} directory not found`);
        }
    });
}

// Main diagnostic function
function runDiagnostics() {
    console.log('Starting build diagnostics...\n');
    
    const results = {
        structure: checkProjectStructure(),
        packageJson: checkPackageJsonScripts(),
        buildCommands: testBuildCommands(),
        deploymentConfigs: checkDeploymentConfigs(),
        buildOutput: checkBuildOutput()
    };
    
    console.log('\n📊 Diagnostic Summary');
    console.log('=====================');
    
    Object.entries(results).forEach(([check, passed]) => {
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${check}`);
    });
    
    console.log('\n💡 Recommendations:');
    console.log('- If any config file contains "cd client", remove that command');
    console.log('- Ensure all build commands run from the root directory');
    console.log('- Use "npm install" and "npm run build" without directory changes');
    console.log('- Verify deployment platform settings match these configurations');
    
    return results;
}

// Run diagnostics if this script is executed directly
if (require.main === module) {
    runDiagnostics();
}

module.exports = { runDiagnostics };