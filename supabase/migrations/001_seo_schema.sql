-- SEO Database Schema Migration
-- This migration creates all necessary tables for SEO functionality

-- Enable RLS on all tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- SEO Projects table
CREATE TABLE IF NOT EXISTS seo_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    target_location VARCHAR(100),
    primary_keywords TEXT[],
    business_type VARCHAR(100),
    competitor_domains TEXT[],
    user_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keywords table
CREATE TABLE IF NOT EXISTS seo_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    keyword VARCHAR(500) NOT NULL,
    search_volume INTEGER DEFAULT 0,
    difficulty INTEGER DEFAULT 0,
    cpc DECIMAL(10,2) DEFAULT 0,
    competition VARCHAR(20) DEFAULT 'medium' CHECK (competition IN ('low', 'medium', 'high')),
    intent VARCHAR(20) DEFAULT 'informational' CHECK (intent IN ('informational', 'transactional', 'navigational', 'commercial')),
    trend INTEGER DEFAULT 0,
    related_keywords TEXT[],
    current_position INTEGER,
    previous_position INTEGER,
    target_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, keyword)
);

-- Content table
CREATE TABLE IF NOT EXISTS seo_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    meta_description VARCHAR(160),
    content_type VARCHAR(50) DEFAULT 'blog-post' CHECK (content_type IN ('service-page', 'blog-post', 'gbp-post', 'meta-description', 'title-tag')),
    target_keyword VARCHAR(500),
    target_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    word_count INTEGER DEFAULT 0,
    headings TEXT[],
    internal_links JSONB DEFAULT '[]',
    schema_markup JSONB,
    ai_generated BOOLEAN DEFAULT false,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backlinks table
CREATE TABLE IF NOT EXISTS seo_backlinks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    source_url VARCHAR(1000) NOT NULL,
    source_domain VARCHAR(255) NOT NULL,
    target_url VARCHAR(1000) NOT NULL,
    anchor_text VARCHAR(500),
    domain_authority INTEGER DEFAULT 0,
    page_authority INTEGER DEFAULT 0,
    link_type VARCHAR(20) DEFAULT 'dofollow' CHECK (link_type IN ('dofollow', 'nofollow')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'lost', 'new')),
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, source_url, target_url)
);

-- Link building opportunities table
CREATE TABLE IF NOT EXISTS seo_opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    domain_authority INTEGER DEFAULT 0,
    relevance_score INTEGER DEFAULT 0,
    contact_info VARCHAR(500),
    outreach_status VARCHAR(20) DEFAULT 'not_contacted' CHECK (outreach_status IN ('not_contacted', 'contacted', 'responded', 'link_acquired')),
    notes TEXT,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics data table
CREATE TABLE IF NOT EXISTS seo_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sessions INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    pageviews INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    organic_traffic INTEGER DEFAULT 0,
    organic_percentage DECIMAL(5,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    top_pages JSONB DEFAULT '[]',
    core_web_vitals JSONB DEFAULT '{}',
    technical_issues JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, date)
);

-- SEO workflows table
CREATE TABLE IF NOT EXISTS seo_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_config JSONB NOT NULL,
    actions JSONB NOT NULL,
    schedule_config JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Local SEO data table
CREATE TABLE IF NOT EXISTS seo_local_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(500),
    categories TEXT[],
    business_hours JSONB DEFAULT '{}',
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    recent_reviews JSONB DEFAULT '[]',
    response_rate DECIMAL(5,2) DEFAULT 0,
    search_views INTEGER DEFAULT 0,
    map_views INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    direction_requests INTEGER DEFAULT 0,
    photo_views INTEGER DEFAULT 0,
    top_search_queries JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id)
);

