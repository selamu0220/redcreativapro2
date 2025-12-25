#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Next.js with error prevention...');

// Clear cache before starting
const nextCacheDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCacheDir)) {
  console.log('🗑️  Clearing .next cache...');
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
}

// Start Next.js with proper error handling
const nextProcess = spawn('node', [
  '--max-old-space-size=4096',
  'node_modules/next/dist/bin/next',
  'dev',
  '--webpack'
], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (error) => {
  console.error('❌ Next.js process error:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  if (code !== 0) {
    console.log(`❌ Next.js exited with code ${code}`);
  }
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Next.js...');
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating Next.js...');
  nextProcess.kill('SIGTERM');
});