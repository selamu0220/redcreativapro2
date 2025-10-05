-- Migración para Sistema de Optimización SEO "Tres Reyes"
-- Crear tablas para keyword opportunities, optimization history e intent analysis

-- Tabla de proyectos SEO (si no existe)
CREATE TABLE IF NOT EXISTS seo_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    target_location VARCHAR(100) DEFAULT 'global',
    target_keywords JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de oportunidades de keywords (posiciones 5-15)
CREATE TABLE keyword_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    current_position DECIMAL(4,2) NOT NULL,
    current_clicks INTEGER DEFAULT 0,
    current_impressions INTEGER DEFAULT 0,
    current_ctr DECIMAL(5,2) DEFAULT 0,
    potential_ctr DECIMAL(5,2) DEFAULT 0,
    search_volume INTEGER DEFAULT 0,
    url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'detected' CHECK (status IN ('detected', 'optimizing', 'optimized', 'monitoring')),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de optimizaciones
CREATE TABLE optimization_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES keyword_opportunities(id) ON DELETE SET NULL,
    target_keyword VARCHAR(255) NOT NULL,
    original_title TEXT,
    optimized_title TEXT NOT NULL,
    original_h1 TEXT,
    optimized_h1 TEXT NOT NULL,
    original_first_paragraph TEXT,
    optimized_first_paragraph TEXT NOT NULL,
    optimization_score INTEGER DEFAULT 0 CHECK (optimization_score >= 0 AND optimization_score <= 100),
    before_metrics JSONB DEFAULT '{}',
    after_metrics JSONB DEFAULT '{}',
    reindex_requested BOOLEAN DEFAULT false,
    reindex_status VARCHAR(20) DEFAULT 'pending' CHECK (reindex_status IN ('pending', 'requested', 'completed', 'failed')),
    optimized_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de análisis de intención de búsqueda
CREATE TABLE intent_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    detected_intent VARCHAR(20) NOT NULL CHECK (detected_intent IN ('informational', 'commercial', 'transactional', 'navigational')),
    intent_confidence DECIMAL(5,2) DEFAULT 0,
    content_match_score INTEGER DEFAULT 0 CHECK (content_match_score >= 0 AND content_match_score <= 100),
    top_competitors JSONB DEFAULT '[]',
    missing_nlp_keywords JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_seo_projects_user_id ON seo_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_projects_status ON seo_projects(status);