-- Google Business Profile posts table
CREATE TABLE IF NOT EXISTS seo_gbp_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    post_type VARCHAR(20) DEFAULT 'update' CHECK (post_type IN ('update', 'offer', 'event', 'product')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(1000),
    cta_text VARCHAR(100),
    cta_url VARCHAR(1000),
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'expired')),
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO audit results table
CREATE TABLE IF NOT EXISTS seo_audit_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    overall_score INTEGER DEFAULT 0,
    technical_seo JSONB DEFAULT '{}',
    content_seo JSONB DEFAULT '{}',
    local_seo JSONB DEFAULT '{}',
    issues JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seo_projects_user_id ON seo_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_projects_domain ON seo_projects(domain);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_project_id ON seo_keywords(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_keyword ON seo_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_seo_content_project_id ON seo_content(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_content_user_id ON seo_content(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_project_id ON seo_backlinks(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_domain ON seo_backlinks(source_domain);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_project_date ON seo_analytics(project_id, date);
CREATE INDEX IF NOT EXISTS idx_seo_workflows_project_id ON seo_workflows(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_workflows_user_id ON seo_workflows(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE seo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_local_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_gbp_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audit_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Projects policies
CREATE POLICY "Users can view their own SEO projects" ON seo_projects
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own SEO projects" ON seo_projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own SEO projects" ON seo_projects
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own SEO projects" ON seo_projects
    FOR DELETE USING (auth.uid()::text = user_id);

-- Keywords policies
CREATE POLICY "Users can view keywords for their projects" ON seo_keywords
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_keywords.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert keywords for their projects" ON seo_keywords
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_keywords.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update keywords for their projects" ON seo_keywords
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_keywords.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete keywords for their projects" ON seo_keywords
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_keywords.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

-- Content policies
CREATE POLICY "Users can view their own SEO content" ON seo_content
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own SEO content" ON seo_content
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own SEO content" ON seo_content
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own SEO content" ON seo_content
    FOR DELETE USING (auth.uid()::text = user_id);

-- Apply similar policies to other tables
-- Backlinks policies
CREATE POLICY "Users can view backlinks for their projects" ON seo_backlinks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_backlinks.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage backlinks for their projects" ON seo_backlinks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_backlinks.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

-- Opportunities policies
CREATE POLICY "Users can view their own opportunities" ON seo_opportunities
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own opportunities" ON seo_opportunities
    FOR ALL USING (auth.uid()::text = user_id);

-- Analytics policies
CREATE POLICY "Users can view analytics for their projects" ON seo_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_analytics.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage analytics for their projects" ON seo_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_analytics.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

-- Workflows policies
CREATE POLICY "Users can view their own workflows" ON seo_workflows
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own workflows" ON seo_workflows
    FOR ALL USING (auth.uid()::text = user_id);

-- Local data policies
CREATE POLICY "Users can view local data for their projects" ON seo_local_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_local_data.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage local data for their projects" ON seo_local_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM seo_projects 
            WHERE seo_projects.id = seo_local_data.project_id 
            AND seo_projects.user_id = auth.uid()::text
        )
    );

-- GBP posts policies
CREATE POLICY "Users can view their own GBP posts" ON seo_gbp_posts
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own GBP posts" ON seo_gbp_posts
    FOR ALL USING (auth.uid()::text = user_id);

-- Audit results policies
CREATE POLICY "Users can view their own audit results" ON seo_audit_results
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own audit results" ON seo_audit_results
    FOR ALL USING (auth.uid()::text = user_id);

-- Grant permissions to authenticated users
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant basic read access to anonymous users (for public content)
GRANT SELECT ON seo_projects TO anon;
GRANT SELECT ON seo_content TO anon;

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_seo_projects_updated_at BEFORE UPDATE ON seo_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_keywords_updated_at BEFORE UPDATE ON seo_keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_content_updated_at BEFORE UPDATE ON seo_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_backlinks_updated_at BEFORE UPDATE ON seo_backlinks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_opportunities_updated_at BEFORE UPDATE ON seo_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_workflows_updated_at BEFORE UPDATE ON seo_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_local_data_updated_at BEFORE UPDATE ON seo_local_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_gbp_posts_updated_at BEFORE UPDATE ON seo_gbp_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();