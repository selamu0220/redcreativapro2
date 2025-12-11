/**
 * Test script for Umami configuration
 * Tests environment variable handling and validation
 */

// Load environment variables from .env file
require('dotenv').config();

console.log('🧪 Testing Umami Configuration...\n');

// Test current environment configuration
console.log('Current Environment Variables:');
console.log('NEXT_PUBLIC_UMAMI_WEBSITE_ID:', process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || 'Not set');
console.log('NEXT_PUBLIC_UMAMI_SCRIPT_URL:', process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'Not set');
console.log('NEXT_PUBLIC_UMAMI_DOMAINS:', process.env.NEXT_PUBLIC_UMAMI_DOMAINS || 'Not set');

// Test website ID format validation
function validateWebsiteId(id) {
  const websiteIdRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  return websiteIdRegex.test(id);
}

// Test script URL validation
function validateScriptUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol.startsWith('http');
  } catch {
    return false;
  }
}

// Test domain validation
function validateDomains(domainsString) {
  if (!domainsString) return true; // Optional field
  
  const domains = domainsString.split(',').map(d => d.trim());
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  
  return domains.every(domain => domainRegex.test(domain));
}

console.log('\n📋 Validation Results:');

const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS;

if (websiteId) {
  const isValidId = validateWebsiteId(websiteId);
  console.log('✅ Website ID format:', isValidId ? 'Valid' : 'Invalid');
  if (!isValidId) {
    console.log('   Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  }
} else {
  console.log('❌ Website ID: Missing');
}

if (scriptUrl) {
  const isValidUrl = validateScriptUrl(scriptUrl);
  console.log('✅ Script URL format:', isValidUrl ? 'Valid' : 'Invalid');
} else {
  console.log('❌ Script URL: Missing');
}

if (domains) {
  const isValidDomains = validateDomains(domains);
  console.log('✅ Domains format:', isValidDomains ? 'Valid' : 'Invalid');
  console.log('   Domains list:', domains.split(',').map(d => d.trim()));
} else {
  console.log('⚠️  Domains: Not set (optional)');
}

// Overall configuration status
const isFullyConfigured = websiteId && scriptUrl && validateWebsiteId(websiteId) && validateScriptUrl(scriptUrl) && validateDomains(domains);

console.log('\n🎯 Overall Status:', isFullyConfigured ? '✅ Fully Configured' : '❌ Configuration Issues');

if (isFullyConfigured) {
  console.log('\n🚀 Umami analytics is ready to use!');
  console.log('   Script tag: <script defer src="' + scriptUrl + '" data-website-id="' + websiteId + '"></script>');
} else {
  console.log('\n🔧 Please check your environment variables in .env file');
}