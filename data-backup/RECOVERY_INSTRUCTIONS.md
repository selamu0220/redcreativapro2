# Data Recovery Instructions

## Migration Date
2025-08-11T09:57:17.619Z

## Backup Files Location
`C:\Users\programar\Documents\GitHub\redcreativapro2\data-backup`

## Recovery Steps

### If you need to restore old contact data:
1. Copy `contacts-backup-*.json` to `data/contacts.json`
2. Restore the old contact management functions in `app/lib/database.ts`
3. Update API endpoints to use old contact system

### If you need to restore old email pages:
1. Copy `email-pages-backup-*.json` to `data/email-pages.json`
2. Restore the old email page management functions in `app/lib/database.ts`
3. Update UI components to use old email page system

### If you need to restore old templates:
1. Copy `templates-backup-*.json` to `data/templates.json`
2. Restore the old template management functions in `app/lib/database.ts`
3. Update UI components to use old template system

## New System Files
- `data/collected-emails.json` - Simplified email collection
- `data/user-page-settings.json` - User page customization settings

## Database Functions
- Old functions backed up in `app/lib/database-backup.ts`
- New simplified functions in `app/lib/database.ts`

## Testing the New System
1. Visit `/correosia/{user-email}` to test collection pages
2. Visit `/correosia/{user-email}/admin` to test admin dashboard
3. Test email collection and export functionality

## Support
If you encounter issues, check the backup files and restore as needed.
