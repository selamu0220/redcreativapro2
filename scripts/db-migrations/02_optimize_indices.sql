-- Add index for translation grouping
CREATE INDEX IF NOT EXISTS idx_blog_posts_translation_group_id ON blog_posts(translation_group_id);

-- Add index for filtering by language
CREATE INDEX IF NOT EXISTS idx_blog_posts_language ON blog_posts(language);
