-- 1. DROP Incorrect Table (Cleanup)
DROP TABLE IF EXISTS user_documents CASCADE;

-- 2. CREATE Table with Correct Types
CREATE TABLE user_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users NOT NULL, -- Must be UUID to match auth.uid()
  group_id uuid,
  
  title text NOT NULL DEFAULT 'Untitled',
  content text DEFAULT '',
  
  -- Metadata
  mode text DEFAULT 'professional',
  language text DEFAULT 'es',
  pre_prompt text,
  context text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Enable Security
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Now types match: UUID = UUID)
CREATE POLICY "Users can view own documents" 
  ON user_documents FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own documents" 
  ON user_documents FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own documents" 
  ON user_documents FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own documents" 
  ON user_documents FOR DELETE 
  USING (auth.uid() = owner_id);

-- 5. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_documents;
