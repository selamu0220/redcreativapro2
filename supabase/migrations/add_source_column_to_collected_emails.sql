-- Add source column to collected_emails table
ALTER TABLE collected_emails 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'collection-page';

-- Add index for better performance on source queries
CREATE INDEX IF NOT EXISTS idx_collected_emails_source ON collected_emails(source);