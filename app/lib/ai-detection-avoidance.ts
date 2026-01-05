/**
 * AI Detection Avoidance Engine
 * 
 * Analyzes text for AI generation patterns and applies techniques to make it more human-like:
 * - Detection risk scoring (0-100 scale)
 * - Pattern analysis for common AI-generated text
 * - Variation techniques (sentence structure, vocabulary, rhythm)
 * - Controlled imperfections for human-like output
 * - Specific improvement suggestions when risk is high
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

export interface DetectionRiskScore {
    overall: number; // 0-100 scale (100 = high risk of being detected as AI)
    breakdown: {
        repetitiveness: number;
        vocabularyVariation: number;
        sentenceStructureVariation: number;
        rhythmVariation: number;
        perfectionism: number; // Too perfect grammar/structure
    };
    confidence: number; // 0-1 scale
}

export interface HumanizationSuggestion {
    id: string;
    type: 'vocabulary' | 'structure' | 'rhythm' | 'imperfection';
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    position?: { start: number; end: number };
}

export interface HumanizationResult {
    originalScore: DetectionRiskScore;
    suggestions: HumanizationSuggestion[];
    estimatedImprovement: number; // Estimated score reduction
}

/**
 * AI Detection Avoidance Engine
 * 
 * Analyzes text for AI-like patterns and provides suggestions to make it more human.
 */
export class AIDetectionAvoidanceEngine {
    /**
     * Analyze text for AI detection risk
     * 
     * @param text - Text to analyze
     * @returns Detection risk score
     */
    async analyzeDetectionRisk(text: string): Promise<DetectionRiskScore> {
        // Analyze different risk factors
        const repetitiveness = this.analyzeRepetitiveness(text);
        const vocabularyVariation = this.analyzeVocabularyVariation(text);
        const sentenceStructureVariation = this.analyzeSentenceStructureVariation(text);
        const rhythmVariation = this.analyzeRhythmVariation(text);
        const perfectionism = this.analyzePerfectionism(text);

        // Calculate overall risk (weighted average)
        const overall = Math.round(
            repetitiveness * 0.2 +
            (100 - vocabularyVariation) * 0.25 +
            (100 - sentenceStructureVariation) * 0.25 +
            (100 - rhythmVariation) * 0.15 +
            perfectionism * 0.15
        );

        return {
            overall: Math.min(Math.max(overall, 0), 100),
            breakdown: {
                repetitiveness: Math.round(repetitiveness),
                vocabularyVariation: Math.round(vocabularyVariation),
                sentenceStructureVariation: Math.round(sentenceStructureVariation),
                rhythmVariation: Math.round(rhythmVariation),
                perfectionism: Math.round(perfectionism)
            },
            confidence: this.calculateConfidence(text)
        };
    }

    /**
     * Generate humanization suggestions
     * 
     * @param text - Text to analyze
     * @returns Humanization result with suggestions
     */
    async generateHumanizationSuggestions(text: string): Promise<HumanizationResult> {
        const originalScore = await this.analyzeDetectionRisk(text);
        const suggestions: HumanizationSuggestion[] = [];

        // Generate suggestions based on risk factors
        if (originalScore.breakdown.repetitiveness > 60) {
            suggestions.push(...this.generateRepetitivenesssuggestions(text));
        }

        if (originalScore.breakdown.vocabularyVariation < 40) {
            suggestions.push(...this.generateVocabularySuggestions(text));
        }

        if (originalScore.breakdown.sentenceStructureVariation < 40) {
            suggestions.push(...this.generateStructureSuggestions(text));
        }

        if (originalScore.breakdown.rhythmVariation < 40) {
            suggestions.push(...this.generateRhythmSuggestions(text));
        }

        if (originalScore.breakdown.perfectionism > 70) {
            suggestions.push(...this.generatePerfectionismSuggestions(text));
        }

        // Calculate estimated improvement
        const estimatedImprovement = Math.min(
            suggestions.filter(s => s.priority === 'high').length * 10 +
            suggestions.filter(s => s.priority === 'medium').length * 5 +
            suggestions.filter(s => s.priority === 'low').length * 2,
            50 // Max 50 point improvement
        );

        return {
            originalScore,
            suggestions,
            estimatedImprovement
        };
    }

