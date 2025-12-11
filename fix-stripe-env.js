#!/usr/bin/env node

/**
 * Stripe Environment Configuration Fix
 * 
 * This script fixes the Stripe configuration by ensuring all keys are from the same environment.
 * It provides options to use either test or live keys consistently.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔧 Stripe Configuration Fix Tool');
  console.log('=================================');
  console.log('');
  console.log('This tool will help you fix the Stripe configuration issue.');
  console.log('Currently you have mixed LIVE and TEST keys which causes payment failures.');
  console.log('');

  // Read current .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
    process.exit(1);
  }

  console.log('Choose your environment:');
  console.log('1. TEST environment (recommended for development)');
  console.log('2. LIVE environment (for production only)');
  console.log('3. Exit without changes');
  console.log('');

  const choice = await question('Enter your choice (1, 2, or 3): ');

  if (choice === '3') {
    console.log('👋 Exiting without changes.');
    rl.close();
    return;
  }

  if (choice !== '1' && choice !== '2') {
    console.log('❌ Invalid choice. Exiting.');
    rl.close();
    return;
  }

  const isLive = choice === '2';
  const environment = isLive ? 'LIVE' : 'TEST';

  console.log(`\n🔧 Configuring for ${environment} environment...`);
  console.log('');

  if (isLive) {
    console.log('⚠️  WARNING: You are configuring LIVE keys!');
    console.log('This will process real payments and charge real money.');
    console.log('Make sure you understand the implications.');
    console.log('');
    
    const confirm = await question('Are you sure you want to use LIVE keys? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('👋 Cancelled. Using test environment instead.');
      // Fall back to test
      isLive = false;
    }
  }

  // Get the keys from user
  console.log(`\nPlease provide your ${environment} Stripe keys:`);
  console.log(`Get them from: https://dashboard.stripe.com/${isLive ? '' : 'test/'}apikeys`);
  console.log('');

  const secretKey = await question(`${environment} Secret Key (${isLive ? 'sk_live_' : 'sk_test_'}...): `);
  const publishableKey = await question(`${environment} Publishable Key (${isLive ? 'pk_live_' : 'pk_test_'}...): `);
  
  console.log('');
  console.log('For webhook secret, go to:');
  console.log(`https://dashboard.stripe.com/${isLive ? '' : 'test/'}webhooks`);
  console.log('');
  
  const webhookSecret = await question(`${environment} Webhook Secret (whsec_...): `);

  // Validate the keys
  const expectedSecretPrefix = isLive ? 'sk_live_' : 'sk_test_';
  const expectedPublishablePrefix = isLive ? 'pk_live_' : 'pk_test_';

  if (!secretKey.startsWith(expectedSecretPrefix)) {
    console.log(`❌ Invalid secret key. Expected to start with ${expectedSecretPrefix}`);
    rl.close();
    return;
  }

  if (!publishableKey.startsWith(expectedPublishablePrefix)) {
    console.log(`❌ Invalid publishable key. Expected to start with ${expectedPublishablePrefix}`);
    rl.close();
    return;
  }

  if (!webhookSecret.startsWith('whsec_')) {
    console.log('❌ Invalid webhook secret. Expected to start with whsec_');
    rl.close();
    return;
  }

  // Create backup
  const backupPath = path.join(process.cwd(), `.env.backup.${Date.now()}`);
  try {
    fs.writeFileSync(backupPath, envContent);
    console.log(`\n💾 Backup created: ${backupPath}`);
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    rl.close();
    return;
  }

  // Update the .env file
  let updatedContent = envContent;

  // Replace Stripe keys
  updatedContent = updatedContent.replace(
    /STRIPE_SECRET_KEY=.*/,
    `STRIPE_SECRET_KEY=${secretKey}`
  );

  updatedContent = updatedContent.replace(
    /NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*/,
    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${publishableKey}`
  );

  updatedContent = updatedContent.replace(
    /STRIPE_WEBHOOK_SECRET=.*/,
    `STRIPE_WEBHOOK_SECRET=${webhookSecret}`
  );

  // Add comment about the configuration
  const configComment = `
# Stripe Configuration - ${environment} Environment
# Updated: ${new Date().toISOString()}
# All keys are from the same ${environment.toLowerCase()} environment
`;

  // Find the Stripe section and add comment
  updatedContent = updatedContent.replace(
    /# Stripe Configuration.*?\n/,
    `# Stripe Configuration - ${environment} Environment${configComment}\n`
  );

  try {
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ .env file updated successfully!');
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    rl.close();
    return;
  }

  console.log('');
  console.log('🎉 Stripe configuration fixed!');
  console.log('');
  console.log('Summary:');
  console.log(`- Environment: ${environment}`);
  console.log(`- Secret Key: ${secretKey.substring(0, 20)}...`);
  console.log(`- Publishable Key: ${publishableKey.substring(0, 20)}...`);
  console.log(`- Webhook Secret: ${webhookSecret.substring(0, 20)}...`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart your application');
  console.log('2. Test the payment flow');
  console.log('3. Verify that payments work correctly');
  console.log('');
  
  if (isLive) {
    console.log('⚠️  IMPORTANT: You are using LIVE keys!');
    console.log('- Real payments will be processed');
    console.log('- Real money will be charged');
    console.log('- Make sure your application is ready for production');
  } else {
    console.log('✅ You are using TEST keys - safe for development');
    console.log('- No real money will be charged');
    console.log('- Use test card numbers for testing');
  }

  rl.close();
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  rl.close();
  process.exit(1);
});