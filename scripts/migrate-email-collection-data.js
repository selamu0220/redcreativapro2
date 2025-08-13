#!/usr/bin/env node

/**
 * Migration script for email collection system
 * This script backs up existing data and migrates to the new simplified structure
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(process.cwd(), 'data-backup');

// File paths
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const EMAIL_PAGES_FILE = path.join(DATA_DIR, 'email-pages.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const COLLECTED_EMAILS_FILE = path.join(DATA_DIR, 'collected-emails.json');
const USER_PAGE_SETTINGS_FILE = path.join(DATA_DIR, 'user-page-settings.json');

// Backup file paths
const CONTACTS_BACKUP = path.join(BACKUP_DIR, `contacts-backup-${Date.now()}.json`);
const EMAIL_PAGES_BACKUP = path.join(BACKUP_DIR, `email-pages-backup-${Date.now()}.json`);
const TEMPLATES_BACKUP = path.join(BACKUP_DIR, `templates-backup-${Date.now()}.json`);

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('✅ Created backup directory:', BACKUP_DIR);
  }
}

/**
 * Backup existing data files
 */
function backupExistingData() {
  console.log('\n📦 Backing up existing data...');
  
  // Backup contacts
  if (fs.existsSync(CONTACTS_FILE)) {
    fs.copyFileSync(CONTACTS_FILE, CONTACTS_BACKUP);
    console.log('✅ Backed up contacts.json');
  } else {
    console.log('ℹ️  No contacts.json file found');
  }
  
  // Backup email pages
  if (fs.existsSync(EMAIL_PAGES_FILE)) {
    fs.copyFileSync(EMAIL_PAGES_FILE, EMAIL_PAGES_BACKUP);
    console.log('✅ Backed up email-pages.json');
  } else {
    console.log('ℹ️  No email-pages.json file found');
  }
  
  // Backup templates
  if (fs.existsSync(TEMPLATES_FILE)) {
    fs.copyFileSync(TEMPLATES_FILE, TEMPLATES_BACKUP);
    console.log('✅ Backed up templates.json');
  } else {
    console.log('ℹ️  No templates.json file found');
  }
}

/**
 * Migrate email pages to user page settings
 */
function migrateEmailPagesToUserSettings() {
  console.log('\n🔄 Migrating email pages to user page settings...');
  
  if (!fs.existsSync(EMAIL_PAGES_FILE)) {
    console.log('ℹ️  No email pages to migrate');
    return;
  }
  
  try {
    const emailPagesData = JSON.parse(fs.readFileSync(EMAIL_PAGES_FILE, 'utf8'));
    const userPageSettings = [];
    
    // Handle both array and object formats
    let pagesToMigrate = [];
    if (Array.isArray(emailPagesData)) {
      pagesToMigrate = emailPagesData;
    } else if (typeof emailPagesData === 'object') {
      // Flatten object structure to array
      Object.values(emailPagesData).forEach(userPages => {
        if (Array.isArray(userPages)) {
          pagesToMigrate.push(...userPages);
        }
      });
    }
    
    // Convert each email page to user page settings
    pagesToMigrate.forEach(page => {
      if (page.userEmail) {
        const settings = {
          userEmail: page.userEmail,
          title: page.title || 'Únete a nuestra lista de correo',
          description: page.description || 'Recibe las últimas actualizaciones y contenido exclusivo directamente en tu bandeja de entrada.',
          callToActionText: page.buttonText || 'Suscribirse',
          successMessage: page.successMessage || '¡Gracias por suscribirte! Te enviaremos contenido valioso muy pronto.',
          customBranding: page.customBranding || undefined,
          isActive: page.isActive !== undefined ? page.isActive : true,
          createdAt: page.createdAt || new Date().toISOString(),
          updatedAt: page.updatedAt || new Date().toISOString()
        };
        
        // Check if settings for this user already exist
        const existingIndex = userPageSettings.findIndex(s => s.userEmail === page.userEmail);
        if (existingIndex >= 0) {
          // Update existing (keep the most recent)
          if (new Date(settings.updatedAt) > new Date(userPageSettings[existingIndex].updatedAt)) {
            userPageSettings[existingIndex] = settings;
          }
        } else {
          userPageSettings.push(settings);
        }
      }
    });
    
    // Save migrated settings
    fs.writeFileSync(USER_PAGE_SETTINGS_FILE, JSON.stringify(userPageSettings, null, 2));
    console.log(`✅ Migrated ${userPageSettings.length} user page settings`);
    
  } catch (error) {
    console.error('❌ Error migrating email pages:', error.message);
  }
}