    /**
     * Apply automatic humanization techniques
     * 
     * @param text - Text to humanize
     * @param aggressiveness - How aggressive to be (0-1 scale)
     * @returns Humanized text
     */
    async applyHumanization(text: string, aggressiveness: number = 0.5): Promise<string> {
        let result = text;

        // Apply various humanization techniques based on aggressiveness
        if (aggressiveness > 0.3) {
            result = this.addMinorImperfections(result, aggressiveness);
        }

        if (aggressiveness > 0.5) {
            result = this.varyVocabulary(result, aggressiveness);
        }

        if (aggressiveness > 0.7) {
            result = this.varySentenceStructure(result, aggressiveness);
        }

        return result;
    }

    // ========== Risk Analysis Methods ==========

    /**
     * Analyze repetitiveness (AI tends to repeat phrases)
     */
    private analyzeRepetitiveness(text: string): number {
        const sentences = this.splitSentences(text);
        if (sentences.length < 2) return 0;

        // Extract sentence starters
        const starters = sentences.map(s => {
            const words = s.trim().split(/\s+/);
            return words.slice(0, 3).join(' ').toLowerCase();
        });

        // Count unique starters
        const uniqueStarters = new Set(starters);
        const repetitionRatio = 1 - (uniqueStarters.size / starters.length);

        return repetitionRatio * 100;
    }

    /**
     * Analyze vocabulary variation (AI tends to use consistent vocabulary)
     */
    private analyzeVocabularyVariation(text: string): number {
        const words = this.tokenizeWords(text);
        if (words.length < 10) return 50;

        // Calculate type-token ratio (unique words / total words)
        const uniqueWords = new Set(words);
        const ttr = uniqueWords.size / words.length;

        // Normalize to 0-100 scale (higher is better)
        return Math.min(ttr * 150, 100);
    }

