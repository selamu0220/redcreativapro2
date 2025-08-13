#!/usr/bin/env node

/**
 * Script to clean up obsolete functions from database.ts
 * This removes old contact, template, and email page management functions
 */

const fs = require('fs');
const path = require('path');

const DATABASE_FILE = path.join(process.cwd(), 'app/lib/database.ts');
const BACKUP_FILE = path.join(process.cwd(), 'app/lib/database-backup.ts');

/**
 * Functions and interfaces to remove from database.ts
 */
const OBSOLETE_PATTERNS = [
  // Legacy interfaces
  /export interface ContactData \{[\s\S]*?\}/g,
  /export interface EmailCollectionPageData \{[\s\S]*?\}/g,
  /export interface TemplateData \{[\s\S]*?\}/g,
  
  // Contact management functions
  /export function getContacts\(\)[\s\S]*?(?=export|$)/g,
  /export async function getContactsAsync\(\)[\s\S]*?(?=export|$)/g,
  /export function saveContacts\([\s\S]*?(?=export|$)/g,
  /export async function saveContactsAsync\([\s\S]*?(?=export|$)/g,
  /export function getUserContacts\([\s\S]*?(?=export|$)/g,
  /export async function getUserContactsAsync\([\s\S]*?(?=export|$)/g,
  /export function getContactById\([\s\S]*?(?=export|$)/g,
  /export async function getContactByIdAsync\([\s\S]*?(?=export|$)/g,
  /export function createContact\([\s\S]*?(?=export|$)/g,
  /export async function createContactAsync\([\s\S]*?(?=export|$)/g,
  /export function updateContact\([\s\S]*?(?=export|$)/g,
  /export async function updateContactAsync\([\s\S]*?(?=export|$)/g,
  /export function deleteContact\([\s\S]*?(?=export|$)/g,
  /export async function deleteContactAsync\([\s\S]*?(?=export|$)/g,
  /export function unsubscribeContact\([\s\S]*?(?=export|$)/g,
  /export async function unsubscribeContactAsync\([\s\S]*?(?=export|$)/g,
  /export function unsubscribeContactByEmail\([\s\S]*?(?=export|$)/g,
  /export async function unsubscribeContactByEmailAsync\([\s\S]*?(?=export|$)/g,
  /export function generateUnsubscribeLink\([\s\S]*?(?=export|$)/g,
  /export async function generateUnsubscribeLinkAsync\([\s\S]*?(?=export|$)/g,
  /export function getUnsubscribeHtml\([\s\S]*?(?=export|$)/g,
  /export async function getUnsubscribeHtmlAsync\([\s\S]*?(?=export|$)/g,
  
  // Email page management functions
  /export async function getEmailPagesAsync\(\)[\s\S]*?(?=export|$)/g,
  /export function getEmailPages\(\)[\s\S]*?(?=export|$)/g,
  /export async function saveEmailPagesAsync\([\s\S]*?(?=export|$)/g,
  /export function saveEmailPages\([\s\S]*?(?=export|$)/g,
  /export function getUserEmailPages\([\s\S]*?(?=export|$)/g,
  /export async function getUserEmailPagesAsync\([\s\S]*?(?=export|$)/g,
  /export function getEmailPageById\([\s\S]*?(?=export|$)/g,
  /export async function getEmailPageByIdAsync\([\s\S]*?(?=export|$)/g,
  /export function createEmailPage\([\s\S]*?(?=export|$)/g,
  /export async function createEmailPageAsync\([\s\S]*?(?=export|$)/g,
  /export function updateEmailPage\([\s\S]*?(?=export|$)/g,
  /export async function updateEmailPageAsync\([\s\S]*?(?=export|$)/g,
  /export function deleteEmailPage\([\s\S]*?(?=export|$)/g,
  /export async function deleteEmailPageAsync\([\s\S]*?(?=export|$)/g,
  
  // Template management functions
  /export async function getTemplatesAsync\(\)[\s\S]*?(?=export|$)/g,
  /export function getTemplates\(\)[\s\S]*?(?=export|$)/g,
  /export async function saveTemplatesAsync\([\s\S]*?(?=export|$)/g,
  /export function saveTemplates\([\s\S]*?(?=export|$)/g,
  /export function getUserTemplates\([\s\S]*?(?=export|$)/g,
  /export async function getUserTemplatesAsync\([\s\S]*?(?=export|$)/g,
  /export function getTemplateById\([\s\S]*?(?=export|$)/g,
  /export async function getTemplateByIdAsync\([\s\S]*?(?=export|$)/g,
  /export function createTemplate\([\s\S]*?(?=export|$)/g,
  /export async function createTemplateAsync\([\s\S]*?(?=export|$)/g,
  /export function updateTemplate\([\s\S]*?(?=export|$)/g,
  /export async function updateTemplateAsync\([\s\S]*?(?=export|$)/g,
  /export function deleteTemplate\([\s\S]*?(?=export|$)/g,
  /export async function deleteTemplateAsync\([\s\S]*?(?=export|$)/g,
];

/**
 * File constants to remove
 */
const OBSOLETE_CONSTANTS = [
  /const CONTACTS_FILE = [\s\S]*?;/g,
  /const CONTACTS_FILE_READ = [\s\S]*?;/g,
  /const EMAIL_PAGES_FILE = [\s\S]*?;/g,
  /const EMAIL_PAGES_FILE_READ = [\s\S]*?;/g,
  /const TEMPLATES_FILE = [\s\S]*?;/g,
  /const TEMPLATES_FILE_READ = [\s\S]*?;/g,
];

/**
 * Backup the original database.ts file
 */
function backupDatabaseFile() {
  if (fs.existsSync(DATABASE_FILE)) {
    fs.copyFileSync(DATABASE_FILE, BACKUP_FILE);
    console.log('✅ Backed up database.ts to database-backup.ts');
  } else {
    throw new Error('database.ts file not found');
  }
}

/**
 * Clean up obsolete functions and interfaces
 */
function cleanupObsoleteFunctions() {
  console.log('🧹 Cleaning up obsolete functions from database.ts...');
  
  let content = fs.readFileSync(DATABASE_FILE, 'utf8');
  let removedCount = 0;
  
  // Remove obsolete constants
  OBSOLETE_CONSTANTS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, '');
      removedCount += matches.length;
    }
  });
  
  // Remove obsolete functions and interfaces
  OBSOLETE_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, '');
      removedCount += matches.length;
    }
  });
  
  // Clean up multiple empty lines
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  // Write cleaned content back
  fs.writeFileSync(DATABASE_FILE, content);
  
  console.log(`✅ Removed ${removedCount} obsolete functions and interfaces`);
}

/**
 * Add comment about legacy interfaces for reference
 */
function addLegacyComment() {
  let content = fs.readFileSync(DATABASE_FILE, 'utf8');
  
  const legacyComment = `
// Legacy interfaces removed during migration to simplified email collection system
// These interfaces were used for the old contact, template, and email page management
// Backup available in database-backup.ts if needed for reference
// Migration date: ${new Date().toISOString()}

`;
  
  // Add comment after the new interfaces
  const insertPoint = content.indexOf('export interface UserPageSettings');
  if (insertPoint !== -1) {
    const beforeInsert = content.substring(0, insertPoint);
    const afterInsert = content.substring(insertPoint);
    content = beforeInsert + legacyComment + afterInsert;
    
    fs.writeFileSync(DATABASE_FILE, content);
    console.log('✅ Added legacy migration comment');
  }
}

/**
 * Validate the cleaned file
 */
function validateCleanedFile() {
  console.log('🔍 Validating cleaned database.ts...');
  
  const content = fs.readFileSync(DATABASE_FILE, 'utf8');
  
  // Check that new functions are still present
  const requiredFunctions = [
    'getCollectedEmailsAsync',
    'saveCollectedEmailsAsync',
    'getUserCollectedEmailsAsync',
    'addCollectedEmailAsync',
    'getUserPageSettingsAsync',
    'createOrUpdateUserPageSettingsAsync',
    'createDefaultPageSettingsForUserAsync'
  ];
  
  const missingFunctions = requiredFunctions.filter(func => !content.includes(func));
  
  if (missingFunctions.length > 0) {
    throw new Error(`Missing required functions: ${missingFunctions.join(', ')}`);
  }
  
  // Check that obsolete functions are removed
  const obsoleteFunctions = [
    'getContactsAsync',
    'createContactAsync',
    'getEmailPagesAsync',
    'createEmailPageAsync',
    'getTemplatesAsync',
    'createTemplateAsync'
  ];
  
  const remainingObsolete = obsoleteFunctions.filter(func => content.includes(func));
  
  if (remainingObsolete.length > 0) {
    console.warn(`⚠️  Some obsolete functions may still be present: ${remainingObsolete.join(', ')}`);
  }
  
  console.log('✅ Database file validation completed');
}

/**
 * Main cleanup function
 */
function runCleanup() {
  console.log('🚀 Starting database cleanup...');
  console.log('='.repeat(50));
  
  try {
    backupDatabaseFile();
    cleanupObsoleteFunctions();
    addLegacyComment();
    validateCleanedFile();
    
    console.log('\n✅ Database cleanup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test that the application still compiles');
    console.log('2. Run the migration script to migrate data');
    console.log('3. Update any imports that reference removed functions');
    console.log('4. Remove database-backup.ts when confident cleanup is successful');
    
  } catch (error) {
    console.error('\n❌ Database cleanup failed:', error.message);
    console.error('Restore from backup if needed:', BACKUP_FILE);
    process.exit(1);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  runCleanup();
}

module.exports = {
  runCleanup,
  backupDatabaseFile,
  cleanupObsoleteFunctions,
  validateCleanedFile
};