// Tipos TypeScript para el Sistema SEO "Tres Reyes"

// Interfaces principales para las tablas de la base de datos
export interface KeywordOpportunity {
  id: string;
  project_id: string;
  keyword: string;
  current_position: number;
  search_volume: number;
  clicks: number;
  impressions: number;
  ctr: number;
  url: string;
  page_title: string;
  meta_description?: string;
  h1_tag?: string;
  first_paragraph?: string;
  potential_ctr_increase: number;
  priority_score: number;
  status: 'identified' | 'in_progress' | 'optimized' | 'monitoring';
  created_at: string;
  updated_at: string;
}

export interface OptimizationHistory {
  id: string;
  project_id: string;
  keyword_opportunity_id: string;
  optimization_type: 'title_tag' | 'h1_tag' | 'first_paragraph' | 'meta_description' | 'full_optimization';
  original_content: string;
  optimized_content: string;
  change_reason: string;
  position_before: number;
  position_after?: number;
  ctr_before: number;
  ctr_after?: number;
  reindex_requested: boolean;
  reindex_status: 'pending' | 'submitted' | 'indexed' | 'failed' | 'not_requested';
  created_at: string;
  updated_at: string;
}

export interface IntentAnalysis {
  id: string;
  project_id: string;
  keyword: string;
  search_intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  intent_confidence: number;
  top_competitors: {
    url: string;
    title: string;
    meta_description: string;
    h1_tag: string;
    content_type: string;
    word_count: number;
  }[];
  semantic_keywords: string[];
  content_gaps: string[];
  recommendations: {
    title_suggestions: string[];
    h1_suggestions: string[];
    content_suggestions: string[];
  };
  serper_analysis: Record<string, any>;
  ai_analysis: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Tipos para las APIs externas
export interface GoogleSearchConsoleData {
  keyword: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
  url: string;
}

export interface SerperCompetitorData {
  position: number;
  title: string;
  link: string;
  snippet: string;
  sitelinks?: {
    title: string;
    link: string;
  }[];
}

export interface AIAnalysisRequest {
  keyword: string;
  current_title: string;
  current_h1: string;
  current_first_paragraph: string;
  competitors: SerperCompetitorData[];
  search_intent: string;
}

export interface AIAnalysisResponse {
  optimized_title: string;
  optimized_h1: string;
  optimized_first_paragraph: string;
  semantic_keywords: string[];
  content_gaps: string[];
  confidence_score: number;
  reasoning: string;
}

// Tipos para las respuestas de API
export interface OpportunitiesResponse {
  success: boolean;
  data: KeywordOpportunity[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface OptimizationRequest {
  keyword_opportunity_id: string;
  optimizations: {
    title_tag?: string;
    h1_tag?: string;
    first_paragraph?: string;
    meta_description?: string;
  };
  change_reason: string;
  request_reindex: boolean;
}

export interface OptimizationResponse {
  success: boolean;
  data: OptimizationHistory;
  reindex_status?: string;
  error?: string;
}

export interface IntentAnalysisRequest {
  keyword: string;
  current_url?: string;
}

export interface IntentAnalysisResponse {
  success: boolean;
  data: IntentAnalysis;
  error?: string;
}

export interface ReindexRequest {
  urls: string[];
}

export interface ReindexResponse {
  success: boolean;
  data: {
    submitted_urls: string[];
    failed_urls: string[];
    inspection_results: {
      url: string;
      status: 'submitted' | 'failed';
      message?: string;
    }[];
  };
  error?: string;
}

// Tipos para filtros y ordenamiento
export interface OpportunityFilters {
  position_min?: number;
  position_max?: number;
  search_volume_min?: number;
  search_volume_max?: number;
  ctr_min?: number;
  ctr_max?: number;
  status?: KeywordOpportunity['status'][];
  keyword_contains?: string;
}

export interface OpportunitySort {
  field: keyof KeywordOpportunity;
  direction: 'asc' | 'desc';
}

// Tipos para el dashboard y UI
export interface DashboardStats {
  total_opportunities: number;
  high_priority_opportunities: number;
  optimizations_this_month: number;
  average_position_improvement: number;
  average_ctr_improvement: number;
  total_traffic_increase: number;
}

export interface OptimizationPreview {
  original: {
    title: string;
    h1: string;
    first_paragraph: string;
    meta_description: string;
  };
  optimized: {
    title: string;
    h1: string;
    first_paragraph: string;
    meta_description: string;
  };
  changes_summary: string[];
  expected_impact: {
    position_improvement: number;
    ctr_improvement: number;
    traffic_increase: number;
  };
}

// Tipos para configuración
export interface TresReyesConfig {
  google_search_console: {
    client_id: string;
    client_secret: string;
    refresh_token: string;
  };
  ai_provider: 'openai' | 'gemini';
  ai_config: {
    api_key: string;
    model: string;
    temperature: number;
  };
  serper_config: {
    api_key: string;
  };
  optimization_settings: {
    auto_reindex: boolean;
    min_position_for_optimization: number;
    max_position_for_optimization: number;
    min_search_volume: number;
    priority_calculation_weights: {
      position: number;
      search_volume: number;
      ctr: number;
      potential_increase: number;
    };
  };
}

// Tipos para errores
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Tipos para eventos y notificaciones
export interface OptimizationEvent {
  type: 'optimization_completed' | 'reindex_requested' | 'position_improved' | 'ctr_improved';
  keyword_opportunity_id: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  position_improvement_threshold: number;
  ctr_improvement_threshold: number;
  weekly_summary: boolean;
}