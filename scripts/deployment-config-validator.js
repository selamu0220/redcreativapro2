#!/usr/bin/env node

/**
 * Deployment Configuration Validator
 * Validates deployment configuration files for correct paths and settings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentConfigValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        
        switch (type) {
            case 'error':
                this.errors.push(logMessage);
                console.error(`❌ ${message}`);
                break;
            case 'warning':
                this.warnings.push(logMessage);
                console.warn(`⚠️  ${message}`);
                break;
            default:
                this.info.push(logMessage);
                console.log(`ℹ️  ${message}`);
        }
    }

    validateVercelConfig() {
        const configPath = 'vercel.json';
        
        if (!fs.existsSync(configPath)) {
            this.log('vercel.json not found', 'warning');
            return;
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // Check framework
            if (config.framework !== 'nextjs') {
                this.log(`vercel.json: Framework should be 'nextjs', found '${config.framework}'`, 'warning');
            }

            // Check build command
            if (config.buildCommand && !config.buildCommand.includes('npm run build')) {
                this.log(`vercel.json: Build command should use 'npm run build', found '${config.buildCommand}'`, 'error');
            }

            // Check for incorrect directory references
            if (config.buildCommand && config.buildCommand.includes('cd client')) {
                this.log('vercel.json: Found incorrect "cd client" command', 'error');
            }

            // Check output directory
            if (config.outputDirectory && config.outputDirectory !== '.next') {
                this.log(`vercel.json: Output directory should be '.next', found '${config.outputDirectory}'`, 'warning');
            }

            this.log('vercel.json validation completed');

        } catch (error) {
            this.log(`vercel.json: Invalid JSON format - ${error.message}`, 'error');
        }
    }

    validateRenderConfig() {
        const configPath = 'render.yaml';
        
        if (!fs.existsSync(configPath)) {
            this.log('render.yaml not found', 'warning');
            return;
        }

        try {
            const content = fs.readFileSync(configPath, 'utf8');
            
            // Basic YAML validation - check for common issues
            if (content.includes('cd client')) {
                this.log('render.yaml: Contains incorrect "cd client" command', 'error');
            }

            // Check for Docker environment
            if (content.includes('env: docker')) {
                this.log('render.yaml: Using Docker environment - good!', 'info');
            }

            // Check for Dockerfile path
            if (content.includes('dockerfilePath:') && !content.includes('./Dockerfile')) {
                this.log('render.yaml: Dockerfile path might be incorrect', 'warning');
            }

            this.log('render.yaml validation completed');

        } catch (error) {
            this.log(`render.yaml: Error reading file - ${error.message}`, 'error');
        }
    }

    validateDockerfile() {
        const dockerfilePath = 'Dockerfile';
        
        if (!fs.existsSync(dockerfilePath)) {
            this.log('Dockerfile not found', 'warning');
            return;
        }

        try {
            const content = fs.readFileSync(dockerfilePath, 'utf8');
            const lines = content.split('\n');

            // Check for correct working directory
            const workdirLines = lines.filter(line => line.trim().startsWith('WORKDIR'));
            const hasCorrectWorkdir = workdirLines.some(line => line.includes('/app'));
            
            if (!hasCorrectWorkdir) {
                this.log('Dockerfile: Should set WORKDIR to /app', 'warning');
            }

            // Check for incorrect directory changes
            if (content.includes('cd client')) {
                this.log('Dockerfile: Contains incorrect "cd client" command', 'error');
            }

            // Check for npm run build command
            if (!content.includes('npm run build')) {
                this.log('Dockerfile: Should include "npm run build" command', 'warning');
            }

            // Check for Next.js specific configurations
            if (!content.includes('standalone')) {
                this.log('Dockerfile: Consider using Next.js standalone output for better optimization', 'info');
            }

            this.log('Dockerfile validation completed');

        } catch (error) {
            this.log(`Dockerfile: Error reading file - ${error.message}`, 'error');
        }
    }

    validatePackageJson() {
        const packagePath = 'package.json';
        
        if (!fs.existsSync(packagePath)) {
            this.log('package.json not found', 'error');
            return;
        }

        try {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Check build script
            if (!pkg.scripts || !pkg.scripts.build) {
                this.log('package.json: No build script found', 'error');
            } else if (pkg.scripts.build.includes('cd client')) {
                this.log('package.json: Build script contains incorrect "cd client" command', 'error');
            }

            // Check for Next.js dependency
            const hasNextJs = pkg.dependencies && pkg.dependencies.next;
            if (!hasNextJs) {
                this.log('package.json: Next.js dependency not found', 'warning');
            }

            this.log('package.json validation completed');

        } catch (error) {
            this.log(`package.json: Invalid JSON format - ${error.message}`, 'error');
        }
    }

    validateDirectoryStructure() {
        const requiredDirs = ['.next', 'app', 'public'];
        const optionalDirs = ['components', 'lib', 'styles'];

        // Check if .next exists (should exist after build)
        if (!fs.existsSync('.next')) {
            this.log('.next directory not found - run "npm run build" first', 'info');
        }

        // Check for app directory (App Router)
        if (!fs.existsSync('app')) {
            this.log('app directory not found - using Pages Router?', 'info');
        }

        // Check for public directory
        if (!fs.existsSync('public')) {
            this.log('public directory not found', 'warning');
        }

        // Check for incorrect client directory
        if (fs.existsSync('client')) {
            this.log('Found "client" directory - this might be causing build issues', 'warning');
        }

        this.log('Directory structure validation completed');
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('DEPLOYMENT CONFIGURATION VALIDATION REPORT');
        console.log('='.repeat(60));

        if (this.errors.length > 0) {
            console.log('\n🚨 ERRORS FOUND:');
            this.errors.forEach(error => console.log(`  ${error}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.forEach(warning => console.log(`  ${warning}`));
        }

        if (this.info.length > 0) {
            console.log('\nℹ️  INFORMATION:');
            this.info.forEach(info => console.log(`  ${info}`));
        }

        console.log('\n' + '='.repeat(60));
        
        if (this.errors.length === 0) {
            console.log('✅ No critical errors found!');
        } else {
            console.log(`❌ Found ${this.errors.length} error(s) that need to be fixed`);
        }
        
        console.log('='.repeat(60));

        return {
            errors: this.errors.length,
            warnings: this.warnings.length,
            info: this.info.length
        };
    }

    async validate() {
        console.log('🔍 Starting deployment configuration validation...\n');

        this.validatePackageJson();
        this.validateVercelConfig();
        this.validateRenderConfig();
        this.validateDockerfile();
        this.validateDirectoryStructure();

        return this.generateReport();
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new DeploymentConfigValidator();
    validator.validate().then(result => {
        process.exit(result.errors > 0 ? 1 : 0);
    });
}

module.exports = DeploymentConfigValidator;