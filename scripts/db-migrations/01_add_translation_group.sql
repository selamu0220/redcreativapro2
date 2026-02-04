-- Add translation_group_id column to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS translation_group_id UUID;

-- Create index for faster lookups of translations
CREATE INDEX IF NOT EXISTS idx_blog_posts_translation_group_id 
ON blog_posts(translation_group_id);

-- Optional: Add comment
COMMENT ON COLUMN blog_posts.translation_group_id IS 'UUID linking different language versions of the same post';
