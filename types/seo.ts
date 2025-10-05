// SEO Types and Interfaces

export interface SEOProject {
  id: string
  name: string
  domain: string
  target_keywords: string[]
  target_location?: string
  business_type?: string
  status: 'active' | 'inactive'
  user_id: string
  created_at: string
  updated_at: string
  competitors?: string[]
  goals?: string[]
}

export interface KeywordData {
  keyword: string
  search_volume: number
  difficulty: number
  cpc: number
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  trend: 'up' | 'down' | 'stable'
  position?: number
  url?: string
  competition: 'low' | 'medium' | 'high'
  related_keywords?: string[]
}

export interface GeneratedContent {
  id: string
  project_id: string
  title: string
  content: string
  target_keyword: string
  content_type: 'blog_post' | 'product_description' | 'landing_page' | 'meta_description' | 'social_post'
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'conversational'
  word_count: number
  seo_analysis: {
    keyword_density: number
    readability_score: number
    heading_structure: {
      h1: number
      h2: number
      h3: number
    }
    meta_title?: string
    meta_description?: string
  }
  related_keywords?: string[]
  created_at: string
  updated_at: string
}

export interface BacklinkData {
  id: string
  project_id: string
  source_domain: string
  source_url: string
  target_url: string
  anchor_text: string
  domain_authority: number
  page_authority: number
  link_type: 'dofollow' | 'nofollow'
  status: 'active' | 'lost' | 'new'
  first_seen: string
  last_seen: string
}

export interface BacklinkOpportunity {
  id: string
  project_id: string
  target_domain: string
  opportunity_type: 'guest_post' | 'resource_page' | 'broken_link' | 'competitor_backlink'
  contact_email?: string
  domain_authority: number
  relevance_score: number
  difficulty: 'easy' | 'medium' | 'hard'
  notes?: string
  status: 'identified' | 'contacted' | 'in_progress' | 'completed' | 'rejected'
  created_at: string
  updated_at: string
}

export interface TrafficData {
  date: string
  sessions: number
  users: number
  pageviews: number
  bounce_rate: number
  avg_session_duration: number
  organic_traffic: number
  conversion_rate: number
}

export interface RankingData {
  keyword: string
  position: number
  previous_position?: number
  url: string
  search_volume: number
  date: string
  change: 'up' | 'down' | 'stable'
}

export interface AnalyticsData {
  traffic: TrafficData[]
  rankings: RankingData[]
  conversions: {
    date: string
    conversions: number
    conversion_rate: number
    revenue?: number
  }[]
}

export interface SEOAuditResult {
  id: string
  project_id: string
  audit_type: 'technical' | 'content' | 'backlinks' | 'local'
  score: number
  issues: {
    critical: number
    warning: number
    notice: number
  }
  recommendations: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    effort: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
  }[]
  created_at: string
}

export interface LocalSEOData {
  id: string
  project_id: string
  business_name: string
  address: string
  phone: string
  website: string
  categories: string[]
  google_my_business_id?: string
  reviews_count: number
  average_rating: number
  local_rankings: {
    keyword: string
    position: number
    location: string
  }[]
  citations: {
    source: string
    url: string
    status: 'active' | 'inactive'
  }[]
}

export interface GBPPost {
  id: string
  project_id: string
  title: string
  content: string
  post_type: 'update' | 'event' | 'offer' | 'product'
  media_urls?: string[]
  cta_type?: 'learn_more' | 'book' | 'order' | 'buy' | 'sign_up'
  cta_url?: string
  scheduled_date?: string
  published_date?: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  engagement: {
    views: number
    clicks: number
    calls: number
    direction_requests: number
  }
  created_at: string
}

export interface SEOWorkflow {
  id: string
  project_id: string
  name: string
  description: string
  workflow_type: 'content_generation' | 'gbp_posting' | 'keyword_monitoring' | 'backlink_outreach'
  trigger_type: 'manual' | 'scheduled' | 'event_based'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    days?: string[]
  }
  actions: {
    type: string
    parameters: Record<string, any>
  }[]
  status: 'active' | 'inactive' | 'paused'
  last_run?: string
  next_run?: string
  created_at: string
}

// API Response Types
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface KeywordResearchResponse extends APIResponse<KeywordData[]> {}
export interface ContentGenerationResponse extends APIResponse<GeneratedContent> {}
export interface BacklinkAnalysisResponse extends APIResponse<BacklinkData[]> {}
export interface AnalyticsResponse extends APIResponse<AnalyticsData> {}
export interface ProjectResponse extends APIResponse<SEOProject> {}
export interface ProjectsResponse extends APIResponse<SEOProject[]> {}

// Form Types
export interface KeywordResearchRequest {
  keyword: string
  location?: string
  language?: string
  limit?: number
}

export interface ContentGenerationRequest {
  project_id: string
  content_type: GeneratedContent['content_type']
  target_keyword: string
  tone: GeneratedContent['tone']
  word_count: number
  audience?: string
  additional_instructions?: string
}

export interface BacklinkAnalysisRequest {
  project_id?: string
  domain?: string
  analysis_type: 'profile' | 'opportunities'
  limit?: number
}

export interface AnalyticsRequest {
  project_id: string
  metric: 'traffic' | 'rankings' | 'conversions'
  date_range: string
  start_date?: string
  end_date?: string
}

// Filter and Sort Types
export interface KeywordFilter {
  search_volume_min?: number
  search_volume_max?: number
  difficulty_min?: number
  difficulty_max?: number
  intent?: KeywordData['intent'][]
  competition?: KeywordData['competition'][]
}

export interface KeywordSort {
  field: keyof KeywordData
  direction: 'asc' | 'desc'
}

export interface ContentFilter {
  content_type?: GeneratedContent['content_type'][]
  tone?: GeneratedContent['tone'][]
  date_range?: {
    start: string
    end: string
  }
}

export interface BacklinkFilter {
  domain_authority_min?: number
  domain_authority_max?: number
  link_type?: BacklinkData['link_type'][]
  status?: BacklinkData['status'][]
}