#!/usr/bin/env node

/**
 * Script to preserve essential user data during migration
 * This ensures no critical user information is lost during the transition
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(process.cwd(), 'data-backup');

// File paths
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const USER_PAGE_SETTINGS_FILE = path.join(DATA_DIR, 'user-page-settings.json');

/**
 * Ensure all registered users have page settings
 */
async function ensureUserPageSettings() {
  console.log('🔍 Ensuring all users have page settings...');
  
  if (!fs.existsSync(USERS_FILE)) {
    console.log('ℹ️  No users.json file found');
    return;
  }
  
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    let userPageSettings = [];
    
    // Load existing settings
    if (fs.existsSync(USER_PAGE_SETTINGS_FILE)) {
      userPageSettings = JSON.parse(fs.readFileSync(USER_PAGE_SETTINGS_FILE, 'utf8'));
    }
    
    let createdCount = 0;
    
    // Create default settings for users who don't have them
    users.forEach(user => {
      const existingSettings = userPageSettings.find(s => s.userEmail === user.email);
      
      if (!existingSettings) {
        const defaultSettings = {
          userEmail: user.email,
          title: 'Únete a nuestra lista de correo',
          description: 'Recibe las últimas actualizaciones y contenido exclusivo directamente en tu bandeja de entrada.',
          callToActionText: 'Suscribirse',
          successMessage: '¡Gracias por suscribirte! Te enviaremos contenido valioso muy pronto.',
          isActive: true,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        userPageSettings.push(defaultSettings);
        createdCount++;
      }
    });
    
    // Save updated settings
    if (createdCount > 0) {
      fs.writeFileSync(USER_PAGE_SETTINGS_FILE, JSON.stringify(userPageSettings, null, 2));
      console.log(`✅ Created page settings for ${createdCount} users`);
    } else {
      console.log('✅ All users already have page settings');
    }
    
  } catch (error) {
    console.error('❌ Error ensuring user page settings:', error.message);
  }
}

/**
 * Validate data integrity after migration
 */
function validateDataIntegrity() {
  console.log('🔍 Validating data integrity...');
  
  const issues = [];
  
  // Check users file
  if (fs.existsSync(USERS_FILE)) {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      console.log(`✅ Users file valid: ${users.length} users`);
    } catch (error) {
      issues.push(`Users file corrupted: ${error.message}`);
    }
  } else {
    issues.push('Users file missing');
  }
  
  // Check user page settings
  if (fs.existsSync(USER_PAGE_SETTINGS_FILE)) {
    try {
      const settings = JSON.parse(fs.readFileSync(USER_PAGE_SETTINGS_FILE, 'utf8'));
      console.log(`✅ User page settings valid: ${settings.length} settings`);
      
      // Check for required fields
      settings.forEach((setting, index) => {
        const requiredFields = ['userEmail', 'title', 'description', 'callToActionText', 'successMessage'];
        const missingFields = requiredFields.filter(field => !setting[field]);
        
        if (missingFields.length > 0) {
          issues.push(`Setting ${index} missing fields: ${missingFields.join(', ')}`);
        }
      });
      
    } catch (error) {
      issues.push(`User page settings corrupted: ${error.message}`);
    }
  } else {
    issues.push('User page settings file missing');
  }
  
  // Check collected emails
  const collectedEmailsFile = path.join(DATA_DIR, 'collected-emails.json');
  if (fs.existsSync(collectedEmailsFile)) {
    try {
      const emails = JSON.parse(fs.readFileSync(collectedEmailsFile, 'utf8'));
      console.log(`✅ Collected emails valid: ${emails.length} emails`);
    } catch (error) {
      issues.push(`Collected emails corrupted: ${error.message}`);
    }
  }
  
  if (issues.length > 0) {
    console.error('❌ Data integrity issues found:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    return false;
  } else {
    console.log('✅ Data integrity validation passed');
    return true;
  }
}

/**
 * Create recovery instructions
 */
function createRecoveryInstructions() {
  const instructionsFile = path.join(BACKUP_DIR, 'RECOVERY_INSTRUCTIONS.md');
  
  const instructions = `# Data Recovery Instructions

## Migration Date
${new Date().toISOString()}

## Backup Files Location
\`${BACKUP_DIR}\`

## Recovery Steps

### If you need to restore old contact data:
1. Copy \`contacts-backup-*.json\` to \`data/contacts.json\`
2. Restore the old contact management functions in \`app/lib/database.ts\`
3. Update API endpoints to use old contact system

### If you need to restore old email pages:
1. Copy \`email-pages-backup-*.json\` to \`data/email-pages.json\`
2. Restore the old email page management functions in \`app/lib/database.ts\`
3. Update UI components to use old email page system

### If you need to restore old templates:
1. Copy \`templates-backup-*.json\` to \`data/templates.json\`
2. Restore the old template management functions in \`app/lib/database.ts\`
3. Update UI components to use old template system

## New System Files
- \`data/collected-emails.json\` - Simplified email collection
- \`data/user-page-settings.json\` - User page customization settings

## Database Functions
- Old functions backed up in \`app/lib/database-backup.ts\`
- New simplified functions in \`app/lib/database.ts\`

## Testing the New System
1. Visit \`/correosia/{user-email}\` to test collection pages
2. Visit \`/correosia/{user-email}/admin\` to test admin dashboard
3. Test email collection and export functionality

## Support
If you encounter issues, check the backup files and restore as needed.
`;

  fs.writeFileSync(instructionsFile, instructions);
  console.log(`✅ Created recovery instructions: ${instructionsFile}`);
}

/**
 * Main preservation function
 */
async function preserveEssentialData() {
  console.log('🛡️  Preserving essential user data...');
  console.log('='.repeat(50));
  
  try {
    await ensureUserPageSettings();
    const isValid = validateDataIntegrity();
    createRecoveryInstructions();
    
    if (isValid) {
      console.log('\n✅ Essential data preservation completed successfully!');
      console.log('\nData preserved:');
      console.log('- User accounts and subscription data');
      console.log('- User page settings for email collection');
      console.log('- Recovery instructions created');
    } else {
      console.log('\n⚠️  Data preservation completed with warnings');
      console.log('Check the issues above and recovery instructions');
    }
    
  } catch (error) {
    console.error('\n❌ Essential data preservation failed:', error.message);
    console.error('Check backup files and recovery instructions');
    process.exit(1);
  }
}

// Run preservation if this script is executed directly
if (require.main === module) {
  preserveEssentialData();
}

module.exports = {
  preserveEssentialData,
  ensureUserPageSettings,
  validateDataIntegrity,
  createRecoveryInstructions
};