    /**
     * Analyze sentence structure variation
     */
    private analyzeSentenceStructureVariation(text: string): number {
        const sentences = this.splitSentences(text);
        if (sentences.length < 3) return 50;

        // Calculate sentence length variation
        const lengths = sentences.map(s => this.tokenizeWords(s).length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        // Higher stdDev = more variation = lower AI risk
        // Normalize to 0-100 scale
        return Math.min(stdDev * 10, 100);
    }

    /**
     * Analyze rhythm variation (AI tends to have consistent rhythm)
     */
    private analyzeRhythmVariation(text: string): number {
        const sentences = this.splitSentences(text);
        if (sentences.length < 3) return 50;

        // Analyze comma usage variation
        const commaCount = sentences.map(s => (s.match(/,/g) || []).length);
        const avgCommas = commaCount.reduce((a, b) => a + b, 0) / commaCount.length;
        const variance = commaCount.reduce((sum, count) => sum + Math.pow(count - avgCommas, 2), 0) / commaCount.length;

        // Normalize to 0-100 scale
        return Math.min(Math.sqrt(variance) * 30, 100);
    }

    /**
     * Analyze perfectionism (AI tends to be too perfect)
     */
    private analyzePerfectionism(text: string): number {
        let score = 0;

        // Check for overly consistent capitalization
        const sentences = this.splitSentences(text);
        const properlyCapitalized = sentences.filter(s => /^[A-Z]/.test(s.trim())).length;
        if (sentences.length > 0 && properlyCapitalized === sentences.length) {
            score += 20;
        }

        // Check for lack of contractions (humans use contractions)
        const contractions = text.match(/\b(can't|won't|don't|I'm|it's|we're|they're|you're)/gi) || [];
        const contractionRatio = contractions.length / Math.max(this.tokenizeWords(text).length / 50, 1);
        if (contractionRatio < 0.5) {
            score += 30;
        }

        // Check for overly formal language
        const formalWords = text.match(/\b(utilize|consequently|furthermore|nevertheless|notwithstanding)\b/gi) || [];
        if (formalWords.length > sentences.length * 0.3) {
            score += 30;
        }

        // Check for perfect punctuation (too consistent)
        const punctuationErrors = this.detectPunctuationInconsistencies(text);
        if (punctuationErrors === 0 && text.length > 500) {
            score += 20;
        }

        return Math.min(score, 100);
    }

    /**
     * Calculate confidence in detection analysis
     */
    private calculateConfidence(text: string): number {
        const wordCount = this.tokenizeWords(text).length;

        // Confidence increases with text length
        if (wordCount < 50) return 0.3;
        if (wordCount < 100) return 0.5;
        if (wordCount < 300) return 0.7;
        if (wordCount < 500) return 0.9;
        return 1.0;
    }

    // ========== Suggestion Generation Methods ==========

    private generateRepetitivenesssuggestions(text: string): HumanizationSuggestion[] {
        return [{
            id: this.generateId(),
            type: 'structure',
            issue: 'Repetitive sentence starters detected',
            suggestion: 'Vary your sentence openings. Try starting some sentences with adverbs, prepositional phrases, or subordinate clauses.',
            priority: 'high'
        }];
    }

    private generateVocabularySuggestions(text: string): HumanizationSuggestion[] {
        return [{
            id: this.generateId(),
            type: 'vocabulary',
            issue: 'Limited vocabulary variation',
            suggestion: 'Use more diverse vocabulary. Replace repeated words with synonyms or rephrase sentences entirely.',
            priority: 'high'
        }];
    }

    private generateStructureSuggestions(text: string): HumanizationSuggestion[] {
        return [{
            id: this.generateId(),
            type: 'structure',
            issue: 'Consistent sentence structure',
            suggestion: 'Mix up your sentence lengths and structures. Combine short sentences or break long, ones into smaller chunks.',
            priority: 'medium'
        }];
    }

    private generateRhythmSuggestions(text: string): HumanizationSuggestion[] {
        return [{
            id: this.generateId(),
            type: 'rhythm',
            issue: 'Monotonous rhythm',
            suggestion: 'Add variety to your writing rhythm. Use more (or fewer) commas, dashes, and semicolons to create natural pauses.',
            priority: 'medium'
        }];
    }

    private generatePerfectionismSuggestions(text: string): HumanizationSuggestion[] {
        return [{
            id: this.generateId(),
            type: 'imperfection',
            issue: 'Text appears too perfect',
            suggestion: 'Add human touches: use contractions, occasional fragment sentences, or conversational transitions like "Now," or "Here\'s the thing:"',
            priority: 'high'
        }];
    }

    // ========== Humanization Application Methods ==========

    private addMinorImperfections(text: string, aggressiveness: number): string {
        // In production, this would make subtle changes like:
        // - Adding occasional contractions
        // - Introducing minor rhythm variations
        // - Adding colloquial phrases
        return text; // Placeholder
    }

    private varyVocabulary(text: string, aggressiveness: number): string {
        // In production, this would:
        // - Replace repeated words with synonyms
        // - Vary word choice
        return text; // Placeholder
    }

    private varySentenceStructure(text: string, aggressiveness: number): string {
        // In production, this would:
        // - Combine or split sentences
        // - Reorder clauses
        return text; // Placeholder
    }

    // ========== Helper Methods ==========

    private splitSentences(text: string): string[] {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    }

    private tokenizeWords(text: string): string[] {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    private detectPunctuationInconsistencies(text: string): number {
        // Simple heuristic: count obvious errors
        let errors = 0;

        // Check for double spaces
        if (text.includes('  ')) errors++;

        // Check for space before punctuation
        if (/\s[,.]/.test(text)) errors++;

        return errors;
    }

    private generateId(): string {
        return `humanization-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Create singleton instance
 */
let globalEngine: AIDetectionAvoidanceEngine | null = null;

export function getGlobalAIDetectionEngine(): AIDetectionAvoidanceEngine {
    if (!globalEngine) {
        globalEngine = new AIDetectionAvoidanceEngine();
    }
    return globalEngine;
}
