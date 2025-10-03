-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('email_collection_pages', 'collected_emails')
ORDER BY table_name, grantee;

-- Grant permissions for email_collection_pages table
GRANT ALL PRIVILEGES ON email_collection_pages TO authenticated;
GRANT SELECT, INSERT ON email_collection_pages TO anon;

-- Grant permissions for collected_emails table
GRANT ALL PRIVILEGES ON collected_emails TO authenticated;
GRANT SELECT, INSERT ON collected_emails TO anon;

-- Verify permissions after granting
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('email_collection_pages', 'collected_emails')
ORDER BY table_name, grantee;