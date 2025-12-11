// GEO Content Analysis Types and Interfaces
export interface ConversationalAnalysisResult {
  formalityScore: number; // 0-100, higher = more formal
  conversationalScore: number; // 0-100, higher = more conversational
  technicalJargonCount: number;
  questionBasedHeadingOpportunities: string[];
  naturalLanguageSuggestions: NaturalLanguageSuggestion[];
  overallReadabilityScore: number;
}

export interface NaturalLanguageSuggestion {
  originalText: string;
  suggestedText: string;
  reason: string;
  confidence: number; // 0-1
}

export interface QuestionPattern {
  question: string;
  answer?: string;
  confidence: number;
  type: 'explicit' | 'implicit' | 'suggested';
  position: number;
}

export interface SemanticAnalysisResult {
  semanticRichness: number; // 0-100
  relatedTerms: string[];
  synonymSuggestions: SynonymSuggestion[];
  topicalCoverageGaps: string[];
  contextDepth: number;
}

export interface SynonymSuggestion {
  originalTerm: string;
  synonyms: string[];
  contextRelevance: number;
}

export interface EEATSignal {
  type: 'experience' | 'expertise' | 'authoritativeness' | 'trustworthiness';
  strength: number; // 0-1
  evidence: string;
  suggestions: string[];
}

export interface GEOAnalysisResult {
  conversationalScore: number;
  semanticRichness: number;
  questionAnswerPatterns: QuestionPattern[];
  eeatSignals: EEATSignal[];
  improvementAreas: string[];
  overallGEOScore: number;
}

export interface OptimizationSuggestion {
  type: 'conversational' | 'semantic' | 'qa' | 'eeat';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  implementation: string;
  expectedImpact: number; // 0-1
}