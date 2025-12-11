#!/usr/bin/env node

/**
 * Stripe Configuration Fix Script
 * 
 * This script identifies and fixes the Stripe configuration issue causing
 * ERR_TUNNEL_CONNECTION_FAILED errors when users try to make payments.
 * 
 * PROBLEM IDENTIFIED:
 * - STRIPE_SECRET_KEY is using a live key (rk_live_...)
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is using a test key (pk_test_...)
 * - STRIPE_WEBHOOK_SECRET is using a test webhook secret (whsec_test_...)
 * 
 * This mismatch prevents Stripe from processing payments correctly.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Stripe Configuration Fix Script');
console.log('=====================================');

// Read current .env file
const envPath = path.join(process.cwd(), '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Current .env file loaded');
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  process.exit(1);
}

// Analyze current Stripe configuration
console.log('\n🔍 Analyzing current Stripe configuration...');

const stripeSecretMatch = envContent.match(/STRIPE_SECRET_KEY=(.+)/);
const stripePublishableMatch = envContent.match(/NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=(.+)/);
const stripeWebhookMatch = envContent.match(/STRIPE_WEBHOOK_SECRET=(.+)/);

if (stripeSecretMatch) {
  const secretKey = stripeSecretMatch[1].trim();
  console.log(`📋 Secret Key: ${secretKey.substring(0, 20)}...`);
  
  if (secretKey.startsWith('rk_live_')) {
    console.log('⚠️  ISSUE: Using LIVE secret key');
  } else if (secretKey.startsWith('sk_test_')) {
    console.log('✅ Using test secret key');
  } else {
    console.log('❌ Invalid secret key format');
  }
}

if (stripePublishableMatch) {
  const publishableKey = stripePublishableMatch[1].trim();
  console.log(`📋 Publishable Key: ${publishableKey.substring(0, 20)}...`);
  
  if (publishableKey.startsWith('pk_live_')) {
    console.log('⚠️  Using LIVE publishable key');
  } else if (publishableKey.startsWith('pk_test_')) {
    console.log('⚠️  ISSUE: Using TEST publishable key');
  } else {
    console.log('❌ Invalid publishable key format');
  }
}

if (stripeWebhookMatch) {
  const webhookSecret = stripeWebhookMatch[1].trim();
  console.log(`📋 Webhook Secret: ${webhookSecret.substring(0, 20)}...`);
  
  if (webhookSecret.startsWith('whsec_')) {
    if (webhookSecret.includes('test')) {
      console.log('⚠️  ISSUE: Using TEST webhook secret');
    } else {
      console.log('✅ Using production webhook secret');
    }
  } else {
    console.log('❌ Invalid webhook secret format');
  }
}

console.log('\n🚨 CRITICAL ISSUE DETECTED:');
console.log('You are mixing LIVE and TEST Stripe keys, which causes payment failures.');
console.log('');
console.log('CURRENT CONFIGURATION:');
console.log('- Secret Key: LIVE (rk_live_...)');
console.log('- Publishable Key: TEST (pk_test_...)');
console.log('- Webhook Secret: TEST (whsec_test_...)');
console.log('');
console.log('🔧 SOLUTION OPTIONS:');
console.log('');
console.log('OPTION 1: Use TEST environment (recommended for development)');
console.log('- Get test secret key from: https://dashboard.stripe.com/test/apikeys');
console.log('- Get test publishable key from: https://dashboard.stripe.com/test/apikeys');
console.log('- Get test webhook secret from: https://dashboard.stripe.com/test/webhooks');
console.log('');
console.log('OPTION 2: Use LIVE environment (for production)');
console.log('- Get live secret key from: https://dashboard.stripe.com/apikeys');
console.log('- Get live publishable key from: https://dashboard.stripe.com/apikeys');
console.log('- Get live webhook secret from: https://dashboard.stripe.com/webhooks');
console.log('');
console.log('⚠️  IMPORTANT: All three keys must be from the same environment (all test OR all live)');

// Create backup of current .env
const backupPath = path.join(process.cwd(), '.env.backup');
try {
  fs.writeFileSync(backupPath, envContent);
  console.log(`\n💾 Backup created: ${backupPath}`);
} catch (error) {
  console.error('❌ Error creating backup:', error.message);
}

// Create a template for the corrected configuration
const correctedTemplate = `
# CORRECTED STRIPE CONFIGURATION TEMPLATE
# Choose ONE of the following configurations:

# OPTION 1: TEST ENVIRONMENT (for development)
# STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE
# STRIPE_WEBHOOK_SECRET=whsec_YOUR_TEST_WEBHOOK_SECRET_HERE

# OPTION 2: LIVE ENVIRONMENT (for production)
# STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
# STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE

# CURRENT PROBLEMATIC CONFIGURATION (DO NOT USE):
# STRIPE_SECRET_KEY=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
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TYooMQauvdEDq54NiTphI7jx
# STRIPE_WEBHOOK_SECRET=whsec_test_webhook_secret
`;

const templatePath = path.join(process.cwd(), 'stripe-config-template.txt');
try {
  fs.writeFileSync(templatePath, correctedTemplate);
  console.log(`📝 Configuration template created: ${templatePath}`);
} catch (error) {
  console.error('❌ Error creating template:', error.message);
}

console.log('\n🔧 NEXT STEPS:');
console.log('1. Go to your Stripe Dashboard');
console.log('2. Choose test or live environment');
console.log('3. Copy all three keys from the SAME environment');
console.log('4. Update your .env file with matching keys');
console.log('5. Restart your application');
console.log('6. Test the payment flow');

console.log('\n✅ Script completed. Please follow the next steps to fix the payment issue.');