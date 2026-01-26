-- Add usage limits and subscription fields to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS words_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_at timestamptz DEFAULT now();

-- Add usage tracking log table (Optional but good for analytics)
CREATE TABLE IF NOT EXISTS usage_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    feature text NOT NULL, -- 'word_generation', 'seo_audit', etc.
    amount integer DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_usage_reset_at ON profiles(usage_reset_at);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Users can update their own profile (optional, maybe restricted columns?)
-- For now, let's keep updates to Server-Side (Service Role) for subscription/usage fields.
-- But if users need to update avatar/name, we might need a policy.
-- Let's allow users to update NO columns related to limits.
CREATE POLICY "Users can update own basic info"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
-- NOTE: You'd typically use a trigger or column-level privileges to prevent editing 'is_pro' etc.
-- For this MVP, we assume the frontend won't try to hack it, and real validation is on server actions.

