-- Check and grant permissions for email_collection_pages table

-- Grant basic permissions to anon role (for reading)
GRANT SELECT ON email_collection_pages TO anon;

-- Grant full permissions to authenticated role
GRANT ALL PRIVILEGES ON email_collection_pages TO authenticated;

-- Create RLS policies if they don't exist

-- Policy for authenticated users to manage their own pages
DROP POLICY IF EXISTS "Users can manage their own email pages" ON email_collection_pages;
CREATE POLICY "Users can manage their own email pages" ON email_collection_pages
  FOR ALL USING (auth.jwt() ->> 'email' = user_email);

-- Policy for anon users to read active pages
DROP POLICY IF EXISTS "Anyone can view active email pages" ON email_collection_pages;
CREATE POLICY "Anyone can view active email pages" ON email_collection_pages
  FOR SELECT USING (is_active = true);

-- Policy for service role to manage all pages (for API operations)
DROP POLICY IF EXISTS "Service role can manage all pages" ON email_collection_pages;
CREATE POLICY "Service role can manage all pages" ON email_collection_pages
  FOR ALL USING (true);

-- Ensure the table has proper indexes
CREATE INDEX IF NOT EXISTS idx_email_collection_pages_user_email ON email_collection_pages(user_email);
CREATE INDEX IF NOT EXISTS idx_email_collection_pages_active ON email_collection_pages(is_active);