/**
 * Migrate contacts to collected emails
 */
function migrateContactsToCollectedEmails() {
  console.log('\n🔄 Migrating contacts to collected emails...');
  
  if (!fs.existsSync(CONTACTS_FILE)) {
    console.log('ℹ️  No contacts to migrate');
    return;
  }
  
  try {
    const contactsData = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
    const collectedEmails = [];
    
    contactsData.forEach(contact => {
      if (contact.email && contact.userEmail) {
        const collectedEmail = {
          id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: contact.email,
          collectedAt: contact.createdAt || new Date().toISOString(),
          userEmail: contact.userEmail,
          source: 'collection-page',
          ipAddress: undefined // We don't have this data from old contacts
        };
        
        collectedEmails.push(collectedEmail);
      }
    });
    
    // Save migrated emails
    fs.writeFileSync(COLLECTED_EMAILS_FILE, JSON.stringify(collectedEmails, null, 2));
    console.log(`✅ Migrated ${collectedEmails.length} collected emails`);
    
  } catch (error) {
    console.error('❌ Error migrating contacts:', error.message);
  }
}

/**
 * Clean up old data files
 */
function cleanupOldData() {
  console.log('\n🧹 Cleaning up old data files...');
  
  const filesToDelete = [CONTACTS_FILE, EMAIL_PAGES_FILE, TEMPLATES_FILE];
  
  filesToDelete.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`✅ Deleted ${path.basename(file)}`);
      } catch (error) {
        console.error(`❌ Error deleting ${path.basename(file)}:`, error.message);
      }
    }
  });
}

/**
 * Initialize new data files with empty arrays
 */
function initializeNewDataFiles() {
  console.log('\n🆕 Initializing new data files...');
  
  // Initialize collected emails if it doesn't exist
  if (!fs.existsSync(COLLECTED_EMAILS_FILE)) {
    fs.writeFileSync(COLLECTED_EMAILS_FILE, JSON.stringify([], null, 2));
    console.log('✅ Initialized collected-emails.json');
  }
  
  // Initialize user page settings if it doesn't exist
  if (!fs.existsSync(USER_PAGE_SETTINGS_FILE)) {
    fs.writeFileSync(USER_PAGE_SETTINGS_FILE, JSON.stringify([], null, 2));
    console.log('✅ Initialized user-page-settings.json');
  }
}

/**
 * Display migration summary
 */
function displaySummary() {
  console.log('\n📊 Migration Summary:');
  console.log('='.repeat(50));
  
  // Count migrated data
  let collectedEmailsCount = 0;
  let userSettingsCount = 0;
  
  if (fs.existsSync(COLLECTED_EMAILS_FILE)) {
    try {
      const emails = JSON.parse(fs.readFileSync(COLLECTED_EMAILS_FILE, 'utf8'));
      collectedEmailsCount = emails.length;
    } catch (e) {
      console.error('Error reading collected emails:', e.message);
    }
  }
  
  if (fs.existsSync(USER_PAGE_SETTINGS_FILE)) {
    try {
      const settings = JSON.parse(fs.readFileSync(USER_PAGE_SETTINGS_FILE, 'utf8'));
      userSettingsCount = settings.length;
    } catch (e) {
      console.error('Error reading user settings:', e.message);
    }
  }
  
  console.log(`📧 Collected emails: ${collectedEmailsCount}`);
  console.log(`⚙️  User page settings: ${userSettingsCount}`);
  console.log(`💾 Backups stored in: ${BACKUP_DIR}`);
  console.log('\n✅ Migration completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Test the new email collection system');
  console.log('2. Verify user page settings are working');
  console.log('3. Remove backup files when confident migration is successful');
}

/**
 * Main migration function
 */
function runMigration() {
  console.log('🚀 Starting email collection data migration...');
  console.log('='.repeat(50));
  
  try {
    ensureBackupDir();
    backupExistingData();
    migrateEmailPagesToUserSettings();
    migrateContactsToCollectedEmails();
    initializeNewDataFiles();
    cleanupOldData();
    displaySummary();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Check the backup files in:', BACKUP_DIR);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  backupExistingData,
  migrateEmailPagesToUserSettings,
  migrateContactsToCollectedEmails,
  cleanupOldData
};