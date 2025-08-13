#!/usr/bin/env node

/**
 * Build Validation Script
 * 
 * This script validates that build commands work correctly and provides
 * specific guidance for fixing the "cd client" deployment error.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Build Validation Script');
console.log('===========================\n');

// Test actual build commands
function validateBuildCommands() {
    console.log('🧪 Testing actual build commands...\n');
    
    const tests = [
        {
            name: 'npm install',
            command: 'npm install',
            description: 'Install dependencies from root package.json'
        },
        {
            name: 'npm run build',
            command: 'npm run build',
            description: 'Build Next.js application'
        },
        {
            name: 'npm run build:ionic',
            command: 'npm run build:ionic',
            description: 'Build mobile version'
        }
    ];
    
    const results = {};
    
    tests.forEach(test => {
        console.log(`Testing: ${test.name}`);
        console.log(`Command: ${test.command}`);
        console.log(`Purpose: ${test.description}`);
        
        try {
            const startTime = Date.now();
            execSync(test.command, { 
                stdio: 'pipe',
                timeout: 300000 // 5 minutes timeout
            });
            const duration = Date.now() - startTime;
            
            console.log(`✅ SUCCESS - Completed in ${duration}ms\n`);
            results[test.name] = { success: true, duration };
            
        } catch (error) {
            console.log(`❌ FAILED - ${error.message}\n`);
            results[test.name] = { success: false, error: error.message };
        }
    });
    
    return results;
}

// Validate required directories and files exist
function validateProjectStructure() {
    console.log('📁 Validating project structure...\n');
    
    const requirements = [
        { path: 'package.json', type: 'file', critical: true },
        { path: 'next.config.js', type: 'file', critical: true },
        { path: 'app', type: 'directory', critical: true },
        { path: 'public', type: 'directory', critical: true },
        { path: '.next', type: 'directory', critical: false },
        { path: 'node_modules', type: 'directory', critical: false }
    ];
    
    const issues = [];
    
    requirements.forEach(req => {
        const exists = fs.existsSync(req.path);
        const status = exists ? '✅' : (req.critical ? '❌' : '⚠️');
        const urgency = req.critical ? 'CRITICAL' : 'Optional';
        
        console.log(`${status} ${req.path} (${req.type}) - ${urgency}`);
        
        if (!exists && req.critical) {
            issues.push(`Missing critical ${req.type}: ${req.path}`);
        }
    });
    
    // Check for problematic directories
    if (fs.existsSync('client')) {
        console.log('⚠️  WARNING: "client" directory exists - this may cause confusion');
        issues.push('Unexpected "client" directory found');
    }
    
    console.log();
    return issues;
}

// Check build output
function validateBuildOutput() {
    console.log('📤 Validating build output...\n');
    
    const outputs = [
        { path: '.next', description: 'Next.js build output' },
        { path: '.next/static', description: 'Static assets' },
        { path: '.next/server', description: 'Server components' },
        { path: 'dist', description: 'Mobile build output (if exists)' }
    ];
    
    outputs.forEach(output => {
        if (fs.existsSync(output.path)) {
            try {
                const stats = fs.statSync(output.path);
                const files = fs.readdirSync(output.path).length;
                console.log(`✅ ${output.path} - ${files} items, modified: ${stats.mtime.toISOString()}`);
            } catch (error) {
                console.log(`⚠️  ${output.path} - exists but cannot read details`);
            }
        } else {
            console.log(`⚪ ${output.path} - not found`);
        }
    });
    
    console.log();
}

// Generate platform-specific fix instructions
function generateFixInstructions() {
    console.log('🔧 Platform-Specific Fix Instructions');
    console.log('=====================================\n');
    
    const platforms = {
        'Vercel': {
            steps: [
                '1. Go to your Vercel dashboard',
                '2. Select your project',
                '3. Go to Settings > General',
                '4. In "Build & Output Settings":',
                '   - Build Command: npm run build',
                '   - Output Directory: .next',
                '   - Install Command: npm install',
                '5. Save and redeploy'
            ],
            note: 'Vercel should auto-detect Next.js projects'
        },
        'Render': {
            steps: [
                '1. Go to your Render dashboard',
                '2. Select your web service',
                '3. Go to Settings',
                '4. If using Docker: ensure Dockerfile is correct',
                '5. If using Node: set Build Command to "npm run build"',
                '6. Set Start Command to "npm start"',
                '7. Save and redeploy'
            ],
            note: 'Check if Docker or Node environment is selected'
        },
        'Netlify': {
            steps: [
                '1. Go to your Netlify dashboard',
                '2. Select your site',
                '3. Go to Site Settings > Build & Deploy',
                '4. In "Build settings":',
                '   - Build command: npm run build',
                '   - Publish directory: .next',
                '5. Save and redeploy'
            ],
            note: 'May need to use "npm run build && npm run export" for static export'
        },
        'GitHub Actions': {
            steps: [
                '1. Check .github/workflows/ directory',
                '2. Look for workflow files (.yml or .yaml)',
                '3. Find build steps and remove "cd client"',
                '4. Use: npm install && npm run build',
                '5. Commit and push changes'
            ],
            note: 'Workflow files are stored in the repository'
        }
    };
    
    Object.entries(platforms).forEach(([platform, config]) => {
        console.log(`### ${platform}`);
        config.steps.forEach(step => console.log(`   ${step}`));
        console.log(`   📝 Note: ${config.note}\n`);
    });
}

// Main validation function
function runValidation() {
    console.log('🚀 Starting comprehensive build validation...\n');
    
    // Run all validations
    const structureIssues = validateProjectStructure();
    validateBuildOutput();
    const buildResults = validateBuildCommands();
    
    // Summary
    console.log('📊 Validation Summary');
    console.log('====================\n');
    
    if (structureIssues.length === 0) {
        console.log('✅ Project structure is valid');
    } else {
        console.log('❌ Project structure issues:');
        structureIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    const buildSuccess = Object.values(buildResults).every(result => result.success);
    if (buildSuccess) {
        console.log('✅ All build commands work correctly');
    } else {
        console.log('❌ Some build commands failed:');
        Object.entries(buildResults).forEach(([name, result]) => {
            if (!result.success) {
                console.log(`   - ${name}: ${result.error}`);
            }
        });
    }
    
    console.log('\n🎯 CONCLUSION:');
    if (buildSuccess && structureIssues.length === 0) {
        console.log('✅ Your repository configuration is CORRECT!');
        console.log('❌ The "cd client" error is coming from your deployment platform settings.');
        console.log('\n💡 Next steps:');
        console.log('1. Check your deployment platform dashboard');
        console.log('2. Look for build command settings');
        console.log('3. Remove any "cd client" commands');
        console.log('4. Use the correct commands: npm install && npm run build');
        
        generateFixInstructions();
    } else {
        console.log('❌ Fix the repository issues first, then check deployment settings.');
    }
    
    return {
        structureValid: structureIssues.length === 0,
        buildValid: buildSuccess,
        buildResults,
        structureIssues
    };
}

// Export for use in other scripts
module.exports = { runValidation };

// Run validation if executed directly
if (require.main === module) {
    runValidation();
}