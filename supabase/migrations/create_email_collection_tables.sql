-- Create email_collection_pages table
CREATE TABLE IF NOT EXISTS email_collection_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Suscríbete a nuestro newsletter',
  description TEXT NOT NULL DEFAULT 'Mantente al día con nuestras últimas noticias y actualizaciones.',
  button_text TEXT NOT NULL DEFAULT 'Suscribirse',
  success_message TEXT NOT NULL DEFAULT '¡Gracias por suscribirte! Te mantendremos informado.',
  is_active BOOLEAN NOT NULL DEFAULT true,
  collect_name BOOLEAN NOT NULL DEFAULT false,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  qualification_form JSONB DEFAULT '{"enabled": false, "questions": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email)
);

-- Create collected_emails table
CREATE TABLE IF NOT EXISTS collected_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  custom_data JSONB DEFAULT '{}'::jsonb,
  questionnaire_data JSONB DEFAULT '{}'::jsonb,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_id UUID REFERENCES email_collection_pages(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE email_collection_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collected_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for email_collection_pages
CREATE POLICY "Users can view their own pages" ON email_collection_pages
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own pages" ON email_collection_pages
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update their own pages" ON email_collection_pages
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can delete their own pages" ON email_collection_pages
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Allow anonymous access to view active pages
CREATE POLICY "Anonymous can view active pages" ON email_collection_pages
  FOR SELECT USING (is_active = true);

-- Create policies for collected_emails
CREATE POLICY "Users can view their collected emails" ON collected_emails
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert emails to their pages" ON collected_emails
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM email_collection_pages 
    WHERE user_email = collected_emails.user_email 
    AND id = collected_emails.page_id
  ));

-- Allow anonymous users to insert emails
CREATE POLICY "Anonymous can submit emails" ON collected_emails
  FOR INSERT WITH CHECK (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON email_collection_pages TO anon;
GRANT INSERT ON collected_emails TO anon;
GRANT ALL PRIVILEGES ON email_collection_pages TO authenticated;
GRANT ALL PRIVILEGES ON collected_emails TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_collection_pages_user_email ON email_collection_pages(user_email);
CREATE INDEX IF NOT EXISTS idx_collected_emails_user_email ON collected_emails(user_email);
CREATE INDEX IF NOT EXISTS idx_collected_emails_page_id ON collected_emails(page_id);
CREATE INDEX IF NOT EXISTS idx_collected_emails_collected_at ON collected_emails(collected_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_email_collection_pages_updated_at
    BEFORE UPDATE ON email_collection_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();