CREATE INDEX IF NOT EXISTS idx_keyword_opportunities_project_id ON keyword_opportunities(project_id);
CREATE INDEX IF NOT EXISTS idx_keyword_opportunities_position ON keyword_opportunities(current_position);
CREATE INDEX IF NOT EXISTS idx_keyword_opportunities_status ON keyword_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_keyword_opportunities_detected_at ON keyword_opportunities(detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_optimization_history_project_id ON optimization_history(project_id);
CREATE INDEX IF NOT EXISTS idx_optimization_history_opportunity_id ON optimization_history(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_optimization_history_optimized_at ON optimization_history(optimized_at DESC);
CREATE INDEX IF NOT EXISTS idx_optimization_history_reindex_status ON optimization_history(reindex_status);

CREATE INDEX IF NOT EXISTS idx_intent_analysis_project_id ON intent_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_intent_analysis_keyword ON intent_analysis(keyword);
CREATE INDEX IF NOT EXISTS idx_intent_analysis_analyzed_at ON intent_analysis(analyzed_at DESC);

-- Configurar permisos RLS (Row Level Security)
ALTER TABLE seo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para seo_projects (crear solo si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_projects' AND policyname = 'Users can view their own SEO projects') THEN
        CREATE POLICY "Users can view their own SEO projects" ON seo_projects
            FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_projects' AND policyname = 'Users can insert their own SEO projects') THEN
        CREATE POLICY "Users can insert their own SEO projects" ON seo_projects
            FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_projects' AND policyname = 'Users can update their own SEO projects') THEN
        CREATE POLICY "Users can update their own SEO projects" ON seo_projects
            FOR UPDATE USING (auth.uid()::text = user_id::text);
    END IF;
END $$;

-- Políticas de seguridad para keyword_opportunities (crear solo si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'keyword_opportunities' AND policyname = 'Users can view keyword opportunities from their projects') THEN
        CREATE POLICY "Users can view keyword opportunities from their projects" ON keyword_opportunities
            FOR SELECT USING (
                project_id IN (
                    SELECT id FROM seo_projects WHERE user_id::text = auth.uid()::text
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'keyword_opportunities' AND policyname = 'Users can insert keyword opportunities to their projects') THEN
        CREATE POLICY "Users can insert keyword opportunities to their projects" ON keyword_opportunities
            FOR INSERT WITH CHECK (
                project_id IN (
                    SELECT id FROM seo_projects WHERE user_id::text = auth.uid()::text
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'keyword_opportunities' AND policyname = 'Users can update keyword opportunities from their projects') THEN
        CREATE POLICY "Users can update keyword opportunities from their projects" ON keyword_opportunities
            FOR UPDATE USING (
                project_id IN (
                    SELECT id FROM seo_projects WHERE user_id::text = auth.uid()::text
                )
            );
    END IF;
END $$;

-- Políticas de seguridad para optimization_history (crear solo si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'optimization_history' AND policyname = 'Users can view optimization history from their projects') THEN
        CREATE POLICY "Users can view optimization history from their projects" ON optimization_history
            FOR SELECT USING (
                project_id IN (
                    SELECT id FROM seo_projects WHERE user_id::text = auth.uid()::text
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'optimization_history' AND policyname = 'Users can insert optimization history to their projects') THEN
        CREATE POLICY "Users can insert optimization history to their projects" ON optimization_history
            FOR INSERT WITH CHECK (
                project_id IN (
                    SELECT id FROM seo_projects WHERE user_id::text = auth.uid()::text
                )
            );
    END IF;
END $$;

-- Políticas de seguridad para intent_analysis (crear solo si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intent_analysis' AND policyname = 'Users can view intent analysis from their projects') THEN
        CREATE POLICY "Users can view intent analysis from their projects" ON intent_analysis
            FOR SELECT USING (
                project_id IN (
                    SELECT id FROM seo_projects WHERE user_id::text = auth.uid()::text
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intent_analysis' AND policyname = 'Users can insert intent analysis to their projects') THEN
        CREATE POLICY "Users can insert intent analysis to their projects" ON intent_analysis
            FOR INSERT WITH CHECK (
                project_id IN (
                    SELECT id FROM seo_projects WHERE user_id::text = auth.uid()::text
                )
            );
    END IF;
END $$;

-- Otorgar permisos básicos
GRANT SELECT ON seo_projects TO anon;
GRANT ALL PRIVILEGES ON seo_projects TO authenticated;

GRANT SELECT ON keyword_opportunities TO anon;
GRANT ALL PRIVILEGES ON keyword_opportunities TO authenticated;

GRANT SELECT ON optimization_history TO anon;
GRANT ALL PRIVILEGES ON optimization_history TO authenticated;

GRANT SELECT ON intent_analysis TO anon;
GRANT ALL PRIVILEGES ON intent_analysis TO authenticated;

-- Insertar datos de ejemplo para testing
INSERT INTO seo_projects (id, user_id, name, domain, primary_keywords) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'user123', 'Proyecto Demo', 'ejemplo.com', ARRAY['seo', 'marketing digital', 'posicionamiento web'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO keyword_opportunities (project_id, keyword, current_position, current_clicks, current_impressions, current_ctr, potential_ctr, search_volume, url) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'marketing digital para pymes', 8.5, 45, 1200, 3.75, 12.8, 2400, '/servicios/marketing-digital'),
    ('550e8400-e29b-41d4-a716-446655440000', 'consultoría seo barcelona', 11.2, 23, 890, 2.58, 8.9, 1800, '/servicios/consultoria-seo'),
    ('550e8400-e29b-41d4-a716-446655440000', 'agencia marketing online', 6.8, 67, 1850, 3.62, 11.5, 3200, '/agencia-marketing'),
    ('550e8400-e29b-41d4-a716-446655440000', 'posicionamiento web madrid', 13.1, 18, 720, 2.5, 7.2, 1500, '/posicionamiento-web')
ON CONFLICT DO NOTHING;