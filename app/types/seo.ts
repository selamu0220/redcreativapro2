// SEO Types and Interfaces

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  trend?: number;
  relatedKeywords?: string[];
}

export interface KeywordResearchRequest {
  seedKeyword: string;
  location?: string;
  language?: string;
  maxSuggestions?: number;
}

export interface KeywordResearchResponse {
  keywords: KeywordData[];
  totalResults: number;
  processingTime: number;
  status: 'success' | 'error';
  message?: string;
}

export interface ContentGenerationRequest {
  contentType: 'service-page' | 'blog-post' | 'gbp-post' | 'meta-description' | 'title-tag';
  targetKeyword: string;
  location?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'authoritative';
  wordCount?: number;
  businessContext?: string;
  competitorUrls?: string[];
}

export interface ContentGenerationResponse {
  content: string;
  title: string;
  metaDescription: string;
  headings: string[];
  internalLinks: LinkSuggestion[];
  schemaMarkup?: string;
  status: 'success' | 'error';
  message?: string;
}

export interface LinkSuggestion {
  anchorText: string;
  targetUrl: string;
  context: string;
  relevanceScore: number;
}

export interface BacklinkData {
  sourceUrl: string;
  sourceDomain: string;
  anchorText: string;
  domainAuthority: number;
  pageAuthority: number;
  linkType: 'dofollow' | 'nofollow';
  firstSeen: string;
  lastSeen: string;
  status: 'active' | 'lost' | 'new';
}

export interface BacklinkAnalysisRequest {
  domain: string;
  competitors?: string[];
  includeNewLinks?: boolean;
  includeLostLinks?: boolean;
}

export interface BacklinkAnalysisResponse {
  totalBacklinks: number;
  referringDomains: number;
  domainAuthority: number;
  topBacklinks: BacklinkData[];
  opportunities: OpportunityData[];
  competitorComparison?: CompetitorBacklinkData[];
  status: 'success' | 'error';
  message?: string;
}

export interface OpportunityData {
  domain: string;
  domainAuthority: number;
  relevanceScore: number;
  contactInfo?: string;
  outreachStatus: 'not_contacted' | 'contacted' | 'responded' | 'link_acquired';
  notes?: string;
}

export interface CompetitorBacklinkData {
  domain: string;
  totalBacklinks: number;
  referringDomains: number;
  domainAuthority: number;
  uniqueBacklinks: BacklinkData[];
}

export interface TrafficData {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  organicTraffic: number;
  organicPercentage: number;
  topPages: PageTrafficData[];
}

export interface PageTrafficData {
  url: string;
  pageviews: number;
  uniquePageviews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  entrances: number;
  exits: number;
}

export interface RankingData {
  keyword: string;
  position: number;
  previousPosition?: number;
  url: string;
  searchVolume: number;
  difficulty: number;
  changeDirection: 'up' | 'down' | 'stable';
  changeAmount?: number;
}

export interface WebVitalsData {
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  pageSpeed: {
    desktop: number;
    mobile: number;
  };
  technicalIssues: TechnicalIssue[];
}

export interface TechnicalIssue {
  type: 'error' | 'warning' | 'info';
  category: 'performance' | 'seo' | 'accessibility' | 'best-practices';
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  affectedUrls?: string[];
}

export interface ConversionData {
  totalConversions: number;
  conversionRate: number;
  organicConversions: number;
  organicConversionRate: number;
  goalCompletions: GoalCompletion[];
  ecommerceData?: EcommerceData;
}

export interface GoalCompletion {
  goalName: string;
  completions: number;
  conversionRate: number;
  value?: number;
}

export interface EcommerceData {
  revenue: number;
  transactions: number;
  averageOrderValue: number;
  organicRevenue: number;
  organicTransactions: number;
}

export interface SEOProject {
  id: string;
  name: string;
  domain: string;
  targetLocation: string;
  primaryKeywords: string[];
  businessType: string;
  competitorDomains: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: 'active' | 'paused' | 'completed';
  settings: ProjectSettings;
}

export interface ProjectSettings {
  trackingEnabled: boolean;
  automationEnabled: boolean;
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
  alertThresholds: {
    rankingDrop: number;
    trafficDrop: number;
    newBacklinks: boolean;
    lostBacklinks: boolean;
  };
}

export interface SEOWorkflow {
  id: string;
  name: string;
  description: string;
  projectId: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  schedule?: ScheduleConfig;
  status: 'active' | 'paused' | 'error';
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: 'schedule' | 'keyword_ranking' | 'traffic_change' | 'new_backlink' | 'manual';
  conditions?: TriggerCondition[];
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number;
}

export interface WorkflowAction {
  type: 'generate_content' | 'update_gbp' | 'send_email' | 'create_backlink_outreach' | 'update_meta_tags';
  parameters: Record<string, any>;
  order: number;
}

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  time: string; // HH:MM format
  timezone: string;
}

export interface LocalSEOData {
  businessName: string;
  address: string;
  phone: string;
  website: string;
  categories: string[];
  hours: BusinessHours;
  reviews: ReviewData;
  posts: GBPPost[];
  insights: LocalInsights;
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    isClosed?: boolean;
  };
}

export interface ReviewData {
  averageRating: number;
  totalReviews: number;
  recentReviews: Review[];
  responseRate: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  response?: string;
  responseDate?: string;
}

export interface GBPPost {
  id: string;
  type: 'update' | 'offer' | 'event' | 'product';
  title: string;
  content: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  publishDate: string;
  endDate?: string;
  status: 'draft' | 'published' | 'expired';
}

export interface LocalInsights {
  searchViews: number;
  mapViews: number;
  profileViews: number;
  websiteClicks: number;
  phoneClicks: number;
  directionRequests: number;
  photoViews: number;
  topSearchQueries: SearchQuery[];
}

export interface SearchQuery {
  query: string;
  impressions: number;
  type: 'direct' | 'discovery';
}

export interface SchemaMarkup {
  type: string;
  properties: Record<string, any>;
  context?: string;
}

export interface SEOAuditResult {
  score: number;
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
  technicalSEO: TechnicalSEOAudit;
  contentSEO: ContentSEOAudit;
  localSEO?: LocalSEOAudit;
}

export interface AuditIssue {
  category: 'critical' | 'warning' | 'info';
  type: string;
  description: string;
  affectedUrls: string[];
  impact: 'high' | 'medium' | 'low';
  howToFix: string;
}

export interface AuditRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface TechnicalSEOAudit {
  crawlability: number;
  indexability: number;
  siteSpeed: number;
  mobileFriendliness: number;
  security: number;
  structuredData: number;
}

export interface ContentSEOAudit {
  keywordOptimization: number;
  contentQuality: number;
  titleTags: number;
  metaDescriptions: number;
  headingStructure: number;
  internalLinking: number;
}

export interface LocalSEOAudit {
  googleBusinessProfile: number;
  localCitations: number;
  reviewManagement: number;
  localKeywords: number;
  locationPages: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  keywords?: string[];
  domains?: string[];
  status?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
