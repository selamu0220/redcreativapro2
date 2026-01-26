-- Add user_id to identify author
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add status column (draft/published)
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view published posts
CREATE POLICY "Public can view published posts" 
ON blog_posts FOR SELECT 
USING (status = 'published');

-- Policy: Users can view their own posts (even drafts)
CREATE POLICY "Users can view own posts" 
ON blog_posts FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own posts
CREATE POLICY "Users can insert own posts" 
ON blog_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts" 
ON blog_posts FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts" 
ON blog_posts FOR DELETE 
USING (auth.uid() = user_id);
